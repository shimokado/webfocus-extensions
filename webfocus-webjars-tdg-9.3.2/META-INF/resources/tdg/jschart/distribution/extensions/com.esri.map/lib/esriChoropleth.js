/*global define: false, esri: false */

/* Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved. */

define(
	[
		'dojo/_base/declare',
		'esri/layers/FeatureLayer',
		'esri/tasks/QueryTask',
		'esri/tasks/query',
		'esri/graphicsUtils',
		'esri/graphic',
		'esri/geometry/Point',
		'esri/request'
	],
	function(declare,
		FeatureLayer,
		QueryTask,
		Query,
		GraphicsUtils,
		Graphic,
		Point,
		esriRequest
	) {
		var chart;
		var properties;
		var container;
		var IBIGisUtil;
		var missingRegionsProperty;
		var circleSizeFactor;
		var dojoObjects;
		var containerIDPrefix;
		var limitNumOfConnections = true;
		var tdg, arrEsriData;
		var currentUrl;
		var EsriChoropleth = declare([], {
			constructor: function() { },

			initialize: function(rc, gisUtil, dobj, tdgObj) {
				chart = rc.moonbeamInstance;
				properties = rc.properties;
				container = rc.container;
				IBIGisUtil = gisUtil;
				missingRegionsProperty = rc.properties.missingRegionsHeightFactor || 0.8;
				circleSizeFactor = properties.circleSizeFactor || 1.0;
				dojoObjects = dobj;
				containerIDPrefix = rc.containerIDPrefix;
				tdg = tdgObj;
				if(!arrEsriData)
					arrEsriData=[];
			},

			draw: function(layer, groupIdVarName, seriesIdVarName, map, usedLayerIds, maxRecordCount, renderConfig) {
				chart = renderConfig.moonbeamInstance;
				container = renderConfig.container;
				
				var missingList = [];
				var mapSpatialReference = map.spatialReference;
				var geoRolesFixedValues = getDefaultValuesFromGeoRolesTable(layer);
				var colorVarName = null, sizeVarName = null;

				if (chart.dataArrayMap && chart.dataArrayMap.indexOf('color') >= 0) {
					colorVarName = 'color';
				} else if (chart.dataArrayMap && chart.dataArrayMap.indexOf('value') >= 0) {
					colorVarName = 'value';
				}
				if (chart.dataArrayMap && chart.dataArrayMap.includes('size') && layer.layerType === 'line') {
					sizeVarName = 'size';
				}
				var geometrySourceType = IBIGisUtil.getGeometrySourceType(layer);
				var keyVarName = (geometrySourceType === 'seriesdata' ? null : layer.geometryDataField || 'name');

				var groupDataItems = {
					groupIdVarName: groupIdVarName,
					seriesIdVarName: seriesIdVarName,
					keyVarName: keyVarName,
					colorVarName: colorVarName,
					sizeVarName: sizeVarName
				};

				var dataMap, glLayer;
				var altDataMapLeft = {};
				var altKeysMap;
				var keysInprogress = [];
				var keysRemaining = [];
				var keysDone = [];

				var lookupPosition = layer.geometrySourceKeyPosition;
				var createSymbol = IBIGisUtil.createSymbol;
				if (layer.seriesIndex == null) {
					dataMap = IBIGisUtil.groupDataForALLSeries(layer, createSymbol, groupDataItems, chart, renderConfig, dojoObjects);
				} else {
					dataMap = IBIGisUtil.groupDataForSeriesOne(layer, createSymbol, groupDataItems, chart, renderConfig, dojoObjects);
				}

				if (dataMap == null) {
					return undefined;  // No data found for this layer - ignore it
				}

				glLayer = IBIGisUtil.createGraphicsLayer(chart, layer, usedLayerIds, containerIDPrefix);

				function getGraphicExtent(graphic) {
					try {
						if (graphic)	{
							var graphicExtent;
							if (graphic instanceof Array) {
								graphicExtent = GraphicsUtils.graphicsExtent(graphic);
							} else {
								graphicExtent = GraphicsUtils.graphicsExtent([graphic]);
							}
							return graphicExtent;
						}
					} catch (e) {
					}
					return undefined;
				}
				function getDefaultValuesFromGeoRolesTable(layer) {
					//  [{ role : 'COUNTRY',format : 'NAME',values:'United States'}, { role : 'STATE',format : 'NAME'} ]],

					function getValuesForGeoRoles(geoRole)	{
						var rtn = [];
						if (geoRole)		{
							for (var i = 0; i < geoRole.length; ++i)	{
								var o = geoRole[i];
								if (o && o.values) {
									var values = (o.values instanceof Array) ? o.values : [o.values];
									var a = [];
									values.forEach(function(value) {
										if (value)	{
											if (typeof value === 'function') {
												a.push(value);
											} else {
												a.push(value.toUpperCase());
											}
										}
									});
									rtn.push(a);
								} else {
									break;
								}
							}
						}
						return rtn;
					}
					var combined = [];
					var layerValues = getValuesForGeoRoles(layer.geoRole);
					var layerExternalValues = getValuesForGeoRoles(layer.externalGeoRole);
					for (var i = 0; i < Math.max(layerValues.length, layerExternalValues.length); ++i) {
						var a = layerValues[i] || [];
						var b = layerExternalValues[i] || [];
						combined.push(a.concat(b));
					}
					return combined;
				}

				function drawChoroplethBasedOnGeometrySourceType(geometryLocateFieldVarNameArray, geometrySourceType, fieldSourceList, lookupKey, reverseTable) {
					var x, dmoArray;
					var lookupKeyStr = (layer.geometrySourceKeyPosition === 'last' ? layer.dataDelim + lookupKey : lookupKey + layer.dataDelim);
					if (lookupKey === 'DEFAULT') {
						lookupKeyStr = '';
					}
					if (!geometrySourceType) {
						IBIGisUtil.drawMissingRegionUI(container, dataMap, missingList, missingRegionsProperty);
					}

					if (geometrySourceType === 'seriesdata') {
						var xVarName = layer.geometryXY ? layer.geometryXY.x || 'lng' : 'lng';
						var yVarName = layer.geometryXY ? layer.geometryXY.y || 'lat' : 'lat';

						keyVarName = layer.geometryDataField || 'name';
						glLayer = IBIGisUtil.createGraphicsLayer(chart, layer, usedLayerIds, containerIDPrefix);
						glLayer.on('graphic-draw', function(evt) {
							IBIGisUtil.addTooltip(renderConfig, evt.graphic, layer.layerType, groupDataItems);
						});
						for (x in dataMap) {
							if (dataMap.hasOwnProperty(x)) {
								dmoArray = dataMap[x];
								dmoArray.map(function(dmo) {
									var geometry;
									if (chart.dataArrayMap && chart.dataArrayMap.indexOf(keyVarName) > -1) {
										if (dmo.groupData[keyVarName] == null) {
											if (geometrySourceType === 'seriesdata') {
												dmo.done = true;
											}
											return;
										}
										geometry = IBIGisUtil.getGeometryFromDataArrayItem(dmo.groupData, keyVarName);
										if (!geometry) {
											geometry = new Point(parseFloat(dmo.groupData[xVarName]), parseFloat(dmo.groupData[yVarName]));
										}
									}
									function isInvalidGeoForPoint(geometry) {
										if (geometry && geometry.type === 'point' && isNaN(geometry.x) && isNaN(geometry.y)) {
											IBIGisUtil.setLayerExtent(glLayer, null, properties, map);
											return true;
										}
										return false;
									}

									if (geometry == null || isInvalidGeoForPoint(geometry)) { //??
										return;
									}
									dmo.done = true;
									var graphic = new Graphic();
									graphic.setGeometry(geometry); // check for point??

									if (!dmo.groupData.hasOwnProperty(colorVarName) || dmo.groupData[colorVarName] != null) {
										graphic.setSymbol(dmo.symbol);
									}
									IBIGisUtil.mergeAttributes(dmo, graphic);
									var grphc = glLayer.add(IBIGisUtil.getChoroplethAsBubble(graphic, layer, properties, circleSizeFactor));
									IBIGisUtil.addDataLabel(renderConfig, tdg, chart, grphc, glLayer);
								});
							}
						}
						IBIGisUtil.drawMissingRegionUI(container, dataMap, missingList, missingRegionsProperty); // should be none??
						if (glLayer.graphics && glLayer.graphics.length) {
							IBIGisUtil.setLayerExtent(glLayer, null, properties, map);
						}
						layer.layerDone=true;
						return glLayer;

					} else if (geometrySourceType === 'geojson' || geometrySourceType === 'ibijson' || geometrySourceType === 'csv') {
						
						function getCachedData(lookupKey, lUrl) {
							var d=null;							
							arrEsriData.forEach(function(mEDObj) {
								if(mEDObj.key==lookupKey && mEDObj.url==lUrl)
									d=mEDObj.data;
							});
							return d;
						}
						function doFinishProcessing(esriData, bDontAdd) {
							if(!layer.allFeatures)
								layer.allFeatures = [];
							if(!bDontAdd && arrEsriData && esriData) {
								var mEsriData={key:lookupKey, data:esriData, url:layer.url};
								arrEsriData.push(mEsriData);
							}
							total--;
							
							if(total==0)
							{
								glLayer.on('graphic-draw', function(evt) {
									IBIGisUtil.addTooltip(renderConfig, evt.graphic, layer.layerType, groupDataItems);
								});
							}

							esriData.features.forEach(function(feature) {
								var itemId = IBIGisUtil.findGeoKeyValue(geometryLocateFieldVarNameArray, geoRolesFixedValues, feature.attributes, layer.dataDelim);
								if (itemId == null || itemId === "") {
									return;
								}

								var dmoArray = null;
								if (layer.geometrySourceKeyPosition === 'last') {
									var xx = itemId + lookupKeyStr;
									dmoArray = dataMap[xx];
									if (!dmoArray && reverseTable[xx]) {
										dmoArray = dataMap[reverseTable[xx]];
									}
								} else if (layer.geometrySourceKeyPosition === 'first') {
									dmoArray = dataMap[lookupKeyStr + itemId];
								} else {
									dmoArray = dataMap[itemId];
								}

								if (!dmoArray && altDataMapLeft[itemId]) {
									dmoArray = dataMap[altDataMapLeft[itemId]];

								}
								if (!dmoArray) {
									return;
								}
								dmoArray.map(function(dmo) {
									if (dmo) {
										dmo.done = true;
										var graphic = Graphic(feature);
										if (!dmo.groupData.hasOwnProperty(colorVarName) || dmo.groupData[colorVarName] != null) {
											graphic.setSymbol(dmo.symbol);
										}
										IBIGisUtil.mergeAttributes(dmo, graphic);
									//	IBIGisUtil.doSimplifyGeom(graphic);
										layer.allFeatures.push(IBIGisUtil.getChoroplethAsBubble(graphic, layer, properties, circleSizeFactor));
										
			//							var grphc = glLayer.add(IBIGisUtil.getChoroplethAsBubble(graphic, layer, properties, circleSizeFactor));
			//							IBIGisUtil.addDataLabel(renderConfig, tdg, chart, grphc, glLayer);
									}
								});
							});
						
							IBIGisUtil.drawMissingRegionUI(container, dataMap, missingList, missingRegionsProperty);
							if(total==0)
							{
								layer.allFeatures.forEach(function(grphc) {
									grphc = glLayer.add(grphc);
									IBIGisUtil.addDataLabel(renderConfig, tdg, chart, grphc, glLayer);

								});
		
								if (glLayer.graphics && glLayer.graphics.length) {
									IBIGisUtil.setLayerExtent(glLayer, null, properties, map);
								}
								//glLayer.refresh();
								layer.layerDone=true;
								layer.allFeatures = null;
							}
						}
						var esriData = getCachedData(lookupKey, layer.url);
						if(!esriData || (Array.isArray(esriData.features) && esriData.features.length != Object.keys(dataMap).length))
							IBIGisUtil.getGeoJsonData(layer, IBIGisUtil.getDataKeys(dataMap), lookupKey, null, doFinishProcessing);
						else
							doFinishProcessing(esriData, true);
						return glLayer;
					} else if (geometrySourceType === 'esri') {
						IBIGisUtil.setProxyForLayer(layer, renderConfig);

						var f, ex, dataMapHave = {};

						glLayer.on('graphic-draw', function(evt) {
							IBIGisUtil.addTooltip(renderConfig, evt.graphic, layer.layerType, groupDataItems);
						});

						for (f in dataMapHave) {
							if (dataMapHave.hasOwnProperty(f)) {

								dmoArray = dataMapHave[f].d;
								if (!dmoArray) {
									return null;
								}
								dmoArray.map(function(dmo) {
									var graphic = new Graphic(dataMapHave[f].g);
									graphic.setGeometry(dataMapHave[f].g);
									var graphicExtent = getGraphicExtent(graphic);
									if (!graphicExtent) {
										return;
									}

									if (!dmo.groupData.hasOwnProperty(colorVarName) || dmo.groupData[colorVarName] != null) {
										graphic.setSymbol(dmo.symbol);
										IBIGisUtil.mergeAttributes(dmo, graphic);
									}

									ex = ex ? ex.union(graphicExtent) : graphicExtent;
									glLayer.add(IBIGisUtil.getChoroplethAsBubble(graphic, layer, properties, circleSizeFactor));
								});
							}
						}

						var maxRecordRetrieval = properties.maxQueryRetrieval;
						var whereArray = IBIGisUtil.createWhere(fieldSourceList, geometryLocateFieldVarNameArray, geoRolesFixedValues, layer.dataDelim, maxRecordCount, maxRecordRetrieval);
						if (whereArray && whereArray.length > 0) {
							var featureLayer = new FeatureLayer(layer.url);
							var query = Query(); //new esri.tasks.Query();
							query.outFields = geometryLocateFieldVarNameArray;
							query.returnGeometry = true;
							query.outSpatialReference = mapSpatialReference;

							var queryDefaults = layer.queryDefaults || properties['queryDefaults_' + featureLayer.spatialReference.wkid] || {};
							for (x in queryDefaults) {
								if (queryDefaults.hasOwnProperty(x)) {
									if (!query[x]) {
										if (x === 'quantizationParameters') {
											//if (featureLayer.supportsCoordinatesQuantization)
											query[x] = queryDefaults[x];
										} else {
											query[x] = queryDefaults[x];
										}
									}
								}
							}
							var queryTask = new QueryTask(layer.url);//new esri.tasks.QueryTask(layer.url);
							var tempFeaturesArray = [];
							var nonQuantizedQueryDone = false;
							var nonQuantizedDmo = {};

							function executeQuery(qqt) {
								if (qqt && qqt.qry && qqt.qt) {
									query = qqt.qry;
									queryTask = qqt.qt;
								}

								if (limitNumOfConnections) {
									if (keysInprogress.length === 4) {
										//console.log('adding to remaining '+ query.where.substring(0,120));
										var query1 = new Query();
										query1.where = query.where;
										query1.returnGeometry = query.returnGeometry;
										query1.outFields = query.outFields;
										query1.outSpatialReference = query.outSpatialReference;
										query1.quantizationParameters = query.quantizationParameters;
										keysRemaining.push({qry: query1, qt: queryTask});
										return;
									}
									keysInprogress.push({qry: query, qt: queryTask});
								}

								queryTask.execute(query, function(results) {
									//take first from list of remaining and query again
									if (limitNumOfConnections) {

										geometryLocateFieldVarNameArray = query.outFields;
										keysDone.push({qry: query, qt: queryTask});
										keysInprogress.forEach(function(obj, index) {
											var uu = obj.qt.url;
											var tmpQry = obj.qry.toString();
											if (uu === queryTask.url && tmpQry === query.toString()) {
												keysInprogress.splice(index);
											}
										});

										if (keysRemaining.length > 0) {
											var qqt = keysRemaining[0];
											keysRemaining.splice(0, 1);
											executeQuery(qqt);
										}
									}

									if (!results.hasOwnProperty('features') || results.features.length === 0) {
										return; // no features, something went wrong
									}

									tempFeaturesArray.push(results.features);
									drawChoroplethFeatures(results.features);
								}, IBIGisUtil.errorHandler);

								function drawChoroplethFeatures(features) {
									features.forEach(function(graphic) {
										var itemId = IBIGisUtil.findGeoKeyValue(geometryLocateFieldVarNameArray, geoRolesFixedValues, graphic.attributes, layer.dataDelim);
										if (!itemId) {
											return;
										}

										var reverseTableLookupKey = reverseTable[itemId + lookupKeyStr];
										if (!reverseTableLookupKey) {
											return;
										}

										var dmoArray = dataMap[reverseTableLookupKey];
										if (!dmoArray) {
											return;
										}
										dmoArray.map(function(dmo) {
											if (dmo) {
												var graphicExtent = getGraphicExtent(graphic);
												if (!graphicExtent) {
													return; // no extent so skip it, yes this happens!
												}

												var minHeightWidth = Math.max.apply(Math, [graphicExtent.getHeight(), graphicExtent.getWidth()]);
												var threshold = layer.quantizationThreshold || properties.quantizationThreshold;
												if (minHeightWidth > 0 && minHeightWidth < threshold && !nonQuantizedQueryDone) {
													nonQuantizedDmo[itemId] = dmo;
													return;
												}

												dmo.done = true;
												if (!dmo.groupData.hasOwnProperty(colorVarName) || dmo.groupData[colorVarName] != null) {
													graphic.setSymbol(dmo.symbol);
													IBIGisUtil.mergeAttributes(dmo, graphic);
												}

												ex = ex ? ex.union(graphicExtent) : graphicExtent;
												var grphc = glLayer.add(IBIGisUtil.getChoroplethAsBubble(graphic, layer, properties, circleSizeFactor));
												IBIGisUtil.addDataLabel(renderConfig, tdg, chart, grphc, graphicsLayer);
											}
										});
									});

									function rerunQueryWithNoQuantization(query, nonQuantizedDmo) {
										nonQuantizedQueryDone = true;
										var whereArray = IBIGisUtil.createWhere(nonQuantizedDmo, geometryLocateFieldVarNameArray, geoRolesFixedValues, layer.dataDelim, maxRecordCount, maxRecordRetrieval);
										if (whereArray) {
											whereArray.forEach(function(whereObj) {
												query.where = whereObj.where;
												query.quantizationParameters = null;
												executeQuery();
											});
										} else {
											IBIGisUtil.drawMissingRegionUI(container, dataMap, missingList, missingRegionsProperty);
											IBIGisUtil.setLayerExtent(glLayer, null, properties, map);
										}
									}
									if (!nonQuantizedQueryDone && nonQuantizedDmo) {
										rerunQueryWithNoQuantization(query, nonQuantizedDmo);
									} else {
										IBIGisUtil.drawMissingRegionUI(container, dataMap, missingList, missingRegionsProperty);
										glLayer.redraw();
										IBIGisUtil.setLayerExtent(glLayer, null, properties, map);
									}
								}
							}

							whereArray.forEach(function(whereObj) {
								query.where = whereObj.where;
								executeQuery();
							});
						}
						IBIGisUtil.drawMissingRegionUI(container, dataMap, missingList, missingRegionsProperty);
						if (ex) {
							IBIGisUtil.setExtent(ex);
						}
						layer.layerDone=true;
						return glLayer;
					}
					return null;
				}
				var reverseTable = {};
				var lists = [];
				var alternateKeysMap;
				for (var x in dataMap) {
					if (dataMap.hasOwnProperty(x)) {

						var dataDelimVar = layer.dataDelim;
						var geoDataField = x.split(dataDelimVar);
						var lookupKey;
						if (lookupPosition === 'first') {
							lookupKey = geoDataField[0];
						} else {
							lookupKey = geoDataField[geoDataField.length - 1];
						}
						var fieldSource = null;

						if (layer.geometrySources) {
							layer.geometrySources = IBIGisUtil.jsonKeysToCase(layer.geometrySources, 'upper');
							function buildAlternateKeys() {
								if (altKeysMap && altKeysMap.length > 0) {
									return altKeysMap;
								}

								var alternateKeyMap = {};
								var sources = layer.geometrySources;
								for (var y in sources) {
									if (sources.hasOwnProperty(y)) {
										var altKeys = sources[y].alt_keys;
										if (altKeys) {
											for (var z in altKeys) {
												if (altKeys.hasOwnProperty(z)) {
													if (altKeys[z]) {
														alternateKeyMap[z.toUpperCase()] = y;
													}
													//ignore if alt_keys = false
												}
											}
										}
									}
								}
								altKeysMap = alternateKeyMap;
								return altKeysMap;
							}

							alternateKeysMap = buildAlternateKeys();

							var tempLookupKey = layer.geometrySources[lookupKey.toUpperCase()];
							if (!tempLookupKey) {
								tempLookupKey = alternateKeysMap[lookupKey.toUpperCase()];
								fieldSource = layer.geometrySources[tempLookupKey] || layer.geometrySources.DEFAULT;
								if (!tempLookupKey) {
									tempLookupKey = lookupKey;
								}
								altDataMapLeft[lookupKey] = fieldSource;

								var newKey, tempList = geoDataField.slice(0);
								if (layer.geometrySourceKeyPosition === 'last') {
									tempList.splice(geoDataField.length, 1);
									tempList.pop();
									tempList.push(tempLookupKey);
									newKey = tempList.join(dataDelimVar);
									reverseTable[newKey ] = x;
								} else if (layer.geometrySourceKeyPosition === 'first') {
									tempList[0] = tempLookupKey;
									newKey = tempList.join(dataDelimVar);
									reverseTable[newKey ] = x;
								}
							} else {
								fieldSource = layer.geometrySources[lookupKey] || layer.geometrySources.DEFAULT;
								reverseTable[x] = x;
							}
							if (!fieldSource) {
								IBIGisUtil.drawMissingRegionUI(container, dataMap, missingList, missingRegionsProperty);
								continue;
							}
						} else {
							//no geometry sources
							reverseTable[x] = x;
						}

						if (!fieldSource) {
							var fieldSourceObj = {
								geometryLocateField: layer.geometryLocateField,
								url: layer.url,
								geometrySourceType: layer.geometrySourceType
							};
							fieldSource = fieldSourceObj;
						}
						if (!(fieldSource.geometryLocateField instanceof Array)) {
							fieldSource.geometryLocateField = [fieldSource.geometryLocateField];
						}

						var tempDelim = '';
						var dataFieldConcat = x.toUpperCase();
						var itemsArray = [];

						if (fieldSource.geometryLocateField && fieldSource.geometryLocateField.length !== geoDataField.length) {
							dataFieldConcat = '';
							geoDataField.forEach(function(d, index) {
								if (index < geoDataField.length - 1) {
									dataFieldConcat += tempDelim + geoDataField[index];
									tempDelim = dataDelimVar;
								}
							});
							itemsArray[dataFieldConcat] = dataMap[x];
							var o = {
								fieldSource: fieldSource,
								items: itemsArray
							};

							var dataFieldObj = lists[lookupKey];
							if (!dataFieldObj) {
								dataFieldObj = lists[alternateKeysMap[lookupKey]];
								lookupKey = alternateKeysMap[lookupKey] || lookupKey;

							}

							if (dataFieldObj != null) {
								dataFieldObj.items[dataFieldConcat] = dataMap[x];
							} else {
								lists[lookupKey] = o;
							}
						} else {
							itemsArray[x] = dataMap[x];
							var obj = {
								fieldSource: fieldSource,
								items: itemsArray
							};
							var defaultVal = lookupKey;
							if (!layer.geometrySources || !layer.geometrySources[lookupKey]) {
								defaultVal = 'DEFAULT'; //create only 1 list to query
							}
							var existingList = lists[defaultVal];
							if (existingList != null) {
								existingList.items[x] = dataMap[x];
							} else {
								lists[defaultVal] = obj;
							}
						}
					}
				}

				var dataKeys = IBIGisUtil.getDataKeys(lists);
				var graphicsLayer = null;
							
				var total=dataKeys.length;
				for(var iii = 0 ; iii < dataKeys.length; ++iii) {				
					var dataKey = dataKeys[iii];
					var item = lists[dataKey];

					var locateField = layer.geometryLocateField;
					if (item.fieldSource) {
						geometrySourceType = item.fieldSource.geometrySourceType;
						layer.url = item.fieldSource.url;
						locateField = item.fieldSource.geometryLocateField;
					}
					if (!(locateField instanceof Array)) {
						locateField = [locateField];
					}
					graphicsLayer = drawChoroplethBasedOnGeometrySourceType(locateField, geometrySourceType, item.items, dataKey, reverseTable);

					}
				
				if(layer.allFeatures)
					{
					layer.allFeatures.forEach(function(grphc) {
						grphc = glLayer.add(grphc);
						IBIGisUtil.addDataLabel(renderConfig, tdg, chart, grphc, graphicsLayer);

					});

					if (graphicsLayer.graphics && graphicsLayer.graphics.length) {
						IBIGisUtil.setLayerExtent(graphicsLayer, null, properties, map);
					}
					layer.allFeatures = null;
					}

				return graphicsLayer;
			},

			drawFeatureLayer: function(layer, map, usedLayerIds, renderConfig) {

				var layerSymbolType, symbol, renderer;
				var geometrySourceType = IBIGisUtil.getGeometrySourceType(layer);

				function createFeatureLayerSymbol(layerSymbolType, layerSymbol) {
					var symbol = null;
					if (layerSymbol) {
						symbol = layerSymbol;
					} else if (layerSymbolType) {
						symbol = properties.defaultReferenceSymbolInfo[layerSymbolType];
					}
					if (symbol) {
						return IBIGisUtil.createSymbolFromObject(symbol, dojoObjects);
					}
					return null;
				}

				if (geometrySourceType === 'geojson' || geometrySourceType === 'ibijson') {
					var esriData = IBIGisUtil.getGeoJsonData(layer, null);
					if (!esriData) {
						return null;
					}
					function jsonToEsriSymbolType(json) {
						if (json && json.features && json.features[0] && json.features[0].geometry.type) {
							switch (json.features[0].geometry.type) {
								case 'Point' :
								case 'MultiPoint' :
									return 'SimpleMarkerSymbol';
								case 'LineString' :
								case 'MultiLineString' :
									return 'SimpleLineSymbol';
								case 'Polygon' :
								case 'MultiPolygon' :
									return 'SimpleFillSymbol';
							}
						}
						return 'SimpleFillSymbol';
					}
					layerSymbolType = IBIGisUtil.convertToEsriSymbolType(layer.symbolType) || 'SimpleFillSymbol';
					symbol = createFeatureLayerSymbol(layerSymbolType, layer.symbol);

					var glLayer = IBIGisUtil.createGraphicsLayer(chart, layer, usedLayerIds, containerIDPrefix);
					esriData.features.forEach(function(feature) {
						var graphic = new Graphic(feature);
						if (symbol) {
							graphic.setSymbol(symbol);
						}
						glLayer.add(IBIGisUtil.getChoroplethAsBubble(graphic, layer, properties, circleSizeFactor));
					});
					return glLayer;

				} else if (geometrySourceType === 'esri') {
					IBIGisUtil.setProxyForLayer(layer, renderConfig);

					var layerOptions = IBIGisUtil.createLayerOptions(chart, layer, usedLayerIds, containerIDPrefix);
					var layerObjectType = layer.layerObjectType || 'esri/layers/FeatureLayer';
					var layerObject = dojoObjects[layerObjectType];
					if (!layerObject) {
						return null;
					}

					var featureLayer;

					function createClassedColorRendererParms(fieldId, layer, tempLayer) {
						if (!fieldId) {
							return null;
						}
						var o = {
							basemap: map.getBasemap(),
							layer: tempLayer
						};
						var p;
						if (typeof fieldId === 'string') {
							p = {
								classificationMethod: 'quantile',
								field: fieldId
							};
							o = chart.mergeObjects(p, o);
						} else	{
							o = chart.mergeObjects(fieldId, o);
						}
						var functionName = o.functionName || 'createClassedColorRenderer';
						delete o.functionName;

						return {
							parms: o,
							functionName: functionName
						};
					}

					if (layerObjectType === 'esri/layers/ArcGISDynamicMapServiceLayer') {
						featureLayer = new dojoObjects['esri/layers/ArcGISDynamicMapServiceLayer'](layer.url, layerOptions);
						var optionsArray = [];

						function mergeSmartMappingFields(fieldsObj) {
							if (fieldsObj) {
								if (typeof fieldsObj === 'string') {
									var o = {field: [fieldsObj]};
									return o.field;
								} else if (typeof fieldsObj.field === 'string') {
									var p = [];
									p.push(fieldsObj.field);
									return p;
								}
								return fieldsObj;
							}
							return null;
						}

						function addSmartMappingToAllLayers(fieldId, resp) {
							var layers = resp.layers;
							var ofields = mergeSmartMappingFields(fieldId);
							for (var j = 0; j < layers.length; j++) {
								(function() {
									var tempLayer = new FeatureLayer(layer.url + '/' + j, {
										mode: FeatureLayer.MODE_SNAPSHOT,
										id: '' + j
									});

									if (ofields.field && ofields.field.length > 0) {
										fieldId = ofields.field; // smartMapping as array
									} else {
										fieldId = ofields; // smartMapping as object
									}
									tempLayer.on('load', function() {
										if (tempLayer.hasOwnProperty('fields')) {
											var appliedSmartRendererToField = false;
											fieldId.forEach(function(fieldName) {
												tempLayer.fields.forEach(function(field) {
													if (!appliedSmartRendererToField) {
														var tempLayerFieldName = field.name;
														if (tempLayerFieldName === fieldName) {
															var o = {field: fieldName};
															appliedSmartRendererToField = true;
															createClassedColorRendererParmsAndApplySmartMapping(o, layers.length);
														}
													}
												});
											});
										}
									});

									function createClassedColorRendererParmsAndApplySmartMapping(fieldId, totalLayers) {
										var o = createClassedColorRendererParms(fieldId, layer, tempLayer);
										dojoObjects['esri/renderers/smartMapping'][o.functionName].apply(this, [o.parms]).then(function(response) {
											var drawingOptions = new esri.layers.LayerDrawingOptions();
											drawingOptions.renderer = response.renderer;
											optionsArray[tempLayer.id] = drawingOptions;
											if (optionsArray.length === totalLayers) {
												featureLayer.setLayerDrawingOptions(optionsArray);
											}
										});
									}
								})();
							}
						}

						function addSmartMapping(fieldId) {
							var req = esriRequest({
								url: layer.url,
								content: {f: 'json'}
							});
							req.then(function(response) {
								addSmartMappingToAllLayers(fieldId, response);
							}, IBIGisUtil.errorHandler);
						}

						function queryGroupForLayers(webMapInfo) {
							var portal = new esri.arcgis.Portal('http://www.arcgis.com');
							var queryParams = {
								q: webMapInfo.queryString,
								sortField: 'title',
								num: 10,
								start: 0
							};

							function getLayerItemDataUrl(results) {
								for (var i = 0; i < results.results.length; i++) {
									var layerInfo = results.results[i];
									var itemDataUrl = webMapInfo.itemDataUrl;
									if(!itemDataUrl || itemDataUrl.indexOf(layerInfo.id) == -1)
										itemDataUrl = 'https://www.arcgis.com/sharing/rest/content/items/' + layerInfo.id + '/data?f=json';
									var url = featureLayer.url;
									var type = layerInfo.type;
									switch (type) {
										case 'Map Service':
											loadMapService(url, itemDataUrl, webMapInfo.opacity);
											break;
										case 'Feature Service':
										//	loadFeatureService(url, itemDataUrl, webMapInfo.opacity);
											break;
										default:
										//Layer type not recognized
									}
								}
							}
							portal.queryItems(queryParams).then(getLayerItemDataUrl);
						}

						if (layer.smartMapping) {
							if (layer.smartMapping.length > 0) { // as array
								for (var ij = 0; ij < layer.smartMapping.length; ++ij) {
									if (layer.smartMapping[ij]) {
										if (layer.smartMapping[ij].field) {
											addSmartMapping(layer.smartMapping[ij]);
										} else if (layer.smartMapping[ij].webMapInfo) {
											queryGroupForLayers(layer.smartMapping[ij].webMapInfo);
										}
									}
								}
							} else if (layer.smartMapping.field) { // as object
								addSmartMapping(layer.smartMapping.field);
							} else if (layer.smartMapping.webMapInfo) { // as web map
								queryGroupForLayers(layer.smartMapping.webMapInfo);
							}
						}

						if (layer.visibleLayers)	{
							featureLayer.setVisibleLayers(layer.visibleLayers);
						}


						function loadMapService(url, itemDataUrl, opacity) {

							var dynamicLayer = new esri.layers.ArcGISDynamicMapServiceLayer(url, {
								showAttribution: false,
								opacity: opacity ? opacity : 0.5
							});
							dynamicLayer.on('error', function(error) {
								//console.log(error);
							});
							dynamicLayer.on('load', function(evt) {
								getDynanicLayerInfoAndDraw(itemDataUrl, evt.layer);
							});
							map.addLayer(dynamicLayer);
						}

						function loadFeatureService(url, itemDataUrl, opacity) {

							var dynamicLayer = new esri.layers.FeatureLayer(itemDataUrl, {
								showAttribution: false,
								opacity: opacity ? opacity : 0.5
							});
							dynamicLayer.on('error', function(error) {
								//console.log(error);
							});
							dynamicLayer.on('load', function(evt) {
						//		getDynanicLayerInfoAndDraw(itemDataUrl, evt.layer);
							});
							map.addLayer(dynamicLayer);
						}
						function getDynanicLayerInfoAndDraw(itemDataUrl, dynamicLayer) {
							var drawingOptions = [];
							var total = dynamicLayer.layerInfos.length;
							for (var i = 0; i < total; i++) {
								applyRendererInfo(i);
							}

							function applyRendererInfo(i) {
								var requestHandle = esriRequest({
									url: itemDataUrl
								});
								requestHandle.then(function(response) {
									response.layers.forEach(function(layer) {
										var ldo = new esri.layers.LayerDrawingOptions();
										if (layer.layerDefinition && layer.layerDefinition.drawingInfo) {
											ldo.renderer = getRenderer(layer.layerDefinition.drawingInfo.renderer);
											drawingOptions[i] = ldo;
										}
									});
									if (total === drawingOptions.length) {
										featureLayer.setLayerDrawingOptions(drawingOptions, false);
									}
								}, IBIGisUtil.errorHandler);
							}
						}

						function getRenderer(json) {
							var renderer = null;
							var type = json.type;
							switch (type) {
								case 'simple':
									renderer = new (dojoObjects['esri/renderers/SimpleRenderer'])(json);
									break;
								case 'uniqueValue':
									renderer = new (dojoObjects['esri/renderers/UniqueValueRenderer'])(json);
									break;
								case 'classBreaks':
									renderer = new (dojoObjects['esri/renderers/ClassBreaksRenderer'])(json);
									break;
								default:

							}
							return renderer;
						}
					} else if (layerObjectType === 'esri/layers/FeatureLayer') {
						featureLayer = new layerObject(layer.url, layerOptions);

						if (layer.smartMapping && layer.smartMapping[0]) {
							var o = createClassedColorRendererParms(layer.smartMapping[0], layer, featureLayer);
							dojoObjects['esri/renderers/smartMapping'][o.functionName].apply(this, [o.parms]).then(function(response) {
								featureLayer.setRenderer(response.renderer);
								//tureLayer.redraw();
								featureLayer.refresh();
							});
						} else {
							if (layer.symbol || layer.symbolType) {
								layerSymbolType = IBIGisUtil.convertToEsriSymbolType(layer.symbolType);
								symbol = createFeatureLayerSymbol(layerSymbolType, layer.symbol);

								if (symbol) {
									renderer = new (dojoObjects['esri/renderers/SimpleRenderer'])(symbol);
									featureLayer.setRenderer(renderer);
								}
							} else {
								featureLayer.on('load', function() {
									if(!featureLayer.renderer || !featureLayer.renderer.symbol){
										layerSymbolType = IBIGisUtil.convertToEsriSymbolType(featureLayer.geometryType);
										symbol = createFeatureLayerSymbol(layerSymbolType, layer.symbol);
	
										if (symbol &&  (!Array.isArray(featureLayer.renderer.infos) ||
																featureLayer.renderer.infos.length==0)) {
											renderer = new (dojoObjects['esri/renderers/SimpleRenderer'])(symbol);
											featureLayer.setRenderer(renderer);
										}
									}
								});
							}
						}
					} else {
						featureLayer = new layerObject(layer.url, layerOptions);
					}

					return featureLayer;
				}
			}
		});
		return EsriChoropleth;
	}
);
