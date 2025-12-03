/*global define: false */

/* Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved. */

define(
	[
		'dojo/_base/declare',
		'esri/geometry/webMercatorUtils',
		'esri/layers/FeatureLayer',
		'esri/tasks/QueryTask',
		'esri/tasks/query',
		'esri/graphicsUtils',
		'esri/graphic',
		'esri/geometry/Circle',
		'esri/units',
		'esri/geometry/Point',
		'esri/renderers/HeatmapRenderer',
		'esri/renderers/SimpleRenderer',
		'esri/geometry/Extent',
	],
	function(declare,
		WebMercatorUtils,
		FeatureLayer,
		QueryTask,
		Query,
		GraphicsUtils,
		Graphic,
		Circle,
		Units,
		Point,
		HeatmapRenderer,
		SimpleRenderer,
		Extent
	) {
		var chart;
		var properties;
		var container;
		var IBIGisUtil;
		var missingRegionsProperty;
		var dojoObjects;
		var containerIDPrefix;
		var tdg;

		var EsriBubble = declare([], {
			constructor: function() { },

			initialize: function(rc, gisUtil, dobj, tdgObj) {
				chart = rc.moonbeamInstance;
				properties = rc.properties;
				container = rc.container;
				IBIGisUtil = gisUtil;
				missingRegionsProperty = rc.properties.missingRegionsHeightFactor || 0.8;
				dojoObjects = dobj;
				containerIDPrefix = rc.containerIDPrefix;
				tdg = tdgObj;
			},

			draw: function(layer, groupIdVarName, seriesIdVarName, map, usedLayerIds, maxRecordCount, renderConfig) {
				container = renderConfig.container;
				chart = renderConfig.moonbeamInstance;
				var traceIt = false;

				var missingList = [];
				var geoRolesFixedValues = this.getDefaultValuesFromGeoRolesTable(layer);

				var sizeVarName, colorVarName;
				var lookupkeyVarName = null;
				var scaledVarName = IBIGisUtil.toInternalEsriDataFieldName('scaledValue');

				if (chart.dataArrayMap && chart.dataArrayMap.indexOf('value') >= 0) {
					sizeVarName = 'value';
				}
				if (chart.dataArrayMap && chart.dataArrayMap.indexOf('color') >= 0) {
					colorVarName = 'color';
				}
				if (chart.dataArrayMap && chart.dataArrayMap.indexOf('lookupKey') >= 0) {
					lookupkeyVarName = 'lookupKey';
				}
				var geometrySourceType = IBIGisUtil.getGeometrySourceType(layer);
				var lookupPosition = layer.geometrySourceKeyPosition;
				if (!lookupPosition) {
					lookupPosition = 'first';
				}
				var createSymbol = IBIGisUtil.createSymbol;
				var keyVarName = (geometrySourceType === 'seriesdata' ? null : layer.geometryDataField || 'name');
				var groupDataItems = {
					groupIdVarName: groupIdVarName,
					seriesIdVarName: seriesIdVarName,
					keyVarName: keyVarName,
					sizeVarName: sizeVarName,
					colorVarName: colorVarName,
					lookupkeyVarName: lookupkeyVarName
				};

				var createBubbleSymbol = function(chart, properties, dojoObjects, layer, color, border, dma, size) {
					return createSymbol(chart, properties, dojoObjects, layer, color, border, dma, size);
				};

				var dataMap;
				var altDataMapLeft = {};
				var altKeysMap;
				if (layer.seriesIndex == null) {
					dataMap = IBIGisUtil.groupDataForALLSeries(layer, createBubbleSymbol, groupDataItems, chart, renderConfig, dojoObjects);
				} else {
					dataMap = IBIGisUtil.groupDataForSeriesOne(layer, createBubbleSymbol, groupDataItems, chart, renderConfig, dojoObjects);
				}
				if (!dataMap) {
					return undefined;
				}

				var items = [];

				var gl = IBIGisUtil.createGraphicsLayer(chart, layer, usedLayerIds, containerIDPrefix);
				var parentExtent = null;

				function drawBubbleBasedOnGeometrySourceType(geometryLocateFieldVarNameArray, geometrySourceType, fieldSourceList, lookupKey, reverseTable, lastOne) {
					var x;
					var lookupKeyStr = (layer.geometrySourceKeyPosition === 'last' ? layer.dataDelim + lookupKey : lookupKey + layer.dataDelim);
					if (lookupKey === 'DEFAULT') {
						lookupKeyStr = '';
					}
					if (geometrySourceType === 'seriesdata') {

						var xVarName = layer.geometryXY ? layer.geometryXY.x || 'lng' : 'lng';
						var yVarName = layer.geometryXY ? layer.geometryXY.y || 'lat' : 'lat';
						keyVarName = layer.geometryDataField || 'name';

						for (x in dataMap) {
							if (dataMap.hasOwnProperty(x)) {
								var dmoArray = dataMap[x];
								dmoArray.map(function(dmo) {
									var point;
									var geometry;
									if (chart.dataArrayMap && chart.dataArrayMap.indexOf(keyVarName) > -1) {
										if (dmo.groupData[keyVarName] == null) {
											if (geometrySourceType === 'seriesdata') {
												dmo.done = true;
											}
											return;
										}

										geometry = IBIGisUtil.getGeometryFromDataArrayItem(dmo.groupData, keyVarName);
										point = IBIGisUtil.getCentroid(geometry);
									} else {
										point = new Point(parseFloat(dmo.groupData[xVarName]), parseFloat(dmo.groupData[yVarName]));
										geometry = new Point(parseFloat(dmo.groupData[xVarName]), parseFloat(dmo.groupData[yVarName]));
									}
									if (point && !isNaN(point.x) && !isNaN(point.y) && (sizeVarName == null || dmo.groupData[sizeVarName] != null)) {  // Filter out invalid markers
										items.push({
											geometry: geometry,
											point: point,
											symbol: dmo.symbol,
											groupData: dmo.groupData
										});
										delete dataMap[x];
									}
								});
							}
						}
						IBIGisUtil.drawMissingRegionUI(container, dataMap, missingList, missingRegionsProperty);
						layer.layerDone=true;
						return drawBubbles(gl, layer, items, groupDataItems);

					} else if (geometrySourceType === 'geojson' || geometrySourceType === 'ibijson' || geometrySourceType === 'csv') {
						function doFinishProcessing(esriData) {
							esriData.features.forEach(function(feature) {
								var itemId = IBIGisUtil.findGeoKeyValue(geometryLocateFieldVarNameArray, geoRolesFixedValues, feature.attributes, layer.dataDelim);
								if (!itemId) {
									return;
								}
								//var dmoArray = dataMap[itemId];
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
	
								if (dmoArray) {
									dmoArray.map(function(dmo) {
										if (dmo && ((sizeVarName && dmo.groupData[sizeVarName] != null) || !sizeVarName)) {
											var graphic = new Graphic(feature); // temp graphic
											dmo.done = true;
											items.push({
												geometry: graphic.geometry,
												point: IBIGisUtil.getCentroid(graphic.geometry),
												symbol: dmo.symbol,
												groupData: dmo.groupData
											});
										} else if (dmo) {
											dmo.done = true;
										}
									});
								}
							});
	
							IBIGisUtil.drawMissingRegionUI(container, dataMap, missingList, missingRegionsProperty);
							if(items.length!=0)
								drawBubbles(gl, layer, items, groupDataItems, lastOne);
							else if(lastOne) {
								layer.gl=gl;
								layer.layerDone=true;
							}
						}
						IBIGisUtil.getGeoJsonData(layer, IBIGisUtil.getDataKeys(dataMap), lookupKey, null,doFinishProcessing);
						
					} else if (geometrySourceType === 'esri') {
						IBIGisUtil.setProxyForLayer(layer, renderConfig);

						var query = new Query(); //new esri.tasks.Query();
						query.outFields = geometryLocateFieldVarNameArray;
						query.returnGeometry = true;
						var maxRecordRetrieval = properties.maxQueryRetrieval;
						var whereArray = IBIGisUtil.createWhere(fieldSourceList, geometryLocateFieldVarNameArray, geoRolesFixedValues, layer.dataDelim, maxRecordCount, maxRecordRetrieval);
						if (whereArray && whereArray.length > 0) {
							var queryTask = new QueryTask(layer.url);//new esri.tasks.QueryTask(layer.url);
							var featureLayer = new FeatureLayer(layer.url);
							var queryDefaults = layer.queryDefaults || properties['queryDefaults_' + featureLayer.spatialReference.wkid] || {};
							query.outSpatialReference = map.spatialReference;

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
							var tempFeatureSetsArray = [];
							var totalQueries = whereArray.length;
							var index = 0;
							var secondQueryDone = false;
							whereArray.forEach(function(whereObj) {
								query.where = (whereObj.where ? whereObj.where : '1=1');

								var graphicsById = {};
								queryTask.execute(query, function(results) {
									index++;
									if (!results.hasOwnProperty('features') || results.features.length === 0) {
										if (tempFeatureSetsArray.length === 0) { //return when there is nothing to draw
											return; // no features, something went wrong
										}
									}
									tempFeatureSetsArray.push(results.features);
									if (totalQueries === index) {
										drawBubblemapFeatures(IBIGisUtil.combineFeaturesFromFeaturesArray(tempFeatureSetsArray), graphicsById, lastOne );
									}

								}, IBIGisUtil.errorHandler);
							}); //end of whereArray.forEach
						}
						IBIGisUtil.drawMissingRegionUI(container, dataMap, missingList, missingRegionsProperty);
						layer.layerDone=true;
						return gl;
					}

					function drawBubblemapFeatures(features, graphicsById, lastOne) {
						var graphicsArrayTemp = [];
						features.forEach(function(graphic) {
							var itemId = IBIGisUtil.findGeoKeyValue(geometryLocateFieldVarNameArray, geoRolesFixedValues, graphic.attributes, layer.dataDelim);

							if (!itemId) {
								return;
							}

							var centroid, g = graphicsById[itemId];

							if (!g) {
								centroid = IBIGisUtil.getCentroid(graphic.geometry);
								if (centroid) {
									graphicsById[itemId] = {
										centroid: centroid,
										geometry: graphic.geometry
									};
								} else {
									graphicsArrayTemp[itemId] = graphic;
								}
							} else {
								centroid = IBIGisUtil.getCentroid(g.geometry);
								if (centroid) {
									g.geometry = IBIGisUtil.combineGeometry(g.geometry, graphic.geometry);
									g.centroid = centroid;
								} else {
									graphicsArrayTemp[itemId] = graphic;
								}
							}
						});
						for (var itemId in graphicsById) {
							if (graphicsById.hasOwnProperty(itemId)) {

								var reverseTableLookupKey = reverseTable[itemId + lookupKeyStr];
								if (!reverseTableLookupKey) {
									return;
								}

								var dmoArray = dataMap[reverseTableLookupKey];
								dmoArray.map(function(dmo) {
									if (dmo) {
										dmo.done = true;
										var oldItem = {
											point: graphicsById[itemId].centroid,
											symbol: dmo.symbol,
											groupData: dmo.groupData,
											geometry: graphicsById[itemId].geometry
										};
										items.push(oldItem);
									}
								});
							}
						}

						var maxRecordRetrieval = properties.maxQueryRetrieval;
						var whereArray = IBIGisUtil.createWhere(graphicsArrayTemp, geometryLocateFieldVarNameArray, geoRolesFixedValues, layer.dataDelim, maxRecordCount, maxRecordRetrieval);
						if (whereArray && whereArray.length > 0 && !secondQueryDone) {
							whereArray.forEach(function(whereObj) {
								query.where = whereObj.where;
							});
							query.quantizationParameters = null;
							//execute the query again with quantizationParameters = null;
							queryTask.execute(query, function(results) {
								secondQueryDone = true;
								if (!results.hasOwnProperty('features') || results.features.length === 0) {
									return; // no features, something went wrong
								}
								drawBubblemapFeatures(results.features, graphicsById, lastOne);
							}, IBIGisUtil.errorHandler);
						}

						IBIGisUtil.drawMissingRegionUI(container, dataMap, missingList, missingRegionsProperty);
						return drawBubbles(gl, layer, items, groupDataItems, lastOne);
					}

					//	aaa is a array of objects that
					//	look like {
					//		groupData : the series/group object
					//		point : point
					//		graphic : graphic from esri
					//	}
					//
					// this  method now sort the itmes based on the relitive size of the bubble
					// so that the smaller bubbled end up on top (high-z order) the the larger ones
					// the has two effects
					// 1> when painting more then one series, all the bubbles for 1 series can now be seen with the smaller one being on top of the larger ones
					// 2> smaller bubbles of different series now paint on top of larger bubbles of other series, other wise they may not been seen at all
					function drawBubbles(gl, layer, items, groupDataItems, lastOne) {

						var minMax = {min: Infinity, max: -Infinity};
						// first we need to regroup
						if (sizeVarName != null) {

							items.forEach(function(dmo) {
								dmo.groupData[sizeVarName] = Math.abs(dmo.groupData[sizeVarName] || 0);
								dmo.groupData[scaledVarName] = Math.sqrt(dmo.groupData[sizeVarName] / Math.PI);
								minMax.min = Math.min(dmo.groupData[scaledVarName], minMax.min);
								minMax.max = Math.max(dmo.groupData[scaledVarName], minMax.max);
							});
							items.sort(function(a, b) {
								return b.groupData[sizeVarName] - a.groupData[sizeVarName];
							});
						}

						gl.clear();

						var renderer, allSymbols = {};
						var extent = null;
						var dataLabelArray = [];
						items.forEach(function(dmo) {
							var graphic = new Graphic(dmo.point);
							if (!graphic.geometry) {
								return;
							}
							if (dmo.symbol) {
								allSymbols[IBIGisUtil.gisSeriesIdGroupIdKey(chart, dmo.groupData[seriesIdVarName], dmo.groupData[groupIdVarName])] = dmo.symbol;
							}
							IBIGisUtil.mergeAttributes(dmo, graphic);
							gl.add(graphic);

							var dataLabelGraphic = IBIGisUtil.addDataLabel(renderConfig, tdg, chart, graphic);
							if (dataLabelGraphic) {
								dataLabelArray.push(dataLabelGraphic);
							}

							if (dmo.geometry.spatialReference.wkid === 4326) {
								dmo.geometry = WebMercatorUtils.geographicToWebMercator(graphic.geometry);
							}							
							if (dmo.geometry.rings && dmo.geometry.rings.length > 0) { // not sure why this test is here
								var e = GraphicsUtils.graphicsExtent([new Graphic(dmo.geometry)]);
								extent = extent ? e.union(extent) : e;
							}
							else if( dmo.geometry.type === "point")
								{
								var newExtent = new Extent(dmo.geometry.x,dmo.geometry.y,dmo.geometry.x,dmo.geometry.y,dmo.geometry.spatialReference);
								extent = extent ? newExtent.union(extent) : newExtent;
								}
						});

						if (layer.renderer && layer.layerType === 'heat') {
							var featureCollection = {
								layerDefinition: {
									geometryType: 'esriGeometryPoint',
									fields: {} // this are the fields
								}
							};

							var featureLayer = new FeatureLayer(featureCollection, {
								id: gl.id
							});

							renderer = new HeatmapRenderer(layer.renderer);
							gl = featureLayer;
							gl.setRenderer(renderer);

						} else {
							gl.on('graphic-draw', function(evt) {
								IBIGisUtil.addTooltip(renderConfig, evt.graphic, layer.layerType, groupDataItems);
							});
							renderer = new SimpleRenderer();
							renderer.getSymbol = function(x) {
								var smbl = allSymbols[IBIGisUtil.gisSeriesIdGroupIdKey(chart, x.attributes[seriesIdVarName], x.attributes[groupIdVarName])];
								return smbl;
							};

							if (sizeVarName != null) {  // have a size bucket - set proportional rendering info
								var sizeScale = renderConfig.modules.sizeScale.getSizeScale();
								var bubbleRadiusMinMax = sizeScale.range();

								renderer.setProportionalSymbolInfo({
									field: scaledVarName,
									minSize: 0,
									maxSize: bubbleRadiusMinMax[1] * 2,
									minDataValue: 0,
									maxDataValue: minMax.max
								});
							}


							gl.setRenderer(renderer);
							gl.redraw();
							dataLabelArray.forEach(function(dl) {
								gl.add(dl);
							});
							gl.redraw();
						}

						if(extent && traceIt)
							console.log("1 : " + JSON.stringify(extent));
						parentExtent = parentExtent ? parentExtent.union(extent) : extent;
						if(parentExtent && traceIt)
							console.log("1 : " + JSON.stringify(parentExtent));

                        if(lastOne){
							IBIGisUtil.setLayerExtent(gl, parentExtent, properties, map);
							layer.gl=gl;
							map.addLayer(gl);
							layer.layerDone=true;							
                        }


						return gl;
					}
										
					if(parentExtent && traceIt)
						console.log("2 : " + JSON.stringify(parentExtent));
					
					return layer;
				}

				// create a table of key/fieldSource
				var reverseTable = {};
				var lists = [];
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
							var alternateKeysMap = buildAlternateKeys();

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
									reverseTable[newKey] = x;
								} else if (layer.geometrySourceKeyPosition === 'first') {
									tempList[0] = tempLookupKey;
									newKey = tempList.join(dataDelimVar);
									reverseTable[newKey] = x;
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
							//no geometrySources
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

						var o, itemsArray = [];
						var tempDelim = '';
						var dataFieldConcat = x;

						if (fieldSource.geometryLocateField && fieldSource.geometryLocateField.length !== geoDataField.length) {
							dataFieldConcat = '';
							geoDataField.forEach(function(d, index) {
								if (index < geoDataField.length - 1) {
									dataFieldConcat += tempDelim + geoDataField[index];
									tempDelim = dataDelimVar;
								}
							});

							itemsArray[dataFieldConcat] = dataMap[x];
							o = {
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
							o = {
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
								lists[defaultVal] = o;
							}
						}
					}
				}
				//end of table create

				var graphicsLayer = null;
				var dataKeys = IBIGisUtil.getDataKeys(lists);
				var c = 0;
				var dataKeysLength = dataKeys.length;
				dataKeys.forEach(function(dataKey) {
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
					graphicsLayer = drawBubbleBasedOnGeometrySourceType(locateField, geometrySourceType, item.items, dataKey, reverseTable, c === (dataKeysLength - 1));
					c = c+1;
				});
				

				if(parentExtent && traceIt)
					console.log("3 : " + JSON.stringify(parentExtent));
				
				IBIGisUtil.setLayerExtent(graphicsLayer, parentExtent, properties, map);
				return graphicsLayer;
			},

			getDefaultValuesFromGeoRolesTable: function(layer) {
				//  [{ role : 'COUNTRY',format : 'NAME',values:'United States'}, { role : 'STATE',format : 'NAME'} ]],
				function getValuesForGeoRoles(geoRole)	{
					var rtn = [];
					if (geoRole)		{
						for (var i = 0; i < geoRole.length; ++i) {
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
				for (var i = 0; i < Math.max(layerValues.length, layerExternalValues.length); ++i)	{
					var a = layerValues[i] || [];
					var b = layerExternalValues[i] || [];
					combined.push(a.concat(b));
				}
				return combined;
			}
		});
		return EsriBubble;
	});
