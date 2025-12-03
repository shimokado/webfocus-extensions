/*global L: false */

/* eslint-disable */
if (typeof window !== 'undefined') {

// Extend Leaflet's existing GeoJSON class to support CSV files
L.GeoCSV = L.GeoJSON.extend({

	options: {
		fieldNames: ['region', 'lng', 'lat'],
		fieldSep: ',',
		lineSep: '\n',
		firstRowIsTitles: false,
		removeSurroundingQuotes: true
	},

	initialize: function(data, options) {
		L.Util.setOptions(this, options);
		L.GeoJSON.prototype.initialize.call(this, data, options);
	},

	addData: function(data) {
		if (typeof data === 'string') {

			var options = this.options;
			var features = [];
			
			if (options.firstRowIsTitles) {
				options.fieldNames = data.slice(0, data.indexOf(options.lineSep))
						.split(options.fieldSep)
						.map(function(el){return (el || "").trim();});
				data = data.slice(data.indexOf(options.lineSep) + 1);
			}

			var cleanData;
			if (!this.options.removeSurroundingQuotes) {
				cleanData = function (txt) {
					return txt.trim();
				};
			} else {
				cleanData = function (txt) {
					return txt.trim().replace(/^"/,"").replace(/"$/,""); 
				};
			}
			data.split(options.lineSep).forEach(function(el) {
				var items = el.split(options.fieldSep);
				if (items.length < 2) {
					return;
				}
				var f = {
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'Point',
						coordinates: [
							parseFloat(cleanData(items[options.fieldNames.indexOf('lng')])),
							parseFloat(cleanData(items[options.fieldNames.indexOf('lat')]))
						]
					}
				};
				options.fieldNames.forEach(function(el, idx) {
					if (el !== 'lat' && el !== 'lng') {
						f.properties[el] = cleanData(items[idx]);
					}
				});
				features.push(f);
				return;
			});

			data = {
				"type" : "FeatureCollection",
				"features" : features
			};
		}
		L.GeoJSON.prototype.addData.call(this, data);
	}
});

// Leaflet extension boilerplate
L.geoCsv = function (csv, options) {
	return new L.GeoCSV(csv, options);
};

}