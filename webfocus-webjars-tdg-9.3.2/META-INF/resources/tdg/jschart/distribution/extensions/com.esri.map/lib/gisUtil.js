/*global tdgchart: false, define: false, esri: false, pv: false, dojox: false */

/* Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved. */
/* $Revision: 1.52 $: */

var WFGlobals;

define(
	[
		'dojo/_base/declare',
		'esri/graphic',
		'esri/geometry/jsonUtils',
		'esri/geometry/geometryEngine',
		'esri/geometry/Geometry',
		'esri/geometry/Point',
		'extras/jsonConverters',
		'esri/layers/GraphicsLayer',
		'esri/graphicsUtils',
		'esri/geometry/Extent',
		'esri/urlUtils',
		'esri/geometry/webMercatorUtils',
		'esri/geometry/Circle',
		'esri/units',
		'esri/symbols/TextSymbol',
		'esri/symbols/Font'
	],
	function(
		declare,
		Graphic,
		GeometryJsonUtils,
		GeometryEngine,
		Geometry,
		Point,
		GeoJsonConverters,
		GraphicsLayer,
		GraphicsUtils,
		Extent,
		urlUtils,
		WebMercatorUtils,
		Circle,
		Units,
		TextSymbol,
		Font
	) {
		var selectedLayerOpacityArray = [];
		var selectedLayerVisibilityArray = [];
		var GisUtil = declare([], {

			constructor: function() { },

			gisSeriesIdGroupIdKey: function(chart, seriesID, groupId) {
				return chart.buildClassName('esrikeyValue', seriesID, groupId);
			},

			gisGroupDataForIthSeries: function(chart, data, layer, seriesID, fields) {

				var groupIdVarName = fields.groupIdVarName;
				var seriesIdVarName = fields.seriesIdVarName;
				var keyVarName = fields.keyVarName;
				var sizeVarName = fields.sizeVarName;
				var colorVarName = fields.colorVarName;
				var groupId = 0;
				var dataMap = { };
				var seriesData = data[seriesID];

				if (seriesData == null) {
					return undefined;
				}
				var outerThis = this;
				seriesData.map(function(el) {
					var tobj = chart.cloneObject(el);
					tobj[groupIdVarName] = groupId;
					tobj[seriesIdVarName] = seriesID;

					var o = {
						groupData: tobj,
						done: false,
						groupId: groupId,
						seriesID: seriesID,
						symbol: null
					};
					if (sizeVarName) {
						if(el[sizeVarName] == undefined){
							el[sizeVarName]=o[sizeVarName] = tobj[sizeVarName]=0;
						}
						else
							o[sizeVarName] = el[sizeVarName];
					}
					if (colorVarName) {
						if(el[colorVarName] == undefined){
							el[colorVarName]=o[colorVarName] = tobj[colorVarName]=0;
						}
						else
							o[colorVarName] = el[colorVarName];
					}
					var keyValue = null;
					if (keyVarName) {
						if (tobj[keyVarName]) {
							keyValue = tobj[keyVarName].toString().toUpperCase();
						}
					} else {
						keyValue = outerThis.gisSeriesIdGroupIdKey(chart, seriesID, groupId);
					}
					if (keyValue) {
						dataMap[keyValue] = o;
					}
					++groupId;
					return tobj;
				});
				return dataMap;
			},

			getGeometryFromDataArrayItem: function(backEndItem, keyVarName) {
				var node = backEndItem[keyVarName];

				var json = null;
				if (typeof node === 'string') {
					try {
						json = JSON.parse(node);
					} catch (e) {
						return null;
					}
				} else if (typeof node === 'object') {
					json = node;
				} else if (typeof node === 'function') {
					json = node(backEndItem);
				}
				if (json) {
					if (json.spatialReference && json.geometry && json.geometry.spatialReference == null)	{
						json.geometry.spatialReference = json.spatialReference;
					}

					var geometry = GeometryJsonUtils.fromJson(json);
					if (geometry == null) {
						// see if its a graphic
						var o = new Graphic(json);
						if (o && o.geometry) {
							geometry = o.geometry;
						}
					}
					return geometry;
				}
				return undefined;
			},
			_processRing: function processRing(ring, translate_x, translate_y, scale_x, scale_y) {

				if (ring[0] instanceof Array && ring[0][0] instanceof Array) {
					for (var i = 0; i < ring.length; ++i) {
						this._processRing(ring[i], translate_x, translate_y, scale_x, scale_y);
					}
					return;
				}
				if (ring.length === 0) {
					return;
				}

				var xx = ring[0][0] * scale_x;
				var yy = ring[0][1] * scale_y;

				if (translate_x < 0) {
					xx = xx + translate_x;
					yy = translate_y - yy;
				} else {
					xx = translate_x + xx;
					yy = translate_y - yy;
				}

				ring[0][0] = xx;
				ring[0][1] = yy;


				for (var k = 1; k < ring.length; ++k) {
					xx = xx + (ring[k][0] * scale_x);
					yy = yy - (ring[k][1] * scale_y);
					ring[k][0] = xx;
					ring[k][1] = yy;
				}
			},

			_decodeIbiQuantizedJson: function(featureSet) {


				if (!featureSet || !featureSet.transform) {
					return featureSet;
				}

				var scale =	featureSet.transform.scale;
				var translate = featureSet.transform.translate;
				var rings = featureSet.geometry.rings;

				var scale_X = scale[0];
				var scale_Y = scale[1];

				var translate_X = translate[0];
				var translate_Y = translate[1];
				this._processRing(rings, translate_X, translate_Y, scale_X, scale_Y);
				return featureSet;
			},

			_toEsriFromCSV: function(data, layer) {
				var options = {
					fieldNames: ['region', 'lng', 'lat'],
					fieldSep: ',',
					lineSep: '\n',
					firstRowIsTitles: false,
					removeSurroundingQuotes: true
				};

				if (layer.csvOptions) {
					options = tdgchart.mergeObjects(layer.csvOptions, options);
				}

				var cleanData;
				if (!options.removeSurroundingQuotes) {
					cleanData = function(txt) {
						return txt.trim();
					};
				} else {
					cleanData = function(txt) {
						return txt.trim().replace(/^"/, '').replace(/"$/, '');
					};
				}

				var features = [];

				if (options.firstRowIsTitles) {
					options.fieldNames = data.slice(0, data.indexOf(options.lineSep))
						.split(options.fieldSep)
						.map(function(el) {
							return (el || '').trim();
						});
					data = data.slice(data.indexOf(options.lineSep) + 1);
				}
				for (var i = 0; i < options.fieldNames.length; ++i) {
					options.fieldNames[i] = cleanData(options.fieldNames[i]);
				}

				data.split(options.lineSep).forEach(function(el) {
					var items = el.split(options.fieldSep);
					if (items.length < 2) {
						return;
					}
					var f = {
						type: 'Feature',
						attributes: {},
						geometry: new Point(parseFloat(cleanData(items[options.fieldNames.indexOf('lng')])),
							parseFloat(cleanData(items[options.fieldNames.indexOf('lat')]))
						)
					};
					options.fieldNames.forEach(function(el, idx) {
						if (el !== 'lat' && el !== 'lng') {
							f.attributes[el] = cleanData(items[idx]);
						}
					});
					features.push(f);

				});

				data = {
					type: 'FeatureCollection',
					features: features
				};

				return data;
			},
			_focusEscape: function(str) {
				return str;
			},
			_toEsriFromIBI: function(geoJsonObject, layer) {
				var outObj,
					i,
					gcFeats,
					esriFeat;

				if (geoJsonObject) {


					outObj = {
						features: []
					};

					if (geoJsonObject._ibi_Report && geoJsonObject._ibi_Report.rows) {
						gcFeats = geoJsonObject._ibi_Report.rows;
					} else if (geoJsonObject.records) {
						gcFeats = geoJsonObject.records;
					} else {
						gcFeats = null;
					}

					if (gcFeats) {
						var GEO_ESRI = layer.ibiGeometryField || 'GEO_ESRI';
						if (GEO_ESRI === 'GEO_ESRI') {
							if (gcFeats) {
								for (var iii = 0; iii < gcFeats.length; ++iii) {
									if (gcFeats[iii].GEO_ESRI) {
										this._decodeIbiQuantizedJson(gcFeats[iii].GEO_ESRI);
									}
								}
							}
						}

						for (i = 0; i < gcFeats.length; i++) {
							esriFeat = {
								attributes: { }
							};
							var currentObject = gcFeats[i];
							for (var f in currentObject) {

								if (currentObject.hasOwnProperty(f)) {
									if (f === GEO_ESRI) {
										esriFeat.geometry = this.getGeometryFromDataArrayItem(currentObject, f);
									} else {
										esriFeat.attributes[f] = (currentObject[f] ? currentObject[f] : '');
									}
								}
							}

							if (esriFeat) {
								outObj.features.push(esriFeat);
							}
						}
					}
				}
				return outObj;
			},

			// one
			//VALUES='{'NAME1':['Bayern','Berlin','Brandenburg','Bremen']}'
			//'geometryLocateField': [ 	'NAME1'],

			// more then one
			//VALUES='[{'NAME5':'Baar-Ebenhausen','NAME1':'Bayern'},{'NAME5':'Bad Griesbach I.Rottal','NAME1':'Bayern'},{'NAME5':'Bad Kissingen','NAME1':'Bayern'}}]'

			getIbiWhere: function(layer, values, geometrySources,forValues) {
				var value = {};
				var dataDelim = geometrySources.dataDelim || layer.dataDelim || '|';

				if (geometrySources.geometryLocateField.length === 1) {
					var list = [];
					values.forEach(function(element) {
//	console.log("element = "  + element);

						var parts = element.split(dataDelim);
						if(parts.length > 1 && parts[0] === "")
							return;
						if(forValues && parts.length > 1)
						{
							if(!forValues[parts[parts.length-1]]  )
								return;
						}
						list.push(parts[0]);
//						console.log(list);

					});

					value[geometrySources.geometryLocateField[0]] = list;
				} else {
					value = [];

					values.forEach(function(element) {
						var parts = element.split(dataDelim);
						var data = {};
						if(forValues && parts.length == (geometrySources.geometryLocateField.length +1)) 
							{
							if(!forValues[parts[parts.length-1]] )
								return;
							}
						
						
						for (var i = 0; i < geometrySources.geometryLocateField.length; ++i) {
							data[ geometrySources.geometryLocateField[i] ] = parts[i];
						}
						value.push(data);
					});
				}
				var rtn = {name: 'IBIF_fexdata', value: value};
//				var rtn = { name: 'VALUES', value: value };
//				console.log(JSON.stringify(value));
//				console.log(JSON.stringify(rtn));

				return rtn;
			},
			
			
			buildAlternateKeys : function buildAlternateKeys(alt_keys) {
				var altKeysMap = null;
				if (!alt_keys) {
					return altKeysMap;
				}

				for (var z in alt_keys) {
					{
					if (alt_keys.hasOwnProperty(z)) {
						if (alt_keys[z]) {
							altKeysMap = altKeysMap || {};
							altKeysMap[z.toUpperCase()] = z;
									}
								}
							}
				}
					
				return altKeysMap;
			},

			getGeoJsonData: function(layer, values, lookupKey, countryKey, callBack) {
				var geoSrcType = layer.geometrySourceType, tokenName=WFGlobals ? WFGlobals.getSesAuthParm() : null,
					tokenValue= WFGlobals ? WFGlobals.getSesAuthVal() : null;
				var url = layer.url;
				var geometrySources = layer.geometrySources;
				var forValues = null;
				if (geometrySources) {
					var lookupKeyObj = geometrySources[lookupKey];
					if (lookupKeyObj) {
						geoSrcType = lookupKeyObj.geometrySourceType;
						url = lookupKeyObj.url;
						forValues =  this.buildAlternateKeys(lookupKeyObj.alt_keys);						
					}
				}
				if(lookupKey)
					{
					forValues = forValues || {};
					forValues[lookupKey.toUpperCase()] = lookupKey;
					}
				if (typeof node === 'function') {
					url = url(layer);
				}
				var othis=this;
				function getRecords(json){ 
					var esriData = null;
					if (geoSrcType === 'csv') {
						esriData = othis._toEsriFromCSV(json, layer);
					} else if (geoSrcType === 'ibijson') {
						esriData = othis._toEsriFromIBI(json, layer, values, lookupKey, countryKey);
					} else {
						esriData = GeoJsonConverters.geoJsonConverter().toEsri(json);
					}
					if(typeof(callBack) == 'function') {
						callBack.call(this, esriData);
						return null;
					}
					return esriData;
				}
				var json;

				if (typeof url === 'string') {					
					if (geoSrcType === 'ibijson' && lookupKey && layer.geometrySources) {
						// if ibi add values!


						var ibiWhereData = this.getIbiWhere(layer, values, layer.geometrySources[lookupKey] || layer.geometrySources['DEFAULT'],forValues);
						if (!url.endsWith('?')) {
							url = url + ",FEXDATA_LENGTH='" + values.length + "'&";
						}
						
//						console.log(JSON.stringify(ibiWhereData.value));
//					url = url  + ibiWhereData.name + "='" + this.focusEscape( JSON.stringify(ibiWhereData.value) ) + "'";
						//url = url  + ibiWhereData.name + '=' + this.focusEscape( JSON.stringify(ibiWhereData.value) );
						url = url + ibiWhereData.name + '=' + encodeURIComponent(JSON.stringify(ibiWhereData.value));
//										console.log(url);

					}
					var asJSON = (geoSrcType !== 'csv') ;
					if(!callBack)
						json = tdgchart.util.ajax(url, {asJSON: asJSON, GETLimit: 0, csrfName: tokenName, csrfValue: tokenValue});
					else
						tdgchart.util.ajax(url, {asJSON: true, GETLimit: (tokenName && tokenValue ? 0 : -1), async: true, onLoad: getRecords, csrfName: tokenName, csrfValue: tokenValue});
				} else if (typeof url === 'object') {
					json = url;
				}
				if (json) {
					return getRecords(json);
				}

				return undefined;
			},
			focusEscape: function(str) {
				return str.replace(/'/gi, "''");
			},


			combineGeometry: function(geo1, geo2) {
				if (!geo2) {
					return geo1;
				}
				switch (GeometryJsonUtils.getJsonType(geo2)) {
					case 'esriGeometryPolygon':
						if (GeometryJsonUtils.getJsonType(geo2) === 'esriGeometryPolygon') {
							if (GeometryEngine.geodesicArea(geo2) > GeometryEngine.geodesicArea(geo1)) {
								return geo2;
							}
						}
						return geo1;
					case 'esriGeometryPoint':
						if (GeometryJsonUtils.getJsonType(geo1) === 'esriGeometryPoint') {
							var mPoint = new esri.geometry.Multipoint(geo1.spatialReference);
							mPoint.addPoint(geo1);
							mPoint.addPoint(geo2);
							return mPoint;
						}
						if (GeometryJsonUtils.getJsonType(geo1) === 'esriGeometryMultipoint') {
							geo1.addPoint(geo2);
						}
						return geo1;
					case 'esriGeometryEnvelope':
						return geo1;
					case 'esriGeometryPolyline':
						return geo1;
					case 'esriGeometryMultipoint':
						if (GeometryJsonUtils.getJsonType(geo1) === 'esriGeometryPoint') {
							geo2.addPoint(geo1);
							return geo2;
						}
						if (GeometryJsonUtils.getJsonType(geo1) === 'esriGeometryMultipoint') {
							for (var i = 0; i < geo2.points.length; ++i) {
								geo1.addPoint(geo2.getPoint(i));
							}
						}
						return geo1;
				}

				return geo1;
			},

			getCentroid: function(geo) {

				switch (GeometryJsonUtils.getJsonType(geo)) {
					case 'esriGeometryPolygon':
						if (geo.rings && geo.rings.length === 0) {
							return null;
						}
						var point = geo.getCentroid();
						if (!geo.contains(point)) {
							if (geo.rings.length === 1 && !geo.isClockwise(geo.rings[0])) {
								geo.rings[0] = geo.rings[0].reverse();
								point = geo.getCentroid();
							}
							if (!geo.contains(point)) {
								point = geo.getPoint(0, 0);
							}
						}
						return point;
					case 'esriGeometryPoint':
						return geo;
					case 'esriGeometryEnvelope':
						return geo.getCenter();
					case 'esriGeometryPolyline':
						return geo.getPoint(0, 0);
					case 'esriGeometryMultipoint':
						return geo.getPoint(Math.floor(geo.points.length / 2));
				}
				return undefined;
			},

			_sqlEscape: function _sqlEscape(s) {
				return s.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function(s) {
					switch (s) {
						case '\0':
							return '\\0';
						case '\n':
							return '\\n';
						case '\r':
							return '\\r';
						case '\b':
							return '\\b';
						case '\t':
							return '\\t';
						case '\x1a':
							return '\\Z';
						case "'":
							return "''";
						default:
							return '\\' + s;
					}
				});
			},

			createSimpleWhere: function createSimpleWhere(valuesData, field) {
				var rtn = '';
				if (valuesData && valuesData.length) {
					var values = '';
					var _sqlEscape = this._sqlEscape;
					valuesData.forEach(function(element) {
						values = values + (values ? ',\'' : '\'') + _sqlEscape(element) + '\'';
					});
					rtn = 'UPPER(' + field + ') IN (' + values + ')';
				}
				return rtn;
			},

			createWhere: function createWhere(dataMap, keyField, geoRolesFixedValues, delim, maxRecordCount, maxRecordRetrieval) {
				var querySize = this.calcMaxRecordCount(maxRecordCount, maxRecordRetrieval);

				if (!querySize) {
					return null;
				}

				var valuesArray = [];
				for (var f in dataMap) {
					if (dataMap.hasOwnProperty(f)) {
						valuesArray.push('\'' + this._sqlEscape(f) + '\'');
					}
				}
				var chunks = function(array, size) {
					var results = [];
					while (array.length) {
						results.push(array.splice(0, size));
					}
					return results;
				};
				var valuesArrayChunk = chunks(valuesArray, querySize);
				var fields = '';
				var seperator = ", '" + delim + "'";

				for (var i = 0; i < keyField.length; ++i) {
					if (geoRolesFixedValues.length > i && geoRolesFixedValues[i].length > 0) { //have default values !
						continue;
					}
					if (keyField.length === 1) {
						fields = keyField[i];
						continue;
					}

					var endParen = '';
					if (fields === '') {
						fields = 'CONCAT(' + keyField[i] + seperator + ')';
						seperator = "),'" + delim + "')";
						continue;
					}

					if (i === keyField.length - 1) {
						seperator = '';
						endParen = ')';
					}
					var startConcat = 'CONCAT(';
					if (seperator !== '') {
						startConcat += startConcat;

					}
					fields = startConcat + fields + ', ' + keyField[i] + seperator + endParen;
				}

				var rtn = null;
				if (valuesArrayChunk.length > 0 && fields !== '') {
					var index = 0;
					rtn = [];
					valuesArrayChunk.forEach(function(valuesArray) {
						var o = {
							where: 'UPPER(' + fields + ') IN (' + valuesArray.join() + ')',
							total: valuesArray.length
						};
						rtn[index] = 'UPPER(' + fields + ') IN (' + valuesArray.join() + ')';
						rtn[index] = o;
						index++;
					});

				}
				return rtn;
			},

			drawMissingRegionUI: function drawMissingRegionUI(container, dataMap, missingList, missingRegionsProperty, animateInMillisecond) {
				animateInMillisecond = animateInMillisecond || 15;
				for (var el in dataMap) {
					if (dataMap.hasOwnProperty(el)) {

						var dmoArray = dataMap[el];
						dmoArray.map(function(dmo) {
							var name = dmo.groupData.name;
							var missingIdx = missingList.indexOf(name);
							if (dmo.done && missingIdx >= 0) {
								missingList.splice(missingIdx, 1);  // Occurs when a previously unknown is now know
							} else if (!dmo.done && missingIdx < 0) {
								missingList.push(name);
							}
						});
					}
				}
				var btnID = container.id + '_Missing';
				var btn = document.getElementById(btnID);
				var maxHeight = (container.clientHeight * 0.90) * (missingRegionsProperty || 0.8);
				if (missingList.length) {
					if (btn == null) {
						btn = document.createElement('div');
						btn.setAttribute('class', 'MissingRegionButton UIButton MissingRegionCollapsed');
						btn.setAttribute('id', btnID);
						btn.style.cursor = 'pointer';
						var timer;

						function onMissingClick() {
							if (this.className.indexOf('MissingRegionExpanded') === -1) {
								this.setAttribute('class', 'MissingRegionButton UIButton MissingRegionExpanded');
								var tmpHeight = this.clientHeight;
								var buttonThis = this;
								btn.style.overflowX = 'none';
								if (btn && missingList) {
									btn.innerHTML = missingList.join('<br>');
									var offsetHeight = this.offsetHeight + 1; //+1 for IE fix
									btn.style.height = tmpHeight + 'px';
									var currentHeight = 10;

									timer = setInterval(function() {
										var initialHeight = offsetHeight;
										currentHeight += initialHeight / 10;
										btn.style.height = currentHeight + 'px';
										if (initialHeight <= currentHeight) {
											btn.style.height = '';
											clearInterval(timer);
											if (offsetHeight < maxHeight) {
												btn.style.height = offsetHeight + 'px';
												btn.style.overflowY = 'hidden';
											} else {
												if (!btn.style.width) {
													btn.style.width = (buttonThis.offsetWidth + 10) + 'px';
												}
												btn.style.overflowY = 'auto';
											}
										}
									}, animateInMillisecond);
									if (buttonThis.clientWidth < buttonThis.scrollWidth) {
										btn.style.width = (buttonThis.offsetWidth + 10) + 'px';
									}

								}

							} else {
								if (btn && missingList) {
									this.setAttribute('class', 'MissingRegionButton UIButton MissingRegionCollapsed');
									var currheight = this.offsetHeight;
									var outtimer = setInterval(function() {
										currheight -= maxHeight / 10;
										btn.style.height = currheight + 'px';
										if (currheight <= 0) {
											clearInterval(outtimer);
											btn.style.height = '';
											btn.innerHTML = missingList.length + ' ' + tdgchart.translations.UNKNOWN;
											btn.style.width = '';
										}
									}, animateInMillisecond);
									clearInterval(timer);
								}
							}
						}
						btn.addEventListener('click', onMissingClick);
						btn.addEventListener('touchend', onMissingClick);

						container.appendChild(btn);
					}
					btn.style.visibility = 'visible';
					btn.style.zIndex = 31;
					btn.innerHTML = missingList.length + ' ' + tdgchart.translations.UNKNOWN;
					btn.style.maxHeight = maxHeight + 'px';
				} else if (btn) {
					btn.style.visibility = 'hidden';
				}
			},

			mergeAttributes: function(dmo, graphic) {
				if (!graphic.attributes) {
					graphic.attributes = dmo.groupData;
				} else {
					for (var xx in dmo.groupData) {
						if (dmo.groupData.hasOwnProperty(xx)) {
							graphic.attributes[xx] = dmo.groupData[xx];
						}
					}
				}
			},
			getDataKeys: function(dataMap) {
				var a = [];
				var def = undefined;
				for (var x in dataMap) {
					if (dataMap.hasOwnProperty(x)) {
						if(x === "default" || x === "DEFAULT")
							{
							def = x;
							continue;
							}
						a.push(x);
					}
				}
				if(def)
					a.push(def);
				return a;
			},

			addTooltip: function(renderConfig, graphic, layerType, keys) {
				var chart = renderConfig.moonbeamInstance;
				var nodes = graphic.getNodes() || [];
				for (var i = 0; i < nodes.length; i++) {
					var s = graphic.attributes[keys.seriesIdVarName];
					var g = graphic.attributes[keys.groupIdVarName];

					var tooltip = renderConfig.modules.tooltip.getToolTipContent(s, g, renderConfig.data[s][g], renderConfig.data[s]);
					if (tooltip === 'auto') {

						function autoToolTipContent(chart, graphic, layerType, s, g, keys) {
							var tdg = tdgchart.util;
							var tooltipFormatter = tdg.partial(chart.formatNumber, [undefined, 'auto', 'tooltip'], chart);
							var tr = tdgchart.translations;

							var valueKey = keys.colorVarName;
							if (layerType === 'bubble' && valueKey == null) {
								valueKey = keys.sizeVarName;
							}
							var v = graphic.attributes[valueKey];

							var nameKey = keys.keyVarName;
							var name = graphic.attributes[nameKey];

							if (nameKey && name) {
								return tdg.formatString(
									'<span style="font: {0}">{1}</span><br /><span style="font: {2}">{3}: {4}</span>',
									chart.htmlToolTip.autoTitleFont || '',
									name || g || (tr.SERIES + ' ' + s),
									chart.htmlToolTip.autoContentFont || '',
									chart.getSeriesLabel(s),
									tooltipFormatter(v || 0)
								);
							} else if (graphic.attributes.lat != null && graphic.attributes.lng != null) {
								return tdg.formatString(
									'<span style="font: {0}">{1}<br />{2}</span><br /><span style="font: {3}">{4}: {5}<br />{6}: {7}<br />{8}: {9}</span>',
									chart.htmlToolTip.autoTitleFont || '',
									chart.getSeriesLabel(s),
									chart.getGroupLabel(g),
									chart.htmlToolTip.autoContentFont || '',
									chart.zaxis.title.text || tr.VALUE,
									tooltipFormatter(v || 0),
									chart.yaxis.title.text || tr.LATITUDE,
									graphic.attributes.lat,
									chart.xaxis.title.text || tr.LONGITUDE,
									graphic.attributes.lng
								);
							}
							return tdg.formatString('{0}: {1}, {2}: {3}, {4}: {5}', tr.SERIES, s, tr.GROUP, g, tr.VALUE, v);
						}
						tooltip = autoToolTipContent(chart, graphic, layerType, s, g, keys);
					}
					renderConfig.modules.tooltip.setToolTipContent(nodes[i], tooltip);

			//		var misc = (layerType === 'bubble') ? 'marker' : 'region';
					var misc =  'region';

					nodes[i].setAttribute('class', chart.buildClassName('riser', s, g, misc));
				}
			},

			toInternalEsriDataFieldName: function(s) {
				return 'data-_ibi' + s;
			},

			getGeometrySourceType: function(layer) {
				var geometrySourceType = layer.geometrySourceType || 'esri';
				return geometrySourceType;
			},

			createGraphicsLayer: function(chart, layer, usedLayerIds, containerIDPrefix) {

				return new GraphicsLayer(this.createLayerOptions(chart, layer, usedLayerIds, containerIDPrefix));
			},

			createLayerOptions: function createLayerOptions(chart, layer, usedLayerIds, containerIDPrefix) {
				var layerOptions = chart.cloneObject(layer.layerOptions || {});
				layerOptions.id = this.getLayerId(layer, layerOptions, usedLayerIds, containerIDPrefix);
				usedLayerIds[layerOptions.id] = layerOptions.id;
				return layerOptions;
			},

			getLayerId: function getLayerId(layer, layerOptions, usedLayerIds, containerIDPrefix) {

				if (layerOptions && layerOptions.id) {
					return layerOptions.id;
				}

				if (layer.seriesIndex != null) {
					if (usedLayerIds[layer.seriesIndex + ''] == null) {
						return layer.seriesIndex + '';
					}
				}

				for (var id = 0; id < 999; ++id) {
					if (usedLayerIds[containerIDPrefix + '_layerId_' + id] == null) {
						return containerIDPrefix + '_layerId_' + id;
					}
				}

				while (true) {
					var t = new Date().getTime();
					if (usedLayerIds[containerIDPrefix + '_layerId_' + t] == null) {
						return containerIDPrefix + '_layerId_' + t;
					}
				}
			},

			combineFeaturesFromFeaturesArray: function(featuresArray) {
				var tempArray = [];
				for (var i = 0; i < featuresArray.length; i++) {
					var a = featuresArray[i];
					for (var t = 0; t < a.length; t++) {
						var o1 = new Graphic();
						o1.attributes = a[t].attributes;
						o1.geometry = a[t].geometry;
						tempArray.push(o1);
					}
				}
				return tempArray;
			},

			findGeoKeyValue: function(keyNames, geoRolesFixedValues, attributes, delim) {
				var keyNamesArray = [];
				if (keyNames && (typeof keyNames === 'string')) {
					keyNamesArray[0] = keyNames;
				} else {
					keyNamesArray = keyNames;
				}
				var itemId = '';
				for (var i = 0; i < keyNamesArray.length; ++i) {
					if (!keyNamesArray[i]) {
						continue;
					}
//				if (!attributes[keyNamesArray[i]]) {
//					continue;
//				}
//				var value = attributes[keyNamesArray[i]].toString().toUpperCase();
					var value = attributes[keyNamesArray[i]];
					value = value ? value.toString().toUpperCase() : '';

					if (geoRolesFixedValues.length > i && geoRolesFixedValues[i].length > 0) { //have default values !
						var values = geoRolesFixedValues[i];
						var ok = false;
						for (var j = 0; j < values.length; ++j)	{
							if (typeof values[j] === 'function') {
								ok = values[j](attributes, keyNamesArray[i]);
							} else {
								ok = (values[j] === value);
							}
							if (ok) {
								break;
							}
						}
						if (!ok) {
							return undefined; // didn't match fixed values
						}
						continue; // skip this entry in key
					}
					if (delim && i !== 0) {
						itemId = itemId + delim;
					}
					itemId = itemId + value;
				}
				return itemId;
			},

			setLayerExtent: function(graphicLayer, extent, properties, map) {
				if (graphicLayer.visible) { // only  if its visible  may also && graphicLayer.visibleAtMapScale
					this.setExtent(extent || this.getExtent(graphicLayer, properties), properties, map);
				}
			},

			setExtent: function setExtent(ex, properties, map) {
				var extent = tdgchart.prototype.extent;
				// If user did not specify a base layer zoom *and* center, we can automatically adjust the viewbox.
				var okToSetExtent = !properties.baseLayer || properties.baseLayer.center == null || properties.baseLayer.zoom == null;
				if (okToSetExtent) {

					extent = extent ? extent.union(ex) : ex;
					if (extent) {
						if (extent.spatialReference && extent.spatialReference.wkid === 4326) {
							Number.prototype.isBetween = function(a, b) {
								var min = Math.min.apply(Math, [a, b]);
								var	max = Math.max.apply(Math, [a, b]);
								return this >= min && this <= max;
							};
							extent.xmin = extent.xmin.isBetween(-180, 180) ? extent.xmin : -180;
							extent.ymin = extent.ymin.isBetween(-90, 90) ? extent.ymin : -90;
							extent.xmax = extent.xmax.isBetween(-180, 180) ? extent.xmax : 180;
							extent.ymax = extent.ymax.isBetween(-90, 90) ? extent.ymax : 90;
						}else {
                            extent.xmin = (extent.xmin > -42022729.320287585) ? extent.xmin : -42022729.320287585;
                            extent.ymin = (extent.ymin > -20700532.18574316) ? extent.ymin : -20700532.18574316;
                            extent.xmax = (extent.xmax < 50415932.21419634) ? extent.xmax : 50415932.21419634;
                            extent.ymax = (extent.ymax < 34402615.7569128) ? extent.ymax : 34402615.7569128;
						}
						map.setExtent(extent, true);
						if(extent.getHeight() === 0 && extent.getWidth() === 0) {
							map.centerAndZoom({x:extent.xmin, y:extent.ymin}, 9);
							setTimeout(function(){
								map.setZoom(9);							
							},1000);
						}			
					}
				}
			},

			getExtent: function getExtent(graphicLayer, properties) {
				var globalExtent = properties.globalExtent;
				if (graphicLayer && graphicLayer.graphics && graphicLayer.graphics.length) {
					return GraphicsUtils.graphicsExtent(graphicLayer.graphics);
				}
				// If we're given an invalid graphics layer on which to calculate an extent, use the full world extent
				return new Extent(globalExtent);
			},

			setProxyForLayer: function(layer, renderConfig) {
				if (layer && layer.url && typeof layer.url === 'string') {
					var proxyObject = this.getProxyFromObject(layer, renderConfig);
					if (proxyObject && proxyObject.proxyUrl) {
						var proxy4URL = proxyObject.proxyUrl;
						if (layer.authorization && typeof layer.authorization === 'string') {
							proxy4URL = proxy4URL + '/' + layer.authorization;
							this.setProxyforUrl(proxy4URL, layer, true);
						} else {
							if (tdgchart.prototype.gisGetEsriProxyUrlList && typeof tdgchart.prototype.gisGetEsriProxyUrlList === 'function') {
								var urlList = tdgchart.prototype.gisGetEsriProxyUrlList();
								if (urlList && urlList.length > 0) {
									for (var i = 0; i < urlList.length; ++i) {
										if (layer.url.toLowerCase().indexOf(urlList[i].url.toLowerCase(), 0) === 0) {
											this.setProxyforUrl(proxy4URL, urlList[i], true);
										}
									}
								}
							}
						}
					}
				}
			},

			getProxyFromObject: function getProxyFromObject(layer, renderConfig) {

				var proxyObject = layer ? layer.proxy : undefined;
				if (!(proxyObject && proxyObject.proxyUrl)) {
					if (renderConfig) {
						proxyObject = getProxyFromObject(renderConfig.properties.proxy);
					}
				}
				if (!(proxyObject && proxyObject.proxyUrl)) {
					if (tdgchart.prototype.gisGetEsriProxyPath && typeof tdgchart.prototype.gisGetEsriProxyPath === 'function') {
						proxyObject = tdgchart.prototype.gisGetEsriProxyPath();
					}
				}
				if (proxyObject && proxyObject.proxyUrl) {
					var url = proxyObject.proxyUrl;
					if (!tdgchart.util.isAbsolutePath(url)) {
						// convert relative urls into absolute urls rooted in the same base folder as Moonbeam
						var path = tdgchart.getScriptPath();
						var tdgidx = path.indexOf('tdg');
						if (tdgidx >= 0) {
							url = path.slice(0, tdgidx) + url;
						}
					}
					return {
						proxyUrl: url,
						alwaysUseProxy: proxyObject.alwaysUseProxy
					};
				}
				return undefined;

			},

			setProxyforUrl: function setProxyforUrl(proxyUrl, proxyEntry, force) {
				//var urlUtils = dojoObjects['esri/urlUtils'];
				if (urlUtils && proxyUrl && (force || proxyEntry.required)) {
					urlUtils.addProxyRule({
						urlPrefix: proxyEntry.url,
						proxyUrl: proxyUrl
					});
				}
			},

			setProxy: function setProxy(renderConfig) {
				var proxyObject = this.getProxyFromObject(null, renderConfig);
				if (proxyObject && proxyObject.proxyUrl) {
					esri.config.defaults.io.proxyUrl = proxyObject.proxyUrl;
					if (proxyObject.alwaysUseProxy) {
						esri.config.defaults.io.alwaysUseProxy = true;
					}
				}

				if (proxyObject && proxyObject.proxyUrl) {
					if (tdgchart.prototype.gisGetEsriProxyUrlList && typeof tdgchart.prototype.gisGetEsriProxyUrlList === 'function') {
						var urlList = tdgchart.prototype.gisGetEsriProxyUrlList();
						if (urlList && urlList.length > 0) {
							for (var i = 0; i < urlList.length; ++i) {
								this.setProxyforUrl(proxyObject.proxyUrl, urlList[i], false);
							}
						}
					}
				}
			},

			createSymbol: function createSymbol(chart, properties, dojoObjects, layer, color, markerBorder, dma, size, border) {
				var symbolType = (layer.symbolType || 'SimpleFillSymbol');
				if (layer.layerType === 'bubble' || layer.layerType === 'heat') {
					symbolType = (layer.symbolType || 'SimpleMarkerSymbol');
				} else if (layer.layerType === 'line') {
					symbolType = 'SimpleLineSymbol';
				}
				if (layer.createSymbol) {
					return layer.createSymbol(chart, properties, dojoObjects, layer, color, markerBorder, dma, symbolType, this.createStandardSymbol);
				}
				return this.createStandardSymbol(chart, properties, dojoObjects, layer, color, markerBorder, dma, symbolType, size, border);
			},

			createStandardSymbol: function createStandardSymbol(chart, properties, dojoObjects, layer, color, markerBorder, dma, symbolType, size, border) {

				symbolType = (properties.defaultSymbolInfo[symbolType] && dojoObjects['esri/symbols/' + symbolType]) ? symbolType : 'SimpleFillSymbol';
				var symbol = chart.cloneObject(properties.defaultSymbolInfo[symbolType] || {});
				if (layer.defaultSymbolInfo) {
					symbol = chart.mergeObjects(layer.defaultSymbolInfo, symbol);
				}

				if (color) {
					symbol.color = [color.r, color.g, color.b, color.a * 255];
				}

				if (markerBorder && symbol.outline) {
					var colorFn = tdgchart.util.color ? tdgchart.util.color : pv.color;
					var borderColor = (typeof markerBorder.color === 'string') ? colorFn(markerBorder.color) : markerBorder.color;
					if (borderColor && typeof borderColor.rgb === 'function') {  // Convert non-rgb colors to rgb
						borderColor = borderColor.rgb();
					}
					symbol.outline.color = [borderColor.r, borderColor.g, borderColor.b, borderColor.a * 255];
					symbol.outline.width = dojox.gfx.px2pt(markerBorder.width);  // esri border widths are in pt, so convert Moonbeam's px to pt
				} else if (layer.layerType === 'line') {
					if (border && border.dash && pv.SvgScene.dashPresets.hasOwnProperty(border.dash)) {
						var dash = border.dash.split('_').map(function(el) {
							return el.charAt(0).toUpperCase() + el.substr(1).toLowerCase();
						}).join('');  // Convert from Moonbeam named dash pattern (dash_dot) to ESRI (DashDot)
						symbol.style = 'esriSLS' + dash;
					}
				}

				if (layer.layerType === 'line' && border && border.width != null) {
					symbol.width = dojox.gfx.px2pt(border.width);
				} else if (size != null) {
					if (tdgchart.util.isPercentString(size)) {
						size = tdgchart.util.applyNumOrPercent(size, Math.min(chart.width, chart.height));
					}
					symbol.size = size;
				}

				return this.createSymbolFromObject(symbol, dojoObjects);
			},

			createSymbolFromObject: function createSymbolFromObject(symbol, dojoObjects)	{
				if (symbol) {
					var originalSize = symbol.size || 16;
					var symbolType = this.convertToEsriSymbolType(symbol.type);

					if (symbolType && dojoObjects['esri/symbols/' + symbolType]) {
						var res = new (dojoObjects['esri/symbols/' + symbolType])(symbol);
						if (res && typeof res.setSize === 'function') {
							res.setSize(originalSize);  // Need separate setSize call to avoid ESRI incorrectly scaling size for us
						}
						return res;
					}
				}
				return null;
			},

			convertToEsriSymbolType: function convertToEsriSymbolType(symbolType) {
				if (symbolType === 'esriSFS') {
					symbolType = 'SimpleFillSymbol';
				} else if (symbolType === 'esriSLS') {
					symbolType = 'SimpleLineSymbol';
				} else if (symbolType === 'esriSMS') {
					symbolType = 'SimpleMarkerSymbol';
				}

				if (symbolType === 'esriGeometryPolygon') {
					symbolType = 'SimpleFillSymbol';
				} else if (symbolType === 'esriGeometryPolyline') {
					symbolType = 'SimpleLineSymbol';
				} else if (symbolType === 'esriGeometryPoint') {
					symbolType = 'SimpleMarkerSymbol';
				}
				return symbolType;
			},

			groupDataForALLSeries: function(layer, createSymbol, groupDataItems, chart, renderConfig, dojoObjects) {
				var i, data = [];
				var dataMapCombinedSeries = {};
				for (i = 0; ; ++i) {
					var tmp = this.gisGroupDataForIthSeries(chart, renderConfig.data, layer, i, groupDataItems);
					if (tmp == null) {
						break;
					}
					data.push(tmp);
				}
				for (i = 0; i < data.length; ++i) {
					var res = this.renderOneSeriesSymbol(layer, createSymbol, data[i], groupDataItems, chart, renderConfig, dojoObjects);
					this.insertIntoSeriesDataArrays(dataMapCombinedSeries, res, i);
				}
				return dataMapCombinedSeries;
			},

			insertIntoSeriesDataArrays: function insertIntoSeriesDataArrays(data, res, index) {
				if (res) {
					for (var xx in res) {
						if (res.hasOwnProperty(xx)) {
							if (!data[xx]) {
								data[xx] = [];
							}
							if (res[xx]) {
								data[xx][index] = res[xx];
							}
						}
					}
				}
				return data;
			},

			renderOneSeriesSymbol: function renderOneSeriesSymbol(layer, createSymbol, dataMap, groupDataItems, chart, renderConfig, dojoObjects) {
				var colorScale, sizeScale;
				if (groupDataItems.colorVarName) {
					colorScale = renderConfig.modules.colorScale.getColorScale();
				} else {
					colorScale = function(seriesID, groupId) {
						return chart.getSeriesAndGroupProperty(seriesID, groupId, 'color');
					};
				}
				if (groupDataItems.sizeVarName && layer.layerType === 'line') {
					var minMax = renderConfig.modules.sizeScale.minMax(renderConfig, groupDataItems.sizeVarName);
					var maxLineWidth = chart.bubbleMarkerRadius();
					sizeScale = (function(minMax, maxLineWidth) {
						var span = minMax.max - minMax.min;
						return function(x) {
							var v = (x - minMax.min) / span * (maxLineWidth - 1) + 1;
							return Math.min(Math.max(v, 1), maxLineWidth);
						};
					})(minMax, maxLineWidth);
				}

				for (var a in dataMap) {
					if (dataMap.hasOwnProperty(a)) {
						var d = dataMap[a];
						var colorIndex = groupDataItems.colorVarName ? d.groupData[groupDataItems.colorVarName] : d.seriesID;
						var colorFn = tdgchart.util.color ? tdgchart.util.color : pv.color;
						var color = colorFn(colorScale(colorIndex, d.groupId));
						color.a = 1.0;  // opacity is a property of the layer
						if (color && typeof color.rgb === 'function') {  // Convert non-rgb colors to rgb
							color = color.rgb();
						}
						var border = chart.getSeriesAndGroupProperty(d.seriesID, d.groupId, 'border');
						var markerBorder = chart.getSeriesAndGroupProperty(d.seriesID, d.groupId, 'marker.border');
						var markerSize;
						if (groupDataItems.sizeVarName == null) {
							markerSize = chart.getSeriesAndGroupProperty(d.seriesID, d.groupId, 'marker.size');
						} else if (groupDataItems.sizeVarName && layer.layerType === 'line') {
							border.width = sizeScale(d[groupDataItems.sizeVarName]);
						}
						d.symbol = this.createSymbol(chart, renderConfig.properties, dojoObjects, layer, color, markerBorder, d, markerSize, border);
					}
				}
				return dataMap;
			},

			groupDataForSeriesOne: function(layer, createSymbol, groupDataItems, chart, renderConfig, dojoObjects) {
				var dataMapCombinedSeries = {};
				var dataSn = this.gisGroupDataForIthSeries(chart, renderConfig.data, layer, layer.seriesIndex, groupDataItems);
				if (dataSn) {
					var res = this.renderOneSeriesSymbol(layer, createSymbol, dataSn, groupDataItems, chart, renderConfig, dojoObjects);
					this.insertIntoSeriesDataArrays(dataMapCombinedSeries, res, layer.seriesIndex);
					return dataMapCombinedSeries;
				}
				return undefined;
			},

			calcMaxRecordCount: function calcMaxRecordCount(maxRecordCount, maxRecordRetrieval) {
				if (!maxRecordCount) {
					return maxRecordRetrieval; // This happens sometimes- intentional code
				}
				if (maxRecordRetrieval && maxRecordRetrieval > 0) {
					if (maxRecordCount > maxRecordRetrieval) {
						maxRecordCount = maxRecordRetrieval;
					}
				}
				return maxRecordCount;
			},

			errorHandler: function(err) {
				tdgchart.util.logError('Error: ', err);
				tdgchart.util.traceError('Error: ', err);
			},

			jsonKeysToCase: function(obj, caseType) {
				if (!caseType) {
					caseType = 'UPPER';
				}
				caseType = caseType.toUpperCase();
				var key, keys = Object.keys(obj);
				var n = keys.length;
				var newobj = {};
				while (n--) {
					key = keys[n];
					if (caseType === 'UPPER') {
						newobj[key.toUpperCase()] = obj[key];
					} else {
						newobj[key.toLowerCase()] = obj[key];
					}
				}
				return newobj;
			},

			drawCircle: function(map, dojoObjects, x, y, wkid) { // a method to add circle in map, useful for debugging purpose
				var wk = wkid || 4326;
				var point = new Point({
					x: x || 0,
					y: y || 0,
					spatialReference: {wkid: wk}
				});
				var symbol = new dojoObjects['esri/symbols/SimpleFillSymbol']().setColor(null).outline.setColor('red');
				var gl2 = new dojoObjects['esri/layers/GraphicsLayer']({id: 'circles'});
				map.addLayer(gl2);
				var circle = new dojoObjects['esri/geometry/Circle']({
					center: point,
					radius: 1000
				});
				var graphic1 = new Graphic(circle, symbol);
				gl2.add(graphic1);
			},

			getChoroplethAsBubble: function(graphic, layer, properties, circleSizeFactor) {
				var circleSizeObj = layer.circleSize || properties.circleSize;
				if (graphic && graphic.geometry && graphic.geometry.type === 'point') {
					var geo = graphic.geometry; // assume geometry is in webmercator
					if (graphic.geometry.spatialReference && graphic.geometry.spatialReference.wkid === 4326) {
						//geometry in degrees- convert to webmercator
						geo = WebMercatorUtils.geographicToWebMercator(graphic.geometry);
					}
					var radUnits = Units[circleSizeObj.radiusUnit || properties.circleSize.radiusUnit];
					var circle = new Circle({
						center: geo,
						radius: (circleSizeObj.radius * circleSizeFactor),
						radiusUnit: radUnits
					});
					if (isNaN(geo.x) && isNaN(geo.y)) { // invalid data. happens on user error scenario IA-4449
						return graphic;
					}
					graphic.geometry = circle;
				} else if (graphic.geometry && graphic.geometry.spatialReference && graphic.geometry.spatialReference.wkid === 4326) {
					//geometry in degrees- convert to webmercator
					graphic.geometry = WebMercatorUtils.geographicToWebMercator(graphic.geometry);
				}
				return graphic;
			},

			_saveSelectedLayerOpacity: function(node, left, index) {
				var o = {index: index, node: node, left: left};
				selectedLayerOpacityArray[index] = o;
			},

			_getSelectedLayerOpacity: function(index) {
				var o = selectedLayerOpacityArray[index];
				return o;
			},

			_saveSelectedLayerToggle: function(index, visibility) {
				var o = {index: index, visibility: visibility};
				selectedLayerVisibilityArray[index] = o;
			},
			_getSelectedLayerVisibility: function(index) {
				var o = selectedLayerVisibilityArray[index];
				return o;
			},

			_resetSelectedLayerToggleAndOpacity: function() {
				selectedLayerOpacityArray = [];
				selectedLayerVisibilityArray = [];
			},

			addDataLabel: function(renderConfig, tdg, chart, graphic, graphicLayer) {

				var d = graphic.attributes;
				var dataLabelProperties = renderConfig.modules.dataLabels.getDataLabelProperties(d, null, {series: d._s, group: d._g});
				if (dataLabelProperties && dataLabelProperties != null) {
					var dataLabelText = dataLabelProperties.content;
					//var dataLabelPosition = dataLabelProperties.position; // if we decide to have datalabels positioned- currently it is positioned center
					var dataLabelFontParts = tdg.fontToFontParts(dataLabelProperties.font);
					var dataLabelColor = dataLabelProperties.color;

					var font = new Font({
						size: dataLabelFontParts.fontSize,
						style: dataLabelFontParts.fontStyle,
						variant: dataLabelFontParts.fontVariant,
						weight: dataLabelFontParts.fontWeight,
						family: dataLabelFontParts.fontFamily
					});
					var textSymbol = new TextSymbol(dataLabelText, font, dataLabelColor);
					/*
					 * https://developers.arcgis.com/javascript/3/jsapi/textsymbol-amd.html#verticalalignment
					 * Vertical alignment of the text with respect to the graphic.
					 *Vertical alignment is not supported in Internet Explorer versions 7-10. Also, it is not supported when the graphics layer uses HTML Canvas to draw graphics. (Added at v3.8)
					 *Known values: 'baseline' | 'top' | 'middle' | 'bottom'
					 *Default value: 'baseline'

					 * According to ESRI doc, setVerticalAlignment does not work for IE 7-10, but I found out it does not work in IE 11 as well.
					 * The data labels are positioned center of the graphic, looks ok for choropleth map but for proportional symbol it looks like
					 * data labels are more into the top half of the graphic. To get to the dead center, the labels need to offset Y axis (in pixels)
					 * by 3. Do not remove the below 4 lines as we might have to revisit this later, we would need these lines then. IF IE decides to
					 * work, then only setVerticalAlignment line is needed. FF chrome works with setAlignment.
					 * */
					//textSymbol.setVerticalAlignment('middle');
					//var scaledValue = graphic.attributes['data-_ibiscaledValue'];
					//var fontHeight = tdg.measureFont(dataLabelProperties.font).height;
					//textSymbol.setOffset(0,(-tdg.measureFont(dataLabelProperties.font).height)/2);
					textSymbol.setOffset(0, -3);

					var center = this.getCentroid(graphic.geometry);
					var textSymbolGraphic = new Graphic(center, textSymbol);
					textSymbolGraphic.attributes = graphic.attributes;
					if (graphicLayer) {
						graphicLayer.add(textSymbolGraphic);
					} else {
						return textSymbolGraphic;
					}
				}
				return null;
			}
		});

		return GisUtil;
	}
);
