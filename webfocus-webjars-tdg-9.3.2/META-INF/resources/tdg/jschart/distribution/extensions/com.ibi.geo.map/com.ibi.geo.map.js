/*global tdgchart: false, d3: false */
/* Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved.  */
var IBGeo=null, satRenderer=null, apiVersion="4.28";

(function() {
	function getEsriJsPath(initConfig) {
		var HOSTNAME_AND_PATH_TO_JSAPI = "https://js.arcgis.com/"+apiVersion;
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

				HOSTNAME_AND_PATH_TO_JSAPI = '//' + window.location.host + path + HOSTNAME_AND_PATH_TO_JSAPI + apiVersion;
			}
		}
		return HOSTNAME_AND_PATH_TO_JSAPI;
	}
	function loadEsriCss(config) {
		var elt = document.createElement("link");
		elt.setAttribute("type", "text/css");
		elt.setAttribute("rel", "stylesheet");
		elt.href = getEsriJsPath(config) + "/esri/css/main.css";			
		elt.setAttribute("charset", "utf-8");
		document.head.appendChild(elt);
	}
	function initCallback(successCallback, initConfig){
		if(typeof(ibxBusy) !== "undefined")ibxBusy.busy.show(true, $(".map-container-frame"));
		if(!initConfig.moonbeamInstance.title.visible)
			initConfig.moonbeamInstance.labelPadding.frame.top=0;
		initConfig.moonbeamInstance.legend.visible=false;
        successCallback(true);
	}

	function noDataPreRenderCallback(preRenderConfig){
	}
	function getDefaultUI(renderConfig){
		//console.log(renderConfig);
		if(!this.res){			
			loadEsriCss(renderConfig);
			var libPath=renderConfig.loadPath ? renderConfig.loadPath : tdgchart.getScriptBasePath()+"tdg/jschart/distribution/extensions/com.ibi.geo.map/",
			inPreview = renderConfig.moonbeamInstance.hasOwnProperty("inPreviewMode") && renderConfig.moonbeamInstance.inPreviewMode,
			bundleToLoad=inPreview ? "lib/res_bundle.xml" : "lib/runtime_bundle.xml"
			ibx.resourceMgr.addBundles([{"src": libPath+bundleToLoad, "loadContext":"ibx"}]).then(
			function(resMgr){		
				this.res = resMgr.getResource(".map-container-frame");
				$(renderConfig.container).append(res);
				$(".sel-pan").css("display","none");
				var mapDiv = resMgr.getResource(".map-container");	
				this.resMgr = resMgr;				
				var myInterval=-1;
				var myWaitFunct = function () {
					if(typeof(IBGeo) == "function") {
						myInterval=window.clearInterval(myInterval);				
						this.ibgeo = new IBGeo(getEsriJsPath(renderConfig), renderConfig.properties.IBI_ESRI_On_Premise && renderConfig.properties.IBI_ESRI_On_Premise.length > 0);
						this.ibgeo.setUIHandlers(false);
						this.ibgeo.createView(renderConfig, mapDiv[0]);											
						renderConfig.renderComplete();
					}
				};
				myInterval = window.setInterval(myWaitFunct, 20);
			}.bind(this));
		}
		else if(this.ibgeo){
			$(renderConfig.container).append(this.res);
		//	this.ibgeo.updateView(renderConfig);	
		}
	}

	function noDataRenderCallback(renderConfig){
		getDefaultUI(renderConfig);
	}

	function preRenderCallback(preRenderConfig){
	}

	function renderCallback(renderConfig){
		noDataRenderCallback(renderConfig);
	}
	var context="/ibi_apps", path=tdgchart.getScriptPath();
	if(typeof(path)==='string'){
		var parts=path.split('/');
		if(parts.length>1)context='/'+parts[1];
	}
	
	//cgiPath + "jquery/js/" + IBI_CACHE_FLUSH_KEY + "jquery.min.js"
	var config = {
		id: 'com.ibi.geo.map',
		containerType: 'html',
		name: 'com.ibi.geo.map',
		description: 'com.ibi.geo.map',
		initCallback: initCallback,
		preRenderCallback: preRenderCallback,
		renderCallback: renderCallback,
		noDataPreRenderCallback: noDataPreRenderCallback,
		noDataRenderCallback: noDataRenderCallback,
		resources: {
			script: [
				{name:'ibx'},
				function(config) {
					return getEsriJsPath(config)+"/init.js";
				}
			],
			css: [
		/*		function(config) {
					return getEsriJsPath(config) + "/esri/css/main.css";
				}*/
			]
		},
		modules: {
			dataSelection: {
				supported: false,
				svgNode: function(){}
			},
			eventHandler: {
				supported: true
			},
			tooltip: {
				supported: false
			},
			colorScale: {
				supported: false,
				minMax: function(renderConfig){
				}
			},
			sizeScale: {
				supported: false,
				maxDiameter: null,
				minMax: function(renderConfig){
				}
			},
			dataLabels: {
				supported: true,
				visible: true,
				font: "7.5pt Sans-Serif",
				color: "auto"
			},
		}
		
	};
	//wait for ibx
	var ibxInt=window.setInterval(()=>{
		if (tdgchart.extensionManager && tdgchart.extensionManager.__externalLibraries['ibx']) {
			ibxInt=window.clearInterval(ibxInt);
			tdgchart.extensionManager.register(config);	
		}			   							
	}, 50);
})();
//# sourceURL=com.ibi.geo.map.js