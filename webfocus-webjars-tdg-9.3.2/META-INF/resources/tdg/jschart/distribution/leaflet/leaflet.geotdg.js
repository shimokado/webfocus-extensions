/* eslint-disable */

if (typeof window !== 'undefined') {

L.GeoTDG = L.GeoJSON.extend({

	options : {
		type : null,
		useDestRects : false
	},

	_areaMaps : [],

	initialize : function (tdg, options) {
		L.Util.setOptions(this, options);
		L.GeoJSON.prototype.initialize.call(this, tdg, options);
	},

	addData : function (data) {
		data = this._tdg2json(data); // let _tdg2json at it first.
		L.GeoJSON.prototype.addData.call(this, data);
	},

	_tdg2json : function (tdgmap) {

		if (typeof tdgmap === "string")
			tdgmap = eval("( " + tdgmap + ")");
		if (tdgmap.type === "FeatureCollection" && tdgmap.features) // already geojson
			return tdgmap;
		if (tdgmap.type === "Feature")
			return tdgmap;
		if (tdgmap.fileformat == 2)
			return this._tdg2jsonV2(tdgmap);
		return this._tdg2jsonV1(tdgmap);
	},
	
	_tdg2jsonV1 : function (tdgmap) {
		var ibitdgmap = {
			"type" : "FeatureCollection",
			"features" : []
		};
		var idCounter = 0;
		//DEST TODO var useDestRects = this.options.useDestRects;
		for (var i = 0; i < tdgmap.regions.length; ++i) {
			var tdg = tdgmap.regions[i];
			var feature = {
				"type" : "Feature",
				"id" : "" + (idCounter++),
				"properties" : {},
				"geometry" : {
					"type" : "Polygon", // "MultiPolygon"
					"coordinates" : tdg.borders
				}
			};
			for (var key in tdg) {
				if (key === "borders")
					continue;
				if (key === "destRect")
					continue;
				if (tdg.hasOwnProperty(key))
					feature.properties[key] = tdg[key];
			}
			//DEST TODO  if(useDestRects && tdg.destRect){
			//DEST TODO    this._reMapGeometry(feature,tdg.destRect);
			//DEST TODO  }

			ibitdgmap.features.push(feature);
		}
		return ibitdgmap;
	},
	
	_tdg2jsonV2 : function (tdgmap) {
		var ibitdgmap = {
			"type" : "FeatureCollection",
			"features" : []
		};

		var layer = null;
		var whichLayerType = this.options.type;
		if (!whichLayerType)
			whichLayerType = tdgmap.primary_layer;
		if (!whichLayerType)
			whichLayerType = "regions";

		tdgmap.layers.forEach(function (l) {
			if (whichLayerType == l.type)
				layer = l;
		});

		var geoType = null;
		var geoSource = null;
		switch (layer.geometry_type) //"Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon", "GeometryCollection",
		{
		case "polygon":
			geoType = "Polygon";
			geoSource = "borders";
			break;
		case "point":
			geoType = "Point";
			geoSource = "position";
			break;
		}

		var features = layer.features;
		var idCounter = 0;
		features.forEach(function (f) {
			var feature = {
				"type" : "Feature",
				"id" : "" + (idCounter++),
				"properties" : {},
				"geometry" : {
					"type" : geoType,
					"coordinates" : f[geoSource]
				}
			};

			for (var key in f) {
				if (key == geoSource)
					continue;
				if (f.hasOwnProperty(key))
					feature.properties[key] = f[key];
			}

			if (feature.geometry.type === "Polygon") {
				var repaired = false;
				var newArray = [];
				var a = [feature.geometry.coordinates];
				for (var i = 0; i < a.length; ++i) {
					var b = a[i];
					newArray.push(b);
					for (var j = 0; j < b.length; ++j) {
						var c = b[j];
						if (c.length == 1) {
							c.push(c[0]);
							c.push(c[0]);
							repaired = true;
						}
					}
				}
				if (repaired) {
					feature.geometry.coordinates = newArray;
					feature.geometry.type = "MultiPolygon";
				}
			}

			ibitdgmap.features.push(feature);
		});
		return ibitdgmap;

	}
	
   	/*DEST TODO
	_getExtent : function (feature) {
		if (feature.geometry && feature.geometry.extent) {
			return feature.geometry.extent;
		}

		var a = null;
		if (feature.geometry.type === 'Polygon') {
			a = [feature.geometry.coordinates];
		} else if (feature.geometry.type === 'MultiPolygon') {
			a = feature.geometry.coordinates;
		} else if (feature.geometry.type === 'Point') {
			a = [[[feature.geometry.coordinates]]];
		} else if (feature.geometry.type === 'LineString') {
			a = [[feature.geometry.coordinates]];
		} else if (feature.geometry.type === 'MultiLineString') {
			a = [feature.geometry.coordinates];
		} else {
			throw Error("feature.geometry.type = " + feature.geometry.type );
		}
		if (!a) {
			feature.geometry.extent = null;
			return false;
		}
		var extent = null;
		for (var i = 0; i < a.length; ++i) {
			var b = a[i];
			for (var j = 0; j < b.length; ++j) {
				var c = b[j];
				for (var k = 0; k < c.length; ++k) {
					if (!extent) {
						var p1 = new L.Point(c[k][0],c[k][1]);
						extent = new L.Bounds(p1, p1);
					} else if (!extent.contains(c[k])) {
						extent.extend(c[k]);
					}
				}
			}
		}
		feature.geometry.extent = extent;
		return extent;
	},

	_reMapGeometry :function (feature,destRect)	{

		var bounds = this._getExtent(feature);
		var xfactor = Math.abs((destRect[0][0] - destRect[1][0]) / (bounds.max.x - bounds.min.x));
		var yfactor = Math.abs((destRect[0][1] - destRect[1][1]) / (bounds.max.y - bounds.min.y));

		var factor = {
			xfactor: xfactor,
			yfactor: yfactor,
			xOffset: destRect[1][0] - (xfactor * bounds.max.x),
			yOffset: destRect[1][1] - (yfactor * bounds.min.y),

			mapPoint : function (point)  {
				point[0] = (this.xfactor * point[0]) + this.xOffset;
				point[1] = (this.yfactor * point[1]) + this.yOffset;
				return point;
			}
		};

		this._areaMaps.push(factor);

		var a = null;
		if (feature.geometry.type === 'Polygon') {
			a = [feature.geometry.coordinates];
		} else if (feature.geometry.type === 'MultiPolygon') {
			a = feature.geometry.coordinates;
		} else if (feature.geometry.type === 'Point') {
			a = [[[feature.geometry.coordinates]]];
		} else if (feature.geometry.type === 'LineString') {
			a = [[feature.geometry.coordinates]];
		} else if (feature.geometry.type === 'MultiLineString') {
			a = [feature.geometry.coordinates];
		} else {
			throw Error("feature.geometry.type = " + feature.geometry.type);
		}

		if (!a) {
			throw Error("No geometry");
		}
		for (var i = 0; i < a.length; ++i) {
			var b = a[i];
			for (var j = 0; j < b.length; ++j) {
				var c = b[j];
				for (var k = 0; k < c.length; ++k) {
					c[k] = factor.mapPoint(c[k]);
				}
			}
		}
	}
	*/
});

L.geoTdg = function (tdg, options) {
	return new L.GeoTDG(tdg, options);
};

}