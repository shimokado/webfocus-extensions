/* Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved. */
/* $Revision: 1.4 $: */
(function() {
	tdgchart.prototype.gisGetEsriProxyPath = getEsriProxyPath;
	if(!tdgchart.prototype.gisGetEsriProxyUrlList)
		tdgchart.prototype.gisGetEsriProxyUrlList = gisGetEsriProxyUrlList;

	function getEsriProxyPath() {
			return {
				"proxyUrl" : "\/GisEsriProxy"
				};
	}
	function gisGetEsriProxyUrlList() {
		return [];
	}
}());