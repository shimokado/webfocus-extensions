/*global tdgchart: false, pv: false, dojo: false, dijit: false, require: false, document: false */

/* Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved. */
/* $Revision: 1.182 $: */

(function() {
	//'use strict';

	tdgchart.prototype.gisExternalQuery = gisExternalQuery;

	var tdg = tdgchart.util;
	var maxRecordRetrieval;
	var animateInMillisecond;
	var userSelectedButtonMode;
	var tocExpandedMode;
	var saveTocSelection = true, waitForLayers=-1;

	var arrayUtils, Color, domStyle, Query,
		Map, esriRequest, Graphic, GeometryJsonUtils,Extent,
		SimpleMarkerSymbol, SimpleFillSymbol, PictureMarkerSymbol, Circle, ClassBreaksRenderer,
		GraphicsLayer, SpatialReference, PopupTemplate, Point, WebMercatorUtils, FeatureLayer,
		UniqueValueRenderer, Units, GraphicsUtils, Scalebar, GeoJsonConverters, TableOfContents,
		IBIGisUtil, esriBasemaps, QueryTask, ScreenPoint,GeometryEngine,IBIEsriChoropleth, IBIEsriBubble;

	var dojoObjects = { };
	var dojoRequires = ['dojo/parser',
		'dojo/_base/array',
		'esri/Color',
		'dojo/dom-style',
		'dojo/query',

		'esri/map',
		'esri/request',
		'esri/graphic',
		'esri/geometry/jsonUtils',
		'esri/geometry/Extent',
		'esri/layers/ArcGISTiledMapServiceLayer',
		'esri/layers/ArcGISDynamicMapServiceLayer',
		'esri/symbols/SimpleMarkerSymbol',
		'esri/symbols/SimpleFillSymbol',
		'esri/symbols/SimpleLineSymbol',
		'esri/symbols/PictureMarkerSymbol',
		'esri/geometry/Circle',
		'esri/renderers/SimpleRenderer',
		'esri/renderers/ClassBreaksRenderer',
		'esri/layers/GraphicsLayer',
		'esri/SpatialReference',
		'esri/dijit/PopupTemplate',
		'esri/geometry/Point',
		'esri/geometry/webMercatorUtils',
		'esri/layers/FeatureLayer',
		'esri/renderers/UniqueValueRenderer',
		'esri/renderers/HeatmapRenderer',
		'esri/units',
		'esri/graphicsUtils',
		'esri/dijit/Scalebar',
		'esri/tasks/query',
		'esri/tasks/QueryTask',
		'esri/geometry/ScreenPoint',
		"esri/geometry/geometryEngine",
		'esri/urlUtils',
		'esri/renderers/smartMapping',
		'extras/jsonConverters',
		'extras/gisUtil',
		'extras/esriChoropleth',
		'extras/esriBubble',
		'esri/basemaps',
		'esri/dijit/Basemap',
		'esri/arcgis/Portal',
		'esri/dijit/BasemapGallery',
		'esri/dijit/BasemapLayer',
		'dijit/TitlePane',
		'dijit/layout/ContentPane',
		'esri/geometry/screenUtils'
		

	];

	function resetUserSelectedPrefs() {
		userSelectedButtonMode = null; //reset to PAN
		tocExpandedMode = null; //reset to collapse layers and basemap control
		if (IBIGisUtil) {
			IBIGisUtil._resetSelectedLayerToggleAndOpacity();
		}
	}

	resetUserSelectedPrefs();

	function geoCacheKey(url, combineGeoKeyValueStr, itemId) {
		return 'geoCacheKey' + combineGeoKeyValueStr + '_' + itemId + '_' + url;
	}

	function initCallback(completeCallback, initConfig) {

		// add requested requires
		// just add to
		if (initConfig.properties.drawToc) {
			dojoRequires.push('extras/TableOfContents');
		}
		var overlayLayers = initConfig.properties.overlayLayers;
		if (overlayLayers) { // add ones from layers that we don't know about
			for (var i = 0; i < overlayLayers.length; ++i) {
				if (overlayLayers[i].layerObjectType) {
					dojoRequires.push(overlayLayers[i].layerObjectType);
				}
			}
		}
		dojoRequires = dojoRequires.concat(initConfig.properties.externalRequires || []);
		dojoRequires.push('dojo/domReady!'); //always last

		var timeoutInMillis = initConfig.properties.mapServicesTimeout || 60000;
		var loaded = false;
		var timedOut = false;
		setTimeout(function() {
			if (!loaded) {
				var errorMessage = tdgchart.translations.MapServicesError;
				timedOut = true;
				initConfig.moonbeamInstance.errorMessage = errorMessage;
				initConfig.moonbeamInstance.redraw();
				tdg.traceError('Failed to load esri dependencies. Connection to Map Services were lost');
			}
		}, timeoutInMillis);


		setTimeout(function() {
			if (!loaded) {
				initConfig.moonbeamInstance.drawSpinner();
			}
		}, 5000);

		require(dojoRequires, function() {
			for (var i = 0; i < dojoRequires.length; ++i) {
				dojoObjects[dojoRequires[i]] = arguments[i];
			}

			loaded = true;
			if (timedOut) {
				return false; // returning true loads the map when the loading of objects are done.
			}

			var parser = dojoObjects['dojo/parser'];
			arrayUtils = dojoObjects['dojo/_base/array'];
			Color = dojoObjects['esri/Color'];
			domStyle = dojoObjects['dojo/dom-style'];
			Query = dojoObjects['dojo/query'];
			Map = dojoObjects['esri/map'];
			esriRequest = dojoObjects['esri/request'];
			Graphic = dojoObjects['esri/graphic'];
			GeometryJsonUtils = dojoObjects['esri/geometry/jsonUtils'];
			Extent = dojoObjects['esri/geometry/Extent'];
			SimpleMarkerSymbol = dojoObjects['esri/symbols/SimpleMarkerSymbol'];
			SimpleFillSymbol = dojoObjects['esri/symbols/SimpleFillSymbol'];
			PictureMarkerSymbol = dojoObjects['esri/symbols/PictureMarkerSymbol'];
			Circle = dojoObjects['esri/geometry/Circle'];
			ClassBreaksRenderer = dojoObjects['esri/renderers/ClassBreaksRenderer'];
			GraphicsLayer = dojoObjects['esri/layers/GraphicsLayer'];
			SpatialReference = dojoObjects['esri/SpatialReference'];
			PopupTemplate = dojoObjects['esri/dijit/PopupTemplate'];
			Point = dojoObjects['esri/geometry/Point'];
			FeatureLayer = dojoObjects['esri/layers/FeatureLayer'];
			UniqueValueRenderer = dojoObjects['esri/renderers/UniqueValueRenderer'];
			Units = dojoObjects['esri/units'];
			GraphicsUtils = dojoObjects['esri/graphicsUtils'];
			Scalebar = dojoObjects['esri/dijit/Scalebar'];
			WebMercatorUtils = dojoObjects['esri/geometry/webMercatorUtils'];
			GeoJsonConverters = dojoObjects['extras/jsonConverters'];
			TableOfContents = dojoObjects['extras/TableOfContents'];
			IBIGisUtil = new dojoObjects['extras/gisUtil']();
			IBIEsriChoropleth = new dojoObjects['extras/esriChoropleth']();
			IBIEsriBubble = new dojoObjects['extras/esriBubble']();
			esriBasemaps = dojoObjects['esri/basemaps'];
			QueryTask = dojoObjects['esri/tasks/QueryTask'];
			ScreenPoint = dojoObjects['esri/geometry/ScreenPoint'];
			GeometryEngine = dojoObjects["esri/geometry/geometryEngine"];
		
			parser.parse();

			completeCallback(true);
		});
	}

	function gisExternalQuery(layerJson, fields, callBack, errorCallback, fieldLayerValues) {
		function sortIt(results, fields) {

			var atts = [];
			// test for  fields ???

			if (results.hasOwnProperty('features') || results.features.length !== 0) {
				results.features.forEach(function(graphic) {
					atts.push(graphic.attributes);
				});
			}
			var sortField = (fields && fields[0] ? fields[0] : null);
			if (sortField) {
				atts.sort(function(a, b) {
					if (a[fields[0]] < b[fields[0]]) {
						return -1;
					}
					if (a[fields[0]] === b[fields[0]]) {
						return 0;
					}
					return 1;
				});
			}
			return atts;
		}
		var attributes = undefined;
		var geometrySourceType = '';
		var url = '';
		if (typeof layerJson === 'string') {
			geometrySourceType = 'esri';
			url = layerJson;
		} else {
			url = layerJson.url;
			geometrySourceType = IBIGisUtil.getGeometrySourceType(layerJson);
		}
		if (geometrySourceType === 'csv') { // assume esri
			var results = IBIGisUtil.getGeoJsonData(layerJson, null);
			attributes = sortIt(results, fields);
			if (callBack) {
				callBack(attributes);
			}
			return;
		}

		if (geometrySourceType === 'esri') { // assume esri
			if (url == null && callBack) {
				return callBack([{}]); // this is no loger valid in 8202+ because we do not have a URL. RS constructs the url based on the field.
				// need to make fdm call to RS to get the values.
			}
			var where = '';
			if (fieldLayerValues && fieldLayerValues.length > 0 && typeof layerJson !== 'string') {
				for (var i = 0; i < fieldLayerValues.length; ++i) {
					if (fieldLayerValues[i] && fieldLayerValues[i].length && layerJson.geometryLocateField && layerJson.geometryLocateField[i]) {
						var x = IBIGisUtil.createSimpleWhere(fieldLayerValues[i], layerJson.geometryLocateField[i]);
						if (x !== '') {
							if (where !== '') {
								where = where + ' AND ';
							}
							where = where + x;
						}
					}
				}
			}
			if (where === '') {
				where = '1=1';
			}

			var queryTask = new (dojoObjects['esri/tasks/QueryTask'])(url);//new esri.tasks.QueryTask(layer.url);
			var query = new (dojoObjects['esri/tasks/query'])(); //new esri.tasks.Query();
			var featureLayer = new FeatureLayer(url);
			query.outFields = fields;
			query.returnGeometry = false;
			query.where = where;

			var tempFeaturesArray = [];
			if (maxRecordRetrieval && maxRecordRetrieval > 0) {
				query.num = maxRecordRetrieval;
			}

			function executeQueryBeforeSorting() {
				queryTask.execute(query, function(results) {
					var maxRecordCount = IBIGisUtil.calcMaxRecordCount(featureLayer.maxRecordCount, maxRecordRetrieval);
					var totalFromQuery = results.features.length;
					tempFeaturesArray.push(results.features);

					if (totalFromQuery === maxRecordCount) {
						if (query.start) {
							query.start += totalFromQuery;
						} else {query.start = totalFromQuery;}
						query.num = maxRecordCount;
						return executeQueryBeforeSorting();
					}
					var dups = IBIGisUtil.combineFeaturesFromFeaturesArray(tempFeaturesArray);
					function removeDupsAndSort(duplicateArray) {
						var unique = [];
						for (var i = 0; i < duplicateArray.length; i++) {
							var value = duplicateArray[i].attributes[fields];
							if (unique.length === 0) {
								unique.push(duplicateArray[i].attributes);
							}
							var match = false;
							for (var u in unique) {
								if (unique.hasOwnProperty(u)) {
									var uniqueObj = unique[u][fields];
									if (value === uniqueObj) {
										match = true; break;
									}
								}
							}
							if (!match) {
								unique.push(duplicateArray[i].attributes);
							}
						}
						return sortInternal(unique);

						function sortInternal(u) {
							var sortBy = (fields && fields[0] ? fields[0] : null);
							if (sortBy) {
								u.sort(function(a, b) {
									if (a[fields[0]] < b[fields[0]]) {
										return -1;
									}
									if (a[fields[0]] === b[fields[0]]) {
										return 0;
									}
									return 1;
								});
							}
							return u;
						}
					}
					attributes = removeDupsAndSort(dups);
					if (callBack) {
						callBack(attributes);
					}
				}, errorCallback);
			}
			executeQueryBeforeSorting();
		}

	}

	function getActiveLayers(properties, dataArrayMap) {

		function _getActiveLayers(properties, dataArrayMap, layers) {
			var geoRoles = properties.geoRoles || [];
			var geoRoleIndex = properties.geoRoleIndex;
			var wantedRole = (geoRoleIndex !== undefined ? geoRoles[geoRoleIndex] : undefined) || [];

			var rtn = [];
			var overlayLayerCount = 0;
			if (layers && layers.length > 0) {
				layers.forEach(function(layer) {

					var addLayer = (dataArrayMap !== undefined && dataArrayMap.length > 0) || layer.layerType === 'featurelayer' || layer.layerType === 'tile';

					if (layer.layerType === 'choropleth' || layer.layerType === 'bubble' || layer.layerType === 'heat' || layer.layerType === 'line') {
						++overlayLayerCount;
					}
					if (layer.layerType === 'bubble' && layer.geometrySourceType === 'seriesdata') {
						// see if data array map has x,y names
						var xVarName = layer.geometryXY ? layer.geometryXY.x || 'lng' : 'lng';
						var yVarName = layer.geometryXY ? layer.geometryXY.y || 'lat' : 'lat';
						var keyVarName = layer.geometryDataField || 'name';

						addLayer = dataArrayMap && ((dataArrayMap.indexOf(xVarName) > -1 && dataArrayMap.indexOf(yVarName) > -1) || dataArrayMap.indexOf(keyVarName) > -1);
					} else if (geoRoleIndex !== undefined && (layer.layerType === 'choropleth' || layer.layerType === 'bubble' || layer.layerType === 'heat' || layer.layerType === 'line')) {
						if (layer.geoRoleIndex !== undefined) {
							addLayer = geoRoleIndex === layer.geoRoleIndex;
						} else {
							var layerRole = layer.geoRole || [];
							addLayer = layerRole.length === wantedRole.length;
							for (var i = 0; i < layerRole.length && addLayer; ++i) {
								addLayer = addLayer && layerRole[i].role === wantedRole[i].role && layerRole[i].format === wantedRole[i].format;
							}
						}
					}
					if (addLayer) {
						layer.externalGeoRole = wantedRole;
						rtn.push(layer);
					}
				});
			}
			return {layers: rtn, overlayLayerCount: overlayLayerCount};
		}
		if (properties && properties._activeLayers) {
			return properties._activeLayers;
		}
		var localLayers = _getActiveLayers(properties, dataArrayMap, properties.overlayLayers);
		var combinedLayers = localLayers.layers;
		if (localLayers.overlayLayerCount === 0) {
			// here we should get the global list of geo layers somehow
			var globalLayerList;
			if (tdgchart.prototype.gisGetExternalLayers && typeof tdgchart.prototype.gisGetExternalLayers === 'function') {
				globalLayerList = tdgchart.prototype.gisGetExternalLayers();
			}
			var globalLayers = _getActiveLayers(properties, dataArrayMap, globalLayerList);

			combinedLayers = combinedLayers.concat(globalLayers.layers);
		}
		properties._activeLayers = combinedLayers;
		return properties._activeLayers;
	}

	function createUIContainer(mapContainer) {
		var id = mapContainer.id + 'TopRightUIContainer';
		var div = document.getElementById(id);
		if (div == null) {
			div = document.createElement('div');
			div.setAttribute('class', 'TopRightUIContainer');
			div.setAttribute('id', id);
			mapContainer.appendChild(div);
		}
		return div;
	}

	function setSelectionButtonMode(chart, map, mode, btn) {
		if (mode === 'SELECTION') {
			userSelectedButtonMode = 'SELECTION';
			chart._disableSelection = false;
			map.disableMapNavigation();
			if (btn) {
				btn.setAttribute('class', 'SelectionButton UIButton toggleModeSelection');
			}
		} else {
			userSelectedButtonMode = 'PAN';
			chart._disableSelection = true;
			map.enableMapNavigation();
			if (btn) {
				btn.setAttribute('class', 'SelectionButton UIButton toggleModePan');
			}
		}
	}

	function drawSelectionModeButton(chart, map, mapContainer) {
		// TODO: Clear any selection when selection mode button is clicked
		function setButtonMode(button, map, newMode) {
			userSelectedButtonMode = newMode;
			button.buttonMode = newMode;
			button.innerHTML = tdgchart.translations[newMode];
			setSelectionButtonMode(chart, map, newMode, button);
		}

		function toggleButtonMode(button, map) {
			var newMode = button.buttonMode === 'PAN' ? 'SELECTION' : 'PAN';
			setButtonMode(button, map, newMode);
		}

		var container = createUIContainer(mapContainer);
		var btn = document.createElement('div');
		setButtonMode(btn, map, (userSelectedButtonMode ? userSelectedButtonMode : 'PAN'));
		btn.style.position = 'absolute';
		btn.style.top = '10px';
		btn.style.right = '10px';

		btn.setAttribute('id', mapContainer.id + 'SelectionButton');
		btn.title = 'Toggle Interaction Mode';
		btn.innerHTML = tdgchart.translations[btn.buttonMode];
		function btnClick() {
			toggleButtonMode(this, map);
		}
		btn.addEventListener('click', btnClick);
		btn.addEventListener('touchend', btnClick);

		container.appendChild(btn);
	}
	function hideBusy() {
		setTimeout(function () { if(typeof(ibxBusy) !== "undefined")ibxBusy.busy.show(false);}, 1000);
	}
	function setTocMode(TableOfContentsID, properties) {
		if (saveTocSelection) {
			if (tocExpandedMode) {
				if ('LAYERS' === tocExpandedMode) {
					expandLayersToc(TableOfContentsID);
				} else {
					if (properties.baseMapInfo && properties.baseMapInfo.drawBasemapControl) {
						if ('BASEMAP' === tocExpandedMode) {
							expandBaseMapControl();
						}
					} else {
						tocExpandedMode = null;
					}
				}
			}
		}
	}

	function drawToc(mapContainer, TableOfContentsID, dataSelectionEnabled, properties) {

		setTocMode(TableOfContentsID, properties);
		var uiContainer = createUIContainer(mapContainer);
		var tocContainer = document.createElement('div');
		tocContainer.style.position = 'relative';
		tocContainer.style.clear = 'both';
		tocContainer.style.height = '0px';

		var tocButton = document.createElement('div');
		tocButton.setAttribute('class', 'TableOfContentsButton UIButton');
		var layersTitleTranslated = tdgchart.translations['Layers'];
		tocButton.innerHTML = layersTitleTranslated;
		function tocClick() {
			expandLayersToc(TableOfContentsID);
		}
		tocButton.addEventListener('click', tocClick);
		tocButton.addEventListener('touchend', tocClick);

		var arrowHeader = document.createElement('span');
		arrowHeader.setAttribute('class', 'toc-header-arrow');
		arrowHeader.innerHTML = '&nbsp;';
		tocButton.appendChild(arrowHeader);
		tocButton.style.position = 'absolute';
		if (dataSelectionEnabled) {
			tocButton.style.top = '30px';
		}
		tocContainer.appendChild(tocButton);

		var toc = document.createElement('div');
		toc.setAttribute('class', 'TableOfContentsContainer');
		toc.setAttribute('id', TableOfContentsID + 'TableOfContentsContainerID');
		toc.style.visibility = 'hidden';
		toc.style.height = '0px';
		if (dataSelectionEnabled) {
			toc.style.top = tocButton.style.top;
		}

		var tocBody = document.createElement('div');
		tocBody.setAttribute('id', TableOfContentsID);

		var header = document.createElement('div');
		header.setAttribute('class', 'toc-header');
		header.innerText = layersTitleTranslated;
		var arrowOpen = document.createElement('span');
		arrowOpen.setAttribute('class', 'toc-header-arrow toc-header-arrow-open');
		arrowOpen.innerHTML = '&nbsp;';
		function headerClick(e) {
			var ancestor = (tdg && tdg.dom && tdg.dom.ancestor) ? tdg.dom.ancestor : pv.ancestor;
			if (!ancestor(e.currentTarget, e.relatedTarget)) {
				collapseLayersToc(TableOfContentsID);
			}
		}
		header.addEventListener('click', headerClick);
		header.addEventListener('touchend', headerClick);

		toc.appendChild(arrowOpen);
		toc.appendChild(header);
		toc.appendChild(tocBody);
		tocContainer.appendChild(toc);
		uiContainer.appendChild(tocContainer);
	}

	function collapseBaseMapControl() {
		dojo.query('.dijitTitlePane').forEach(function(node) {
			var tp = dijit.getEnclosingWidget(node);
			//dijit.getEnclosingWidget(node).set('open',false); // need this for further testing if tp.toggle() will work in all scenario, if not, use this line.
			if (tp && tp._isShown()) {
				tocExpandedMode = null;
				tp.toggle();
			}
		});
	}

	function expandBaseMapControl() {
		dojo.query('.dijitTitlePane').forEach(function(node) {
			var tp = dijit.getEnclosingWidget(node);
			if (tp && !tp._isShown()) {
				tocExpandedMode = 'BASEMAP';
				tp.toggle();
			}
		});
	}

	function collapseLayersToc(TableOfContentsID) {
		var obj = document.getElementById(TableOfContentsID + 'TableOfContentsContainerID');
		if (obj && obj.style) {
			tocExpandedMode = null;
			var tocObj = document.getElementById(TableOfContentsID);
			var currheight = tocObj.offsetHeight;
			var initialHeight = currheight;
			var timer = setInterval(function() {
				currheight -= initialHeight / 10;
				tocObj.style.height = currheight + 'px';
				if (currheight <= 0) {
					clearInterval(timer);
					obj.style.visibility = 'hidden';
					tocObj.style.height = '';
				}
			}, animateInMillisecond);
		}
	}

	function expandLayersToc(TableOfContentsID) {
		collapseBaseMapControl();
		var obj = document.getElementById(TableOfContentsID + 'TableOfContentsContainerID');
		if (obj && obj.style) {
			var tocObj = document.getElementById(TableOfContentsID);
			var initialHeight = tocObj.offsetHeight;
			var currentHeight = 0;
			var timer = setInterval(function() {
				currentHeight += initialHeight / 10;
				tocObj.style.height = currentHeight + 'px';
				obj.style.visibility = 'visible';
				if (initialHeight <= currentHeight) {
					tocObj.style.height = '';
					clearInterval(timer);
				}
			}, animateInMillisecond);
			tocExpandedMode = 'LAYERS';
		}
	}

	function createCustomBaseMapLayers(baseMapInfo, BaseMapContentsID) {
		var basemaps = [];
		if (!baseMapInfo || !baseMapInfo.customBaseMaps) {
			return basemaps;
		}

		if (!(baseMapInfo.customBaseMaps instanceof Array)) {
			baseMapInfo.customBaseMaps = [baseMapInfo.customBaseMap];
		}
		baseMapInfo.customBaseMaps.forEach(function(customBaseMapEntry) {
			if (!customBaseMapEntry) {
				return;
			}
			var basemapLayer = null;
			if (customBaseMapEntry.name && esriBasemaps[customBaseMapEntry.name]) {
				basemapLayer = new dojoObjects['esri/dijit/Basemap']({
					layers: esriBasemaps[customBaseMapEntry.name].layers,
					title: customBaseMapEntry.title || esriBasemaps[customBaseMapEntry.name].title,
					thumbnailUrl: esriBasemaps[customBaseMapEntry.name].thumbnailUrl,
					id: esriBasemaps[customBaseMapEntry.name].id,
					itemId: esriBasemaps[customBaseMapEntry.name].itemId,

					name: customBaseMapEntry.name
				});
			} else if ((customBaseMapEntry.basemapLayer || customBaseMapEntry.url) && customBaseMapEntry.name) {
				basemapLayer = new dojoObjects['esri/dijit/Basemap']({
					layers: [new dojoObjects['esri/dijit/BasemapLayer'](customBaseMapEntry.basemapLayer || {url: customBaseMapEntry.url})],
					title: customBaseMapEntry.title || customBaseMapEntry.name,
					thumbnailUrl: customBaseMapEntry.thumbnailUrl,
					id: BaseMapContentsID + '_ID_' + customBaseMapEntry.name,
					itemId: BaseMapContentsID + '_ID_' + customBaseMapEntry.name,
					name: customBaseMapEntry.name
				});
				// add so that it can be uses
				esriBasemaps[customBaseMapEntry.name] = basemapLayer;
			}

			if (basemapLayer) {
				if (customBaseMapEntry && customBaseMapEntry.showInBasemapControl != null) {
					//do not add in basemap control
					var showInControl = customBaseMapEntry.showInBasemapControl;
					if (!showInControl) {
						//console.log('not adding to control');
					} else {
						basemaps.push(basemapLayer);
					}
				} else {
					basemaps.push(basemapLayer);
				}
			}
		});
		return basemaps;
	}

	function drawBaseMapControl(mapContainer, BaseMapContentsID, basemaps, map, baseMapInfo, dataSelectionEnabled, overlayLayers, TableOfContentsID) {
		var uiContainer = createUIContainer(mapContainer);
		var div = document.createElement('div');
		div.setAttribute('id', BaseMapContentsID + '_basemapGallery');
		var cp = new dojoObjects['dijit/layout/ContentPane']({style: 'width:380px; height:280px; overflow:auto;', content: div});

		div = document.createElement('div');
		div.setAttribute('id', BaseMapContentsID + '_container');
		div.setAttribute('style', 'z-Index:1;');
		div.style.position = 'absolute';
		div.style.right = '10px';

		function divClick() {
			collapseLayersToc(TableOfContentsID);
			dojo.query('.dijitTitlePane').forEach(function(node) {
				var tp = dijit.getEnclosingWidget(node);
				if (tp) {
					if (!tp._isShown()) {
						tocExpandedMode = null;
					} else if (tp._isShown()) {
						tocExpandedMode = 'BASEMAP';
					}
				}
			});
		}
		div.addEventListener('click', divClick);
		div.addEventListener('touchend', divClick);

		var positionTopPixel = 10;
		if (dataSelectionEnabled) {
			positionTopPixel += 30;
		}
		if (overlayLayers && overlayLayers.length > 0) {
			positionTopPixel += 30;
		}
		div.style.top = positionTopPixel + 'px';
		uiContainer.appendChild(div);

		var tp = new dojoObjects['dijit/TitlePane']({title: tdgchart.translations.Switch_Basemap, content: cp.domNode, open: false});
		div.appendChild(tp.domNode);
		tp.startup();

		var basemapGallery = new dojoObjects['esri/dijit/BasemapGallery']({
			showArcGISBasemaps: baseMapInfo.showArcGISBasemaps,
			map: map,
			basemaps: basemaps
		}, BaseMapContentsID + '_basemapGallery');

		basemapGallery.startup();
	}

	var extent;  // Track the last specified extent - necessary for building one extent across all layers
	tdgchart.prototype.extent = extent;
	function myCallbackFunction(ioArgs) {
		if((ioArgs.url.search("/silent:") != -1 || ioArgs.url.search("/named:") != -1) && typeof(WFGlobals) != 'undefined') {
			if(!ioArgs.hasOwnProperty("headers"))
				ioArgs.headers={};
	        ioArgs.headers[WFGlobals.getSesAuthParm()]=WFGlobals.getSesAuthVal();
		}
		return ioArgs;
	}
	function myDrawFn(renderConfig) {
		var map;
		var chart = renderConfig.moonbeamInstance;
		IBIEsriChoropleth.initialize(renderConfig, IBIGisUtil, dojoObjects, tdg);
		IBIEsriBubble.initialize(renderConfig, IBIGisUtil, dojoObjects, tdg);
		var properties = renderConfig.properties;
		var container = renderConfig.container;
		var containerID = renderConfig.containerIDPrefix;
		if(typeof(ibxBusy) !== "undefined")
			ibxBusy.busy.show(true, $("#"+containerID));
		var TableOfContentsID = containerID + 'TableOfContents';
		var BaseMapContentsID = containerID + 'BaseMapOfContents';
		var maxRecordCount;
		chart.processSelection(); // enables selection on map legend
		// esri pages have this at body, this is the best we can do.
		container.setAttribute('class', 'claro');

		IBIGisUtil.setProxy(renderConfig);
		var baseLayer = properties.baseLayer;
		baseLayer.autoResize = false;
		var layersToDraw = getActiveLayers(properties, chart.dataArrayMap);
		var basemaps = createCustomBaseMapLayers(properties.baseMapInfo, BaseMapContentsID);
		if (properties.drawToc && layersToDraw && layersToDraw.length > 0) {
			drawToc(container, TableOfContentsID, chart.dataSelection.enabled, properties);
		}
		animateInMillisecond = properties.animateInMillis || 15;

		if (baseLayer && baseLayer.basemap === 'None') {
			baseLayer.basemap = '';
		}
		esriRequest.setRequestPreCallback(myCallbackFunction);
		if (baseLayer && baseLayer.basemap) {

			var clientHeight = document.getElementById(containerID).clientHeight;
			var clientWidth = document.getElementById(containerID).clientWidth;
			var baseLayerDimension = (baseLayer.hasOwnProperty('baseLayerDimension') ? baseLayer.baseLayerDimension: {});

			if (!baseLayer.hasOwnProperty('minZoom') || (baseLayerDimension.height !== clientHeight || baseLayerDimension.width !== clientWidth)) {
				if (properties.pixelsPerTile && properties.pixelsPerTile > 0) {
					baseLayer.minZoom = Math.min(Math.floor((Math.min(clientHeight, clientWidth) - properties.pixelsPerTile) / properties.pixelsPerTile), 2);
					baseLayer.baseLayerDimension = {height: clientHeight, width: clientWidth};
				}
			}

			layersToDraw.forEach(function(data) {

				IBIGisUtil.setProxyForLayer(data, renderConfig);

				var urlToQuery = data.url;
				var geoSrcType = data.geometrySourceType;
				if (data.fieldSource) {
					for (var x in data.fieldSource) {
						if (data.fieldSource.hasOwnProperty(x)) {
							geoSrcType = data.fieldSource[x].geometrySourceType;
							urlToQuery = data.fieldSource[x].url;
							if (geoSrcType === 'esri') {
								break;
							}
						}
					}
				}
				if (geoSrcType === 'esri') {
					var errorMessage = tdgchart.translations.MapLoadError;
					var esriReq = esriRequest({url: urlToQuery, content: {f: 'json'}, handleAs: 'json', callbackParamName: 'callback'});
					esriReq.then(function(response) {
						if (!response) {
							chart.errorMessage = errorMessage;
							chart.redraw();
							tdg.traceError('Failed to load ' + urlToQuery + '. ' + errorMessage);
							return;
						}
						maxRecordCount = IBIGisUtil.calcMaxRecordCount(response.maxRecordCount, maxRecordRetrieval);

					}, function(err) {
						chart.errorMessage = errorMessage;
						chart.redraw();
						var additionalError = err.toString();
						if (err.httpCode) {
							additionalError += 'HTTP ' + err.httpCode + '. ';
						}
						if (err.details) {
							additionalError += err.details.toString() + '. ';
						}
						tdg.traceError('Failed to load ' + urlToQuery + '. ' + additionalError + errorMessage);
					});
				}
			});

			baseLayer.showLabels = true;
			map = new Map(containerID, baseLayer);
			map.on('load', function() {
				addLayers(layersToDraw);
			});

		} else {
			// Must specify a world-encompassing initial extent with ESRI's default
			// spatial reference, so that initial view can load everything correctly.
			var bounds = new Extent(IBIGisUtil.getExtent(layersToDraw, properties));
			map = new Map(containerID, {extent: bounds, autoResize: false, showLabels: true});
			if (baseLayer && baseLayer.center && baseLayer.zoom) {
				map.centerAndZoom(baseLayer.center, baseLayer.zoom);  // TODO: zoom doesn't work for non-existent base layers
			}
			map.on('load', function() {
				map.setExtent(map.extent);
			});
			// If we have no base map, map.on(load) never fires; must call addLayers directly	
			
            addLayers(layersToDraw);
		}

		if (chart.dataSelection.enabled) {
			drawSelectionModeButton(chart, map, container);
		}

		if (properties.baseMapInfo && properties.baseMapInfo.drawBasemapControl) {
			drawBaseMapControl(container, BaseMapContentsID, basemaps, map, properties.baseMapInfo, chart.dataSelection.enabled, properties.overlayLayers, TableOfContentsID);
		}

		if (properties.scalebar) {
			var o = {map: map};
			o = chart.mergeObjects(properties.scalebar, o);
			var scalebar = new Scalebar(o);
		}

		if (properties.maxQueryRetrieval && properties.maxQueryRetrieval > 0) {
			maxRecordRetrieval = properties.maxQueryRetrieval;
		}

		function addLayers(layers) {
			var groupIdVarName = IBIGisUtil.toInternalEsriDataFieldName('groupId');
			var seriesIdVarName = IBIGisUtil.toInternalEsriDataFieldName('seriesId');

			function mapUpdateEnd(e) {
				chart.processEvents();
				if (e && e.target) {
					renderConfig.modules.tooltip.updateToolTips(e.target.container);
				}
				if (chart.dataSelection.enabled) {
					renderConfig.modules.dataSelection.activateSelection();
				}
				if (chart.dataSelection.enabled) {
					setSelectionButtonMode(chart, map, userSelectedButtonMode ? userSelectedButtonMode : 'PAN', null);
				} else {
					userSelectedButtonMode = null;
				}
			}
			map.on('update-end', function(e) {
				mapUpdateEnd(e);
			});
			map.on('extent-change', function(e) {
				mapUpdateEnd(e);
			});

			if (chart.htmlToolTip.enabled) {
				map.on('pan-start', function() {
					chart.hideToolTip();
				});
				map.on('zoom-start', function() {
					chart.hideToolTip();
				});
			}

			if (!layers || layers.length === 0) {
				hideBusy();
				return;
			}
			if(waitForLayers && waitForLayers!=-1)
				waitForLayers=window.clearInterval(waitForLayers);
			var newLayers = [];
			var tocNewLayers = [];
			var layerOpacity = (typeof chart.mapProperties.mapOpacity === 'number') ? chart.mapProperties.mapOpacity : 1;
			var usedLayerIds = {};
			var hasOlnyIBIlayers = true;
			var totalLayersToDraw = -1;
			var mapLayersDone = []; 

			function mapRenderComplete() {
				//all the layers are rendered here.
				renderConfig.renderComplete();
			}
			var layersLength=layers.length;
			layers.forEach(function(layer) {
				var newLayer = null;
				if (layer.layerType === 'bubble' || layer.layerType === 'heat') {
					newLayer = IBIEsriBubble.draw(layer, groupIdVarName, seriesIdVarName, map, usedLayerIds, maxRecordCount, renderConfig);
				} else if (layer.layerType === 'choropleth' || layer.layerType === 'line') {
					newLayer = IBIEsriChoropleth.draw(layer, groupIdVarName, seriesIdVarName, map, usedLayerIds, maxRecordCount, renderConfig);
				} else if (layer.layerType === 'featurelayer') {
					newLayer = IBIEsriChoropleth.drawFeatureLayer(layer, map, usedLayerIds);
					layer.gl=newLayer;
					if (newLayer instanceof GraphicsLayer) {
						if (newLayer instanceof FeatureLayer) {
							hasOlnyIBIlayers = false;
						}
					} else {
						hasOlnyIBIlayers = false;
					}
					layer.layerDone=true;
				
				} else if (layer.layerType === 'tile') {
					hasOlnyIBIlayers = false;
					newLayer = drawTileLayer(layer);
					layer.layerDone=true;
				}

				function layerUpdateEnd(newLayer) {
					mapLayersDone.push(newLayer);
					if (totalLayersToDraw === mapLayersDone.length) {
						mapRenderComplete();
					}
				}

				function layerLoad(newLayer, map1) {
					//some layers are not visible at certain scales, use this to figure out if layer should have been painted
					var isVisible = newLayer.isVisibleAtScale(map1.getScale());
					if (!isVisible) {
						layerUpdateEnd(newLayer);
					}
				}
				function layerIsLoaded(layerToAdd, ibLay) {
					var opacity = layerOpacity;
					if (ibLay.options && ibLay.options.opacity != null) {
						opacity = (ibLay.options.opacity > 1) ? ibLay.options.opacity / 256 : ibLay.options.opacity;
					}
					layerToAdd.setOpacity(opacity);
					layerToAdd.title = ibLay.title || ('Layer ' + newLayer.id);
					tocNewLayers.push({
						layer: layerToAdd,
						ibilayer: ibLay,
						layerType: ibLay.layerType
					});

					layerToAdd.on('update-end', function() {
						layerUpdateEnd(layerToAdd);
					});

					layerToAdd.on('load', function() {
						layerLoad(layerToAdd, map);						
					});

					layerToAdd.on('error', function() {
						layerUpdateEnd(layerToAdd);
					}); 
					newLayers.push(layerToAdd);                        
				}
				if (newLayer) {
					if(layer.layerDone) 
						layerIsLoaded(layer.gl ? layer.gl : newLayer, layer);
					else {
						var done = -1;                
						var geomF = function () {                    
							if(layer.layerDone) {
								done=window.clearInterval(done);
								layerIsLoaded(layer.gl ? layer.gl : newLayer, layer);
							}                
						};
						done = window.setInterval(geomF, 10);
					}
				}
				else //something is not right
					hideBusy();
			});
			var waitForAll=-1;
			var waitForAllFunc = function () {  
				if(layersLength == newLayers.length) {
					waitForAll=window.clearInterval(waitForAll);
					totalLayersToDraw = newLayers.length;
					newLayers.forEach(function(lay){lay.visible=true;});	
					chart.__esri = {
							map : map
					};
					
					if (properties.drawToc) {
						if (hasOlnyIBIlayers) {
							tocNewLayers[0].layer.dataLayer=true;
							new TableOfContents({
								map: map,
								layers: newLayers.reverse(),
								tocNewLayers: tocNewLayers.reverse(),
								gisUtil: IBIGisUtil
							}, TableOfContentsID).startup();
						} else {
							// Add layer info to already created but empty TOC
							function isLoadingDone(){
								var done=false;
								if(document.getElementById(TableOfContentsID)){
									done=true;
									for (var ii = 0; ii < tocNewLayers.length; ii++){
										var tocLay =tocNewLayers[ii].layer, layer = map.getLayer(tocLay.id);
										if(!layer && tocLay && tocLay.loadError) {
											alert(tocLay.loadError.message);
											tocNewLayers.splice(ii,1);
											for (var jj = 0; jj < newLayers.length; jj++){
												if(newLayers[jj].id==tocLay.id) {
													newLayers.splice(jj,1);
													break;
												}
											}
											done=false;
											break;
										}
										if(!layer || !layer.loaded) {
											done=false;
											break;
										}
									}									
								}
								return done; 
							}
							var waitForLegendFunc = function () {  
								if(isLoadingDone()){
									waitForLayers=window.clearInterval(waitForLayers);
									hideBusy();
				//			map.on('layers-add-result', function() {
									try {
										for (var i = 0; i < tocNewLayers.length; i++) {
											if(!(tocNewLayers[i].layerType === 'featurelayer' || tocNewLayers[i].layerType === 'tile')) {
												tocNewLayers[i].layer.dataLayer=true;
												map.reorderLayer(tocNewLayers[i].layer, tocNewLayers.length-1);
											}
										}
										
										mapUpdateEnd(null);
										new TableOfContents({
											map: map,
											layers: newLayers.reverse(),
											tocNewLayers: tocNewLayers.reverse(),
											gisUtil: IBIGisUtil
										}, TableOfContentsID).startup();
									}
									catch (error) {}
								}
							};
							waitForLayers = window.setInterval(waitForLegendFunc, 1000);
						}
					}
					map.addLayers(newLayers);
					setTocMode(TableOfContentsID, properties);
					if (hasOlnyIBIlayers)
						hideBusy();
				}
			};
			waitForAll = window.setInterval(waitForAllFunc, 10);
			function drawTileLayer(layer) {
				IBIGisUtil.setProxyForLayer(layer, renderConfig);
				var ArcGISTiledMapServiceLayer = dojoObjects['esri/layers/ArcGISTiledMapServiceLayer'];
				var newLayer = new ArcGISTiledMapServiceLayer(layer.url, layer.options);
				map.addLayer(newLayer);
				return newLayer;
			}
		}
	}

	function getEsriJsPAth(initConfig) {
		var HOSTNAME_AND_PATH_TO_JSAPI = '//js.arcgis.com/3.39/';
		if (window.location.protocol.startsWith('file:')) {
			// ESRI can't load from 'file:' based pages, so assume 'http:' in that case instead.  Necessary for server-side rendering.
			HOSTNAME_AND_PATH_TO_JSAPI = 'http:' + HOSTNAME_AND_PATH_TO_JSAPI;
		}
		if (initConfig.properties.IBI_ESRI_On_Premise && initConfig.properties.IBI_ESRI_On_Premise.length > 0) {
			HOSTNAME_AND_PATH_TO_JSAPI = initConfig.properties.IBI_ESRI_On_Premise;

			if (HOSTNAME_AND_PATH_TO_JSAPI.indexOf('//') < 0) {
				var path = '';
				if (HOSTNAME_AND_PATH_TO_JSAPI.charAt(0) !== '/') {
					path = tdgchart.getScriptPath();
					var i = path.indexOf('/tdg/');
					path = (i >= 0 ? path.substring(0, i) : path);
				}

				HOSTNAME_AND_PATH_TO_JSAPI = '//' + window.location.host + path + HOSTNAME_AND_PATH_TO_JSAPI;
			}
		}
		window.HOSTNAME_AND_PATH_TO_JSAPI = HOSTNAME_AND_PATH_TO_JSAPI;
		return HOSTNAME_AND_PATH_TO_JSAPI;
	}

	function isChoropleth(arg) {
		var layers = getActiveLayers(arg.properties, arg.moonbeamInstance.dataArrayMap);
		if (layers && layers.length) {
			for (var i = 0; i < layers.length; i++) {
				return layers[i].layerType === 'choropleth' || layers[i].layerType === 'line';
			}
		}
	}

	// Optional: if defined, is invoked once at the very beginning of each chart engine draw cycle
	// Use this to configure a specific chart engine instance before rendering.
	// Arguments:
	//  - preRenderConfig: the standard callback argument object
	function preRenderCallback(preRenderConfig) {
		var chart = preRenderConfig.moonbeamInstance;
		preRenderConfig.properties._activeLayers = null;
		chart.dataLabels.position = 'center';
		//chart.dataLabels.visible = 'true';
	}
	var wfglobals=false;
	if(!tdgchart.util.isServerSide && typeof(tdgchart.getScriptBasePath) == 'function') 
		wfglobals=tdgchart.getScriptBasePath()+'tools/shared_resources/source/wf_globals.jsp';	
	var config = {
		containerType: 'html',
		id: 'com.esri.map', // string that uniquely identifies this extension
		name: 'com.esri.map', // colloquial name for your chart - might be used in some extension list UI
		description: 'com.esri.map', // description useful for a UI tooltip or similar
		outputFormat: 'html',
		initCallback: initCallback,
		renderCallback: myDrawFn, // reference to a function that will draw the actual chart.  Will be passed one 'renderConfig' object, defined below
		preRenderCallback: preRenderCallback,

		modules: {
			tooltip: {
				supported: true,
				supportDOMContent: true
			},
			dataSelection: {
				supported: true,
				needSVGEventPanel: true,
				getSelectedNodes: function(arg) {
					var rect = arg.container.getBoundingClientRect();
					return function(selectionRectangle) {
						var traceIt = false;
						if(traceIt)
							{
							console.log("rect = " + JSON.stringify(rect));
							console.log("selectionRectangle = " + JSON.stringify(selectionRectangle));
							}
						
			
						var chart = arg.moonbeamInstance;
	//					var screenPoint1 = new ScreenPoint(selectionRectangle.x - rect.x ,selectionRectangle.y  - rect.y  );
	//					var screenPoint2 = new ScreenPoint(selectionRectangle.x - rect.x + selectionRectangle.width, selectionRectangle.y - rect.y  + selectionRectangle.height);
						
	//					var screenPoint1 = new ScreenPoint(rect.x + selectionRectangle.x, rect.y + selectionRectangle.y  );
	//					var screenPoint2 = new ScreenPoint(rect.x + selectionRectangle.x  + selectionRectangle.width, selectionRectangle.y + rect.y  + selectionRectangle.height);

						var screenPoint1 = new ScreenPoint(selectionRectangle.x, selectionRectangle.y);
						var screenPoint2 = new ScreenPoint(selectionRectangle.x + selectionRectangle.width, selectionRectangle.y + selectionRectangle.height);

						if(traceIt)
						{
							console.log("screenPoint1 = " + JSON.stringify(screenPoint1));
							console.log("screenPoint2 = " + JSON.stringify(screenPoint2));
						}

						var p1 = dojoObjects['esri/geometry/screenUtils'].toMapPoint(chart.__esri.map.extent, rect.width, rect.height, screenPoint1);
						var p2 = dojoObjects['esri/geometry/screenUtils'].toMapPoint(chart.__esri.map.extent, rect.width, rect.height, screenPoint2);
						
						if(traceIt)
						{
							console.log("p1 = " + JSON.stringify(p1));
							console.log("p2 = " + JSON.stringify(p2));
						}
						var newExtent = new Extent(p1.x,p1.y,p2.x,p2.y,p2.spatialReference);

						var rtn = [], dataLayer=null;
						
						for(var k = 0; k<chart.__esri.map.graphicsLayerIds.length; k++) {
							var temp = chart.__esri.map.getLayer(chart.__esri.map.graphicsLayerIds[k]);
							if(temp && temp.dataLayer) {
								dataLayer=temp;
								break;
							}
						}
						if(dataLayer) {
							var convExt = WebMercatorUtils.webMercatorToGeographic(newExtent);
							dataLayer.graphics.forEach(function(g){
								if( ! GeometryEngine.disjoint(newExtent, g.geometry) || ! GeometryEngine.disjoint(convExt, g.geometry))
								{
//								console.log(g.attributes.NAME + ", g:" +  g.attributes._g + " ,s:" + g.attributes._s);
								rtn.push({ series :  g.attributes._s , group : g.attributes._g, misc : 'region'});
								}
							});
	
							// selectionRectangle has properties x, y, width & height.
							// Function should return the list of DOM nodes to be selected.
							// Selected DOM nodes must 'risers', with a class that starts with 'riser!s'.
							// Selected DOM nodes must be children of the container returned by 'svgNode' below.
						}
						return rtn;
					}
				},
				svgNode: function(arg) {
					return arg.container.getElementsByTagName('svg')[0];
				}
			},
			previewSelection: {
				supported: true,
				svgNode: function(arg) {
					
					console.log('previewSelection');

					
					return arg.container.getElementsByTagName('svg')[0];
				}
			},
			legend: {

				colorMode: function(arg) {
					var dataArrayMap = arg.moonbeamInstance.dataArrayMap || [];
					var layers = getActiveLayers(arg.properties, dataArrayMap);
					if (layers && layers.length) {
						for (var i = 0; i < layers.length; i++) {
							if (layers[i].layerType === 'choropleth' || layers[i].layerType === 'line') {
								if (dataArrayMap.indexOf('value') >= 0) {
									return 'data';
								}
							}
						}
					}
					return dataArrayMap.indexOf('color') >= 0 ? 'data' : 'series';
				}, // either 'data' (for color scale) or 'series'

				sizeMode: function(arg) {
					var dataArrayMap = arg.moonbeamInstance.dataArrayMap || [];
					var layers = getActiveLayers(arg.properties, dataArrayMap);

					if (layers && layers.length) {
						for (var i = 0; i < layers.length; i++) {
							if (layers[i].layerType === 'bubble' || layers[i].layerType === 'heat') {
								return dataArrayMap.indexOf('value') >= 0 ? 'size' : undefined;  // If we have a bubble layer, need a size legend , if its there
							}
						}
					}
					return undefined;
				},

				seriesCount: function(arg) {
					var idx_count = 0, data_count = arg.data.length;
					var dataArrayMap = arg.moonbeamInstance.dataArrayMap || [];
					var layers = getActiveLayers(arg.properties, dataArrayMap);
					if (layers && layers.length) {
						for (var i = 0; i < layers.length; i++) {
							if (layers[i].seriesIndex == null) {
								return data_count;  // If a layer does not have a series id, it means 'use all data'
							}
							idx_count += 1;
						}
					}
					return Math.min(idx_count, data_count);
				} // If colorMode is 'series', how many series do we draw? Series properties (color, label, etc) are driven by chart.series array.
			},

			sizeScale: {
				supported: true,
				minMax: function(arg, key) { // only for bubble markers and their size legends
					return minMax(arg.data, key || 'value', true);
				}  // Define the min & max values on the size scale legend
			},

			colorScale: {
				supported: true,
				minMax: function(arg) {  // only for 'data' color mode legends
					return minMax(arg.data, 'color');
				}, // Define the min & max values on the color scale legend
				colorDataArrayEntry: function(arg) {
					return isChoropleth(arg) ? 'value' : 'color';
				}
			},

			dataLabels: {
				supported: true,
				defaultDataArrayEntry: function(arg) {
					return 'color';    // Return the name of the 'default' bucket
				}
			}
		},
		resources: {
			// Additional external resources (CSS & JS) required by this extension
			
			script: wfglobals ? 
				[
					function(config) {
						return getEsriJsPAth(config) + 'init.js';
					},	
					wfglobals,
					'lib/proxyInfo.js',
					'lib/layerInfo.js',
					'lib/disableAMD.js'
				] : 
				[
					function(config) {
						return getEsriJsPAth(config) + 'init.js';
					},	
					'lib/proxyInfo.js',
					'lib/layerInfo.js',
					'lib/disableAMD.js'
				],				
			css: [
				function(config) {
					return getEsriJsPAth(config) + 'dijit/themes/claro/claro.css';
				},
				function(config) {
					return getEsriJsPAth(config) + 'esri/css/esri.css';
				},
				'lib/TableOfContents.css',
				'lib/esriOverride.css']
		}
	};
	var portal = this.BipIframeInterface || parent.BipIframeInterface ? true : false;
	if(document.getElementsByName("viewport").length && document.body.id!=="wndApp" && !portal) {
		config.resources.script.push({name:'ibx'});
		var ibxInt=window.setInterval(function() {
			if (tdgchart.extensionManager && tdgchart.extensionManager.__externalLibraries['ibx']) {
				ibxInt=window.clearInterval(ibxInt);
				tdgchart.extensionManager.register(config);	
			}			   							
		}, 50);	
	}
	else tdgchart.extensionManager.register(config);

	// Find the min & max values in an arbitrarily nested array of data
	// End values can be either numbers or objects; if objects, key then 'value' (if no key match) properties are used
	function minMax(data, key, abs) {
		var res, min = Infinity, max = -Infinity;
		for (var i = 0; i < data.length; i++) {
			var d = data[i];
			if (Array.isArray(d)) {
				res = minMax(d, key, abs);
			} else if (typeof d === 'object') {
				var value = (d[key] == null) ? d.value || 0 : d[key];
				res = {min: value, max: value};
			} else if (typeof d === 'number') {
				res = {min: d, max: d};
			}
			if (abs) {
				res.min = Math.abs(res.min);
				res.max = Math.abs(res.max);
			}
			min = Math.min(res.min, min || 0);
			max = Math.max(res.max, max || 0);
		}
		return {min: min, max: max};
	}

})();

var dojoConfig = {
	locale: document.documentElement.lang.substring(0,2),
	paths: {		
		extras: tdgchart.util.makePathAbsolute(tdgchart.getScriptPath()) + 'extensions/com.esri.map/lib'
	}
};
