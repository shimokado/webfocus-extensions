/*Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved.*/
var mlChart = null,isIEvar=null, NUM_SEGS=1, flow_Layer=null, flow_Source=null, defaultRouteLayerId="ibi_defaultRouteLayer", 
			defaultGraphicsLayerId="ibi_defaultGraphicsLayerId", discoverRoutesLayerId="ibi_discoverRoutesLayerId", bIsMobileDevice=null;
require([
    "esri/Map","esri/config", "esri/request",
    "esri/views/MapView", "esri/portal/Portal", "esri/views/SceneView", "esri/WebScene", "esri/WebMap",  "esri/Basemap", "esri/Viewpoint",
    "esri/widgets/BasemapGallery", "esri/widgets/BasemapGallery/support/PortalBasemapsSource", "esri/widgets/Bookmarks", "esri/widgets/TimeSlider", "esri/webmap/Bookmark","esri/widgets/Expand",
    "esri/widgets/Legend", "esri/widgets/LayerList", "esri/layers/FeatureLayer", "esri/layers/SceneLayer", "esri/layers/WCSLayer", "esri/layers/MediaLayer", "esri/layers/KMLLayer", "esri/layers/support/KMLSublayer",
    "esri/layers/GraphicsLayer", "esri/layers/MapImageLayer", "esri/layers/VectorTileLayer", "esri/layers/TileLayer", "esri/layers/StreamLayer", "esri/layers/Layer",
	"esri/layers/ImageryLayer","esri/layers/ImageryTileLayer",  "esri/layers/ElevationLayer", "esri/layers/GroupLayer",  "esri/layers/CSVLayer", "esri/layers/RouteLayer","esri/views/2d/layers/BaseLayerViewGL2D",
    "esri/Graphic", "esri/Camera", "esri/geometry/Point", "esri/geometry/Polyline", "esri/geometry/Polygon", "esri/geometry/Extent", "esri/geometry/Circle",
    "esri/geometry/support/webMercatorUtils", "esri/geometry/support/normalizeUtils", "esri/geometry/projection", "esri/layers/support/VideoElement", "esri/layers/support/ImageElement",
    "esri/layers/support/ExtentAndRotationGeoreference", "esri/geometry/SpatialReference", "esri/geometry/support/jsonUtils", "esri/renderers/Renderer", "esri/renderers/ClassBreaksRenderer",
    "esri/renderers/SimpleRenderer", "esri/renderers/UniqueValueRenderer",  "esri/renderers/FlowRenderer", "esri/renderers/HeatmapRenderer",  
    "esri/smartMapping/renderers/heatmap", "esri/smartMapping/symbology/heatmap", "esri/smartMapping/statistics/heatmapStatistics", "esri/smartMapping/symbology/color", 
    "esri/symbols/SimpleMarkerSymbol","esri/symbols/TextSymbol", "esri/symbols/CIMSymbol", "esri/Color", "esri/rest/support/Query", "esri/layers/support/FeatureReductionBinning",
    "esri/layers/support/Field", "esri/layers/support/AggregateField", "esri/views/draw/Draw", "esri/views/draw/SegmentDrawAction", "esri/layers/support/FeatureEffect", "esri/layers/support/FeatureFilter",	
    "esri/geometry/geometryEngine", "esri/rest/geometryService","esri/widgets/Search", "esri/widgets/Weather", "esri/widgets/Daylight", "esri/widgets/Widget",
	"esri/widgets/Measurement","esri/widgets/Directions","esri/widgets/Sketch","esri/widgets/Popup","esri/widgets/support/TimePicker",
    "esri/widgets/Sketch/SketchViewModel","esri/rest/networkService", "esri/rest/geoprocessor", "esri/rest/locator","esri/smartMapping/statistics/uniqueValues",
    "esri/widgets/ScaleBar", "esri/widgets/ScaleRangeSlider", "esri/widgets/NavigationToggle","esri/widgets/Compass","esri/widgets/Locate","esri/widgets/CoordinateConversion",
	"esri/renderers/RasterStretchRenderer","esri/widgets/Slider", "esri/rest/support/AlgorithmicColorRamp","esri/rest/support/MultipartColorRamp", "esri/rest/support/ProjectParameters",
    "esri/portal/PortalItem",'esri/views/3d/externalRenderers', "esri/core/urlUtils","esri/core/reactiveUtils", "esri/identity/OAuthInfo", "esri/identity/IdentityManager",
	"esri/rest/serviceArea",  "esri/rest/support/ServiceAreaParameters", "esri/rest/support/FeatureSet", "esri/rest/support/LinearUnit",	"esri/intl", "esri/layers/support/LabelClass",
], function (
    Map,esriConfig,esriRequest, MapView, Portal,
    SceneView, WebScene, WebMap, Basemap, Viewpoint,
    BasemapGallery, PortalBasemapsSource, Bookmarks, TimeSlider, Bookmark, Expand, Legend, LayerList,
    FeatureLayer, SceneLayer, WCSLayer, MediaLayer, KMLLayer, KMLSublayer, GraphicsLayer, MapImageLayer,
    VectorTileLayer,TileLayer,StreamLayer,Layer, ImageryLayer,ImageryTileLayer, ElevationLayer,
	GroupLayer, CSVLayer, RouteLayer, BaseLayerViewGL2D, Graphic,Camera,
    Point, Polyline, Polygon, Extent, Circle,// Layer_1,
    webMercatorUtils, normalizeUtils, projection, VideoElement, ImageElement, ExtentAndRotationGeoreference, SpatialReference, jsonUtils,
    Renderer, ClassBreaksRenderer, SimpleRenderer, UniqueValueRenderer, FlowRenderer, HeatmapRenderer,
	heatmapRendererCreator, heatmapSchemes, heatmapStatistics, colorSchemes,
    SimpleMarkerSymbol, TextSymbol,CIMSymbol, Color, Query, FeatureReductionBinning, Field, AggregateField, Draw, SegmentDrawAction, FeatureEffect, FeatureFilter,
    geometryEngine, GeometryService,  Search, Weather, Daylight, Widget,Measurement,Directions,Sketch,Popup,TimePicker,
    SketchViewModel, networkService, geoprocessor, locator, uniqueValues, ScaleBar, ScaleRangeSlider, NavigationToggle, Compass, Locate,
	CoordinateConversion, RasterStretchRenderer, Slider, AlgorithmicColorRamp, MultipartColorRamp,
	ProjectParameters, PortalItem,ExternalRenderers,urlUtils,reactiveUtils,OAuthInfo, esriId, serviceArea, ServiceAreaParams, FeatureSet, LinearUnit, intl, LabelClass,
) {
    var GeoStats = function (s) {
        var self = this;
        self.serie = s;
        self.objectId = '';
        self.separator = ' - ';
        self.legendSeparator = this.separator;
        self.method = '';
        self.precision = 0;
        self.precisionflag = 'auto';
        self.roundlength = 2; // Number of decimals; round values
        self.is_uniqueValues = false;
        self.debug = false;
        self.bounds = [];
        self.ranges = [];
        self.inner_ranges = null;
        self.colors = [];
        self.counter = [];
        // statistics information
        self.stat_sorted = null;
        self.stat_mean = null;
        self.stat_median = null;
        self.stat_sum = null;
        self.stat_max = null;
        self.stat_min = null;
        self.stat_pop = null;
        self.stat_variance = null;
        self.stat_stddev = null;
        self.stat_cov = null;
    };
    GeoStats.prototype = {
        isInt: function (n) {
            return typeof n === 'number' && parseFloat(n) === parseInt(n, 10) && !isNaN(n);
        },

        _t: function (str) {
            return str;
        },

        isNumber: function (n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },

        Log: function (msg) {
            if (this.debug)
                console.log(this.objectID + "(object id) :: " + msg);
        },

        setBounds: function (a) {
            this.Log('Setting bounds (' + a.length + ') : ' + a.join());
            this.bounds = []; // init empty array to prevent bug when calling classification after another with less items (sample getQuantile(6) and getQuantile(4))
            this.bounds = a;
            //this.bounds = this.decimalFormat(a);
        },

        setSerie: function (a) {
            this.log('Setting serie (' + a.length + ') : ' + a.join());
            this.serie = []; // init empty array to prevent bug when calling classification after another with less items (sample getQuantile(6) and getQuantile(4))
            this.serie = a;
            this.setPrecision();
        },

        setColors: function (colors) {
            this.log('Setting color ramp (' + colors.length + ') : ' + colors.join());
            this.colors = colors;
        },

        doCount: function () {
            if (this._nodata())
                return;
            var tmp = this.sorted();
            this.counter = [];
            // we init counter with 0 value
            for (i = 0; i < this.bounds.length - 1; i++) {
                this.counter[i] = 0;
            }
            for (j = 0; j < tmp.length; j++) {
                // get current class for value to increment the counter
                var cclass = this.getClass(tmp[j]);
                this.counter[cclass]++;
            }

        },


        setPrecision: function (decimals) {
            // only when called from user
            if (typeof decimals !== "undefined") {
                this.precisionflag = 'manual';
                this.precision = decimals;
            }
            // we calculate the maximal decimal length on given serie
            if (this.precisionflag === 'auto') {
                var precision;
                for (var i = 0; i < this.serie.length; i++) {
                    // check if the given value is a number and a float
                    if (!isNaN((this.serie[i] + "")) && (this.serie[i] + "").toString().indexOf('.') !== -1) {
                        precision = (this.serie[i] + "").split(".")[1].length;
                    } else {
                        precision = 0;
                    }
                    if (precision > this.precision) {
                        this.precision = precision;
                    }
                }
            }
            this.log('Calling setPrecision(). Mode : ' + this.precisionflag + ' - Decimals : ' + this.precision);
            this.serie = this.decimalFormat(this.serie);
        },

        decimalFormat: function (a) {
            var b = [];
            for (var i = 0; i < a.length; i++) {
                // check if the given value is a number
                if (this.isNumber(a[i])) {
                    b[i] = parseFloat(a[i].toFixed(this.precision));
                } else {
                    b[i] = a[i];
                }
            }
            return b;
        },

        setRanges: function () {
            this.ranges = []; // init empty array to prevent bug when calling classification after another with less items (sample getQuantile(6) and getQuantile(4))
            for (i = 0; i < (this.bounds.length - 1); i++) {
                this.ranges[i] = this.bounds[i] + this.separator + this.bounds[i + 1];
            }
        },

        min: function () {
            if (this._nodata())
                return;
            this.stat_min = Math.min.apply(null, this.serie);
            return this.stat_min;
        },

        max: function () {
            this.stat_max = Math.max.apply(null, this.serie);
            return this.stat_max;
        },

        sum: function () {

            if (this._nodata())
                return;

            if (this.stat_sum == null) {

                this.stat_sum = 0;
                for (i = 0; i < this.pop(); i++) {
                    this.stat_sum += parseFloat(this.serie[i]);
                }

            }

            return this.stat_sum;
        },

        pop: function () {
            if (this._nodata())
                return;
            if (this.stat_pop == null) {
                this.stat_pop = this.serie.length;
            }
            return this.stat_pop;
        },

        mean: function () {
            if (this._nodata())
                return;
            if (!this.stat_mean) {
                this.stat_mean = parseFloat(this.sum() / this.pop());

            }

            return this.stat_mean;
        },

        median: function () {

            if (this._nodata())
                return;

            if (!this.stat_median) {

                this.stat_median = 0;
                var tmp = this.sorted();

                // serie pop is odd
                if (tmp.length % 2) {
                    this.stat_median = parseFloat(tmp[(Math.ceil(tmp.length / 2) - 1)]);

                    // serie pop is even
                } else {
                    this.stat_median = (parseFloat(tmp[((tmp.length / 2) - 1)]) + parseFloat(tmp[(tmp.length / 2)])) / 2;
                }

            }

            return this.stat_median;
        },

        variance: function () {

            var round = (typeof round === "undefined");

            if (this._nodata())
                return;

            if (this.stat_variance == null) {
                var tmp = 0;
                for (var i = 0; i < this.pop(); i++) {
                    tmp += Math.pow((this.serie[i] - this.mean()), 2);
                }
                this.stat_variance = tmp / this.pop();
                if (round) {
                    this.stat_variance = Math.round(this.stat_variance * Math.pow(10, this.roundlength)) / Math.pow(10, this.roundlength);
                }
            }

            return this.stat_variance;
        },

        stddev: function (round) {

            round = (typeof round === "undefined");

            if (this._nodata())
                return;

            if (this.stat_stddev == null) {
                this.stat_stddev = Math.sqrt(this.variance());
                if (round) {
                    this.stat_stddev = Math.round(this.stat_stddev * Math.pow(10, this.roundlength)) / Math.pow(10, this.roundlength);
                }
            }
            return this.stat_stddev;
        },

        cov: function (round) {
            round = (typeof round === "undefined");

            if (this._nodata())
                return;

            if (this.stat_cov == null) {
                this.stat_cov = this.stddev() / this.mean();
                if (round) {
                    this.stat_cov = Math.round(this.stat_cov * Math.pow(10, this.roundlength)) / Math.pow(10, this.roundlength);
                }
            }
            return this.stat_cov;
        },

        _nodata: function () {
            if (this.serie.length === 0) {
                alert("Error. You should first enter a serie!");
                return 1;
            } else
                return 0;
        },

        _hasNegativeValue: function () {
            for (i = 0; i < this.serie.length; i++) {
                if (this.serie[i] < 0)
                    return true;
            }
            return false;
        },

        _hasZeroValue: function () {
            for (i = 0; i < this.serie.length; i++) {
                if (parseFloat(this.serie[i]) === 0)
                    return true;
            }
            return false;
        },

        sorted: function () {
            if (this.stat_sorted == null) {
                if (!this.is_uniqueValues) {
                    this.stat_sorted = this.serie.sort(function (a, b) {
                        return a - b;
                    });
                } else {
                    this.stat_sorted = this.serie.sort(function (a, b) {
                        var nameA = a.toString().toLowerCase(), nameB = b.toString().toLowerCase();
                        if (nameA < nameB) return -1;
                        if (nameA > nameB) return 1;
                        return 0;
                    });
                }
            }
            return this.stat_sorted;
        },

        info: function () {
            if (this._nodata())
                return;

            var content = '';
            content += this._t('Population') + ' : ' + this.pop() + ' - [' + this._t('Min') +
                ' : ' + this.min() + ' | ' + this._t('Max') + ' : ' + this.max() +
                ']' + "\n";
            content += this._t('Mean') + ' : ' + this.mean() + ' - ' + this._t('Median') + ' : ' + this.median() + "\n";
            content += this._t('Variance') + ' : ' + this.variance() + ' - ' + this._t('Standard deviation') + ' : ' + this.stddev() +
                ' - ' + this._t('Coefficient of variation') + ' : ' + this.cov() + "\n";
            return content;
        },

        /**
         * Set Manual classification Return an array with bounds : ie array(0,
         * 0.75, 1.5, 2.25, 3);
         * Set ranges and prepare data for displaying legend
         *
         */
        setClassManually: function (array) {
            if (this._nodata())
                return;

            if (array[0] !== this.min() || array[array.length - 1] !== this.max()) {
                alert(this._t('Given bounds may not be correct! please check your input.\nMin value : ' + this.min() + ' / Max value : ' + this.max()));
                return;
            }

            this.setBounds(array);
            this.setRanges();

            // we specify the classification method
            this.method = this._t('manual classification') + ' (' + (array.length - 1) + ' ' + this._t('classes') + ')';
            return this.bounds;
        },

        /**
         * Equal intervals classification Return an array with bounds : ie array(0,
         * 0.75, 1.5, 2.25, 3);
         */
        getClassEqInterval: function (nbClass) {
            if (this._nodata())
                return;

            var tmpMax = this.max();
            var a = [];
            var val = this.min();
            var interval = (tmpMax - this.min()) / nbClass;

            for (i = 0; i <= nbClass; i++) {
                a[i] = val;
                val += interval;
            }

            //-> Fix last bound to Max of values
            a[nbClass] = tmpMax;

            this.setBounds(a);
            this.setRanges();

            // we specify the classification method
            this.method = this._t('eq. intervals') + ' (' + nbClass + ' ' + this._t('classes') + ')';

            return this.bounds;
        },

        getQuantiles: function (nbClass) {
            var tmp = this.sorted();
            var quantiles = [];

            var step = this.pop() / nbClass;
            for (var i = 1; i < nbClass; i++) {
                var qidx = Math.round(i * step + 0.49);
                quantiles.push(tmp[qidx - 1]); // zero-based
            }
            return quantiles;
        },

        /**
         * Quantile classification Return an array with bounds : ie array(0, 0.75,
         * 1.5, 2.25, 3);
         */
        getClassQuantile: function (nbClass) {

            if (this._nodata())
                return;

            var tmp = this.sorted();
            var bounds = this.getQuantiles(nbClass);
            bounds.unshift(tmp[0]);

            if (bounds[tmp.length - 1] !== tmp[tmp.length - 1])
                bounds.push(tmp[tmp.length - 1]);

            this.setBounds(bounds);
            this.setRanges();
            // we specify the classification method
            this.method = this._t('quantile') + ' (' + nbClass + ' ' + this._t('classes') + ')';
            return this.bounds;
        },
        /**
         * Standard Deviation classification
         * Return an array with bounds : ie array(0,
         * 0.75, 1.5, 2.25, 3);
         */
        getClassStdDeviation: function (nbClass) {
            if (this._nodata())
                return;

            //   var tmpMax = this.max();
            //  var tmpMin = this.min();
            var a = [];
            // number of classes is odd
            if (nbClass % 2 === 1) {

                // Euclidean division to get the inferior bound
                var infBound = Math.floor(nbClass / 2);

                var supBound = infBound + 1;
                // we set the central bounds
                a[infBound] = this.mean() - (this.stddev() / 2);
                a[supBound] = this.mean() + (this.stddev() / 2);
                // Values < to infBound, except first one
                for (var i = infBound - 1; i > 0; i--) {
                    var val = a[i + 1] - this.stddev();
                    a[i] = val;
                }
                // Values > to supBound, except last one
                for (i = supBound + 1; i < nbClass; i++) {
                    var val = a[i - 1] + this.stddev();
                    a[i] = val;
                }
                // number of classes is even
            } else {
                var meanBound = nbClass / 2;
                // we get the mean value
                a[meanBound] = this.mean();

                // Values < to the mean, except first one
                for (i = meanBound - 1; i > 0; i--) {
                    var val = a[i + 1] - this.stddev();
                    a[i] = val;
                }

                // Values > to the mean, except last one
                for (i = meanBound + 1; i < nbClass; i++) {
                    var val = a[i - 1] + this.stddev();
                    a[i] = val;
                }
            }

            // we finally set the first value
            a[0] = this.min();

            // we finally set the last value
            a[nbClass] = this.max();

            this.setBounds(a);
            this.setRanges();
            // we specify the classification method
            this.method = this._t('std deviation') + ' (' + nbClass + ' ' + this._t('classes') + ')';
            return this.bounds;
        },

        /**
         * Geometric Progression classification
         * http://en.wikipedia.org/wiki/Geometric_progression
         * Return an array with bounds : ie array(0,
         * 0.75, 1.5, 2.25, 3);
         */
        getClassGeometricProgression: function (nbClass) {

            if (this._nodata())
                return;

            if (this._hasNegativeValue() || this._hasZeroValue()) {
                alert(this._t('geometric progression can\'t be applied with a serie containing negative or zero values.'));
                return;
            }

            var a = [];
            var tmpMin = this.min();
            var tmpMax = this.max();

            var logMax = Math.log(tmpMax) / Math.LN10; // max decimal logarithm (or base 10)
            var logMin = Math.log(tmpMin) / Math.LN10; // min decimal logarithm (or base 10)

            var interval = (logMax - logMin) / nbClass;

            // we compute log bounds
            for (i = 0; i < nbClass; i++) {
                if (i === 0) {
                    a[i] = logMin;
                } else {
                    a[i] = a[i - 1] + interval;
                }
            }

            // we compute antilog
            a = a.map(function (x) { return Math.pow(10, x); });

            // and we finally add max value
            a.push(this.max());

            this.setBounds(a);
            this.setRanges();
            // we specify the classification method
            this.method = this._t('geometric progression') + ' (' + nbClass + ' ' + this._t('classes') + ')';
            return this.bounds;
        },

        /**
         * Arithmetic Progression classification
         * http://en.wikipedia.org/wiki/Arithmetic_progression
         * Return an array with bounds : ie array(0,
         * 0.75, 1.5, 2.25, 3);
         */
        getClassArithmeticProgression: function (nbClass) {

            if (this._nodata())
                return;

            var denominator = 0;
            // we compute the (french) "Raison"
            for (i = 1; i <= nbClass; i++) {
                denominator += i;
            }

            var a = [];
            var tmpMin = this.min();
            var tmpMax = this.max();

            var interval = (tmpMax - tmpMin) / denominator;

            for (i = 0; i <= nbClass; i++) {
                if (i === 0) {
                    a[i] = tmpMin;
                } else {
                    a[i] = a[i - 1] + (i * interval);
                }
            }

            this.setBounds(a);
            this.setRanges();

            // we specify the classification method
            this.method = this._t('arithmetic progression') + ' (' + nbClass + ' ' + this._t('classes') + ')';

            return this.bounds;
        },

        /**
         * Credits : Doug Curl (javascript) and Daniel J Lewis (python implementation)
         * http://www.arcgis.com/home/item.html?id=0b633ff2f40d412995b8be377211c47b
         * http://danieljlewis.org/2010/06/07/jenks-natural-breaks-algorithm-in-python/
         */
        getClassJenks: function (nbClass) {

            if (this._nodata())
                return;

            dataList = this.sorted();

            // now iterate through the datalist:
            // determine mat1 and mat2
            // really not sure how these 2 different arrays are set - the code for
            // each seems the same!
            // but the effect are 2 different arrays: mat1 and mat2
            var mat1 = [];
            for (var x = 0, xl = dataList.length + 1; x < xl; x++) {
                var temp = [];
                for (var j = 0, jl = nbClass + 1; j < jl; j++) {
                    temp.push(0);
                }
                mat1.push(temp);
            }

            var mat2 = [];
            for (var i = 0, il = dataList.length + 1; i < il; i++) {
                var temp2 = [];
                for (var c = 0, cl = nbClass + 1; c < cl; c++) {
                    temp2.push(0);
                }
                mat2.push(temp2);
            }

            // absolutely no idea what this does - best I can tell, it sets the 1st
            // group in the
            // mat1 and mat2 arrays to 1 and 0 respectively
            for (var y = 1, yl = nbClass + 1; y < yl; y++) {
                mat1[0][y] = 1;
                mat2[0][y] = 0;
                for (var t = 1, tl = dataList.length + 1; t < tl; t++) {
                    mat2[t][y] = Infinity;
                }
                var v = 0.0;
            }

            // and this part - I'm a little clueless on - but it works
            // pretty sure it iterates across the entire dataset and compares each
            // value to
            // one another to and adjust the indices until you meet the rules:
            // minimum deviation
            // within a class and maximum separation between classes
            for (var l = 2, ll = dataList.length + 1; l < ll; l++) {
                var s1 = 0.0;
                var s2 = 0.0;
                var w = 0.0;
                for (var m = 1, ml = l + 1; m < ml; m++) {
                    var i3 = l - m + 1;
                    var val = parseFloat(dataList[i3 - 1]);
                    s2 += val * val;
                    s1 += val;
                    w += 1;
                    v = s2 - (s1 * s1) / w;
                    var i4 = i3 - 1;
                    if (i4 !== 0) {
                        for (var p = 2, pl = nbClass + 1; p < pl; p++) {
                            if (mat2[l][p] >= (v + mat2[i4][p - 1])) {
                                mat1[l][p] = i3;
                                mat2[l][p] = v + mat2[i4][p - 1];
                            }
                        }
                    }
                }
                mat1[l][1] = 1;
                mat2[l][1] = v;
            }

            var k = dataList.length;
            var kclass = [];

            // fill the kclass (classification) array with zeros:
            for (i = 0, il = nbClass + 1; i < il; i++) {
                kclass.push(0);
            }

            // this is the last number in the array:
            kclass[nbClass] = parseFloat(dataList[dataList.length - 1]);
            // this is the first number - can set to zero, but want to set to lowest
            // to use for legend:
            kclass[0] = parseFloat(dataList[0]);
            var countNum = nbClass;
            while (countNum >= 2) {
                var id = parseInt((mat1[k][countNum]) - 2, 10);
                kclass[countNum - 1] = dataList[id];
                k = parseInt((mat1[k][countNum] - 1), 10);
                // spits out the rank and value of the break values:
                // console.log("id="+id,"rank = " + String(mat1[k][countNum]),"val =
                // " + String(dataList[id]))
                // count down:
                countNum -= 1;
            }
            // check to see if the 0 and 1 in the array are the same - if so, set 0
            // to 0:
            if (kclass[0] === kclass[1]) {
                kclass[0] = 0;
            }

            this.setBounds(kclass);
            this.setRanges();


            this.method = this._t('Jenks') + ' (' + nbClass + ' ' + this._t('classes') + ')';

            return this.bounds; //array of breaks
        },

        /**
         * Quantile classification Return an array with bounds : ie array(0, 0.75,
         * 1.5, 2.25, 3);
         */
        getClassUniqueValues: function () {

            if (this._nodata())
                return;

            this.is_uniqueValues = true;

            var tmp = this.sorted(); // display in alphabetical order

            var a = [];

            for (var i = 0; i < this.pop(); i++) {
                if (a.indexOf(tmp[i]) === -1)
                    a.push(tmp[i]);
            }

            this.bounds = a;

            // we specify the classification method
            this.method = this._t('unique values');

            return a;

        },

        /**
         * Return the class of a given value.
         * For example value : 6
         * and bounds array = (0, 4, 8, 12);
         * Return 2
         */
        getClass: function (value) {

            for (var i = 0; i < this.bounds.length; i++) {


                if (this.is_uniqueValues) {
                    if (value === this.bounds[i])
                        return i;
                } else {
                    // parseFloat() is necessary
                    if (parseFloat(value) <= this.bounds[i + 1]) {
                        return i;
                    }
                }
            }

            return this._t("Unable to get value's class.");

        },

        /**
         * Return the ranges array : array('0-0.75', '0.75-1.5', '1.5-2.25',
         * '2.25-3');
         */
        getRanges: function () {
            return this.ranges;
        },

        /**
         * Returns the number/index of this.ranges that value falls into
         */
        getRangeNum: function (value) {
            var bounds, i;
            for (i = 0; i < this.ranges.length; i++) {
                bounds = this.ranges[i].split(/ - /);
                if (value <= parseFloat(bounds[1])) {
                    return i;
                }
            }
        },

        /*
         * Compute inner ranges based on serie.
         * Produce discontinous ranges used for legend - return an array similar to :
         * array('0.00-0.74', '0.98-1.52', '1.78-2.25', '2.99-3.14');
         * If inner ranges already computed, return array values.
         */
        getInnerRanges: function () {

            // if already computed, we return the result
            if (this.inner_ranges != null)
                return this.inner_ranges;


            var a = [];
            var tmp = this.sorted();

            var cnt = 1; // bounds array counter
            var range_firstvalue;
            for (var i = 0; i < tmp.length; i++) {

                if (i === 0) {
                    range_firstvalue = tmp[i]; // we init first range value
                }

                if (parseFloat(tmp[i]) > parseFloat(this.bounds[cnt])) {
                    a[cnt - 1] = '' + range_firstvalue + this.separator + tmp[i - 1];
                    range_firstvalue = tmp[i];
                    cnt++;

                }

                // we reach the last range, we finally complete manually
                // and return the array
                if (cnt === (this.bounds.length - 1)) {
                    // we set the last value
                    a[cnt - 1] = '' + range_firstvalue + this.separator + tmp[tmp.length - 1];

                    this.inner_ranges = a;
                    return this.inner_ranges;
                }


            }

        },

        getSortedlist: function () {

            return this.sorted().join(', ');

        },

        /**
         * Return an html legend
         * colors : specify an array of color (hexadecimal values)
         * legend :  specify a text input for the legend. By default, just displays 'legend'
         * counter : if not null, display counter value
         * callback : if not null, callback function applied on legend boundaries
         * mode : 	null, 'default', 'distinct', 'discontinuous' :
         * 			- if mode is null, will display legend as 'default mode'
         * 			- 'default' : displays ranges like in ranges array (continuous values), sample :  29.26 - 378.80 / 378.80 - 2762.25 /  2762.25 - 6884.84
         * 			- 'distinct' : Add + 1 according to decimal precision to distinguish classes (discrete values), sample :  29.26 - 378.80 / 378.81 - 2762.25 /  2762.26 - 6884.84
         * 			- 'discontinuous' : indicates the range of data actually falling in each class , sample :  29.26 - 225.43 / 852.12 - 2762.20 /  3001.25 - 6884.84 / not implemented yet
         */
        getHtmlLegend: function (colors, legend, counter, callback, mode) {

            var cnt = '';

            this.doCount(); // we do count, even if not displayed

            if (colors != null) {
                ccolors = colors;
            }
            else {
                ccolors = this.colors;
            }

            if (legend != null) {
                lg = legend;
            }
            else {
                lg = 'Legend';
            }

            if (counter) {
                getcounter = true;
            }
            else {
                getcounter = false;
            }

            if (callback != null) {
                fn = callback;
            }
            else {
                fn = function (o) { return o; };
            }
            if (mode == null) {
                mode = 'default';
            }
            if (mode === 'discontinuous') {
                this.getInnerRanges();
                // check if some classes are not populated / equivalent of in_array function
                if (this.counter.indexOf(0) !== -1) {
                    alert(this._t("Geostats cannot apply 'discontinuous' mode to the getHtmlLegend() method because some classes are not populated.\nPlease switch to 'default' or 'distinct' modes. Exit!"));
                    return;
                }

            }


            if (ccolors.length < this.ranges.length) {
                alert(this._t('The number of colors should fit the number of ranges. Exit!'));
                return;
            }

            var content = '<div class="geostats-legend"><div class="geostats-legend-title">' + this._t(lg) + '</div>';

            if (!this.is_uniqueValues) {

                for (var i = 0; i < (this.ranges.length); i++) {
                    if (getcounter === true) {
                        cnt = ' <span class="geostats-legend-counter">(' + this.counter[i] + ')</span>';
                    }
                    //console.log("Ranges : " + this.ranges[i]);

                    // default mode
                    var tmp = this.ranges[i].split(this.separator);

                    var start_value = parseFloat(tmp[0]).toFixed(this.precision);
                    var end_value = parseFloat(tmp[1]).toFixed(this.precision);


                    // if mode == 'distinct' and we are not working on the first value
                    if (mode === 'distinct' && i !== 0) {

                        if (this.isInt(start_value)) {
                            start_value = parseInt(start_value, 10) + 1;
                        } else {

                            start_value = parseFloat(start_value) + (1 / Math.pow(10, this.precision));
                            // strangely the formula above return sometimes long decimal values,
                            // the following instruction fix it
                            start_value = parseFloat(start_value).toFixed(this.precision);
                        }
                    }

                    // if mode == 'discontinuous'
                    if (mode === 'discontinuous') {

                        var tmp = this.inner_ranges[i].split(this.separator);
                        // console.log("Ranges : " + this.inner_ranges[i]);

                        var start_value = parseFloat(tmp[0]).toFixed(this.precision);
                        var end_value = parseFloat(tmp[1]).toFixed(this.precision);

                    }

                    // we apply callback function
                    var el = fn(start_value) + this.legendSeparator + fn(end_value);


                    content += '<div><div class="geostats-legend-block" style="background-color:' + ccolors[i] + '"></div> ' + el + cnt + '</div>';
                }

            } else {

                // only if classification is done on unique values
                for (i = 0; i < (this.bounds.length); i++) {
                    if (getcounter === true) {
                        cnt = ' <span class="geostats-legend-counter">(' + this.counter[i] + ')</span>';
                    }
                    var el = fn(this.bounds[i]);
                    content += '<div><div class="geostats-legend-block" style="background-color:' + ccolors[i] + '"></div> ' + el + cnt + '</div>';
                }

            }

            content += '</div>';

            return content;
        },
    };
    var U = {

        _sqlEscape: function (s) {
            return s.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function (s) {
                switch (s) {
                    case "\0":
                        return "\\0";
                    case "\n":
                        return "\\n";
                    case "\r":
                        return "\\r";
                    case "\b":
                        return "\\b";
                    case "\t":
                        return "\\t";
                    case "\x1a":
                        return "\\Z";
                    case "'":
                        return "''";
                    case "\"":
                    case "\\":
                    case "%":
                    default:
                        return "\\" + s;
                }
            });
            //   return s;
        },

        _trimString: function (str) {
            return str.replace(/^\s+|\s+$/g, "");
        },

        _generateUid: function (separator) {
            var delim = separator || "-";
            function S4() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }
            return (S4() + S4() + delim + S4() + delim + S4() + delim + S4() + delim + S4() + S4() + S4());
        },

        _getSeries: function (data) {
            var output = {}, item;
            // iterate the outer array to look at each item in that array
            for (var i = 0; i < data.length; i++) {
                item = data[i];
                // iterate each key on the object
                for (var prop in item) {
                    if (item.hasOwnProperty(prop)) {
                        // if this keys doesn't exist in the output object, add it
                        if (!(prop in output)) {
                            output[prop] = [];
                        }
                        // add data onto the end of the key's array
                        output[prop].push(item[prop]);
                    }
                }
            }
            return output;
        },

        _toTitleCase: function (str) {
            return str.replace(
                /\w\S*/g,
                function (txt) {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                }
            );
        },

        _esriUnits: ['esriMeters', 'esriKilometers', 'esriInches', 'esriFeet', 'esriYards', 'esriMiles', 'esriNauticalMiles', 'esriMillimeters', 'esriCentimeters', 'esriDecimeters'],

        _parseFex: function (fex) {
            var fexResponse = {};
            var metaKeyValue = {};
            var nameType = {};
            var fexRawMeta = fex.getElementsByTagName('column_desc');
            var fexRawMetaContent = fexRawMeta[0].getElementsByTagName('col');
            var fcFields = [];
            function getType(type) {
                var types = {
                    'char': function () {
                        return 'esriFieldTypeString';
                    },
                    'float': function () {
                        return 'esriFieldTypeDouble';
                    },
                    'integer': function () {
                        return 'esriFieldTypeInteger';
                    },
                    'date': function () {
                        return 'esriFieldTypeString';
                    }
                };
                if (typeof types[type] !== 'function') {
                    throw new Error('invalid data type');
                } else {
                    return types[type]();
                }
            }
            for (var i = 0; i < fexRawMetaContent.length; i += 1) {
                var fcField = {};
                fcField.name = fexRawMetaContent[i].getAttribute('fieldname');
                fcField.alias = fexRawMetaContent[i].getAttribute('title') ? fexRawMetaContent[i].getAttribute('title') : fexRawMetaContent[i].getAttribute('fieldname');
                fcField.type = getType(fexRawMetaContent[i].getAttribute('datatype'));
                if (fcField.type === 'esriFieldTypeString') {
                    fcField.customFormat = "FormatType_Text";
                } else if (fcField.type === 'esriFieldTypeDouble') {
                    fcField.customFormat = "FormatType_Decimal";
                }
                fcFields.push(fcField);
                metaKeyValue[fexRawMetaContent[i].getAttribute('colnum')] = fexRawMetaContent[i].getAttribute('fieldname');
                nameType[fexRawMetaContent[i].getAttribute('fieldname')] = fexRawMetaContent[i].getAttribute('datatype');
            }
            var objectID = {
                "alias": "_FID",
                "name": "_FID",
                "type": "oid"
            };
            fcFields.push(objectID);

            //Parsing Data
            var records = [];
            var fexRawData = fex.getElementsByTagName('table');
            var fexRawRecords = fexRawData[0].getElementsByTagName('tr');
            var badData = [];
            for (var j = 0; j < fexRawRecords.length; j += 1) {
                var id = parseInt(fexRawRecords[j].getAttribute('linenum'), 10);
                var td = fexRawRecords[j].getElementsByTagName('td');
                var record = {};

                for (var ii = 0; ii < fexRawMetaContent.length; ii += 1) {
                    var colindex, type, key;
                    if (td[ii].getAttribute('rawvalue') != null) {
                        colindex = td[ii].getAttribute('colnum');
                        if (metaKeyValue.hasOwnProperty(colindex)) {
                            key = metaKeyValue[colindex];
                            if (nameType.hasOwnProperty(key)) {
                                type = nameType[key];
                            }
                        }
                        if (type === "integer") {
                            record[key] = parseInt(td[ii].getAttribute('rawvalue'), 10);
                        } else if (type === "float") {
                            record[key] = parseFloat(td[ii].getAttribute('rawvalue'));
                        } else {
                            record[key] = td[ii].getAttribute('rawvalue');
                        }
                    } else {
                        colindex = td[ii].getAttribute('colnum');
                        if (metaKeyValue.hasOwnProperty(colindex)) {
                            key = metaKeyValue[colindex];
                            if (nameType.hasOwnProperty(key)) {
                                type = nameType[key];
                            }
                        }

                        if (td[ii].childNodes.length === 0) {
                            badData.push(record);
                        } else {
                            if (type === "integer") {
                                record[key] = parseInt(td[ii].childNodes[0].nodeValue, 10);
                            } else if (type === "float") {
                                record[key] = parseFloat(td[ii].childNodes[0].nodeValue);
                            } else {
                                record[key] = td[ii].childNodes[0].nodeValue;
                            }
                        }
                    }
                }
                records.push(record);
            }
            if (badData.length) {
                console.log("Some data were missing on these records:", badData);
                alert("There were some data missing in your data source. See console for more info");
            }

            fexResponse.records = records;
            fexResponse.fields = fcFields;
            return fexResponse;
        },

        _isNumber: function (n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },

        _createEsriWhereQuery: function (Fields) {
            var numOfFields = Fields.length;
            var concatPattern = 'CONCAT(';
            var QStr = "";
            var separator = ", '|'";
            if (numOfFields === 1) {
                QStr = Fields[0];
            }
            if (numOfFields > 1) {
                for (var i = 0; i < numOfFields; ++i) {
                    var endParen = "";
                    if (QStr === "") {
                        QStr = concatPattern + Fields[i] + separator + ")";
                        separator = "),'|')";
                        continue;
                    }
                    if (i === numOfFields - 1) {
                        separator = "";
                        endParen = ")";
                        concatPattern = 'CONCAT(';
                    }
                    if (separator !== "") {
                        concatPattern += concatPattern;
                    }
                    QStr = concatPattern + QStr + ", " + Fields[i] + separator + endParen;
                }
            }
            return QStr;
        },

        _createEsriWhereQueryValues: function (fexdata, fields) {
            var Response = {};
            var dataMap = {};
            var initStr = "";
            var records;
            if (fexdata.length > 2000) {
                records = fexdata.slice(0, 2000);
                alert('Your request contained ' + fexdata.length + ' records. In order to preserve performance only the first 2000 records will be used in the query');
            } else {
                records = fexdata;
            }

            var groupData2 = (records).map(function (o) {
                fields.forEach(function (f) {
                    var rawVal = (o[f].toString()).toUpperCase();
                    var val = U._trimString(rawVal);
                    val = U._sqlEscape(val);
                    if (initStr !== "") {
                        initStr = initStr + "|";
                    }
                    initStr = initStr + val;
                });
                dataMap[initStr] = o;
                initStr = "";
            });

            var str1 = "";
            for (var a in dataMap) {
                if (dataMap.hasOwnProperty(a)) {
                    if (str1 !== "") {
                        str1 = str1 + ",";
                    }
                    a = U._sqlEscape(a);
                    str1 = str1 + "'" + a + "'";
                }
            }
            Response.qstring = str1;
            Response.dataMap = dataMap;
            return Response;
        },

        _getColorScheme: function (SchemeID, BreaksNumber) {
            var colorbrewer = {
                YlGn: {
                    3: ["#f7fcb9", "#addd8e", "#31a354"],
                    4: ["#ffffcc", "#c2e699", "#78c679", "#238443"],
                    5: ["#ffffcc", "#c2e699", "#78c679", "#31a354", "#006837"],
                    6: ["#ffffcc", "#d9f0a3", "#addd8e", "#78c679", "#31a354", "#006837"],
                    7: ["#ffffcc", "#d9f0a3", "#addd8e", "#78c679", "#41ab5d", "#238443", "#005a32"],
                    8: ["#ffffe5", "#f7fcb9", "#d9f0a3", "#addd8e", "#78c679", "#41ab5d", "#238443", "#005a32"],
                    9: ["#ffffe5", "#f7fcb9", "#d9f0a3", "#addd8e", "#78c679", "#41ab5d", "#238443", "#006837", "#004529"]
                }, YlGnBu: {
                    3: ["#edf8b1", "#7fcdbb", "#2c7fb8"],
                    4: ["#ffffcc", "#a1dab4", "#41b6c4", "#225ea8"],
                    5: ["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"],
                    6: ["#ffffcc", "#c7e9b4", "#7fcdbb", "#41b6c4", "#2c7fb8", "#253494"],
                    7: ["#ffffcc", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#0c2c84"],
                    8: ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#0c2c84"],
                    9: ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"]
                }, GnBu: {
                    3: ["#e0f3db", "#a8ddb5", "#43a2ca"],
                    4: ["#f0f9e8", "#bae4bc", "#7bccc4", "#2b8cbe"],
                    5: ["#f0f9e8", "#bae4bc", "#7bccc4", "#43a2ca", "#0868ac"],
                    6: ["#f0f9e8", "#ccebc5", "#a8ddb5", "#7bccc4", "#43a2ca", "#0868ac"],
                    7: ["#f0f9e8", "#ccebc5", "#a8ddb5", "#7bccc4", "#4eb3d3", "#2b8cbe", "#08589e"],
                    8: ["#f7fcf0", "#e0f3db", "#ccebc5", "#a8ddb5", "#7bccc4", "#4eb3d3", "#2b8cbe", "#08589e"],
                    9: ["#f7fcf0", "#e0f3db", "#ccebc5", "#a8ddb5", "#7bccc4", "#4eb3d3", "#2b8cbe", "#0868ac", "#084081"]
                }, BuGn: {
                    3: ["#e5f5f9", "#99d8c9", "#2ca25f"],
                    4: ["#edf8fb", "#b2e2e2", "#66c2a4", "#238b45"],
                    5: ["#edf8fb", "#b2e2e2", "#66c2a4", "#2ca25f", "#006d2c"],
                    6: ["#edf8fb", "#ccece6", "#99d8c9", "#66c2a4", "#2ca25f", "#006d2c"],
                    7: ["#edf8fb", "#ccece6", "#99d8c9", "#66c2a4", "#41ae76", "#238b45", "#005824"],
                    8: ["#f7fcfd", "#e5f5f9", "#ccece6", "#99d8c9", "#66c2a4", "#41ae76", "#238b45", "#005824"],
                    9: ["#f7fcfd", "#e5f5f9", "#ccece6", "#99d8c9", "#66c2a4", "#41ae76", "#238b45", "#006d2c", "#00441b"]
                }, PuBuGn: {
                    3: ["#ece2f0", "#a6bddb", "#1c9099"],
                    4: ["#f6eff7", "#bdc9e1", "#67a9cf", "#02818a"],
                    5: ["#f6eff7", "#bdc9e1", "#67a9cf", "#1c9099", "#016c59"],
                    6: ["#f6eff7", "#d0d1e6", "#a6bddb", "#67a9cf", "#1c9099", "#016c59"],
                    7: ["#f6eff7", "#d0d1e6", "#a6bddb", "#67a9cf", "#3690c0", "#02818a", "#016450"],
                    8: ["#fff7fb", "#ece2f0", "#d0d1e6", "#a6bddb", "#67a9cf", "#3690c0", "#02818a", "#016450"],
                    9: ["#fff7fb", "#ece2f0", "#d0d1e6", "#a6bddb", "#67a9cf", "#3690c0", "#02818a", "#016c59", "#014636"]
                }, PuBu: {
                    3: ["#ece7f2", "#a6bddb", "#2b8cbe"],
                    4: ["#f1eef6", "#bdc9e1", "#74a9cf", "#0570b0"],
                    5: ["#f1eef6", "#bdc9e1", "#74a9cf", "#2b8cbe", "#045a8d"],
                    6: ["#f1eef6", "#d0d1e6", "#a6bddb", "#74a9cf", "#2b8cbe", "#045a8d"],
                    7: ["#f1eef6", "#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#034e7b"],
                    8: ["#fff7fb", "#ece7f2", "#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#034e7b"],
                    9: ["#fff7fb", "#ece7f2", "#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#045a8d", "#023858"]
                }, BuPu: {
                    3: ["#e0ecf4", "#9ebcda", "#8856a7"],
                    4: ["#edf8fb", "#b3cde3", "#8c96c6", "#88419d"],
                    5: ["#edf8fb", "#b3cde3", "#8c96c6", "#8856a7", "#810f7c"],
                    6: ["#edf8fb", "#bfd3e6", "#9ebcda", "#8c96c6", "#8856a7", "#810f7c"],
                    7: ["#edf8fb", "#bfd3e6", "#9ebcda", "#8c96c6", "#8c6bb1", "#88419d", "#6e016b"],
                    8: ["#f7fcfd", "#e0ecf4", "#bfd3e6", "#9ebcda", "#8c96c6", "#8c6bb1", "#88419d", "#6e016b"],
                    9: ["#f7fcfd", "#e0ecf4", "#bfd3e6", "#9ebcda", "#8c96c6", "#8c6bb1", "#88419d", "#810f7c", "#4d004b"]
                }, RdPu: {
                    3: ["#fde0dd", "#fa9fb5", "#c51b8a"],
                    4: ["#feebe2", "#fbb4b9", "#f768a1", "#ae017e"],
                    5: ["#feebe2", "#fbb4b9", "#f768a1", "#c51b8a", "#7a0177"],
                    6: ["#feebe2", "#fcc5c0", "#fa9fb5", "#f768a1", "#c51b8a", "#7a0177"],
                    7: ["#feebe2", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177"],
                    8: ["#fff7f3", "#fde0dd", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177"],
                    9: ["#fff7f3", "#fde0dd", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177", "#49006a"]
                }, PuRd: {
                    3: ["#e7e1ef", "#c994c7", "#dd1c77"],
                    4: ["#f1eef6", "#d7b5d8", "#df65b0", "#ce1256"],
                    5: ["#f1eef6", "#d7b5d8", "#df65b0", "#dd1c77", "#980043"],
                    6: ["#f1eef6", "#d4b9da", "#c994c7", "#df65b0", "#dd1c77", "#980043"],
                    7: ["#f1eef6", "#d4b9da", "#c994c7", "#df65b0", "#e7298a", "#ce1256", "#91003f"],
                    8: ["#f7f4f9", "#e7e1ef", "#d4b9da", "#c994c7", "#df65b0", "#e7298a", "#ce1256", "#91003f"],
                    9: ["#f7f4f9", "#e7e1ef", "#d4b9da", "#c994c7", "#df65b0", "#e7298a", "#ce1256", "#980043", "#67001f"]
                }, OrRd: {
                    3: ["#fee8c8", "#fdbb84", "#e34a33"],
                    4: ["#fef0d9", "#fdcc8a", "#fc8d59", "#d7301f"],
                    5: ["#fef0d9", "#fdcc8a", "#fc8d59", "#e34a33", "#b30000"],
                    6: ["#fef0d9", "#fdd49e", "#fdbb84", "#fc8d59", "#e34a33", "#b30000"],
                    7: ["#fef0d9", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#990000"],
                    8: ["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#990000"],
                    9: ["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"]
                }, YlOrRd: {
                    3: ["#ffeda0", "#feb24c", "#f03b20"],
                    4: ["#ffffb2", "#fecc5c", "#fd8d3c", "#e31a1c"],
                    5: ["#ffffb2", "#fecc5c", "#fd8d3c", "#f03b20", "#bd0026"],
                    6: ["#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#f03b20", "#bd0026"],
                    7: ["#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#b10026"],
                    8: ["#ffffcc", "#ffeda0", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#b10026"],
                    9: ["#ffffcc", "#ffeda0", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#bd0026", "#800026"]
                }, YlOrBr: {
                    3: ["#fff7bc", "#fec44f", "#d95f0e"],
                    4: ["#ffffd4", "#fed98e", "#fe9929", "#cc4c02"],
                    5: ["#ffffd4", "#fed98e", "#fe9929", "#d95f0e", "#993404"],
                    6: ["#ffffd4", "#fee391", "#fec44f", "#fe9929", "#d95f0e", "#993404"],
                    7: ["#ffffd4", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#8c2d04"],
                    8: ["#ffffe5", "#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#8c2d04"],
                    9: ["#ffffe5", "#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"]
                }, Purples: {
                    3: ["#efedf5", "#bcbddc", "#756bb1"],
                    4: ["#f2f0f7", "#cbc9e2", "#9e9ac8", "#6a51a3"],
                    5: ["#f2f0f7", "#cbc9e2", "#9e9ac8", "#756bb1", "#54278f"],
                    6: ["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"],
                    7: ["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#4a1486"],
                    8: ["#fcfbfd", "#efedf5", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#4a1486"],
                    9: ["#fcfbfd", "#efedf5", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#54278f", "#3f007d"]
                }, Blues: {
                    3: ["#deebf7", "#9ecae1", "#3182bd"],
                    4: ["#eff3ff", "#bdd7e7", "#6baed6", "#2171b5"],
                    5: ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"],
                    6: ["#eff3ff", "#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08519c"],
                    7: ["#eff3ff", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#084594"],
                    8: ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#084594"],
                    9: ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"]
                }, Greens: {
                    3: ["#e5f5e0", "#a1d99b", "#31a354"],
                    4: ["#edf8e9", "#bae4b3", "#74c476", "#238b45"],
                    5: ["#edf8e9", "#bae4b3", "#74c476", "#31a354", "#006d2c"],
                    6: ["#edf8e9", "#c7e9c0", "#a1d99b", "#74c476", "#31a354", "#006d2c"],
                    7: ["#edf8e9", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#005a32"],
                    8: ["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#005a32"],
                    9: ["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#006d2c", "#00441b"]
                }, Oranges: {
                    3: ["#fee6ce", "#fdae6b", "#e6550d"],
                    4: ["#feedde", "#fdbe85", "#fd8d3c", "#d94701"],
                    5: ["#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#a63603"],
                    6: ["#feedde", "#fdd0a2", "#fdae6b", "#fd8d3c", "#e6550d", "#a63603"],
                    7: ["#feedde", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#8c2d04"],
                    8: ["#fff5eb", "#fee6ce", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#8c2d04"],
                    9: ["#fff5eb", "#fee6ce", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#a63603", "#7f2704"]
                }, Reds: {
                    3: ["#fee0d2", "#fc9272", "#de2d26"],
                    4: ["#fee5d9", "#fcae91", "#fb6a4a", "#cb181d"],
                    5: ["#fee5d9", "#fcae91", "#fb6a4a", "#de2d26", "#a50f15"],
                    6: ["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#de2d26", "#a50f15"],
                    7: ["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d"],
                    8: ["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d"],
                    9: ["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"]
                }, Greys: {
                    3: ["#f0f0f0", "#bdbdbd", "#636363"],
                    4: ["#f7f7f7", "#cccccc", "#969696", "#525252"],
                    5: ["#f7f7f7", "#cccccc", "#969696", "#636363", "#252525"],
                    6: ["#f7f7f7", "#d9d9d9", "#bdbdbd", "#969696", "#636363", "#252525"],
                    7: ["#f7f7f7", "#d9d9d9", "#bdbdbd", "#969696", "#737373", "#525252", "#252525"],
                    8: ["#ffffff", "#f0f0f0", "#d9d9d9", "#bdbdbd", "#969696", "#737373", "#525252", "#252525"],
                    9: ["#ffffff", "#f0f0f0", "#d9d9d9", "#bdbdbd", "#969696", "#737373", "#525252", "#252525", "#000000"]
                }, PuOr: {
                    3: ["#f1a340", "#f7f7f7", "#998ec3"],
                    4: ["#e66101", "#fdb863", "#b2abd2", "#5e3c99"],
                    5: ["#e66101", "#fdb863", "#f7f7f7", "#b2abd2", "#5e3c99"],
                    6: ["#b35806", "#f1a340", "#fee0b6", "#d8daeb", "#998ec3", "#542788"],
                    7: ["#b35806", "#f1a340", "#fee0b6", "#f7f7f7", "#d8daeb", "#998ec3", "#542788"],
                    8: ["#b35806", "#e08214", "#fdb863", "#fee0b6", "#d8daeb", "#b2abd2", "#8073ac", "#542788"],
                    9: ["#b35806", "#e08214", "#fdb863", "#fee0b6", "#f7f7f7", "#d8daeb", "#b2abd2", "#8073ac", "#542788"],
                    10: ["#7f3b08", "#b35806", "#e08214", "#fdb863", "#fee0b6", "#d8daeb", "#b2abd2", "#8073ac", "#542788", "#2d004b"],
                    11: ["#7f3b08", "#b35806", "#e08214", "#fdb863", "#fee0b6", "#f7f7f7", "#d8daeb", "#b2abd2", "#8073ac", "#542788", "#2d004b"]
                }, BrBG: {
                    3: ["#d8b365", "#f5f5f5", "#5ab4ac"],
                    4: ["#a6611a", "#dfc27d", "#80cdc1", "#018571"],
                    5: ["#a6611a", "#dfc27d", "#f5f5f5", "#80cdc1", "#018571"],
                    6: ["#8c510a", "#d8b365", "#f6e8c3", "#c7eae5", "#5ab4ac", "#01665e"],
                    7: ["#8c510a", "#d8b365", "#f6e8c3", "#f5f5f5", "#c7eae5", "#5ab4ac", "#01665e"],
                    8: ["#8c510a", "#bf812d", "#dfc27d", "#f6e8c3", "#c7eae5", "#80cdc1", "#35978f", "#01665e"],
                    9: ["#8c510a", "#bf812d", "#dfc27d", "#f6e8c3", "#f5f5f5", "#c7eae5", "#80cdc1", "#35978f", "#01665e"],
                    10: ["#543005", "#8c510a", "#bf812d", "#dfc27d", "#f6e8c3", "#c7eae5", "#80cdc1", "#35978f", "#01665e", "#003c30"],
                    11: ["#543005", "#8c510a", "#bf812d", "#dfc27d", "#f6e8c3", "#f5f5f5", "#c7eae5", "#80cdc1", "#35978f", "#01665e", "#003c30"]
                }, PRGn: {
                    3: ["#af8dc3", "#f7f7f7", "#7fbf7b"],
                    4: ["#7b3294", "#c2a5cf", "#a6dba0", "#008837"],
                    5: ["#7b3294", "#c2a5cf", "#f7f7f7", "#a6dba0", "#008837"],
                    6: ["#762a83", "#af8dc3", "#e7d4e8", "#d9f0d3", "#7fbf7b", "#1b7837"],
                    7: ["#762a83", "#af8dc3", "#e7d4e8", "#f7f7f7", "#d9f0d3", "#7fbf7b", "#1b7837"],
                    8: ["#762a83", "#9970ab", "#c2a5cf", "#e7d4e8", "#d9f0d3", "#a6dba0", "#5aae61", "#1b7837"],
                    9: ["#762a83", "#9970ab", "#c2a5cf", "#e7d4e8", "#f7f7f7", "#d9f0d3", "#a6dba0", "#5aae61", "#1b7837"],
                    10: ["#40004b", "#762a83", "#9970ab", "#c2a5cf", "#e7d4e8", "#d9f0d3", "#a6dba0", "#5aae61", "#1b7837", "#00441b"],
                    11: ["#40004b", "#762a83", "#9970ab", "#c2a5cf", "#e7d4e8", "#f7f7f7", "#d9f0d3", "#a6dba0", "#5aae61", "#1b7837", "#00441b"]
                }, PiYG: {
                    3: ["#e9a3c9", "#f7f7f7", "#a1d76a"],
                    4: ["#d01c8b", "#f1b6da", "#b8e186", "#4dac26"],
                    5: ["#d01c8b", "#f1b6da", "#f7f7f7", "#b8e186", "#4dac26"],
                    6: ["#c51b7d", "#e9a3c9", "#fde0ef", "#e6f5d0", "#a1d76a", "#4d9221"],
                    7: ["#c51b7d", "#e9a3c9", "#fde0ef", "#f7f7f7", "#e6f5d0", "#a1d76a", "#4d9221"],
                    8: ["#c51b7d", "#de77ae", "#f1b6da", "#fde0ef", "#e6f5d0", "#b8e186", "#7fbc41", "#4d9221"],
                    9: ["#c51b7d", "#de77ae", "#f1b6da", "#fde0ef", "#f7f7f7", "#e6f5d0", "#b8e186", "#7fbc41", "#4d9221"],
                    10: ["#8e0152", "#c51b7d", "#de77ae", "#f1b6da", "#fde0ef", "#e6f5d0", "#b8e186", "#7fbc41", "#4d9221", "#276419"],
                    11: ["#8e0152", "#c51b7d", "#de77ae", "#f1b6da", "#fde0ef", "#f7f7f7", "#e6f5d0", "#b8e186", "#7fbc41", "#4d9221", "#276419"]
                }, RdBu: {
                    3: ["#ef8a62", "#f7f7f7", "#67a9cf"],
                    4: ["#ca0020", "#f4a582", "#92c5de", "#0571b0"],
                    5: ["#ca0020", "#f4a582", "#f7f7f7", "#92c5de", "#0571b0"],
                    6: ["#b2182b", "#ef8a62", "#fddbc7", "#d1e5f0", "#67a9cf", "#2166ac"],
                    7: ["#b2182b", "#ef8a62", "#fddbc7", "#f7f7f7", "#d1e5f0", "#67a9cf", "#2166ac"],
                    8: ["#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac"],
                    9: ["#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#f7f7f7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac"],
                    10: ["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061"],
                    11: ["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#f7f7f7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061"]
                }, RdGy: {
                    3: ["#ef8a62", "#ffffff", "#999999"],
                    4: ["#ca0020", "#f4a582", "#bababa", "#404040"],
                    5: ["#ca0020", "#f4a582", "#ffffff", "#bababa", "#404040"],
                    6: ["#b2182b", "#ef8a62", "#fddbc7", "#e0e0e0", "#999999", "#4d4d4d"],
                    7: ["#b2182b", "#ef8a62", "#fddbc7", "#ffffff", "#e0e0e0", "#999999", "#4d4d4d"],
                    8: ["#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#e0e0e0", "#bababa", "#878787", "#4d4d4d"],
                    9: ["#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#ffffff", "#e0e0e0", "#bababa", "#878787", "#4d4d4d"],
                    10: ["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#e0e0e0", "#bababa", "#878787", "#4d4d4d", "#1a1a1a"],
                    11: ["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#ffffff", "#e0e0e0", "#bababa", "#878787", "#4d4d4d", "#1a1a1a"]
                }, RdYlBu: {
                    3: ["#fc8d59", "#ffffbf", "#91bfdb"],
                    4: ["#d7191c", "#fdae61", "#abd9e9", "#2c7bb6"],
                    5: ["#d7191c", "#fdae61", "#ffffbf", "#abd9e9", "#2c7bb6"],
                    6: ["#d73027", "#fc8d59", "#fee090", "#e0f3f8", "#91bfdb", "#4575b4"],
                    7: ["#d73027", "#fc8d59", "#fee090", "#ffffbf", "#e0f3f8", "#91bfdb", "#4575b4"],
                    8: ["#d73027", "#f46d43", "#fdae61", "#fee090", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4"],
                    9: ["#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4"],
                    10: ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4", "#313695"],
                    11: ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4", "#313695"]
                }, Spectral: {
                    3: ["#fc8d59", "#ffffbf", "#99d594"],
                    4: ["#d7191c", "#fdae61", "#abdda4", "#2b83ba"],
                    5: ["#d7191c", "#fdae61", "#ffffbf", "#abdda4", "#2b83ba"],
                    6: ["#d53e4f", "#fc8d59", "#fee08b", "#e6f598", "#99d594", "#3288bd"],
                    7: ["#d53e4f", "#fc8d59", "#fee08b", "#ffffbf", "#e6f598", "#99d594", "#3288bd"],
                    8: ["#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#e6f598", "#abdda4", "#66c2a5", "#3288bd"],
                    9: ["#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#e6f598", "#abdda4", "#66c2a5", "#3288bd"],
                    10: ["#9e0142", "#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#e6f598", "#abdda4", "#66c2a5", "#3288bd", "#5e4fa2"],
                    11: ["#9e0142", "#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#e6f598", "#abdda4", "#66c2a5", "#3288bd", "#5e4fa2"]
                }, RdYlGn: {
                    3: ["#fc8d59", "#ffffbf", "#91cf60"],
                    4: ["#d7191c", "#fdae61", "#a6d96a", "#1a9641"],
                    5: ["#d7191c", "#fdae61", "#ffffbf", "#a6d96a", "#1a9641"],
                    6: ["#d73027", "#fc8d59", "#fee08b", "#d9ef8b", "#91cf60", "#1a9850"],
                    7: ["#d73027", "#fc8d59", "#fee08b", "#ffffbf", "#d9ef8b", "#91cf60", "#1a9850"],
                    8: ["#d73027", "#f46d43", "#fdae61", "#fee08b", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850"],
                    9: ["#d73027", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850"],
                    10: ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#006837"],
                    11: ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#006837"]
                }, Accent: {
                    3: ["#7fc97f", "#beaed4", "#fdc086"],
                    4: ["#7fc97f", "#beaed4", "#fdc086", "#ffff99"],
                    5: ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0"],
                    6: ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0", "#f0027f"],
                    7: ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0", "#f0027f", "#bf5b17"],
                    8: ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0", "#f0027f", "#bf5b17", "#666666"]
                }, Dark2: {
                    3: ["#1b9e77", "#d95f02", "#7570b3"],
                    4: ["#1b9e77", "#d95f02", "#7570b3", "#e7298a"],
                    5: ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e"],
                    6: ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02"],
                    7: ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d"],
                    8: ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666"]
                }, Paired: {
                    3: ["#a6cee3", "#1f78b4", "#b2df8a"],
                    4: ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c"],
                    5: ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99"],
                    6: ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c"],
                    7: ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f"],
                    8: ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00"],
                    9: ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6"],
                    10: ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a"],
                    11: ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99"],
                    12: ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99", "#b15928"]
                }, Pastel1: {
                    3: ["#fbb4ae", "#b3cde3", "#ccebc5"],
                    4: ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4"],
                    5: ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6"],
                    6: ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc"],
                    7: ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd"],
                    8: ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec"],
                    9: ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec", "#f2f2f2"]
                }, Pastel2: {
                    3: ["#b3e2cd", "#fdcdac", "#cbd5e8"],
                    4: ["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4"],
                    5: ["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4", "#e6f5c9"],
                    6: ["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4", "#e6f5c9", "#fff2ae"],
                    7: ["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4", "#e6f5c9", "#fff2ae", "#f1e2cc"],
                    8: ["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4", "#e6f5c9", "#fff2ae", "#f1e2cc", "#cccccc"]
                }, Set1: {
                    3: ["#e41a1c", "#377eb8", "#4daf4a"],
                    4: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3"],
                    5: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"],
                    6: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33"],
                    7: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628"],
                    8: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628", "#f781bf"],
                    9: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628", "#f781bf", "#999999"]
                }, Set2: {
                    3: ["#66c2a5", "#fc8d62", "#8da0cb"],
                    4: ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3"],
                    5: ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854"],
                    6: ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f"],
                    7: ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494"],
                    8: ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494", "#b3b3b3"]
                }, Set3: {
                    3: ["#8dd3c7", "#ffffb3", "#bebada"],
                    4: ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072"],
                    5: ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3"],
                    6: ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462"],
                    7: ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69"],
                    8: ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5"],
                    9: ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9"],
                    10: ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd"],
                    11: ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5"],
                    12: ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"]
                }
            };
            return colorbrewer[SchemeID][BreaksNumber];
        },

        _getSimpleRenderer: function (O) {
            var symbol = {
                type: O.symbol.type
            };
            var defaultOutline = {
                width: 1,
                color: "white"
            };
            var defaultFill = {
                color: "blue",
                outline: defaultOutline
            };
            if (O.hasOwnProperty("symbol") && O.symbol) {
                if (O.symbol.type === "simple-marker") {
                    symbol.size = O.symbol.size || 12;
                    symbol.color = O.symbol.color || "blue";
                    symbol.style = O.symbol.style || "circle";
                    symbol.angle = O.symbol.angle || 0;
                    if (O.symbol.hasOwnProperty("outline") && O.symbol.outline) {
                        symbol.outline = {
                            width: (O.symbol.outline.hasOwnProperty("width") && O.symbol.outline.width) ? O.symbol.outline.width : defaultOutline.width,
                            color: (O.symbol.outline.hasOwnProperty("color") && O.symbol.outline.color) ? O.symbol.outline.color : defaultOutline.color,
                        };
                    }
                }
                if (O.symbol.type === 'simple-fill') {
                    symbol.color = (O.symbol.hasOwnProperty("color") && O.symbol.color) ? O.symbol.color : defaultFill.color;
                    if (O.symbol.hasOwnProperty("outline") && O.symbol.outline) {
                        symbol.outline = {
                            width: (O.symbol.outline.hasOwnProperty("width") && O.symbol.outline.width) ? O.symbol.outline.width : defaultOutline.width,
                            color: (O.symbol.outline.hasOwnProperty("color") && O.symbol.outline.color) ? O.symbol.outline.color : defaultOutline.color,
                        };
                    }

                }
                if (O.symbol.type === 'picture-marker') {
                    symbol.url = O.symbol.url ? O.symbol.url : "https://static.arcgis.com/images/Symbols/Shapes/BlueStarLargeB.png";
                    symbol.width = O.symbol.width ? O.symbol.width : "20px";
                    symbol.height = O.symbol.height ? O.symbol.height : "20px";
                }
            }

            return {
                type: "simple",
                symbol: symbol
            };
        },

        _getHeatMapRenderer: function (O) {

            var breaks = (O.hasOwnProperty('breaks') && O.breaks) ? O.breaks : 3;
            var colorSchemeKey = (O.hasOwnProperty('colorRamp') && O.colorRamp) ? O.colorRamp : "YlOrRd";
            var colorRamp = U._getColorScheme(colorSchemeKey, breaks);
            var colorStops = [];
            var min = 0;
            var max = 1;
            var increment = 1 / breaks;
            if (breaks === 3) {
                colorStops = [
                    { ratio: 0, color: colorRamp[0] },
                    { ratio: 0.5, color: colorRamp[1] },
                    { ratio: 1, color: colorRamp[2] },
                ];
            } else {
                colorRamp.forEach(function (c) {
                    var stop = {};
                    stop.color = c;
                    if (min = 0) {
                        stop.ratio = 0;
                    } else if (min >= max) {
                        stop.ratio = max;
                    } else {
                        stop.ratio = min + increment;
                    }
                    min = min + increment;
                    colorStops.push(stop);
                });
            }

            return {
                "type": "heatmap",
                "field": (O.hasOwnProperty('field') && O.field) ? O.field : "",
                "blurRadius": (O.hasOwnProperty('blurRadius') && O.blurRadius) ? O.blurRadius : 60,
                "colorStops": colorStops,
                "minPixelIntensity": (O.hasOwnProperty('minPixelIntensity') && O.minPixelIntensity) ? O.minPixelIntensity : 0,
                "maxPixelIntensity": (O.hasOwnProperty('maxPixelIntensity') && O.maxPixelIntensity) ? O.maxPixelIntensity : 1000,
            };
        },

        _getClassBreaksRenderer: function (O) {

            if (O.hasOwnProperty('field') && O.field) {

                var symbol = {

                };

                var breakInfo = {
                    minValue: 0,
                    maxValue: 1,
                    symbol: symbol,
                    label: ""
                };

                var renderer = {
                    type: "class-breaks",
                    field: O.field,
                    classBreakInfos: []
                };

            } else {

            }

        },

        _getUniqueValueRenderer: function (O) {

            if (O.hasOwnProperty('field') && O.field) {

            } else {

            }

        },

        _getRenderer: function (type, options) {
            function handleType(type) {
                var types = {
                    'simple': function () {
                        return U._getSimpleRenderer(options);
                    },
                    'heatmap': function () {
                        return U._getHeatMapRenderer(options);
                    },
                    'unique-value': function () {
                        return U._getUniqueValueRenderer(options);
                    },
                    'class-breaks': function () {
                        return U._getClassBreaksRenderer(options);
                    }
                };
                if (typeof types[type] !== 'function') {
                    throw new Error(type + ' Is not a valid renderer type. Supported values are: simple, heatmap, unique-value and class-breaks');
                } else {
                    return types[type]();
                }
            }
            handleType(type);
        }
    };
	IBGeo = function (path, onpremise) {
		
        this.GeoStats = GeoStats;
       
        this.sketchLineSymbol = {
            type: "simple-line",
            color: "red",
            width: 2,
            style: "short-dot"
        };
        this.sketchPolygonSymbol = {
            type: "simple-fill",
            color: [150, 150, 150, 0.2],
            outline: this.sketchLineSymbol
        };           

        this.units = {
            "km": "kilometers",
            "m": "meters",
            "mi": "miles",
            "nmi": "nautical-miles",
            "yd": "yards",
            "ft": "feet"
        };
		this.tdgchart = null;
        
        this.options={ userValue: "selPan", useSmallest: false, layersOrder: "as-is", getGeometry: "async", 
                    totalGeom: 0, showTooltips: true, hoverHL: true, ttOffset:25, deviation: 1000, useExpand: false,
                    context: "/ibi_apps", csrfTokenName:"",csrfTokenValue:"", discoverType: null,
					edaNode:"EDASERVE", inheritEsriTheme: false, cimSymbol: false, bookmarks: true, esriPath: path, onPremiseApi: onpremise };
		this.initialize();
		this.options.satSubs={
			"AUS": {"title":"Australia"},
			"CA" :  {"title":"Canada"},
			"PRC" :  {"title":"China"},
			"FR" :  {"title":"France and Italy"}, 
			"IND" :  {"title":"India"},
			"JPN" :  {"title":"Japan"},
			"CIS" :  {"title":"Russia"},
			"UK" :  {"title":"United Kingdom"},
			"US" :  {"title":"United States"},		
			"DEBRIS" : {"title":"Debris"},		
			"default" :  {"title":"Other"}
		};
	
		this.options.emphasizeEffects=[		
			{name:getTransString("cshift"), value: "saturate(1.25) hue-rotate(60deg) drop-shadow(3.75pt 3.75pt 3.75pt rgba(0, 219, 186, 1))"},
			{name:getTransString("embolden"), value: "saturate(1.75) contrast(1.25) drop-shadow(3.75pt 3.75pt 3.75pt rgba(2, 11, 179, 1))"},
			 {name:getTransString("hlight"), value: "brightness(1.25) saturate(1.50) drop-shadow(3.75pt 3.75pt 3.75pt rgba(218, 255, 33, 1))"},
			{name:getTransString("invert"), value:"drop-shadow(3.75pt 3.75pt 3.75pt red) invert(0.85)" }
		];
	
    	this.options.deemphasizeEffects=[ 		
			{name:getTransString("blur"), value: "blur(3.75pt) opacity(0.5)"},		
			{name:getTransString("darken"), value: "brightness(0.25) opacity(0.6)"},
			{name:getTransString("fade"), value: "grayscale(0.5) opacity(0.3)"},
			 {name:getTransString("lighten"), value: "brightness(1.5) saturate(0.1) opacity(0.6)"},
			{name:getTransString("satur"), value: "saturate(0.25) opacity(0.6)"},
			{name:getTransString("sepia"), value: "sepia(0.8) opacity(0.6)"}				 
		];
		this.options.amperInfo=null;
        this.setContext();
    }	
	IBGeo.prototype = {
		initialize: function(skip) {
			if(!skip) {
				this._view = null; this._view3d = null; this._map = null; this._map3d = null;
	            this.activeWidgets = [];
				this.bookmarksList=[];
				this.activeEventListeners = [];
				this.options.viewpoint=null;
				this.initFinal=false;
				this.currentTT=$("<div class='tooltipcontainer'></div>"); 
			}			 
            this.extents = this.layersAddedDir = [];
            this.sketchVM = null;
			this.layerList = [], this.dynamicLayers=[];
            this.addedLrs=false;
            this.layersLength = 0;
			this.selUnit = "mi"; 
			this.updating=false;           
            this.unitsCtrlVis=true;

            this.options.basemap= null;
			this.options.inheritEsriTheme= false;
			this.options.bubbleUniqueMix= false;
			this.options.basemapAdded=false; this.options.numOfLayers= 0;
			
            this.mapCntrsFlds={};
            this.initialViewInfo=null;
			this.hlhandles=[]; this.selections=[];  
            this.currentThemeName=null;
			this.loadingFiles=null;
			this.toggleView=false;
			
		},
		addRequestIntersept(urlInt) {
			var othis=this; 
			if(typeof(othis.urlInterseptsToken)=='undefined') {
				othis.urlInterseptsToken=[];
				esriConfig.request.interceptors.push({
				   before: function(params) {			
						for(let k = 0; k < othis.urlInterseptsToken.length; k++) {
							if (params.url.search(othis.urlInterseptsToken[k]) != -1) {			
								if(!params.requestOptions.hasOwnProperty("headers"))
									params.requestOptions.headers={};
						        params.requestOptions.headers[othis.options.csrfTokenName]=othis.options.csrfTokenValue;
								break;
							}
						}	
						
				     }					
				});
			}
			othis.urlInterseptsToken.push(urlInt);
		},
		isonPremiseApi: function (){
			return this.options.onPremiseApi;
		},
		addRouteProxy: function(){
			var othis=this, proxy = othis.getEdaRequestPrefix()+"/GisEsriProxy",
			prefix="route-api.arcgis.com";
			if(typeof(othis.options.routeProxy) == 'undefined') {
				othis.addRequestIntersept(prefix);
				othis.options.routeProxy=urlUtils.addProxyRule({ urlPrefix: prefix,proxyUrl: proxy});
			}			
		},
		addPortalProxy: function(){
			var proxy = this.getEdaRequestPrefix()+"/GisEsriProxy",
			prefix="/esri/identity/t9n";
			if(typeof(this.options.portalProxy) == 'undefined') {
			//	this.addRequestIntersept(prefix);
				this.options.portalProxy=urlUtils.addProxyRule({ urlPrefix: prefix,proxyUrl: proxy});
			}			
		},
		getMyPath: function(bFullPath,bNameOnly){
			var path = getFileFromLocation();
			
			if (!bFullPath && typeof path === 'string') {
	            var index = path.lastIndexOf("/");
	            if (index != -1) {
	                if (!bNameOnly)
	                    path = path.slice(0, index);
	                else {
	                    path = path.slice(index + 1, path.length - 1);
	                    var dot = path.indexOf(".");
	                    path = dot != -1 ? path.slice(0, dot) : path;
	                }
	            }
	        }
			return path;
		},
		getContext: function() {
			let context= this.options.context || this.tdgchart.webappContext || "";
			if(typeof(context)=="string" && context.lastIndexOf('/') == context.length-1)
	            context = context.substr(0,context.lastIndexOf('/'));
			return context;
		},
        is3dView: function(){
            return this.getWidgetProperties("viewType") == "3d" ? true : false;
        },
        setUnits: function (unitsSet) {
            this.setSelectedUnit(unitsSet.units);
            this.unitsCtrlVis=unitsSet.visible;
        },
		supportOldTheme: function(color, dark) {
			let esriStyle = $(document.createElement("style"));
            if (color && esriStyle) {
                esriStyle.prop("type", "text/css");
				switch(color) {
					case "red":
						color=dark ? "#ff642e" : "#df9780";
					break;
					case "green":
						color=dark ? "#71de6e" : "#9edb9e";
					break;
					case "purple":
						color=dark ? "#b096ff" : "#c8b4ff";
					break;
					case "blue":
						color= dark ? "#69dcff" : "#afdbf7";
					break;
				} 
				
				let ruleW=dark ? "{color:" +color+";}" : "{color:#323232; background-color:" +color+";}", ruleA="{color:#07a1df;}";
				$(':root').css("--primary-color-text", dark ? color : "#323232");
				$(':root').css("--primary-color-paper", dark ? "#353535" : color);
				$(':root').css("--primary-color-paper-light", dark ? "#353535" : color);
                esriStyle.appendTo("head");		
					rule=".radio-group-checked, .lyr-btn-active " + ruleA;
					insertCSSRule(esriStyle[0].sheet, rule);		
					rule=".esri-widget, .esri-widget--button, .esri-menu, .esri-feature__content-node, .esri-popup__main-container, .esri-popup .esri-popup__pointer-direction, \
						.esri-popup .esri-popup__button, .esri-button, .esri-layer-list__item, .esri-layer-list__item-actions-menu-item, \
						.esri-ui-top-left .ibx-label-text, \
						.esri-ui-top-left .ibx-select-open-btn, .esri-popup__main-container .esri-widget__heading, .esri-search__container .esri-search__input-container .esri-input, \
						.esri-layer-list__item-toggle, .esri-input, .esri-widget, :not(.ibx-text-field) > input[type='text'], .ibx-text-field > input[type='text'], \
						.ibx-accordion-button:hover, .ibx-accordion-button.acc-btn-closed, .ibx-check-box-simple-marker, .ibx-accordion-button, .ibx-label-text a" + ruleW;
					insertCSSRule(esriStyle[0].sheet, rule);					
			}			
		},
        setTheme: function (themeName) {
			let inhSet=false;
			if(this.options.Settings.properties.hasOwnProperty("inheritEsriTheme")) {
				this.options.inheritEsriTheme=this.options.Settings.properties.inheritEsriTheme;
				inhSet=true;
			}                  
			if(typeof(themeName) === 'string') {
				//only dark or light
				if(themeName.length) {
					let dash=themeName.indexOf('-');
					if(dash!=-1) {					
						this.supportOldTheme(themeName.slice(dash+1), themeName.slice(0,dash)=="dark");	
						themeName=themeName.slice(0,dash);				
					}			
				}					
	            var links=$("link");
	            for(var v=0;v<links.length;v++){
	                var themeCss=links.eq(v);
	                var hrefCur=themeCss.prop("href");
	                if(typeof(hrefCur) === 'string' && hrefCur.search("js.arcgis.com")!=-1){
						if(themeName.length == 0){
							var prefInd=hrefCur.search("/esri");
							if(prefInd!=-1)
								hrefCur=hrefCur.substr(0,prefInd)+"/esri/css/main.css";
						}
	                    else if(!this.currentThemeName)
	                        hrefCur=hrefCur.replace("css/main","themes/"+themeName+"/main");
	                    else
	                        hrefCur=hrefCur.replace(this.currentThemeName,themeName);
	                    themeCss.prop("href",hrefCur);
	                    this.currentThemeName=themeName;
						this.setProperty("theme",themeName);
	                    break;
	                }
	            }  
				if(!inhSet)	this.options.inheritEsriTheme=true;
			}
			if(!inhSet)this.options.inheritEsriTheme= themeName.length != 0; 
        },
		getEffects: function(emphasize) {
			return emphasize ? this.options.emphasizeEffects : this.options.deemphasizeEffects;	
		},
		setUIThemeEx : function(path) {
			var request = this.getContext() + '/wfirs?IBFS_action=get&IBFS_service=ibfs&IBFS_path=' + path,
				ibfs_obj = '<rootObject _jt="IBFSMRObject" ></rootObject>';
	       
	        request += "&IBFS_object=" + ibfs_obj+this.addToken(); 
			doXmlHttpRequest(request, { asJSON: false, async: true, asXML: true, GETLimit: 0, onLoad: this.themeFileLoad.bind(this)});
		},
		themeFileLoad: function(xmlResult) {
			if (xmlResult && xmlResult.status != '403' && xmlResult.status != '0') {
	            var content = getSingleNode(xmlResult, '//ibfsrpc/rootObject/content');
	            if (content && content.firstChild) {
	                var fileCont = ibiunescape(window.atob(content.firstChild.nodeValue));
					if(typeof(fileCont)==='string')
					try { this.setUITheme( JSON.parse(fileCont));}							
					catch (e) {console.log("error loading theme file");}
				}
			}
			else console.log("error loading theme file");
		},
		getApiKey: function() {
			return esriConfig.apiKey ? esriConfig.apiKey : null;
		},
		getApiKeyEx: function() {
		   // var request = this.getContext() + '/wfirs?IBICFG_action=CFGGET&IBICFG_objtype=VARIABLE&IBICFG_handle=IBI_ESRI_ON_PREMISE';	
			var request = this.getContext() + '/wfirs?IBICFG_action=CFGGET&IBICFG_objtype=VARIABLE&IBICFG_handle=IBI_ESRI_API_KEY';		    
		    doXmlHttpRequest(request, { asJSON: false, async: true, asXML: true, GETLimit: -1, onLoad: this.setApiKey.bind(this)});
		},
		setApiKey: function(xmldoc) {
			if (xmldoc) {
		        var retcode = getNodeValue(xmldoc, "//ibwfrpc/returncode");
		        switch (parseInt(retcode, 10)) {
		            case 10000:
		                {
		                    var values = getNodes(xmldoc, "//object[@type='VARIABLE']");
		                    if (values) {
		                        var node = values.iterateNext();
		                        while (node) {
		                            var handle = getNodeValue(node, "./handle");	
									if ("IBI_ESRI_ON_PREMISE" == handle) {
										let val=getNodeValue(node, "./value");
	                                    if(val != "no value")
	                                       esriConfig.apiKey=val;
	                                    break;
									}
		                            node = values.iterateNext();
		                        }
		                    }
		                }
		                break;
		        }
			}
			this.doAfterFileProp();
		},
		setUITheme: function(uiTheme) {
			if(typeof(uiTheme) === 'string') {
				this.setUIThemeEx(uiTheme);
				return;
			}
			function ssJson2string(ssProp) {
				let retStr = null, re = /\"/g, re2=/,/g;
				if(uiTheme.hasOwnProperty(ssProp)) {
					try {
						retStr =JSON.stringify(uiTheme[ssProp]);
						retStr = retStr.replace(re, "").replace(re2, ";");
					}
					catch (e) {console.log("error loading theme");}	
				}
				return retStr;
			}
			
			let ruleW = ssJson2string("widgets"), ruleA=ssJson2string("active"), ruleH=ssJson2string("hover"), ruleL=ssJson2string("legend"), rule="";
			if(ruleW || ruleH || ruleA) {
				let esriStyle = $(document.createElement("style"));
	            if (esriStyle) {
	                esriStyle.prop("type", "text/css");
	                esriStyle.appendTo("head");
					if(ruleA) {
						rule=".radio-group-checked, .lyr-btn-active " + ruleA;
						insertCSSRule(esriStyle[0].sheet, rule);
					}
					if(ruleW) {
						rule=".esri-widget, .esri-widget--button, .esri-menu, .esri-popup__main-container, .esri-widget__table, .esri-popup .esri-popup__pointer-direction, \
							.esri-popup .esri-popup__button, .esri-button, .esri-layer-list__item, .esri-layer-list__item-actions-menu-item, \
							.esri-ui-top-left .ibx-label-text, .ibx-label-icon, \
							.esri-ui-top-left .ibx-select-open-btn, .esri-popup__main-container .esri-widget__heading, .esri-search__container .esri-search__input-container .esri-input, \
							.esri-layer-list__item-toggle, .esri-input, .esri-widget, :not(.ibx-text-field) > input[type='text'], .ibx-text-field > input[type='text'], \
							.ibx-accordion-button:hover, .ibx-accordion-button.acc-btn-closed, .ibx-check-box-simple-marker, .ibx-accordion-button, .ibx-label-text a" + ruleW;
						insertCSSRule(esriStyle[0].sheet, rule);						
						rule=".ibx-check-box-simple-marker, .ibx-glyph-ellipsis-v-sm {font-family:ibi-design-system;}";
						insertCSSRule(esriStyle[0].sheet, rule, true);
					}
					if(ruleH) {
						rule=".esri-widget--button:hover, .esri-layer-list__item-actions-menu-item:hover " + ruleH;
				//		rule="--calcite-ui-foreground-3 " + ruleH;
						insertCSSRule(esriStyle[0].sheet, rule);
					}
					if(ruleL) {
						rule=".esri-legend__service > .esri-widget__heading " + ruleL;
						insertCSSRule(esriStyle[0].sheet, rule);
					}	
				}			
			}
			if(uiTheme.hasOwnProperty("emphasizeEffects")) 
				this.options.emphasizeEffects=this.options.emphasizeEffects.concat(uiTheme.emphasizeEffects);	
			if(uiTheme.hasOwnProperty("deemphasizeEffects"))
				this.options.deemphasizeEffects=this.options.deemphasizeEffects.concat(uiTheme.deemphasizeEffects);			
		},
		getColorObj2Css: function (colorObj) {
			let clr = new Color(colorObj);
			return clr.toCss(true);
		},
		getFromRendererColor: function(renderer, propName, obj){
			if(renderer && propName) {
				let clr = new Color(renderer[propName]);
				if(obj){
					obj.hex=clr.toHex();
					obj.opacity=clr.a;
					return obj;
				}
				return clr.toCss(true);
			}			
			return null;
		},	
		updateSelectedGraphics: function(propName, propType, propValue){
			let colorRet="red";
			if(propName && typeof(propValue)!='undefined') {
				var view=this.getCurrentView(),wdg=view.ui.find("sketch"), items=wdg.updateGraphics ? wdg.updateGraphics.items : [],
				nValue=propType=="color" ? new Color(propValue) : propValue;
				if(propType=="color") colorRet= nValue.toCss(true);
				items.forEach((graphic)=> {
					let clone = graphic.clone(), done=false;
					if(propType=='text' && clone.symbol.type!='text') {
						clone.symbol={ type: "text", width: 20, 
						backgroundColor: clone.symbol.color, 
						borderLineSize: clone.symbol.outline.width,
						borderLineColor: clone.symbol.outline.color };
						colorRet=true;
					}			
					if(clone.symbol.type=='simple-line') {
						if(propName=='borderLineSize')clone.symbol.width=propValue;
						else if(propName=='borderLineColor'|| propName=='backgroundColor' || propName=='color')clone.symbol.color=nValue;
						else if(propName=='linestyle')clone.symbol.style=propValue;
						done=true;
					}			
					else if(clone.symbol.type!='text') {
						if(propName=='backgroundColor')propName='color';
						else if(propName=='borderLineSize') {
							if(clone.symbol.outline)clone.symbol.outline.width=nValue;
							else clone.symbol.outline={width:nValue};
							done=true;
						}
						else if(propName=='borderLineColor') {
							if(clone.symbol.outline)clone.symbol.outline.color=nValue;
							else clone.symbol.outline={color:nValue};
							done=true;
						}
					}
					if(clone.symbol.type=='text' && propType=='font') {
						clone.symbol.font=propValue;
						done=true;
					}
					if(!done && (clone.symbol.type=='text' || propName!='angle')) {
						clone.symbol[propName] = nValue;
						done=true;
					}
					if(done)graphic.symbol=clone.symbol;
				});
			}
			return colorRet;
		},	
		setRendererColor: function(renderer, propName, color, opacity){
			if(renderer && propName) {
				let clr=new Color(color);
				renderer[propName] = clr;	
				return clr.toCss(true);			
			}
			return "red";
		},
		setViewBackground: function(color) {
			let clr=new Color(color), view=this.getCurrentView();
			if(view.environment) 
				view.environment.background = {
		              "type": "color",
		              "color": clr
		            };
			else {
				view.environment={
					background : {
		              "type": "color",
		              "color": clr
		            }
				};
			}
		},
		getViewBackgroundColor: function(obj){
			var othis=this, view=othis.getCurrentView(), back=othis.is3dView() ? view.environment.background : view.background;
			var clr = back ? new Color(back.color) : new Color();
			if(obj){
				obj.hex=clr.toHex();
				obj.opacity=clr.a;
				return obj;
			}
			return clr.toCss(true);
		},
		doUpdateViewBackgroundColor:function(color, opacity) {
			var othis=this, view=othis.getCurrentView(), clr = new Color(color), 
			rgba=clr.toRgb(); clr.a=opacity;
			othis.setProperty("background",clr.toCss(true));
			if(othis.is3dView()) {
				if(view.environment.background)
					view.environment.background.color=clr;
				else
					view.environment.background = {
					      type: "color",
					      color: clr
					    };					
			}
			else {
				if(view.background)	view.background.color=clr;
				else view.background = {color: clr };
			}
		//	view.background.color=clr;
			var map=othis.getCurrentMap();
			if(map.basemap)
				map.basemap=null;
		},
        isSameTTGraphic: function(testGraphic, checkTT) {
            var othis=this;
            for(var l=0;l<othis.hlhandles.length;l++){
                if(othis.isSameGraphic(othis.hlhandles[l].graphic,testGraphic)) {
                    if(checkTT) return othis.hlhandles[l].tooltip; else return true;
                }
            }
            return false;
        },
        ttAddedToGraphic: function(graphic) {
            var othis=this;
            for(var l=0;l<othis.hlhandles.length;l++){
                if(othis.isSameGraphic(othis.hlhandles[l].graphic,graphic)) {
                    othis.hlhandles[l].tooltip=true;
                    break;
                }
            }
        },
        setContext: function() {
            var othis=this; 
			intl.setLocale(document.documentElement.lang);
			if(typeof (WFGlobals) != 'undefined' && WFGlobals.ses_auth_val) {
    			othis.options.csrfTokenValue = WFGlobals.getSesAuthVal();
        		othis.options.csrfTokenName = WFGlobals.getSesAuthParm();
			}
        },
        isClusterGraphic: function(graphic) {
            return graphic && graphic.attributes && graphic.attributes.hasOwnProperty("clusterId");
        },
        isSameGraphic: function(gr1,gr2) {
           
            return gr1 && gr2 && gr1.layer && gr2.layer && gr1.attributes &&  gr2.attributes && 
					((gr1.layer.id == gr2.layer.id) && 
					(gr1.attributes["ObjectID"] && gr1.attributes["ObjectID"] == gr2.attributes["ObjectID"]) ||
                    (gr1.attributes["FID"] && gr1.attributes["FID"] == gr2.attributes["FID"]) ||
                    (gr1.attributes["_FID"] && gr1.attributes["_FID"] == gr2.attributes["_FID"]) ||
                    (gr1.attributes["clusterId"] && gr1.attributes["clusterId"] == gr2.attributes["clusterId"]));            
        },
        endSelection: function(){
			var othis=this;
			if(othis.showUIControls()){
				this.showDistanceBox(false); 
	            this.options.userValue="selPan";
	            $(".cmdRadioGroup").ibxHRadioGroup("selected", $(".sel-pan"));
	            this.options.userValue = "selPan";        
			}
                
        },
        updateSelectionList: function (graphic, layerview, selType) {
            var othis = this, wasSel=false;
            othis.hideTooltips();
            if(othis.selections.length) {
                if(!othis.options.multiselect && othis.options.userValue=="selSingle")
                    wasSel=othis.removeSelHighlights(graphic);
                else if(selType=="selSingle" || selType=="selCustPolygon"){
                    for(var kk=0; kk<othis.selections.length; kk++) {  
                        var temp = othis.selections[kk], tHandle=temp.handle;
                        if(othis.isSameGraphic(temp.graphic, graphic)) {                        
                            othis.selections.splice(kk, 1); 
                            tHandle.remove();
                            return false;
                        }
                    } 
                }
            }
            //add new graphic
            if(!wasSel && (selType != "selSingle" || othis.selections.length==0 || selType != "selPan"))
                othis.selections.push({graphic:graphic,handle:layerview.highlight(graphic)});        
            return true;
        },
        
        setMainOptions: function(mainLayer) {
			if(mainLayer) {
            this.options.highLight = mainLayer.ttHighlight || { 
                "color": "white",
                "haloColor": "white",
                "haloOpacity":0.8,
                "fillOpacity": 0.5 
            };
            this.options.selHighLight = mainLayer.selHighLight || { 
                "color": "white",
                "haloColor": "black",
                "haloOpacity": 0.8,
                "fillOpacity": 0 
            };  
			
				if(mainLayer.hasOwnProperty("layersOrder"))  
	                this.options.layersOrder= mainLayer.layersOrder; 
	            if(mainLayer.hasOwnProperty("getGeometry"))  
	                this.options.getGeometry= mainLayer.getGeometry;     
			}                       
        },
        isShowUnits: function() {
            return this.unitsCtrlVis;
        },
        isSelectedUnit: function(U) {
            return U == this.selUnit;
        },
        esriBaseMaps: ['streets-vector', 'satellite', 'hybrid', 'topo-vector', 'gray-vector', 'oceans', 'national-geographic', 'terrain', 'osm', 'dark-gray-vector', 'streets-night-vector', 'streets-relief-vector', 'streets-navigation-vector'],
        
        setHighlightOpt: function(bSelection) {
            this.getCurrentView().highlightOptions = bSelection || this.selections.length ? this.options.selHighLight : this.options.highLight;           
        },
        getSuitableView: function(extents){
            var viewInfo=extents, niceZoom=9, view=this.getCurrentView();
            if(Array.isArray(extents) && extents.length==1 && extents[0].width==0 && extents[0].height==0) {
				view.constraints.snapToZoom=true;
                viewInfo= { "center" : extents[0].center, "zoom" : niceZoom };
			}
            else if(extents && extents.width==0 && extents.height==0) {
				view.constraints.snapToZoom=true;
                viewInfo= { "center" : extents.center, "zoom" : niceZoom };
			}
			else {
				view.constraints.snapToZoom=false; 
				if(Array.isArray(viewInfo)) {
					viewInfo=[];
					extents.forEach(function(ext){
						if(ext) {
							var useExt=ext.clone();
							useExt.expand(1.2);
							viewInfo.push(useExt);
						}
					});
				}	
				else {
					viewInfo=[];
					var useExt=extents.clone();
					
					if(!useExt.spatialReference.wkid)
						//useExt=webMercatorUtils.geographicToWebMercator(useExt);
						useExt.spatialReference.wkid=4326;
				//	else if(useExt.spatialReference.wkid != view.spatialReference.wkid)
				//		useExt = webMercatorUtils.webMercatorToGeographic(useExt);
					useExt.expand(1.2);
					viewInfo.push(useExt);
				}		
			}				
            return viewInfo;
        },
		isDefaultViewInfo: function(initialViewInfo) {
			if(initialViewInfo.hasOwnProperty("center") && initialViewInfo.hasOwnProperty("zoom")) {
				if(Array.isArray(initialViewInfo.center) && initialViewInfo.center.length==2)
					return initialViewInfo.center[0] == 0 && initialViewInfo.center[1] == 0 && initialViewInfo.zoom==2;
			}
		},
		goToHomeExtent: function(keepWait){
			var othis=this, view = othis.getCurrentView();	
			//check layers			
			othis.addHomeButton();
			if(othis.options.viewpoint) {
				view.goTo(othis.options.viewpoint);
				return;
			}	
			//data layers only
			if(othis.extents.length==0){				
				for(var k = 0; k<othis.layerList.length; k++) {
					if(this.layerList[k].layer && this.layerList[k].layer.type != "stream" && 
							this.layerList[k].layer.fullExtent && othis.isDataLayer(this.layerList[k].layer.id))
						othis.extents.push(this.layerList[k].layer.fullExtent);
				}
            }	
			if(othis.extents.length==0){				
				for(var k = 0; k<othis.layerList.length; k++) {
					if(othis.layerList[k].layer && othis.layerList[k].layer.type != "stream" && 
							othis.layerList[k].layer.fullExtent)
						othis.extents.push(this.layerList[k].layer.fullExtent);
					else if(othis.layerList[k].layer && othis.layerList[k].layer.type == "group")
						othis.getGroupLayerExtent(othis.layerList[k].layer,othis.extents);
				}
            }	
			if(othis.initialViewInfo) { 
				var camera=othis.initialViewInfo.hasOwnProperty("camera");
				if(othis.initialViewInfo.hasOwnProperty("zoomToOnLoad") && 
					typeof(othis.initialViewInfo.zoomToOnLoad) === 'string' && othis.initialViewInfo.zoomToOnLoad.length) {
					var lId=othis.initialViewInfo.zoomToOnLoad;                
                    if(!othis.setTargetLayer(lId)) {
					 var homeInt = -1;                
	                 var homemF = function () {                    
	                    if(othis.setTargetLayer(lId))
	                        homeInt = window.clearInterval(homeInt);
		                };
		                homeInt = window.setInterval(homemF, 100);        
					}
					return;
				}
				else if(othis.is3dView() && camera) {
						view.camera = new Camera(othis.initialViewInfo.camera);
				}
				else if(Array.isArray(othis.extents) && othis.extents.length){
					view.constraints.snapToZoom=true; 
					if(othis.isDevelopmentMode() && othis.layerList.length==0 && !othis.getCurrentMap().component) view.goTo({ "center" : othis.extents[0].center, "zoom" : 3});
					else if(othis.is3dView() && camera) view.goTo(othis.initialViewInfo);
					else {
						let where=othis.initialViewInfo.hasOwnProperty("center") && !othis.isDefaultViewInfo(othis.initialViewInfo) ? othis.initialViewInfo : othis.getSuitableView(othis.extents);
						view.goTo(where).then((resolvedVal) => {
							if(!keepWait)
							othis.wait(false);	
						  }, (error) => {
						    console.log(error);
							othis.wait(false);
						  });
					}
				}
				else view.goTo({ "center" : [-112, 38], "zoom" : 3 });
			}                        
            else {
				if(othis.isDevelopmentMode() && othis.layerList.length==0)
					view.goTo({ "center" : othis.extents[0].center, "zoom" : 3});
				else 
					view.goTo(othis.getSuitableView(othis.extents));
			}
		},
		is3dOnlyWidget: function(wId){
			var othis = this, prop=othis.options.Settings.properties[wId];
			return prop && prop.viewType=="3d";
		},
		showUIControls: function(){
			var othis = this, prop=othis.getWidgetProperties('noUIcontrols');
			return prop ? false : true;
		},		
		hideOtherTools: function(tool){
			var othis=this, curView = othis.getCurrentView(), members=othis.getWidgetProperties("interaction").members, wait=false;
			if(typeof(members)==='object'){
				Object.keys(members).forEach(function(wd){
					if(wd!=tool){
						var comp=curView.ui.find(wd),button=$(".btn"+wd);            
			            if(comp){
							var cont=$(comp.container);
							if(cont.is(":visible")) {
								if(wd=="measurement")othis.clearMeasurements();
								else if(wd=="direction")comp.viewModel.reset();
								else if(wd=="sketch")othis.stopSketch();
								else if(wd=="location")comp.viewModel.mode="live";
								cont.fadeOut(); button.removeClass("_onControlClose");wait=true;
							}
						}
						button.removeClass(othis.buttonActive);
					}
					else
						if(wd=="measurement")othis.clearMeasurements();
				});
			}
			return wait;
		},
		createInteractionWidget: function(prop,key,dflt) {
			var othis = this, view=othis.getCurrentView();
			var create=dflt===true || prop.members[key].create,button=$(".btn"+key);
			if(create && (key=='direction' || key=='search') && this.isonPremiseApi()) {
				button.hide();
				return;
			}
			if(!view.ui.find(key) && (create || othis.devTools ||  othis.isPreviewMode())) {
				var comp=othis.addViewUI(key, true);
				if(comp) {
					view.ui.add({component: comp, position: prop ? prop.attachTo : "top-right", index: prop ? prop.index : 0});
					if(key=="measurement")	othis.setMeasuringTools();
					if(key=="direction") comp.apiKey=prop.members[key].apikey;
					if((key==dflt && prop.members[key].create===true) || dflt===true){
						button.addClass(othis.buttonActive);
						if(key=="measurement"){
							var meas=$(comp.container).find(".measTools");
							if(!meas || meas.length==0){
								meas=view.type=='2d' ? $(".measTools") : $(".measTools3d");
								meas.appendTo($(comp.container)).css("display","block");
							}
							othis.clearMeasurements();
						}
					}
					else
						$(comp.container).hide(); 
					othis.setInteractionTrigger(key);
				}
			} 
			if(!create) 
				button.hide();
		},
		getRouteLayer: function(lId) {
			for(var k = 0; k<this.layerList.length; k++) {
				let lr=this.layerList[k].layer;
				if(lr && lr.type == "route")
					return lr;
				else if(lr && lr.type == "group") {
					var layersThere=lr.layers.items;
					for(let i = 0; i<layersThere.length;i++) {
						if(layersThere[i].type=="route")
							return layersThere[i];
					}
				}
			}
		},
		doInteractionTrigger: function(key){
			var othis=this, wait=othis.hideOtherTools(key), button=$(".btn"+key);
			setTimeout(function(){if(othis.toggleUIwidget(key)){
				if(key=="direction") {
					let curView=othis.getCurrentView(), comp=curView.ui.find(key), rl= othis.getRouteLayer(); 
					if(rl && comp)
					comp.layer=rl;
				}
				else if(key=='sketch')othis.startSketch();
				button.addClass(othis.buttonActive);
			} 
            else {
				if(key=='sketch')othis.stopSketch();
				button.removeClass(othis.buttonActive);
			}
			if(othis.devTools) othis.updateInterWidgetSetting(key);},wait ? 500 : 10); 
		},
		setInteractionTrigger: function(key){
			var othis = this;
			$(".cmd-" + key).off("ibx_triggered");
			$(".cmd-" + key).on("ibx_triggered", function(e){
				othis.doInteractionTrigger(key);				
            });
		},
		createInteractionTools: function(prop) {
			if(prop){
				var othis = this, view=othis.getCurrentView(), dflt= prop.default;
				if(typeof(prop.members)==="object"){
					Object.keys(prop.members).forEach(function(key){
						othis.createInteractionWidget(prop,key,dflt);
					});
				}
				else if(dflt) {
					$(".btn-inter-type").not(".btn"+dflt).remove();
					othis.createInteractionWidget(prop,dflt,true);
				}
			}
		},
		updateLocationMeasurement: function(prop) {
			//else if(key=='direction')									$(".btnToggleDir").addClass(othis.buttonActive);
			var othis = this, view=othis.getCurrentView();
		},
		addLocateWidget:function(key){
			if(!key)key="locate";
			var othis = this, view=othis.getCurrentView();
			if(!view.ui.find(key)) {
				let comp = othis.addViewUI(key); 
				if(comp){
					$(comp.container).hide();
					$(".cmd-locate").on("ibx_triggered", function(e){	
		                othis.doLocate();
					});
				}
				else $(".btnlocate").remove();
			} 
		},
		
		updateToolBarButtonsState: function() {
			let mainTB = $(".map-container-tbar"), view=this.getCurrentView();
			const keys=["layers", "legend", "basemaps", "search", "measurement", "direction", "location", "sketch","scalerange"], 
			buttons=["btnToggleTOC", "btnToggleLE","btnToggleBM","btnsearch","btnmeasurement","btndirection","btnlocation","btnsketch","btnScalerangeSlider"];
			for(let k = 0; k<keys.length; k++){
				let comp=view.ui.find(keys[k]);
				if(comp) {
					let btn = mainTB.find("."+buttons[k]);
					if($(comp.container).is(":visible")) btn.addClass(this.buttonActive); else btn.removeClass(this.buttonActive);
				}
			}			
		},
		createWidgets: function(){
			var othis = this, view=othis.getCurrentView(), mainTB, mTBProp, inter=false, curViewType=othis.getWidgetProperties("viewType");	
			if(0){
				return;
			}
			else if(othis.tdgchart.chartType === "com.ibi.geo.map") {
				Object.keys(othis.options.Settings.properties).forEach(function(key){
					var prop=othis.options.Settings.properties[key];
					if(prop.hasOwnProperty("attachTo") && !view.ui.find(key) && (!prop.hasOwnProperty("viewType") || 
						prop.viewType==curViewType) && (!prop.hasOwnProperty("create") || prop.create || 
							((key=='scalerange' || key=='discover' || key=='timeslider') && othis.isPreviewMode()))){
						if(key=="interaction"){
							othis.createInteractionTools(prop);inter=true;
						}
						else if(!othis.isonPremiseApi() || !(key=='basemaps'))
							othis.addViewUI(key);
					}  
					else if(key=="locate"){
						if(prop.hasOwnProperty("create") && prop.create && !othis.isonPremiseApi())
							othis.addLocateWidget(key);
						else $(".btnlocate").hide();
					}
					else if(key=="layers" || key=="legend" || key=="basemaps" ||  key=="bookmarks"){
						if(othis.devTools  && (!prop.hasOwnProperty("viewType") || 
							prop.viewType==curViewType))othis.addViewUI(key);
						if(key=="layers")$(".btnToggleTOC").hide();
						else if(key=="legend")$(".btnToggleLE").hide();
						else if(key=="basemaps")$(".btnToggleBM").hide();
					//	else if(key=="bookmarks")$(".btnSaveCustom").hide();
					}
				});
				var noIndex=[];
				Object.keys(othis.options.Settings.properties).forEach(function(key){
					var prop=othis.options.Settings.properties[key];
					if(prop.hasOwnProperty("attachTo")){
						var comp=view.ui.find(key);
						if(comp){
							var sProp=othis.getWidgetProperties(key);
							if(key=='maintoolbar' && othis.showUIControls()) {
								mainTB = $(".map-container-tbar");
								mTBProp=sProp;
								if(!sProp.visible)
					                $(comp.container).hide(); 
								else $(comp.container).show(); 
							}
							else if(sProp){
								if(othis.isIndexNeeded(sProp.attachTo))
									othis.addWidget2View(sProp, view, comp, "", true);									
								else
									noIndex.push({component: comp, position: sProp.attachTo});									
								if(!sProp.visible && key!='camera') {
					                if(key=='legend'){$(".btnToggleLE").removeClass(othis.buttonActive);$(comp.container).css("width","auto");}
									else if(key=='layers')$(".btnToggleTOC").removeClass(othis.buttonActive);
									else if(key=='basemaps')$(".btnToggleBM").removeClass(othis.buttonActive);
					                $(comp.container).hide(); if(!comp.container) $(comp).hide();
					            }
								else if(key=='layers') {
									$(".btnToggleTOC").addClass(othis.buttonActive);
									$(comp.container).hide(); 
									
									setTimeout(function(){othis.setupLayersList(comp);$(comp.container).show();},1000); 
								}
								else if(key=="devTools"){
									var wdg = othis.activeWidgets.filter((function (w) {
							             return (w.id === key);
							        }));
									if(wdg)
										wdg[0].expand(); 
								}
								else if(key=='camera') {
									if(prop.viewType!=curViewType)
										$(comp.container).hide();
									else if(sProp.visible) {
										var wdg = othis.activeWidgets.filter((function (w) {
							             return (w.id === key);
								        }));
										if(wdg) setTimeout(function(){wdg[0].expand();},2000);
									}
								}
									
								else if(key=="basemaps") {
									$(".btnToggleBM").addClass(othis.buttonActive);
									if(othis.devTools)setTimeout(function(){othis.addCustomBaseMap(comp);},2500); 
								}
								else if(key=="bookmarks")inter=true;
								else {
									if(key=='legend'){$(".btnToggleLE").addClass(othis.buttonActive);$(comp.container).css("width","auto");}
									else if(key=='layers')$(".btnToggleTOC").addClass(othis.buttonActive);
									else if(key=='basemaps')$(".btnToggleBM").addClass(othis.buttonActive);
								}
							}
						}
						else if(key=="interaction")
							othis.updateLocationMeasurement(sProp);
						else if(key=="maintoolbar")
							$(".map-container-tbar").hide();
						else if(key=='basemaps')
							$(".btnToggleBM").hide();
					}  
				});
				//add leading and trailing view.ui.move({component: comp, position: sProp.attachTo});
				if(noIndex.length) noIndex.forEach((obj) =>{view.ui.move(obj);});
			}
			else {
				if(!othis.isonPremiseApi()) {
					var bmaps=othis.addViewUI("basemaps");   
					$(bmaps.container).hide(); 
					othis.addViewUI("search"); 
				}
				else {
					$(".btnToggleBM").hide();
				}           
	            var led = othis.addViewUI("legend");  
	            var layers = othis.addViewUI("layers");//, locate=othis.addViewUI("locate"), devTools=othis.addViewUI("devTools"); 
	            
				$(".btnToggleLE").addClass(othis.buttonActive);
				$(".btnToggleTOC").addClass(othis.buttonActive);
				othis.addLocateWidget("locate");
	      //$(".btnToggleView")
	            $(led.container).css("width","auto");
	            
				$(".btnToggleView").hide();
				mainTB = $(".map-container-tbar");          
                var buttons = mainTB.find(".ibx-button");
                buttons.removeClass("ibx-button"); buttons.addClass("esri-widget--button");
                buttons = mainTB.find(".ibx-radio-button");
                buttons.removeClass("ibx-radio-button"); buttons.removeClass("ibx-check-box"); 
                buttons.addClass("esri-widget--button");

                var tbW = new Widget({ view: view, id: "maintoolbar" });
                view.ui.add({component: tbW, position: "manual"});
                tbW.render = function(){
                    mainTB.css("visibility", "visible"); 
                    var wCont=$(tbW.container);
                    mainTB.appendTo($(wCont)); 
                    wCont.css({"top": "10px", "left":"calc(50% - " + wCont.width()/2 + "px)"});
                    return ( '<div></div>'        
                    );
                }; 
			    setTimeout(function(){othis.setupLayersList(layers);$(layers.container).show();},1000);
			}
			
            if(othis.options.inheritEsriTheme) {				
                othis.currentTT=$("<div class='tooltipcontainerEsri esri-widget esri-popup--shadow'></div>"); 
                othis.currentTT.appendTo( $(".map-container-frame"));
                if(mainTB && (!mTBProp || mTBProp.visible)) {
                    mainTB.find(".btnToggleTOC").find("div").first().attr("class","esri-icon-layers");
                    mainTB.find(".btnToggleLE").find("div").first().attr("class","esri-icon-layer-list");
                    mainTB.find(".btnToggleBM").find("div").first().attr("class","esri-icon-basemap");
                    mainTB.find(".sel-extent").find("div").first().addClass("esri-icon-sketch-rectangle");  
                    mainTB.find(".sel-polygon").find("div").first().addClass("esri-icon-polygon");
					mainTB.find(".sel-custpolygon").find("div").first().addClass("ds-icon-selection-polygon");
                    mainTB.find(".sel-circle").find("div").first().addClass("esri-icon-arrow-down-circled");
					mainTB.find(".btnToggleDir").find("div").first().addClass("esri-icon-directions");
					
					mainTB.find(".btnDistToolMs").find("div").first().addClass("esri-icon-measure-line"); 
                    mainTB.find(".btnAreaToolMs").find("div").first().addClass("esri-icon-measure-area"); 
					mainTB.find(".btnClearMs").find("div").first().addClass("esri-icon-trash"); 
                }
            }
            else {
                if(mainTB && (!mTBProp || mTBProp.visible)) {
                    mainTB.find(".sel-extent").find("div").first().addClass("ds-icon-selection-square");
                    mainTB.find(".sel-polygon").find("div").first().addClass("ds-icon-selection-marquee");
                    mainTB.find(".sel-circle").find("div").first().addClass("ds-icon-selection-circular");  
					mainTB.find(".sel-custpolygon").find("div").first().addClass("ds-icon-selection-polygon");
				//	if(othis.getCurrentMap().portalItem)
				//		mainTB.find(".btnToggleView").remove();    
                }
                othis.currentTT.appendTo( $(".map-container-frame"));
            }
			$(".map-container-frame")[0].chartRoot = document.documentElement; 
		 	if(!inter && mainTB)
				mainTB.find(".interactionTools").hide();
		},
		addHomeButton: function(){
			var othis = this, view=othis.getCurrentView(), zoomComp=view.ui.find("zoom");
		//	if(othis.isPreviewMode() && zoomComp)
		//		view.ui.remove(zoomComp);
			if(zoomComp && othis.showUIControls()) {
				var homeB = $(zoomComp.container).find(".home-btn");
	            if (!homeB || homeB.length == 0) {
	                var home = $("<div tabindex='0' title='" +getTransString('HomeExtent')+ "'></div>").ibxButtonSimple({
	                    aria: { label: getTransString('HomeExtent') },
	                    class: "home-btn esri-widget--button esri-widget esri-interactive", glyphClasses: "fa fa-home"
	                });
	                home.removeClass("ibx-button-simple");
	                home.insertAfter($(".esri-zoom").children().first());
	                $(".esri-attribution__sources").removeClass("esri-interactive");
	                home.on("click", function (e) {
						othis.goToHomeExtent();
	                });
	            }      
			}
			   
		},
        doAfterAllLoaded: function(){
            var othis = this, view=othis.getCurrentView();
			if(!othis.initFinal) {
				othis.initFinal=true;
	            othis.setHighlightOpt(true);
	            view.emit("add-layers-completed", {});  
	            othis.setSelectionTools();	            
	            othis.addCssOverride(); 
	    //        othis.goToHomeExtent();  
		//		othis.startPreviewWatch();
		        if(othis.transIbi) setTimeout(function () { othis.wait(false);}, 1000); 
				else if(othis.options.numOfLayers==0)othis.wait(false);
			}
        },
		wait: function(show) {
			if(isIbxLoaded()){
				var othis = this;
				ibxBusy.busy.show(show, $(".map-container-frame")[0]);
			//	this.addOverlayWidget(show, $.ibi.CONTAINER_MESSAGE_TYPE_LOADING);
			} 
			if(this.isPreviewMode() && !show) $(".esri-component").addClass("wfc-map-disabledwidgetPreview"); 
		},
		doCopyCamera: function(justCam) {
			var othis = this, view = othis.getCurrentView();
			if(view.camera) {
				var camera={};
				camera.fov=parseInt(view.camera.fov,10);
				camera.heading=parseInt(view.camera.heading,10);
				camera.tilt=parseInt(view.camera.tilt,10);
				camera.position={ 
					latitude:parseFloat(view.camera.position.latitude).toFixed(2),
					longitude:parseFloat(view.camera.position.longitude).toFixed(2),
					z:parseInt(view.camera.position.z,10),
					spatialReference: {
						wkid: view.camera.position.spatialReference.wkid
					}
				};	
				if(justCam)
					return camera;			
				var re = /\,/g, re2 = /\}/g, re3=/\{/g, text = '"camera": ' + JSON.stringify(camera).replace(re,",\n\t").replace(re2,"}\n\t").replace(re3,"{\n\t");
				
				var tempInput = $(document.createElement('textarea'));
		        tempInput.appendTo($(document.body));
				tempInput.val(text);tempInput.select(); document.execCommand('copy'); tempInput.remove();
				console.log(text);
				return text;
			}
		},
		isLayerTypeValid: function(layer) {
			return true;/*
			return layer ? layer.type === "feature" || layer.type === "map-image" || layer.type === "media" ||layer.type === "tile" || layer.type === "vector-tile" ||
					layer.type === "imagery-tile" || layer.type === "elevation" || layer.type === "stream" || layer.type === "csv" ||
					layer.type === "imagery" ||layer.type === "group" ||layer.type === "graphics" || layer.type === "route": false;*/
		},
		sync: function(){
			if(this.camera && this.is3dView())
				$(this.camera).geoUICamera("update");
		},
		addEditsEvent: function(layer) {
			var othis=this;
			if(layer.type=="group") {
				layer.layers.forEach(function(lay) {
					othis.addEditsEvent(lay);
				});
			}
			else if(layer.type=="feature") {
				layer.on("edits", function (event) {                            
                    var extractObjectId = function (result) {
                        return result.objectId;
                    };
                    var updates = event.updatedFeatures.map(extractObjectId);
                    var added = event.addedFeatures.map(extractObjectId);
                    var del = event.deletedFeatures.map(extractObjectId);
                    console.log("deletedFeatures: " + del.length  + " " + "addedFeatures: " + added.length);
                    
                    if(updates.length>1) {
                    	othis.updatingFeature = false;
                     //   layer.refresh();
                    }
					
					if(othis.runtimeRefresh){
						layer.refresh();
						var layertoset=layer;
						setTimeout(function () {
							othis.setPopuptemplates(layertoset);
							othis.wait(false);
							othis.continueRefreshing();
						}, 250); 
					} 
                    else if(del.length && added.length)
                    	setTimeout(function () {layer.refresh(); othis.refreshGo();}, 250); 
					else if(del.length && othis.refreshing){
						layer.refresh(); othis.continueRefreshing();
					}
                    othis.updateClearSelectionButtonsState();
                });
			}
		},
		getServiceDescription: function() {
			return this.options.servDesc;
		},
		startDriveDiscover: function(start) {
			this.options.discoverType=start;
			if(start)
			this.removeViewGraphics();
		},
/*
e="manual" data-ibxp-selected="true">@ibxString('mlmap.manual')</div>
		   			<div class="mlm-method-item" data-ibx-type="ibxSelectItem" data-ibxp-user-value="locate" >@ibxString('mlmap.mylocate')</div>	
		   			<div class="mlm-method-item" data-ibx-type="ibxSelectItem" data-ibxp-user-value="search"*/
		//driving selection
		selectByDrivingTime: function(mapPoint) {
			var othis = this, view=othis.getCurrentView();
			let locationGraphic = new Graphic({
			    geometry: mapPoint,
			    symbol: {
			      type: "picture-marker",
			      url: this.options.esriPath + "/esri/images/search/search-symbol-32.png",
			      size: 24,
					height: 24,
					width: 24
			    }
			  });
			if(this.options.servDesc) {
			//	view.graphics.removeAll();
				 view.graphics.add(locationGraphic);
				//  var driveTimeCutoffs = [60]; // Minutes (default)
				  var serviceAreaParams = othis.createServiceAreaParams(
				    locationGraphic,
					view.spatialReference
				  ); 
				   othis.executeServiceAreaTask(serviceAreaParams, locationGraphic);
				//   view.graphics.remove(locationGraphic);
			}			 
		},
		createServiceAreaParams: function(locationGraphic, outSpatialReference) {
		  // Create one or more locations (facilities) to solve for
			  var featureSet = new FeatureSet({
			    features: [locationGraphic]
			  });
			  // Set all of the input parameters for the service
			  var srvAreaParams={};
			  $(this.discover).geoUIDiscover("getParameters", srvAreaParams);
			  var taskParameters = new ServiceAreaParams({
			    facilities: featureSet, // Location(s) to start from
				travelMode: srvAreaParams.travelMode,
				timeOfDay: srvAreaParams.timeOfDay,
				travelDirection: srvAreaParams.travelDirection,
			    defaultBreaks: srvAreaParams.defaultBreaks, // One or more drive time cutoff values
			    outSpatialReference: outSpatialReference // Spatial reference to match the view
			  });
			  return taskParameters;
		},
		getTotalNumberOfFeatures: function() {
			var map=this.getCurrentMap(), view=this.getCurrentView(),
	        features=[];
	        map.layers.forEach((layer)=>{ 
				if(this.isDataLayer(layer.id) && layer.visible) 
					features.splice(0,0,...layer.source.items);
			});
			return features.length;
		},
		updateCommuteInformation: function(serviceAreaParams) {
			var map=this.getCurrentMap(), defaults=getRouteDefaults(), useEsri=this.options.inheritEsriTheme;
			var rl=new RouteLayer({ defaultSymbols: defaults}), destGraphic=this.discoverGraphic;
			map.layers.forEach((layer)=>{ 
				if(layer.visible && layer.type=="feature" && layer.source.length) {
					var items=layer.source.length
					layer.source.items.forEach((gr)=> {	
						if(gr.geometry.type=="point") {
							let stops=[];
							if(serviceAreaParams.travelDirection && serviceAreaParams.travelDirection=="from-facility") {
								stops.push({ locationType: "stop",  geometry: destGraphic.geometry });
								stops.push({ locationType: "stop",  geometry: gr.geometry });							
							}
							else {
								stops.push({ locationType: "stop",  geometry: gr.geometry });
								stops.push({ locationType: "stop",  geometry: destGraphic.geometry });
							}							
							rl.stops=stops;
							this.wait(true);
							rl.solve( {travelMode:serviceAreaParams.travelMode,										
										startTime:serviceAreaParams.timeOfDay || new Date() }).then((results)=> {					 
			                    var content=gr.popupTemplate.content;		
								if(content) {
									if(!gr.popupTemplate.contentTemp)
										gr.popupTemplate.contentTemp=$(content).clone()[0];
									else 
										content=gr.popupTemplate.content=$(gr.popupTemplate.contentTemp).clone()[0];
										
									let dist=results.routeInfo.totalDistance;
									if(serviceAreaParams.travelMode.distanceAttributeName=="miles" || serviceAreaParams.travelMode.distanceAttributeName=="kilometers")
										dist=parseFloat(dist/1609).toFixed(1);
									let drTimeH=parseInt(results.routeInfo.totalDuration/60,10), drTimeMin=parseInt(results.routeInfo.totalDuration%60,10), 
									drTime= drTimeH ? drTimeH+' '+getTransString(drTimeH>1 ? 'hours2' : 'hour' )+' '+drTimeMin+' '+getTransString('mins') : drTimeMin+' '+getTransString('mins');

									addContentLine($(content), getTransString('travel_time_min'), drTime);
									addContentLine($(content), getTransString('travel_distance'), this.formatDistanceToLocal(dist) + ' ml');
									items--;
									if(items==0)this.wait(false);
								} 
			                },
						    (error)=> {
						      console.log(error.message);
								items--;
								if(items==0)this.wait(false);
						    }
							);
						}
					});
				}
			});
		},
		showDirectionsFromSelected: function(startPoints, destGraphic, course) {
			//this.showDirectionsForSelected(this.selections, locationGraphic);
			if(!startPoints) startPoints=this.selections; 
			if(!destGraphic)destGraphic=this.discoverGraphic;
			if(Array.isArray(startPoints) && destGraphic){
				let map=this.getCurrentMap(), rt=map.findLayerById(discoverRoutesLayerId);
				if(rt)map.remove(rt);
				var arrRgrs=[], routs=[];
	            startPoints.forEach((selPt)=> {
	                arrRgrs.push(this.getRealGraphic(selPt.graphic));
	            });
				arrRgrs.forEach((gr)=> {		
					let layer=gr.layer, stops=[];
					if(gr.geometry.type=="polygon") {
						gr.geometry.paths.forEach(function (stop) {	
							//stops.push({ locationType: "stop",  geometry: { x: stop[1][0], y: stop[1][1] } });					
							//stops.push({ locationType: "stop",  geometry: { x: stop[0][0], y: stop[0][1] } });								
	                    });
					}
					else if(gr.geometry.type=="point") {
						if(course && course=="from-facility") {
							stops.push({ locationType: "stop",  geometry: destGraphic.geometry });
							stops.push({ locationType: "stop",  geometry: gr.geometry });						
						}
						else {
							stops.push({ locationType: "stop",  geometry: gr.geometry });
							stops.push({ locationType: "stop",  geometry: destGraphic.geometry });
						}						
					}
					var tlt=gr.attributes.hasOwnProperty("name") ? gr.attributes["name"] : "",
					 rl=new RouteLayer({ title: tlt, stops, 
					defaultSymbols: getRouteDefaults()});
					rl.on("layerview-create", (event)=>{							
						this.updateDirections(rl, "automobile");					        
					});
					rl.on("layerview-destroy", function(event){
					//	alert("layerview-destroy");					        
					});
					routs.push(rl);
	            });
				if(routs.length) {
					var fl=null;
					//if(routs.length>1) {
					fl = new GroupLayer({ 
		                id: discoverRoutesLayerId,
		                title: getTransString("discoverRoutes") }	);
					fl.addMany(routs);
					//}
				//	else
				//		fl = routs[0];
					this.getCurrentMap().add(fl);
				}
			}
			
		},
		executeServiceAreaTask: function(serviceAreaParams, locationGraphic) {
			var view=this.getCurrentView();
			this.wait(true);
			
	    	return serviceArea.solve(this.routeUrl, serviceAreaParams).then(
			    (result)=> {
			      if (result.serviceAreaPolygons.length || result.serviceAreaPolygons.features.length) {
			        // Draw each service area polygon
					let serviceAreaPolygons=result.serviceAreaPolygons.length ? result.serviceAreaPolygons : result.serviceAreaPolygons.features;
					var last=null;
			        serviceAreaPolygons.forEach((graphic)=> {
			          graphic.symbol = {
			               type: "simple-fill",
			               color: "rgba(255,50,50,.25)"
			            };
						if(graphic.attributes) graphic.attributes['private']="servicearea";
						else graphic['attributes'] = { private: "servicearea" };
			            view.graphics.add(graphic, 0);
						if(!last || geometryEngine.within(last, graphic.geometry))
							last=graphic.geometry.clone();
			        });
					if(last) {
						view.goTo(last).then((resolvedVal) => {
							this.wait(false);
							setTimeout(()=>{
                                this.doContSelection(last, false);	
								setTimeout(()=>{									
								let msg = this.selections.length + " selected out of " + this.getTotalNumberOfFeatures() + "\nDo you want to update commute information?"; 
								this.discoverGraphic=locationGraphic;
								
								//alert(msg);
								if(confirm(msg))
									this.updateCommuteInformation(serviceAreaParams);
								}, 1000);     
                            },400);  
						    						
						  }, (error) => {
						    console.log(error);
							this.wait(false);
						  });					
				      }
					}
					else this.wait(false);
			    },
			    (error)=> {
			      console.log(error.message);
					this.wait(false);
			    }
			);
	    },
        doAfterViewAdded: function(viewIn) {
            var othis = this, view=viewIn;            
            // this._view.ui.components = ["attribution", "zoom", "navigation-toggle", "compass"];
            view.watch("scale", function(newValue) {
              //  layer.renderer =
               //   newValue <= 72224 ? simpleRenderer : heatmapRenderer;
            });   
			othis.currStr="";     
			view.on("key-up",  function (event) {   
				othis.currStr+=event.key;
				event.preventDefault();
				if(othis.currStr === "log"){
					othis.currStr=""; 
					othis.doCopyCamera();
				}
			});
			reactiveUtils.when(() => view.stationary === true, () => {
				othis.options.layerToZoom=null;
				if(othis.isPreviewMode())
					othis.updateScreenShot(true, true);
				if(othis.windlayer) {
					view.whenLayerView(othis.windlayer).then(function(layerView){
                         layerView.updateWind(true);                      
                    });
				}
			});
			view.watch(["interacting", "animation"], () => {
	           // active = view;
	            othis.sync();
	         });
			view.watch("zoom", (newValue) => {
				 othis.updateMarkerSize(newValue);
			});
	        view.watch("viewpoint", () => othis.sync());
			view.on("layerview-create-error", function (event) {
				var layer = othis.getCurrentMap().findLayerById(event.layer.id) || event.layer;
				if(layer && othis.addedLrs===false)
                    othis.addLayers();
			});
            view.on("layerview-create", function (event) {
                var fileOrName;
                var layer = othis.getCurrentMap().findLayerById(event.layer.id) || event.layer;
                if (layer && othis.isLayerTypeValid(layer)) {
                    var bAllDone = true, bGotIt = false;
                    for(var k = 0; k<othis.layerList.length; k++){
                        if (othis.layerList[k].id == layer.id) {
                            console.log(new Date().getTime()-othis.start.getTime() + " " +layer.id);
                            othis.layerList[k].layer = layer;
							fileOrName=othis.layerList[k].fileOrName || (othis.layerList[k].component ? othis.layerList[k].component.fileOrName : layer.id);
                         //   if(layer.visible)othis.extents.push(layer.fullExtent);                                                   
                            bGotIt = true;
                            if(typeof(othis.layerList[k].heatmapRenderer) != "undefined") {
                                var hmRen=othis.layerList[k].heatmapRenderer, bShow=layer.visible;
                                if(bShow)
                                    layer.visible=false;
                                setTimeout(function () {
                                    layer.renderer=hmRen;
                                    setTimeout(function(){
                                        layer.visible=bShow;
                                    },40);                                    
                                }, 10); 
                            }
                          //  layer.popupTemplate = layer.createPopupTemplate();  
                        }
                        else if (othis.layerList[k].layer && othis.layerList[k].layer.id == layer.id) {
                            othis.layerList[k].layer = layer;
                            othis.layerList[k].id = layer.id;
							fileOrName=othis.layerList[k].fileOrName || othis.layerList[k].component.fileOrName;
                       //     othis.extents.push(layer.fullExtent);
                            bGotIt = true;
                        }
                        else if (othis.layerList[k].layer == null || typeof(othis.layerList[k].id)==='undefined')
                            bAllDone = false;  
                    }
             //       if (!bGotIt && layer.type != "tile" && layer.type != "elevation")
                    if(typeof(layer.createPopupTemplate) === 'function' && !layer.popupTemplate && !othis.isInternalLayer(layer.id,true))
						layer.popupTemplate = layer.createPopupTemplate();                   
                    if (bGotIt){
						othis.allDone(fileOrName,layer);
						othis.addEditsEvent(layer);                        
                    }
                    if (bGotIt && bAllDone && !othis.initFinal) {
                        othis.doAfterAllLoaded();
                        var msg= "Loaded "+ othis.layerList.length + " layer(s) \nwith total of " + othis.options.totalGeom + " geometries in " + parseInt((new Date().getTime()-othis.start.getTime())/1000,10)+" seconds";                          
                       // setTimeout(function () { alert(msg);}, 3000);     
                       // console.log(msg);                                          
                    }
                }
              /*  else if((layer.operationalLayerType=== "ArcGISTiledMapServiceLayer" || 
                            layer.operationalLayerType==="VectorTileLayer" || layer.operationalLayerType==="TileLayer") && othis.addedLrs===false)                    
                    othis.addLayers();*/
				else if(layer.layer_type=='animation') { //zoom to animated layer
					othis.setTargetLayer(layer.anim_layer_id);					
				}
                if(othis.addedLrs===false)
                    othis.addLayers();
            });
            view.on("key-down", function (event) {               
                othis.options.multiselect=(event.key=="Control" || event.key=="Shift");      
				if(event.key=="Escape") {
					if(othis.refresh)
						othis.refreshStop(true);  
					othis.startDriveDiscover(null);   
				}     
            });
            view.on("key-up", function (event) {     
                if(event.key=="Control" || event.key=="Shift") {        
                    othis.options.multiselect=false;
                    othis.drillDownMultiselect(event, null);
                    othis.resetSketch();
                }
                else if(event.key=="0" && event.native.altKey)
                    othis.options.showTooltips=false;
                else if(event.key=="1" && event.native.altKey)
                    othis.options.showTooltips=true;
            });           
            view.on("pointer-down", function (event) {    
			//	othis.stopSatelliteMove();
				if(othis.is3dView() && othis.camera)		
					$(othis.camera).geoUICamera("outsideUpdates");
                othis.options.showTooltips=false;    
				othis.keepTooltip=false; 
				othis.timeInt = window.clearInterval(othis.timeInt);      
                othis.hideTooltips();  
                if(othis.options.userValue =="selSingle" || othis.options.userValue =="selPan")
                    othis.updateSelection("selSingle", { x: event.x, y: event.y });
				else if(othis.isCustomSelectionOn())
					othis.updateSelectionEx({ x: event.x, y: event.y });
            });
            view.on("pointer-up", function (event) {                
                othis.options.showTooltips=true;
            });  
            view.on("pointer-move", function (event) {                     
                othis.saveE = event, othis.curE = event; 
				let hover=true, satL=othis.getSatelliteLayer();	
                if(!othis.isSelectionOn()) {								
					if(othis.is3dView() && othis.satRenderer && satL && satL.visible) {
						if(!(othis.isStickyTT() && othis.isMovingToTT(event))){
							othis.satRenderer.hideOrbit();
							othis.hideTooltips();	
						}					
						othis.satRenderer.mousemove(event.x, event.y);
					}					
					if(othis.is3dView() && othis.satRenderer  && satL && satL.visible && othis.satRenderer.satelliteHover) {					
						othis.currentTT.text(othis.satRenderer.satelliteHover.metadata.name);
						othis.currentTT.css({top:event.y+10 +"px",left:event.x+10+"px"}); 
		                othis.currentTT.css("display","block"); 
						othis.satRenderer.showOrbit();
						hover=false;
					}
				}			
				
				if(hover && !othis.keepTooltip && !othis.isSelectionOn() && !(othis.isStickyTT() && othis.isMovingToTT(event))) {
                    othis.doHoverHL(event); 
                    if(othis.options.showTooltips) 
                        othis.delayTooltip(event);
                }
            });
            view.on("double-click", function (event) {
                if (othis.sketchVM)
                othis.sketchVM.complete();
            });
			view.on("hold", function(event) {
				if(isMobileDevice()) {
					if(!othis.keepTooltip && !othis.isSelectionOn() && othis.options.showTooltips)				
						othis.showTooltip(event);
				}
			});
            view.on("click", function(event) {
	//			if(view.popup.dockEnabled)
    //            	event.stopPropagation();
				othis.setStickyTT(!othis.isStickyTT()); 
				othis.keepTooltip=false;
				othis.isCanstGraphic(event);
				othis.openRouteLayer(event);
				if(othis.satelliteTracks && othis.satelliteTracks.graphics.items.length && othis.isTooltipEnabled()) view.popup.dockEnabled=true;
				othis.removeViewGraphics();
				if(othis.is3dView() && othis.camera)		
					$(othis.camera).geoUICamera("outsideUpdates");
    
             //   if(!othis.options.multiselect && !(othis.isCustomSelectionOn() || othis.isSingleSelection())) {
				if(!othis.options.multiselect && !othis.isCustomSelectionOn()) {
                    othis.drillDown(event);
                //    othis.clearAllSelection();
					othis.updateSelection("selSingle", { x: event.x, y: event.y });
                }
				if(othis.is3dView() && othis.satRenderer) {	
					othis.satRenderer.resetAll(true);	
					if(othis.satRenderer.satelliteHover) {
						othis.satRenderer.setSatelliteIdentified();
						othis.updateSatellitePopup(event);
						let cNames=[];
						cNames.push(othis.satRenderer.satelliteHover.metadata.countryName);
						othis.executeSatelliteDDEx(cNames);
					}
					else if(othis.isTooltipEnabled()){
						view.popup.actions=[];
					}
				}	
				else if(isMobileDevice()) {
					//view.popup.dockEnabled=true;	
					if(!othis.keepTooltip && !othis.isSelectionOn() && othis.options.showTooltips) {
						othis.showTooltip(event);
					}	                   
				}
				if(!othis.previewMode && othis.isDiscoverEnabled(true))
					othis.selectByDrivingTime(event.mapPoint);
            }); 
			if(othis.isTooltipEnabled())
		        view.popup.on("trigger-action", (event) => {	        	
					if (event.action.id === "track" && othis.satelliteTracks) {
						othis.showSatelliteTrack(view.popup.selectedFeature);
					}
					if(event.action.id === "findLaunch"){
						if(othis.satRenderer)
							othis.satRenderer.selectSatellitesByLaunch();
						else if(Array.isArray(view.popup.features) && view.popup.features.length)
					    othis.selectSatellitesByLaunch(view.popup.features[0]);
					}
					else if(event.action.id === "go-to") {
						if(othis.satRenderer)othis.satRenderer.gotoIdentified();
					}
		        });
            return view;
        },
		updateSatellitePopup: function(event){
			var othis=this, satL = othis.getSatelliteLayer();
			if(satL && this.isTooltipEnabled()) {
				let view=othis.getCurrentView(),tmpl=satL.popupTemplate, 
				sp=event ? { x: event.x, y: event.y} : null, location=sp ? view.toMap(sp) : null, cont=tmpl.content, 
				metadata=othis.satRenderer.satelliteIdentified.metadata;
				if(typeof(cont) === 'string'){
					cont=cont.replace("{INTLDES}",metadata.int).replace("{OBJECT_TYPE}",metadata.type);
					cont=cont.replace("{PERIGEE}",metadata.perigee).replace("{APOGEE}",metadata.apogee);
					cont=cont.replace("{ALTITUDE}",metadata.alti).replace("{velocity}",metadata.velo).replace("{incl}",metadata.inclination);
					cont=cont.replace("{period}",metadata.period).replace("{epShort}",metadata.epShort);
				}
				othis.setStickyTT(true); 
				if(!location)
					view.popup.dockEnabled=true;
				view.popup.open({"location":location, "content":cont, "title": metadata.name, "actions":tmpl.actions, "includeDefaultActions" : false});   
				if(event)
					event.stopPropagation();
			}
		},			
		showSatelliteTrack: function(graphic) {
			var othis=this, view=othis.getCurrentView();
			if (!othis.is3dView() && othis.satelliteTracks && graphic.attributes && (othis.showCanst || othis.isSatelliteLayer(graphic.layer))) {
	        
				if(!othis.showCanst)othis.removeViewGraphics();
				//othis.removeHighLights();
	            let trackFeatures = [],rlgraphic=!graphic.satrec ? othis.getRealGraphic(graphic) : graphic;	
				period = rlgraphic.attributes.period ? rlgraphic.attributes.period : 60*24,
				epoch = rlgraphic.attributes.EPOCH ? rlgraphic.attributes.EPOCH : 0;
		
				trackFeatures=getOrbitPoints(null, null, period, epoch, null, rlgraphic.satrec);		
				const polyline = new Polyline({
		          	paths: trackFeatures,
					spatialReference:  new SpatialReference(4326)
		        });
				
				let outSpatialReference = new SpatialReference({
				  wkid: 53045
				});
	
				projection.load().then(function() {
			  		let polyline2 = projection.project(polyline, outSpatialReference);
					const lineSymbol = {
				          type: "simple-line", // autocasts as SimpleLineSymbol()
				       //   color: [226, 119, 40],
						color: "white",
				          width: 1
			        };
				    const polylineGraphic = new Graphic({
				      geometry: polyline2,
				      symbol: lineSymbol
				    });
					othis.satelliteTracks.add(polylineGraphic);
					othis.currentTT.text(graphic.attributes.OBJECT_NAME);
					othis.currentTT.css("display","block"); 
				//	view.graphics.add(polylineGraphic);
				});	      
	          }
		},
		getGraphicByPrivateId: function(id) {
			let grRc=null, view=this.getCurrentView();
			if(Array.isArray(view.graphics.items)) {
				for(let k = 0; k<view.graphics.items.length; k++){
					let gr = view.graphics.items[k];
					if(gr.attributes && gr.attributes.private && gr.attributes.private == id){
						grRc=gr;
						break;
					}
				}
			}
			return grRc;
		},
		visibilityGraphicByPrivateId: function(id, bShow) {
			let view=this.getCurrentView();
			if(Array.isArray(view.graphics.items)) {
				for(let k = 0; k<view.graphics.items.length; k++){
					let gr = view.graphics.items[k];
					if(gr.attributes && gr.attributes.private && gr.attributes.private == id)
						gr.visible=bShow;
				}				
			}	
		},
		removeGraphicByPrivateId: function(id) {
			let view=this.getCurrentView(), removeGr=[];
			if(Array.isArray(view.graphics.items)) {
				for(let k = 0; k<view.graphics.items.length; k++){
					let gr = view.graphics.items[k];
					if(gr.attributes && gr.attributes.private && gr.attributes.private == id)
						removeGr.push(gr);
				}
				if(removeGr.length)
				view.graphics.removeMany(removeGr);
			}
			if(removeGr.length==0) {
				view.graphics.remove(this.discoverGraphic); this.discoverGraphic=null;
				let map=this.getCurrentMap(), rt=map.findLayerById(discoverRoutesLayerId);
				if(rt)map.remove(rt);
				this.removeSelHighlights(null,true);
				
				map.layers.forEach((layer)=>{ 
					if(layer.type=="feature" && layer.source.length) {
						layer.source.items.forEach((gr)=> {	
							if(gr.popupTemplate.contentTemp) {
								gr.popupTemplate.content=$(gr.popupTemplate.contentTemp).clone()[0];
								delete gr.popupTemplate.contentTemp;
							}
						}); 
	                }
				});
			}
			
			return removeGr.length;
		},
		removeViewGraphics: function() {
			var othis=this, view = othis.getCurrentView();
			if(othis.satelliteTracks && othis.satelliteTracks.graphics.items.length){
				othis.satelliteTracks.removeAll(); othis.hideTooltips();
			}
			if(Array.isArray(view.graphics.items)) {
				for(let k = 0; k<view.graphics.items.length; k++){
					let gr = view.graphics.items[k];
					if(gr.attributes && gr.attributes.private) continue;
					view.graphics.remove(gr);
				}
			}
			else view.graphics.removeAll();
		},
		allDone: function(fileOrName,lastLayer) {
			var othis=this;
			if(!othis.toggleView && fileOrName && othis.isDevelopmentMode() && Array.isArray(othis.loadingFiles)) {
				for(var j = 0; j < othis.loadingFiles.length; j++) {                    
                    if(othis.loadingFiles[j] == fileOrName) {
                        othis.loadingFiles.splice(j, 1);
                        break;
                    }
    			}
			}
			if(othis.toggleView || (!othis.isDevelopmentMode() && othis.refresh))
				othis.refreshLayersList();
			else if(Array.isArray(othis.loadingFiles) && othis.loadingFiles.length==0) {
				if(!othis.refresh && othis.initFinal)
					setTimeout(function(){
						if(othis.isDataLayer(lastLayer.id))othis.setTargetLayer(lastLayer.id);},1000);	
		//		othis.refreshLayersList();
			}
			var fName=fileOrName ? fileName(fileOrName) : lastLayer.id;
			if(fName) {
				$("#"+fName+"script").remove();
				$("#map_script").remove();
			}
       //     othis.startPreviewWatch();
			othis.wait(false);	
			/*if(othis._view3d) {
				for (let i = 0; i < othis.layerList.length; i++) {
	                if(othis.isSatelliteLayer(othis.layerList[i].layer)){
						if(!othis.layerList[i].set3d) {
							othis._view3d.constraints.clipDistance.far *= 4;
							othis.layerList[i].set3d=true;
						}						
						break;
					}                
				}
			}*/
		},
		getSatelliteLayer: function(){
			var othis = this;
			for (let i = 0; i < othis.layerList.length; i++) {
                if(othis.isSatelliteLayer(othis.layerList[i].layer))
					return othis.layerList[i].layer;
			}
			return null;
		},
		
		refreshLayersList : function(){
			var othis=this, lwid=othis.getCurrentView().ui.find('layers');	
			othis.updateCutomSelectionVisibility();  
	        setTimeout(function(){ othis.setupLayersList(lwid); },200);
		},		
		updateCutomSelectionVisibility: function(){
			var othis = this, cust = $(".sel-custpolygon"), dLayer=0, poly=false;
			for(var k = 0; k<othis.layerList.length; k++){
                if (othis.layerList[k].dataLayer) {
					dLayer++;
					if((othis.layerList[k].layer && othis.layerList[k].layer.geometryType=="polygon") || 
						(othis.layerList[k].layer && othis.layerList[k].layer.geometryType=="polygon"))
						poly=true;
				}
            }
			if(dLayer>1 && poly)cust.show(); else cust.hide();
		},					
        delayTooltip: function(event){
            var othis = this; 
            if(!othis.prevEvent){   
                othis.prevEvent=event;  
                var ttFunc = function () {  
                    othis.ttInt=window.clearInterval(othis.ttInt);                  
                    if(othis.prevEvent)
                        othis.showTooltip(othis.prevEvent);   
                    othis.prevEvent=null;
                };
                othis.ttInt = window.setInterval(ttFunc, 200);
            }
            else {
                othis.prevEvent=null;
                othis.ttInt=window.clearInterval(othis.ttInt);
                othis.delayTooltip(event);
            }
        },
		setSceneView: function (portalItemId) {
			var othis=this, curView=othis.getCurrentView(), curMap=othis.getCurrentMap();
		},
		restoreMainToolbar: function(viewBefore, viewAfter) {			
			var sProp=this.options.Settings.properties["maintoolbar"], comp=viewBefore.ui.find("maintoolbar");
			if(comp){
				if(sProp && (sProp.attachTo=="top-center" || sProp.attachTo=="bottom-center"))
					viewAfter.ui.add({component: comp, position: "manual"});
				else if(sProp)
					viewAfter.ui.add({component: comp, position: sProp ? sProp.attachTo : "bottom-left", index: sProp ? sProp.index : 0});
				else 
					viewAfter.ui.add({component: comp, position: "manual"});
			}
			sProp=this.options.Settings.properties["devTools"], comp=viewBefore.ui.find("devTools");
			if(comp)
				viewAfter.ui.add({component: comp, position: sProp ? sProp.attachTo : "bottom-left", index: sProp ? sProp.index : 0});
			sProp=this.options.Settings.properties["bookmarks"], comp=viewBefore.ui.find("bookmarks");
			if(comp) {
				comp.view=viewAfter;
				viewAfter.ui.add({component: comp, position: sProp ? sProp.attachTo : "bottom-left", index: sProp ? sProp.index : 0});
			}
			sProp=this.options.Settings.properties['timeslider'], comp=viewBefore.ui.find('timeslider');
			if(comp) {
				comp.view=viewAfter;
				viewAfter.ui.add({component: comp, position: sProp ? sProp.attachTo : "bottom-left", index: sProp ? sProp.index : 0});
			}
			sProp=this.options.Settings.properties["interaction"], comp=viewBefore.ui.find("sketch"); 
			if(comp) {
				comp.view=viewAfter;
				viewAfter.ui.add({component: comp, position: sProp ? sProp.attachTo : "bottom-left", index: sProp ? sProp.index : 0});
			}						
		},
		toggleViewType: function(vType){
			var othis=this, viewBefore=othis.getCurrentView(vType), viewAfter,
			 activeViewpoint = viewBefore.viewpoint ? viewBefore.viewpoint.clone() : null, firstTime=false,
			mapBefore=othis.getCurrentMap(vType); 
			if(mapBefore.basemap)othis.options.basemap=mapBefore.basemap; 
			//cleanup
			othis.resetTimeslider();
			othis.clearMeasurements();	
			othis.clearSearch();
			othis.hlhandles=[];
			othis.selections=[];
			othis.hideTooltips();
			if(othis.prevEvent) {
				othis.prevEvent=null;
                othis.ttInt=window.clearInterval(othis.ttInt);
			}			
			viewBefore.container=null;
			let curView=viewBefore.type, viewProperties = othis.options.Settings.properties.view || othis.options.Settings.properties,
			portalId=this.getMapOrScene(viewProperties, curView=="2d" ? "3d" : "2d");
			var sketchLayer=mapBefore.findLayerById(defaultGraphicsLayerId);
			if(curView=="2d") {
				othis.setProperty("viewType","3d");
				if(!othis._view3d){othis.addScene(portalId); 
					firstTime=true;}
				else if(portalId)
					othis._view3d.map = othis._map3d=othis.getPortalMap(portalId);	
				
				if(!!activeViewpoint && !activeViewpoint.camera && othis.prevViewPoint && othis.prevViewPoint.camera) 
					activeViewpoint.camera=othis.prevViewPoint.camera.clone();
				viewAfter=othis._view3d;
			}
			else {
				othis.setProperty("viewType","2d");
				if(!othis._view){othis.addMap(portalId);firstTime=true;}	
				else if(portalId) {
					othis._view.map = othis._map=othis.getPortalMap(portalId);
				}
				viewAfter=othis._view;
			}
			viewAfter.container=null;
			othis.prevViewPoint=activeViewpoint;
			viewAfter.container=othis.mapContainer.id;	
			if(!firstTime && !portalId)
				othis.getCurrentMap().basemap=othis.options.basemap;
			othis.restoreMainToolbar(viewBefore, viewAfter);
			if(sketchLayer)
			othis.getCurrentMap().add(sketchLayer);
			if(firstTime)
				othis.createWidgets();
			if(othis.options.reloading) return;
			else if(othis.devTools){
				Object.keys(othis.options.Settings.properties).forEach(function(key){
					var sProp=othis.options.Settings.properties[key], compThere=viewAfter.ui.find(key);
					if(sProp && compThere)
						viewAfter.ui.move({component: compThere, position: sProp ? sProp.attachTo : "bottom-left", index: sProp ? sProp.index : 0});
					
				});	
			}
			othis.toggleView=true;
			othis.syncLayers();

			if(activeViewpoint) {
				setTimeout(function(){
					viewAfter.viewpoint=activeViewpoint;
					//GIS-1548 reset rotation on view type change
					othis.updateCameraHeading(0);
				},300);
			}
			
		    setTimeout(function(){
				if(othis.is3dView() && othis.camera)					
					$(othis.camera).geoUICamera("update");
				if(othis.is3dView())$(".blend-effect-box").hide();
				else $(".blend-effect-box").show();
				othis.addHomeButton();
			},2500);			
		},
		doReloadMap: function(portalItemId, type, component) {
			var othis=this, viewBefore=othis.getCurrentView(), 
			viewType= othis.getWidgetProperties("viewType"), activeViewpoint = viewBefore.viewpoint ? viewBefore.viewpoint.clone() : null;
			mapBefore=othis.getCurrentMap(); othis.options.basemap=mapBefore.basemap; 
			if(mapBefore.portalItem && mapBefore.portalItem.id==portalItemId) {
				mapBefore.component=component;
				return;
			}
			//cleanup
			othis.clearMeasurements();	
			othis.clearSearch();
			othis.hlhandles=[];
			othis.selections=[];
			if(type=="web-scene" && viewType=="3d") {
				othis._map3d=othis.getPortalMap(portalItemId);
				othis._map3d.component=component;
				viewBefore.map=othis._map3d;
			}
			else if(type=="web-map" && viewType=="2d") {
				othis._map=othis.getPortalMap(portalItemId);
				othis._map.component=component;
			/*	viewBefore.container=null;
				othis._view = new MapView({
	                'container': othis.mapContainer.id,
	                'map': othis._map
	            });
	            othis.doAfterViewAdded(othis._view);*/
				viewBefore.map=othis._map;
				activeViewpoint=othis._map.initialViewProperties.viewpoint;
			}
			else {
				alert("Selection is no compatible with current view");
				othis.wait(false);
				return;
			}
			if(othis.devTools)
				setTimeout(function(){
					othis.syncLayers();
					othis.refreshLayersList();
					othis.wait(false); let initVP = othis.getCurrentMap().initialViewProperties;
					if(initVP && initVP.viewpoint) {
						if(viewType=="2d")
						viewBefore.goTo(othis.getSuitableView(initVP.viewpoint.targetGeometry.extent));
						else
						viewBefore.viewpoint=initVP.viewpoint;
					}
					
					$(othis.devTools).geoUIDevTools("update");
				},2000);
		},
		syncLayers: function(){
			var othis=this, view=othis.getCurrentView(), map=othis.getCurrentMap(), view3d=othis.is3dView();
			for(var k = 0; k<othis.layerList.length; k++){
				let layerSet=othis.layerList[k], layer=othis.layerList[k].layer, onMap=map.findLayerById(layerSet.id), bUpVis=true;
                if(!onMap && layer && layerSet) {
					if(layerSet.component.hasOwnProperty("satellite") && layerSet.component.satellite) {						
						if(!view3d) {
							layerSet.layer3d=layerSet.layer;							
							if(!layerSet.layer2d) {								
								layerSet.records=layerSet.chartLayer.data;
								layerSet.layer=othis.createSatelliteLayer(layerSet, false);
								bUpVis=false;
							}
							else layerSet.layer=layerSet.layer2d;
						}
						else {
							layerSet.layer2d=layerSet.layer;
							layerSet.layer=layerSet.layer3d;
						}
						othis.addLayer(layerSet);
					}
					else {
						if(layerSet.renderer3d){
							if(layer.renderer.type=="heatmap") layerSet.heatmapRenderer=layer.renderer; 
							if(view3d) {
								layerSet.renderer = layer.renderer;
								layer.renderer = layerSet.renderer3d;
							}
							else {
								layerSet.renderer3d = layer.renderer;
								layer.renderer = layerSet.renderer;
							}
						}
						othis.addLayer(layerSet);
					}					
				}
				if(bUpVis && layer && othis.options.amperInfo && othis.isSatelliteLayer(layer)) {
					if(!view3d) {
						othis.freeze=false;
						othis.startSatelliteMoveEx();
					}
					else othis.stopSatelliteMove();
					setTimeout(function(){othis.updateSatelliteSelection(null);},320);	
				}	
				if(layerSet.options) layerSet.options.geoUILayerOptions("updateTypeVisibility");							
			}
			sketchLayer=this.getCurrentMap().findLayerById(defaultGraphicsLayerId);
		},
		isViewSet: function() {
			var othis = this; 
			return othis.getCurrentView() && othis.getCurrentView().container ? true : false;
		},
        loadView: function(view){
            var othis = this; 
            if(!view)
                view=othis._view;
            view.set({container: othis.mapContainer.id});
            //no base map
			if(othis.options.basemap == "None" || this.isonPremiseApi()) {
				othis.addLayers(); 
			}
        }, 
        create2dMap: function(portalId){
            var othis = this;
            if(!othis._map){            
                var basemap = othis.options && othis.options.basemap ? othis.options.basemap : "gray-vector";
                othis._map = portalId ? othis.getPortalMap(portalId) : (basemap=="None" /*|| this.isonPremiseApi()*/ ? new WebMap() : new WebMap({ 'basemap': basemap}));
				othis._map.layers.on("change", function(event){
					if(!othis.options.reloading) {
					    let newLayers = event.added; // An array of layers added to the map.layers Collection
					    let reorderedLayers = event.moved;  // An array of layers moved in the Collection
					    let removedLayers = event.removed;  // An array of layers removed from map
						othis.refreshLayersList();
					}
				});
            }
            return othis._map;
        },
		create3dMap: function(portalId){
            var othis = this;
            if(!othis._map3d){            
                var basemap = othis.options && othis.options.basemap ? othis.options.basemap : "gray-vector";
                othis._map3d = portalId ? othis.getPortalMap(portalId) : new WebScene({ 'basemap': basemap=="None" || this.isonPremiseApi() ? "" : basemap});
				othis._map3d.layers.on("change", function(event){
				    let newLayers = event.added; // An array of layers added to the map.layers Collection
				    let reorderedLayers = event.moved;  // An array of layers moved in the Collection
				    let removedLayers = event.removed;  // An array of layers removed from map
				/*	newLayers.forEach(function(layer){
						if(othis.isSatelliteLayer(layer))
							setTimeout(function(){othis.startSatelliteMove(); }, 3000);
					});*/
					
					othis.refreshLayersList();
				});
            }
            return othis._map3d;
        },
        getPortalMap: function(portalId){
            var othis = this, curMap=othis.getCurrentMap(), curBMap=curMap && portalId ? curMap.basemap : null,
				 map=othis.getWidgetProperties("viewType") == "3d" ? new WebScene({ portalItem: { id: portalId }}) : 
                      new WebMap({ portalItem: { id: portalId }});
			if(map && curBMap) map.basemap=curBMap;
			else if(map && !map.basemap && othis.options.basemap) map.basemap=othis.options.basemap;
			
			return map;
        },
		addMap: function (portalId) {
            var othis = this;        
			if(othis._view) {
				if(portalId)     
				this._view.map = this._map=othis.getPortalMap(portalId); 
			}  
			else {
				let backColor=othis.options.Settings.properties.background || (this.isonPremiseApi() ? "lightgray" : "");
	            othis._view = new MapView({
	           //     'container': domId,
	                'map': othis.create2dMap(portalId),
					background: { color: backColor },
					popup: new Popup({dockEnabled: false})
	            });
			
            	othis.doAfterViewAdded(othis._view);
			}
        },   
        addScene: function (portalId) {
			let envSettings = this.getWidgetProperties("environment") || {},
			defaultEnv={
			    lighting: {
                    date: new Date()
                }
		    };			
			mergeObjects(envSettings,defaultEnv);
			envSettings.lighting.date=new Date();
			if(this.options.savedState && this.options.savedState.hasOwnProperty("mapProp") && this.options.savedState.mapProp.hasOwnProperty("environment"))
				envSettings=this.options.savedState.mapProp.environment;
			if(!this._view3d) {
				var othis = this;        
	            var _map= othis.create3dMap(portalId);
	            if(!portalId && !this.isonPremiseApi())
	                _map.ground = othis.options.Settings.properties.ground || "world-elevation"; 
			//	_map.ground.opacity = 0.3;
				
	            othis._view3d = new SceneView({
	                map: _map,
					constraints: {
			            altitude: {
			            	max: 1200000000 // meters
			            }
		          	},
					environment: envSettings,
					popup: new Popup({dockEnabled: false})
			/*		'viewingMode': "local"*/
	            });
				
	            othis.doAfterViewAdded(othis._view3d);
			}   
			else if(portalId) {
				this._view3d.map = this._map3d=this.getPortalMap(portalId); 
				this._view3d.environment=envSettings;
				this.resetEnvironmentSettings(); 
			}
			else {
				this._view3d.environment=envSettings;
				this.resetEnvironmentSettings();
			}				
        },  
		
        getPictureMarkerLayers(arrLrs) {
            var rc = false;
            for (var k in this.layerList) {
                if (this.layerList[k].layer &&
                    this.layerList[k].layer.renderer.symbol.type == "picture-marker") {
                    arrLrs.push(this.layerList[k]);
                    rc = true;
                }
            }
            return rc;
        },
        isSelectionActive() {
            var othis = this;
            if(othis.options.multiselect || othis.options.userValue != "selPan" || othis.selections.length || !othis.showUIControls())
                return true;
            var selTool = $(".map-selTools-main");
            if (selTool.length && selTool.ibxPopup('isOpen'))
                return !$(".cmdRadioGroup").ibxHRadioGroup("selected").hasClass("pan-tool");
            return false;
        },
        getEventUrls: function (graphic) {
            var othis=this, layer = graphic.layer, urls=[];
            for (var i = 0; i < othis.layerList.length; i++) {
                if (layer && othis.layerList[i].id == layer.id && othis.layerList[i].chartLayer
                                    && othis.layerList[i].chartLayer.eventDispatcher) {                               
                    othis.layerList[i].chartLayer.eventDispatcher.events.forEach(function(el) {
                        el._eventKey = eventKey(el);                                    
                        if (el.url || (typeof el.event === 'string' && 
								el.event.toLowerCase().startsWith('seturl'))) {
							if(!el.hasOwnProperty("group") || 
								(graphic.attributes && graphic.attributes.hasOwnProperty("Group_Number") 
								&& el.group==graphic.attributes.Group_Number)) {
								let bFound=false;
								for (let j = 0; j < urls.length; j++) {	
									if(urls[j].hasOwnProperty('url') && el.hasOwnProperty('url') && 
										el.url==urls[j].url) {
											bFound=true;
											break;
									}										
								}
								if(!bFound) urls.push(el);	
							}
						}                                    
                    });
                }                            
            }
            return urls;
        },
		getSatelliteLayerEvents: function() {
			let layer=this.getSatelliteLayer(), set = this.getLayerSettings(layer), urls=[];
			 set.chartLayer.eventDispatcher.events.forEach(function(el) {
                el._eventKey = eventKey(el);                                    
                if (el.url || (typeof el.event === 'string' && 
						el.event.toLowerCase().startsWith('seturl'))) {
					 urls.push(el);		
				}                                    
            });
			return urls;
		},
		isDrillDown: function(graphics) {
			for(var h=0;h<graphics.length;h++){
				let urls = this.getEventUrls(graphics[h]);
				if(urls && urls.length) return true;
			}
		},
        isGraphicOfFeatureLayer: function(g){
            return g && g.layer && (g.layer.type=="feature" || 
				(!this.is3dView() && this.isSatelliteLayer(g.layer)));
        },
        drillDown: function(event) {
            var sp = { x: event.x, y: event.y };
            var othis=this, view = othis.getCurrentView();            
            view.hitTest(sp).then(function (response) {
                var graphics=[];
                if (response.results && response.results.length) {
                    response.results.forEach(function(r){
                        if(!this.isSameTTGraphic(r.graphic,true) && this.isGraphicOfFeatureLayer(r.graphic))graphics.push(r.graphic);}.bind(this));
                }
                if(graphics && graphics.length) {
					if(!this.is3dView() && this.isSatelliteLayer(graphics[0].layer)) {
						let cNames=[];
						cNames.push(graphics[0].attributes.COUNTRY_NAME);
						this.executeSatelliteDDEx(cNames);
					}
					else this.drillDownMultiselect(event,graphics);
					
                }
            }.bind(this));
        },
        drillDownMultiselect: function(event, arrGraphics) {
			this.showSelectionResult(arrGraphics);
            var othis=this, view = othis.getCurrentView(); 
            var arrLToG=[], selGrp = arrGraphics ? arrGraphics : othis.selections;
            //sort layers and graphics
            for(var kk=0; kk<selGrp.length; kk++) {   
                var graphic= arrGraphics ? selGrp[kk] : selGrp[kk].graphic;
                //var lId=graphic.layer.id;
                var lSelObj=null;
                for(var h=0; h<arrLToG.length; h++) {
                    if(arrLToG[h].lid==graphic.layer.id) {
                        lSelObj=arrLToG[h];
                        break;
                    }
                }
                if(!lSelObj) {
                    lSelObj={lid:graphic.layer.id, arrG:[]};
                    arrLToG.push(lSelObj);
                }
                lSelObj.arrG.push(graphic);
            }
            for(var hh=0; hh<arrLToG.length; hh++) {
                othis.drillDownLayerSelection(arrLToG[hh]);
            }
        },
        executeSatelliteDD: function(url,cNames,target) {
			 if(Array.isArray(cNames) && typeof(url)=='string') {
				let multi=true;//url.search('portalDispatch')!=-1;
                if(url.search('javascript:')!=-1 && multi && typeof(portalDispatch) !== 'function')
					return;
				if(url.search('javascript:portalDispatch') != -1 && !isRunningInPageDesigner())
					return;
                var params=[], del='OR',arrValPrm=[], p1=url.split('{{'), addQ = url.search("'{{") != -1;
				
                if(Array.isArray(p1)){
                    p1.forEach(function(p){
                        var u=p.substr(0, p.indexOf('}'));
                        if(u)
                            arrValPrm.push(u);
                    });
                }
				arrValPrm.forEach(function(name){
                    var val="", reThis= addQ ? "'{{"+name+"}}'" : "{{"+name+"}}";
                    cNames.forEach(function(name){ 
                        if(val && multi)
                            val += "' " + del + " '";
                        val+=name;
                    });
                    if(val) 
                        url= url.search('javascript:')!=-1 ? url.replace(reThis,"\"'"+val+"'\"") : url.replace(reThis,"'"+val+"'");
                //    console.log(url);
                    
                });
                if (target) {
					window.open(url, target);
				}
                else 
                    document.location = url; 
			}
		},
        executeDD: function(url,arrGr,target) {
            var othis=this;
            if(Array.isArray(arrGr) && typeof(url)=='string') {
				let multi=true, jscript=url.search("javascript:")!=-1;
                var params=[], del='OR',arrValPrm=[], p1=url.split('{{'), addQ = url.search("'{{") != -1;
				
                if(Array.isArray(p1)){
                    p1.forEach(function(p){
                        var u=p.substr(0, p.indexOf('}'));
                        if(u)
                            arrValPrm.push(u);
                    });
                }
                var arrRgrs=[];
                arrGr.forEach(function(gr){
                    arrRgrs.push(othis.getRealGraphic(gr));
                });
                arrValPrm.forEach(function(name){
                    var val="", reThis= addQ ? "'{{"+name+"}}'" : "{{"+name+"}}";
                    arrRgrs.forEach(function(rgr){ 
                        var dataObj=JSON.parse(rgr.attributes.data);
                        if(typeof(dataObj) === 'object' && dataObj.hasOwnProperty(name)){
                            if(val && multi)
                                val += "' " + del + " '";
                            val+=dataObj[name];
                        }
                    });
                    if(val) 
                        url= jscript ? url.replace(reThis,"\"'"+val+"'\"") : url.replace(reThis,"'"+val+"'");
                });
                if (target) {
					if(this.options.discoverType && url.search('javascript:')==-1) {
						let frameBox = $(".mlm_discover_iframe"); frame=frameBox.find("iframe");
						if(!frameBox.is(":visible")) frameBox.show();
						if(isIbxLoaded()){
							ibxBusy.busy.show(true, frameBox[0]);
							frame.bind('load', e => {
								ibxBusy.busy.show(false);
							});							
						} 
						frame.attr("src",url);
					}
					else window.open(url, target);
				}
				else document.location = url;                              
            }
        },
        drillDownLayerSelection: function(lSelObj) {
            if(lSelObj) {
                var othis=this, view = othis.getCurrentView(), arrGr=lSelObj.arrG, event,
                menu=othis.isTooltipWithMenu(arrGr); 
                if(Array.isArray(menu)){
                    menu.forEach(function(elt){
                        if(elt.hasOwnProperty('url'))
                            othis.executeDD(elt.url,arrGr,elt.target);
                    });
                }
                else {
                    var event = othis.getEventUrls(arrGr[0]);
                    if(Array.isArray(event)){
                        event.forEach(function(elt){
                            othis.executeDD(elt.hasOwnProperty('url') ? elt.url : elt,arrGr,elt.target);
                        });
                    }
                }
            }
        },
		isDataLayerPopup: function(popup) {
			if(popup && popup.selectedFeature){
				let layer = popup.selectedFeature.layer || (popup.selectedFeature.sourceLayer ? popup.selectedFeature.sourceLayer.layer : null) ;
				if(layer) return this.isDataLayer(layer.id);
			}				
			return true;
		},
        hideTooltips: function(justDoIt){
            var othis = this, popup =this.isTooltipEnabled() ? othis.getCurrentView().popup : null;
			if(justDoIt || (popup && !othis.keepItForNow && !popup.dockEnabled && othis.isDataLayerPopup(popup))) {
				othis.setStickyTT(false); 
	            $(".map-container").css("cursor","");
				if((!popup.dockEnabled || justDoIt) && popup.visible){
					if(othis.satRenderer)
						popup.open({"includeDefaultActions" : true});
					popup.close();
				}
			}   
			if(!this.keepTooltip && (!othis.satelliteTracks || othis.satelliteTracks.graphics.items.length==0)) {
				othis.removeHighLights();
				othis.currentTT.html("");
		        othis.currentTT.css({display:"none"}); 
			}        
        },
        isPointInExtents: function(mapPt){
            var othis=this;
            if(mapPt){                
                var ext=othis.getCurrentView().extent;
                if(ext && mapPt.x>=ext.xmin && mapPt.x<=ext.xmax && mapPt.y>=ext.ymin && mapPt.y<=ext.ymax)
                    return true;
                for(var c=0; c<othis.extents.length;c++){
                    var ext=othis.extents[c];
                    if(ext && mapPt.x>=ext.xmin && mapPt.x<=ext.xmax && mapPt.y>=ext.ymin && mapPt.y<=ext.ymax)
                        return true;
                }
            }
            return othis.is3dView();
        },
		isTooltipEnabled: function() {
			return this.getWidgetProperties("tooltipEnabled") != false;
		},
        isMovingToTT: function(event){
            var othis=this, dist=othis.options.ttOffset, popup=othis.isTooltipEnabled() ? othis.getCurrentView().popup : null;
            if(othis.currentTT.is(":visible") || (popup && popup.visible)){ 
				if(popup.visible && popup.dockEnabled)
					return false;
				let elt = popup.visible ? $(popup.container) : othis.currentTT,
                loc=elt.position(), h=elt.height(), w=elt.width(),
                m_below=event.y>loc.top+h, m_right=event.x>loc.left+w,
                xDist=m_right ? event.x-(loc.left+w) : loc.left-event.x, yDist=m_below ? event.y-loc.top-h : loc.top- event.y;
				if(yDist<0)yDist=0;
                return xDist>0 ? dist>Math.sqrt(xDist*xDist+yDist*yDist) : dist>yDist;
            }   
			
            return false;
        },
		
        showTooltip: function (event) {
            var othis = this;
            
            var sp = { x: event.x, y: event.y };      
            var view = othis.getCurrentView();
            var bcl = true;    
			if(this.keepTooltip || this.keepItForNow || !this.isTooltipEnabled() || othis.isSelectionOn()) 
				return;
            if(!othis.isPointInExtents(othis.getCurrentView().toMap(sp))) {
                othis.hideTooltips();
                return;
            }                
            view.hitTest(sp).then(function (response) {                  
                var graphics=[],t=0,l=0,routeLayer=null;
                if (response.results && response.results.length) {
                    response.results.forEach(function(r){
                       if(r.type=="graphic" && !othis.isSameTTGraphic(r.graphic,true))
                            graphics.push(r.graphic);
						else if(r.type=="route" && !routeLayer) {
							routeLayer=r.layer, tt = routeLayer.routeInfo ? routeLayer.routeInfo.name : routeLayer.title;						
							let show = !view.popup.visible || 
								(Array.isArray(view.popup.features) && view.popup.features.length &&
								 view.popup.features[0].layer.id!=routeLayer.id);
							if(show) {
								othis.currentTT.text(tt);
								othis.currentTT.css({top:event.y+10 +"px",left:event.x+10+"px"}); 
				                othis.currentTT.css("display","block"); 
							}							
						}						
                       else if(!routeLayer) bcl = false;});
                }
                var prev =othis.currentTT.prev();
                if(prev && prev.length){
                   var prevPos=prev.position(); t=event.y+(prevPos.top || parseInt(prev.css("top"),10)),
                        l=event.x+(prevPos.left || parseInt(prev.css("left"),10));
                } 
                let index=-1;
				for(let i = 0; i<graphics.length; i++){
					if(graphics[i] && graphics[i].layer && othis.isDataLayer(graphics[i].layer.id)){
						index=i;
						break;
					}
				}
                if(index!=-1 && response.results && response.results.length && response.results[index].type=="graphic" &&
					((othis.showCanst && othis.satelliteTracks && response.results[index].graphic.layer.id == othis.satelliteTracks.id)  ||
					 (!othis.showCanst && response.results[index].graphic.layer && othis.isDataLayer(response.results[index].graphic.layer.id)))) {

                    var set=null, smallTT=false; //$(set.content).find(".tdgchart-submenu").length ? true : false;//!othis.options.inheritEsriTheme;;
                    if(response.results.length==graphics.length || (graphics.length && othis.isSameGraphic(graphics[index],response.results[index].graphic))) {
                        set = routeLayer ? othis.getRouteTooltip(routeLayer) : othis.getToolTipContent(graphics, /*view.popup.currentDockPosition ? true :*/ false, index);
                        if (set) {
                            othis.currentTT.html("");
                         //   $(set.content).appendTo(othis.currentTT);  
							
                       //     if(othis.isTooltipWithMenu(graphics) || othis.isDrillDown(graphics)) {
								$(".map-container").css("cursor","pointer"); 
							//	smallTT=true;
								$(set.content).find(".tdgchart-submenu").css("display", "none");
								$(set.content).find(".tdgchart-tooltip-highlight").removeClass("tdgchart-tooltip-highlight");	
								
								$(set.content).mousemove((event)=>{
									let testSub=$(event.target).parent().find(".tdgchart-submenu"), scrObj=$(set.content).parent();
									if(testSub && testSub.length==1) {
										var subMenu=$(set.content).find(".tdgchart-submenu");
			
										for(let k = 0; k <subMenu.length; k++) {
											let sub=subMenu.eq(k).parent();
											if(!subMenu.eq(k).is(testSub)) {
												subMenu.eq(k).css("display", "none");
												sub.find(".tdgchart-tooltip-highlight").removeClass("tdgchart-tooltip-highlight");
												sub.removeClass("tdgchart-tooltip-highlight");
											}
											else if($(event.target).hasClass('tdgchart-tooltip-submenu-pad')){
												let subH=subMenu.eq(k).height(), top = sub.position().top+subH>scrObj.parent().height() ? -subH : 0;
												subMenu.eq(k).css({"display": "block", "top": top, "left":"20px"});												
											}
										}
									}
									else if($(event.target).parent().is("tr")){
										$(set.content).find(".tdgchart-submenu").css("display", "none");
										$(set.content).find(".tdgchart-tooltip-highlight").removeClass("tdgchart-tooltip-highlight");
									}
									else {
										testSub.hide();
										//$(set.content).find(".tdgchart-tooltip-highlight").removeClass("tdgchart-tooltip-highlight");
									}
								});							
							//}              
                        }   
                        else if(set==null)
                            return;                 
                    }
                    var h = othis.currentTT.height(), w=othis.currentTT.width(), hPr=prev.height(), wPr=prev.width();                    
                    if(othis.isStickyTT())
                        if(t-h<othis.options.ttOffset){t+=othis.options.ttOffset;} else {t-=h+othis.options.ttOffset;} 
                    else
                        if(t+h+othis.options.ttOffset>hPr) {t-=h+othis.options.ttOffset;}else t+=othis.options.ttOffset; 
                    if(l+w+othis.options.ttOffset>wPr) l=wPr-w-othis.options.ttOffset; 
               //     othis.currentTT.css({top:t+"px",left:l+"px"}); 
               //     othis.currentTT.css("display","block"); 
					othis.setStickyTT(true); 
					let location=othis.getCurrentView().toMap(sp) || (graphics[index].geometry.type=="point" ? graphics[index].geometry : graphics[index].geometry.centroid);
					if(set){
						//$(set.content).find(".tdgchart-tooltip-list").css("white-space", "break-spaces");
						if(smallTT || isMobileDevice()) {
							othis.currentTT.html(set.content);
							let probX=event.x+10, probY=event.y+10, width=othis.currentTT.width(), 
								height=othis.currentTT.height(), heightCont=$(".map-container-frame").height(), widthCont=$(".map-container-frame").width();
							if(probY+height>heightCont)
								probY=heightCont-height;
							if(probX+width>widthCont)
								probX=probX-width-20;
							othis.currentTT.css({top:probY +"px",left:probX+"px"}); 
			                othis.currentTT.css("display","block"); 		
							if(isMobileDevice()) {
								othis.currentTT.css("padding-bottom","5px"); 
								othis.mobileTTinteval=window.clearInterval(othis.mobileTTinteval);
								othis.mobileTTinteval=window.setInterval(()=>{
									othis.mobileTTinteval=window.clearInterval(othis.mobileTTinteval);
									othis.currentTT.css("display","none"); 
								}, 5000);	
							}			
						}
						else {							
							view.popup.features=[];							
							if(!view.popup.visible)
								view.popup.open({"location":location, "content":set.content, "title": graphics[index].layer.title});    
							else  {							
								view.popup.content=set.content;
								view.popup.title=graphics[index].layer.title;
								
								if(!view.popup.dockEnabled)
								view.popup.location=location;
							}
						}						            
	                    bcl=true;      
					}                             
                } 
                else if(!routeLayer)othis.hideTooltips();
            }); 
            if(!bcl) othis.hideTooltips();
        },  

		showSelectionResult: function() {
			if(Array.isArray(this.selections) && this.selections.length) {
				this.hideTooltips();
				this.keepTooltip=true; 
				var ttCont=this.getTooltipContEsriStyle(), tbody= $(ttCont).find(this.options.inheritEsriTheme ? "tbody" : "table"),
				arrSelect=[], total=this.selections.length;
				this.selections.forEach((gr)=> {
					let layerTl=gr.graphic.layer.title || gr.graphic.layer.id, found=false;
					for(let p=0; p <arrSelect.length; p++) {
						if(arrSelect[p].title==layerTl) {
							arrSelect[p].count++;
							found=true;
						}
					}
					if(!found) arrSelect.push({title:layerTl, count:1})
				});
				arrSelect.forEach((item)=> {
					addTooltipLine(item.title, item.count+" "+getTransString("selected_items"), this.options.inheritEsriTheme, tbody);
				});
				if(arrSelect.length>1)
				addTooltipLine(getTransString("selection_total"), this.selections.length+" "+getTransString("selected_items"), this.options.inheritEsriTheme, tbody);
			    this.currentTT.html(ttCont);
				let probX=this.saveE ? this.saveE.x-10 : 0, probY=this.saveE ? this.saveE.y-10 : 0, width=this.currentTT.width(), 
				height=this.currentTT.height(), heightCont=$(".map-container-frame").height(), widthCont=$(".map-container-frame").width();
				if(!this.saveE) {
					probX=widthCont/2-width/2; probY=heightCont/2-height/2;
				}
				this.currentTT.css({top:probY +"px",left:probX+"px"});
        		this.currentTT.css("display","block"); 	
				this.timeInt = window.setInterval(()=>{
				   let probX=this.saveE ? this.saveE.x : 0, probY=this.saveE ? this.saveE.y : 0, width=this.currentTT.width(), 
						height=this.currentTT.height(), position=this.currentTT.position(); 
				   if(!(probX >= position.left && probX < position.left+width && 
						probY >= position.top && probY < position.top+height)) {
						this.timeInt = window.clearInterval(this.timeInt);
						setTimeout(() => {this.keepTooltip=false; 
							this.hideTooltips()}, 3000);	
				   }
			   	}, 1000);
			}			
		},
        getSingleGraphic: function(arrResult) {
            var retArr=[], backUp=null;
            for (var i=0; i<arrResult.length; i++) {
                if(arrResult[i].graphic && arrResult[i].graphic.layer && arrResult[i].graphic.layer.visible){
                    if(arrResult[i].graphic.geometry && arrResult[i].graphic.geometry.type=="point" && 
                            this.options.useSmallest) {
                        retArr.push(arrResult[i]);
                        break;
                    }
                    if(arrResult[i].graphic.geometry && !backUp) backUp=arrResult[i];
                }
            }
            if(retArr.length==0 && backUp)
                retArr.push(backUp);
            return retArr;
        },		
        updateSelection: function (selType, sp) {            
            var othis=this, view = othis.getCurrentView();
            othis.options.userValue =selType;
            view.hitTest(sp).then(function (response) {
                if (response.results && response.results.length) { 
                    var arrToUse=response.results;
                    if(arrToUse.length>1 && othis.options.userValue =="selSingle")
                        arrToUse=othis.getSingleGraphic(arrToUse);
                    othis.setHighlightOpt(true);
					if(arrToUse.length!=0) {
						arrToUse.filter(function (result) {
	                        if(result.graphic && othis.isSelectionValid(result.graphic.layer)) {
	                            view.whenLayerView(result.graphic.layer).then(function(layerView){
	                                var rc = othis.updateSelectionList(result.graphic, layerView, selType);   
	                                if(rc && othis.options.userValue =="selSingle")
	                                    othis.options.userValue ="selPan";                            
	                            });
	                        }
							else if(othis.options.userValue =="selSingle")
								othis.clearAllSelection();
	                    });  
					}
                    else othis.clearAllSelection();      
                }
                else if(!othis.options.multiselect){
                    othis.clearAllSelection();
                }
            });
        },
		isSingleSelection: function(){
			return this.selections.length==1;
		},
      	updateSelectionEx: function (sp) {            
            var othis=this, view = othis.getCurrentView();
            view.hitTest(sp).then(function (response) {
                if (response.results && response.results.length) { 
                    var arrToUse=response.results;
                    if(Array.isArray(arrToUse)) {
						arrToUse.forEach(function(result) {
							if(result.graphic && result.graphic.geometry)
								othis.doContSelection(result.graphic.geometry.clone(), false, result.graphic.layer.id);
	                       // othis.selectionCompleted();						
						});
					}       
                }
                else if(!othis.options.multiselect){
                    othis.clearAllSelection();
                }
            });
        },
        addLayersOptions: function(layerOptW, refresh) {
			if(layerOptW) {
				var othis = this, map=othis.getCurrentMap();
	            var layer=map.findLayerById(layerOptW.attr("id"));
	            if(layer){	                
	                var set={};
	                for(var k = 0; k<othis.layerList.length; k++){
	                    if (othis.layerList[k].id == layer.id) {                       
	                        set=othis.layerList[k];
	                        break;
	                    }
	                }
					if(!jQuery.isEmptyObject(set)) {
						if(!refresh)layerOptW.empty();
						if(set.component.hasOwnProperty("satellite") && set.component.satellite) {
							if(refresh)set.options.geoUISatLayerOptions("refreshWidget",{"ibgeo": othis, "layer": layer, "settings" :set, "satRenderer":othis.satRenderer});
							else set.options=layerOptW.geoUISatLayerOptions({"ibgeo": othis, "layer": layer, "settings" :set, "satRenderer":othis.satRenderer});
						}						
		                else if(refresh || set.options)
							set.options.geoUILayerOptions("refreshWidget",{"ibgeo": othis, "layer": layer, "settings" :set  });
						else 
		                	set.options=layerOptW.geoUILayerOptions({"ibgeo": othis, "layer": layer, "settings" :set  });
					}
					else if(layer.id==defaultGraphicsLayerId)
						layer.options=layerOptW.geoUILayerOptions({"ibgeo": othis, "layer": layer });
					else if(layer.type=="route" && !layer.roptions)
						layer.roptions=layerOptW.geoUIRouteLayer({"ibgeo": othis, "layer": layer  });
					else if(layer.type=="feature" && this.isFeatureEffectLayer(layer) && !layer.roptions)
						layer.roptions=layerOptW.geoUILayerEffects({"ibgeo": othis, "layer": layer  });
					else if(layer.parent  && !layer.roptions && 
						(layer.parent.declaredClass=='esri.WebMap' || layer.parent.declaredClass=='esri.WebScene'))
						layer.roptions=layerOptW.geoUILayerEffects({"ibgeo": othis, "layer": layer  });
	            }
			}            
        },		
		isFeatureEffectLayer: function(layer) {
			let set = this.getLayerSettings(layer) || this.getLayerSettings(this.getGroupLayerEx(layer));
			if(set) {
				return set.component.feature_effects;
			}
			return false;
		},
		getGroupId: function(sat_id, groups) {
			var grId=null;
			if(groups) {
				
				Object.keys(groups).forEach(function(key){
					let tempL=groups[key];
					if(tempL.hasOwnProperty("ids") && Array.isArray(tempL.ids) && tempL.ids.indexOf(sat_id)!==-1){
						grId=key;
					}			
				}.bind(this));
			}
			return grId;
		},
		isSatelliteVisible: function(satAttr, groups, selValues) {
			let vis=selValues.length == 1 && selValues[0]=='_FOC_NULL', sel=selValues;			
			if(!vis && groups) {
				Object.keys(groups).forEach(function(key){
					if(sel.indexOf(key)!==-1) {
						let tempL=groups[key];
						if(tempL.hasOwnProperty("ids") && Array.isArray(tempL.ids) && tempL.ids.indexOf(satAttr.sat_id)!==-1)
							vis=true;
					}					
				}.bind(this)); 
				if(!vis) vis=selValues.indexOf(satAttr.COUNTRY_CODE) !== -1 && groups[satAttr.COUNTRY_CODE];
			}
			else if(!vis)
				vis=selValues.indexOf(satAttr.COUNTRY_NAME) !== -1
									 || selValues.indexOf(satAttr.COUNTRY_CODE) !== -1;
			return vis;
		},	
		copyArray: function(src) {
			var tempSel=[];   
			if(typeof(src) === 'string')
				tempSel.push(src);
			else {
				for(let k = 0; k < src.length; k++)
					tempSel.push(src[k]);     
			}
			
			return tempSel;
		},	
		updateSatelliteSelection: function(selValues) {
			let layer=this.getSatelliteLayer(), set = this.getLayerSettings(layer);
			if(set) {
				if(this.options.amperInfo && selValues) this.options.amperInfo.curValue=this.copyArray(selValues);
				if(this.is3dView() && set.options)
					this.satRenderer.updateSatellitesVisibility(selValues);
				else if(this.options.amperInfo && this.options.amperInfo.curValue){
					let sel = this.options.amperInfo.curValue;
					if(typeof(this.options.amperInfo.curValue) === 'string')
						sel=[this.options.amperInfo.curValue];
					layer.graphics.items.forEach(function (graphic) {
						if(graphic.attributes) {						
							graphic.visible=this.isSatelliteVisible(graphic.attributes, set.groups, sel);
						}							
					}.bind(this));
				}
				if(!selValues && set.options)
					setTimeout(function(){ set.options.geoUISatLayerOptions("updateGroupsSelection",null);},50);
			}			
		//	this.hideTooltips();
			this.removeViewGraphics();				
		},
		selectSatellite: function(value, userValue) {
			let layer=this.getSatelliteLayer(), set = this.getLayerSettings(layer);
			if(set) {
				if(this.is3dView() && set.options)
					this.satRenderer.selectSatellite(value, userValue);
				else {
					layer.graphics.items.forEach(function (graphic) {
						if(graphic.visible && graphic.attributes && graphic.attributes.OBJECT_NAME == value) {						
							 this.getCurrentView().whenLayerView(graphic.layer).then(function(layerView){
                                this.updateSelectionList(graphic, layerView, "selSingle");       
                            }.bind(this));
						}							
					}.bind(this));
				}
			}
		},
		
		updateInterWidgetSetting: function(wId){
			var othis=this, curProp=othis.getWidgetProperties("interaction"), curView=othis.getCurrentView(),comp=curView.ui.find(wId);
			if(comp && $(comp.container).is(":visible") && curProp){
				curProp.default=wId;
				//if(othis.devTools)
				//	$(othis.devTools).geoUIDevTools("updateInterWidget",wId);		
			}
		},
		updateWidgetSetting: function(wId,change) {
			if(wId=="maintoolbar") {
				if(!change.hasOwnProperty("attachTo"))
					change.attachTo ="top-center";
				if(!change.hasOwnProperty("visible"))
					change.visible =true;
			}
			var othis=this, curProp=othis.getWidgetProperties(wId), curView=othis.getCurrentView(), inter=wId=="interaction",
			comp=curView.ui.find(wId);
			
			mergeObjects(curProp,change,true), btn=null;
			if(curProp.visible && !change.hasOwnProperty('visible') && !(wId=="legend" 
				|| wId=="maintoolbar" || wId=="scalebar" || wId=="zoom")) change.visible=false;
			if(wId=="timeslider" || wId=="scalerange" || wId=="discover") {
				if(curProp.create && !change.hasOwnProperty('create')) change.create=false;
			}
	
			if((wId=="legend" || wId=="maintoolbar" || wId=="scalebar" || wId=="zoom") && !curProp.visible && !change.hasOwnProperty('visible')) change.visible=true;
			if(wId=="legend" || wId=="maintoolbar" || wId=="scalebar" || wId=="zoom" || wId=="layers" || wId=="bookmarks" || wId=="basemaps") 
				if(!curProp.create && !change.hasOwnProperty('create')) change.create=true;
			if(wId=="locate") {
				btn=$(".btn"+wId); if(change.create) {btn.show(); if(!comp) othis.addLocateWidget();} else btn.hide();
			}
			else if(wId=="search" || wId=="direction" || wId=="measurement" || wId=="location" || wId=="sketch"){
				btn=$(".btn"+wId);
				curProp=othis.getWidgetProperties("interaction");
				if(curProp && !change.create && curProp.default==wId)
					curProp.default="";
				
				if(change.create){
					if(wId=="direction")othis.addRouteProxy();
					if(!btn.parent().is(":visible")) btn.parent().show(); btn.show(); 
				}
				else btn.hide();
			}
			else if(wId=="layers" || wId=="legend" || wId=="basemaps" || 
					wId=="timeslider" || wId=="bookmarks" || wId=="scalerange" || wId=="discover"){
				if(wId=="layers") btn=$(".btnToggleTOC");
				else if(wId=="legend")btn=$(".btnToggleLE");
				else if(wId=="basemaps")btn=$(".btnToggleBM");
				else if(wId=="discover")btn=$(".btnDiscover");
				else if(wId=="scalerange")btn=$(".btnScalerangeSlider");
				else if(wId=="timeslider")btn=$(".btnTimeSlider");
				else if(wId=="bookmarks")btn=$(".btnSaveCustom");
				
				if(change.hasOwnProperty("create") && btn){
					if(change.create)btn.show(); else btn.hide();
				}				
			}
			if(inter)
				wId=curProp.default;
			
			if(comp){
				var cont=$(comp.container);
				if(change.hasOwnProperty("visible")) {
					if(!comp.container && change.visible != $(comp).is(":visible")) {
						if(change.visible) $(comp).show();
						else $(comp).hide();
					}					
					else if(comp.container && change.visible != cont.is(":visible")) {
						if(wId!="devTools")
							othis.toggleUIwidget(wId);
					}
				}
				if(change.create || inter || !change.hasOwnProperty("create")){
					if(curProp.attachTo=="top-center" || curProp.attachTo=="bottom-center"){
						curView.ui.move({component: wId, position: "manual"});
						comp.renderNow();
					}
					else if(curProp.attachTo) {
						this.addWidget2View(curProp, curView, comp, "", true);	
					/*	if(this.isIndexNeeded(curProp.attachTo))
							curView.ui.move({component: wId, position: curProp.attachTo, index: curProp.index || 1});
						else curView.ui.move({component: wId, position: curProp.attachTo});*/
					}						
				}
			}
		},
		setProperty: function(pId,value) {
			this.options.Settings.properties[pId]=value;
		},
		getWidgetProperties: function(wId) {
			var prop= this.options.Settings.properties[wId];
			if(typeof(prop) === 'undefined') //check group
			{
				var inter=this.options.Settings.properties["interaction"];
				if(inter && inter.members) 
					prop=inter.members[wId];
			}
			return prop;
		},
		getWidgetSetting: function(widId) {
			var settings=null,othis = this,
            		curView=othis.getCurrentView(), comp=curView.ui.find(widId);            
            if(comp || widId=="interaction")
				settings=othis.getWidgetProperties(widId);
			return settings;
		},
		addDevToolsWidget: function() {
            var othis=this;
			if(!othis.devTools) {
				var camWdg = $(document.createElement("div")); 
				othis.devTools=camWdg[0];
				$(othis.devTools).mouseenter(function() {
				    // $(othis.devTools).geoUIDevTools("update");
				});
			}       
            else
            	$(othis.devTools).geoUIDevTools({ "ibgeo": othis, "saveAsPath": othis.reopenedFile ? othis.getMyPath(true,false) : null,
									"description": othis.reopenedFile ? othis.options.description : "" });
            return othis.devTools;
        },
		addCameraWidget: function() {
            var othis=this;
			if(!othis.camera) {
				var camWdg = $(document.createElement("div")); 
				othis.camera=camWdg[0];
			}       
        //    else
            	$(othis.camera).geoUICamera({ "ibgeo": othis, "tilt": othis.getCameraTilt(),
												"fov": othis.getCameraFov(),
												"heading": othis.getCameraHeading(),
												"elevation": othis.getCameraHeight()});
            return othis.camera;
        },			
		addOverlayWidget: function(show, overType) {
            var othis=this;
			if(show && !othis.overlay) {
				othis.overlay= $(document.createElement("div")); 
				$(othis.overlay).geoUIOverlayMessage({"type":overType});
			//	let msgContainer = $('.ds-container-message');
			//	if(msgContainer) {				
				//	msgContainer.ibxWidget("option", "type", $.ibi.CONTAINER_MESSAGE_TYPE_BLANK );  
				othis.overlay.appendTo($(".map-container-frame")); 
			//	}
			} else if(!show && othis.overlay && $(othis.overlay).is(":visible")) {
				$(othis.overlay).hide(); $(othis.overlay).css("visibility","hidden");
			} 
        },					
        createLayersList: function(content){   
			if(this.showUIControls()) { 
	            var othis = this, map=othis.getCurrentMap(), view=othis.getCurrentView();
	            var leyArr=[];
	            map.layers.forEach(function(layer){ leyArr.push(layer); });
	            leyArr.reverse();
	            leyArr.forEach(function(layer){
	                var defRend=null, feaRed=null, sizeVV=null;
	                for(var k = 0; k<othis.layerList.length; k++){
	                    if (othis.layerList[k].id == layer.id) {
	                        defRend=othis.layerList[k].defaultRenderer;
	                        feaRed=othis.layerList[k].featureReduction;
	                        sizeVV=othis.layerList[k].sizeVisVar;
	                        break;
	                    }
	                }
	                $(content).ibxWidget("add", $("<div>").geoUILayer({
	                    "ibgeo": othis,
	                    "layer": layer,
	                    "layerType": layer.type,
	                    "defaultRenderer": defRend,
	                    "featureReduction": feaRed,
	                    "sizeVisVar" : sizeVV
	                }));
	            });
			}            
        },
		updateLayerTitle: function(pathOrId, title){
			var othis = this,len = othis.layerList.length,map=othis.getCurrentMap();
			for (var i = 0; i < len; i++) {
	           if(othis.layerList[i].fileOrName === pathOrId || othis.layerList[i].id === pathOrId){
		 	   		var layer=map.findLayerById(othis.layerList[i].id);
					if(layer){
						layer.title=title;
						if(othis.layerList[i].hasOwnProperty("component"))
						othis.layerList[i].component.title=title;
					}
						
					break;
				}
	        }         
		},
        updateLayersVisibility: function (layer) {
            var visLay = null;
            var othis = this;
            for (var k in this.layerList) {
                if (this.layerList[k].layer.visible) {
                    visLay = this.layerList[k].layer;
                    break;
                }
            }
            
            var selTool = $(".cmd-ToggleST");
            selTool.ibxWidget("option", "disabled", !visLay);
            if (!visLay) {
                var selToolPopup = $(".map-selTools-main");
                if (selToolPopup && selToolPopup.length && selToolPopup.ibxPopup('isOpen'))
                    selTool.trigger("ibx_triggered");
            }
            return visLay;
        },     
        defineActions: function(event) {
            
            var othis = this;
            var item = event.item, layer=item.layer, id=layer.id, contId=id;

            if(document.getElementById(contId)) {
                if(!othis.firstTime || document.getElementById(contId)) {
					var isOpen=othis.isLayerItemOpen(id), elt=document.getElementById(contId);
                    item.panel = {
                        content: elt,
                        className: isOpen ? "esri-icon-up" : "esri-icon-down",
                        open: isOpen
                    };
					if(!isOpen)$(elt).hide();
                }
                return;
            }
			
            var _lyrOptionsWrapper = othis.getLayerOptionsElt(contId); 
			if(!_lyrOptionsWrapper) {
				_lyrOptionsWrapper=$("<div class='lyr lyr-options-wrapper' id="+contId+">").ibxHBox({'align':"stretch"});        
            	var _lyrOpacityLbl = $("<div></div>").ibxLabel();
           		_lyrOpacityLbl.appendTo(_lyrOptionsWrapper);  
			}			  
            _lyrOptionsWrapper.appendTo( $("body"));
        
            item.panel = {
                content: document.getElementById(contId),
                className: "esri-icon-down",
                open: false
            };
        },
		setLayerListItem: function(item,index,opItems){
			if(!opItems.items[index]) return;
			var othis = this, layer = opItems.items[index].layer ? opItems.items[index].layer : opItems.items[index];
			if(othis.isSatelliteLayer(layer)) {
				item.find(".esri-layer-list__item-label").on("click", function(e){		                
					othis.toggleSatelliteLayerVisibility(layer);
				});
			}
			else if(layer.type == "stream") {
				item.find(".esri-layer-list__item-label").on("click", function(e){		                
					othis.visibilityGraphicByPrivateId(layer.id, layer.visible);
				});
			}
			if(item.find(".lyr-menu").length==0/* && layer.type!="route"*/){
                var _lyrDaD = $("<div class='lyr lyr-menu' title='"+getTransString('Drag')+"'>").ibxLabel({"glyphClasses":"ibx-icons ibx-glyph-ellipsis-v-sm",draggable:true}),
				insB4=item.find(".esri-layer-list__child-toggle");
				if(insB4.length)insB4 = insB4.first(); else insB4=item.find(".esri-layer-list__item-label").first();
                _lyrDaD.insertBefore(insB4); 
				if(layer.type=="route" || (othis.devTools && !othis.isLayerGroupPart(layer))) {
					var _trash = $("<div class='lyr lyr-menu esri-widget--button esri-widget esri-interactive' title='"+getTransString('remove')+"'>").ibxLabel({"glyphClasses":"fas fa-trash"});
					 _trash.insertAfter(item.find(".esri-layer-list__item-actions-menu").first());  
					_trash.on("click", function(e){
						e = e.originalEvent;
		                var target = $(e.currentTarget);
		                if(!target.hasClass("esri-layer-list__item"))
		                    target=target.parents(".esri-layer-list__item").first();
						othis.removeLayer(target.attr("data-layerId"),true);
					});
				}
            }  
           // item.prop("id",opItems.items[index].layer.id); 
           item.attr("data-layerId", layer.id);
           item.prop("id","layer-list_item_"+index); 
     //      item.attr("data-layerId", opItems.items.length>index ? opItems.items[index].layer.id : item.prop("id"));
           othis.setDragAndDropLayersItem(item);
		},
		updateLayersList: function(layerList, groupLayer) {
			var othis = this;
			var groupitems= othis.options.useExpand ? $(layerList.content).find(".esri-layer-list__item--has-children") : 
				$(layerList.container).find(".esri-layer-list__item--has-children");
			var opItems=groupLayer.layers;
			for(var p=0; p<groupitems.length; p++){
				if(othis.isInternalLayer(groupitems.eq(p).attr("id"),true) || othis.isInternalLayer(groupitems.eq(p).attr("data-layerId"),true)) {
					let litems= groupitems.eq(p).find(".esri-layer-list__item"), index=0;
					for(var h=0; h<litems.length; h++){
		                var item=litems.eq(h);
						if(item) {
							othis.setLayerListItem(item,index,opItems);
							index++
						} 
					}
				}
            }
		},
		isLayerAnimationReady: function(layer) {
			if(layer && (layer.type=='imagery-tile' ||layer.type=='imagery' || layer.type=='wcs') && layer.rasterInfo && 
				(layer.rasterInfo.dataType == "vector-magdir" || layer.rasterInfo.dataType == "vector-uv" || layer.rasterInfo.dataType == "generic"))
				return true;
			return false;
		},
		closeMySettings:function(layer) {
			/*if(this.isLayerAnimationReady(layer))
				this.animationWidget(layer, false, true);*/
		},
		updateOpenedItemsList: function(layerId, opened) {
			var othis=this; //layerId=layerId.replace(prefix,"");
			for(var k = 0; k<othis.layerList.length; k++){
               if (othis.layerList[k].id == layerId) {
					othis.layerList[k].opened=opened;
					if(!opened) othis.closeMySettings(othis.layerList[k].layer);
					break;
				}
			}
		},
		isLayerItemOpen: function(layerId) {
			var othis=this;
			
			for(var k = 0; k<othis.layerList.length; k++){
               if (othis.layerList[k].id == layerId)
					return othis.layerList[k].opened ? true : false;
			}
			return false;
		},
		getLayerOptionsElt: function(layerId) {
			var othis=this;
			for(var k = 0; k<othis.layerList.length; k++){
               if (othis.layerList[k].id == layerId)
					return othis.layerList[k].options;
			}
			return false;
		},
		/*
		 function updateFilterGeometry() {
          // add a polygon graphic for the bufferSize
          if (sketchGeometry) {
            if (bufferSize > 0) {
              const bufferGeometry = geometryEngine.geodesicBuffer(sketchGeometry, bufferSize, "meters");
              if (bufferLayer.graphics.length === 0) {
                bufferLayer.add(
                  new Graphic({
                    geometry: bufferGeometry,
                    symbol: sketchViewModel.polygonSymbol
                  })
                );
              } else {
                bufferLayer.graphics.getItemAt(0).geometry = bufferGeometry;
              }
              filterGeometry = bufferGeometry;
            } else {
              bufferLayer.removeAll();
              filterGeometry = sketchGeometry;
            }
          }
        }
*/
		doResetFeatureEffect: function(layer) {
			let fe = new FeatureEffect({
			  filter: new FeatureFilter({
				  		geometry: null,
						where:null}),
			    excludedEffect: "",
		  		includedEffect: ""
			});
			layer.featureEffect =fe;
		},
		doUpdateFeatureEffect: function(layer, feSetting) {
		    let filter=null,whereStr="", values = null;
			if(feSetting.type=="field") {
				if(typeof(feSetting.values)==='string')
					values = feSetting.values.split(",");
				else if(Array.isArray(feSetting.values))
					values = feSetting.values;
				if(!values)return;
				values.forEach((value)=>{
					if(typeof(whereStr)==='string' && whereStr.length) whereStr+=feSetting.selComp=="=" ? " OR " : " AND ";
					whereStr+=feSetting.field+feSetting.selComp+addQuotes(value);
				});
				filter = new FeatureFilter({
				    where: whereStr
				});
				if(!whereStr || (typeof(whereStr)==='string' && whereStr.length==0))
					feSetting.excludedEffect=feSetting.includedEffect="";
			}
			else if(feSetting.type=="geometry") {
				filter = new FeatureFilter({
				  geometry: feSetting.geometry,
				  spatialRelationship: feSetting.spatialRel,
				  distance: feSetting.distance,
				  units: "meters"
				});
			}
			let fe = new FeatureEffect({
			  filter: filter,
			  excludedEffect: feSetting.excludedEffect,
		  		includedEffect: feSetting.includedEffect
			});
			layer.featureEffect =fe;
			return whereStr;
		},
		getUniqueValuesFromField: function(layer, fieldName, callBackFunc, view) {
			if(!view)view=this.getCurrentView();
			uniqueValues({
			  layer: layer,
			  field: fieldName,
			  view: view
			}).then((response)=>{
			  callBackFunc.call(this, response.uniqueValueInfos, layer);
			}).catch((error)=> {
				 //try 2d view
				console.log(error.message);
				if(view.type=='3d' && this._view)
				this.getUniqueValuesFromField(layer, fieldName, callBackFunc, this._view);
			});
		},
		
		//ST_ABBREV = 'CA' OR ST_ABBREV = 'NY'" "ST_ABBREV <> 'CA'" not equel 
        setupLayersList: function(layerList) {
            var othis = this;
			if(!othis.showUIControls() || !layerList) return;
			othis.firstTime=false;  
			var expand=$(layerList.container).find(".esri-layer-list__child-toggle");
			if(expand.length!=0) {
				expand.off("mouseup");
	            expand.on("mouseup", function (jevent) {
					var fld=$(this).parents(".esri-layer-list__item--has-children"), grLayer;
					if(fld && fld.length)
						 grLayer=othis.getCurrentMap().findLayerById(fld.attr("data-layerid"));
					if(grLayer) {
						setTimeout(function(){
							var lwid=othis.getCurrentView().ui.find('layers');	   
							othis.firstTime=false;                     
			        		othis.updateLayersList(lwid,grLayer);
						},100); 
					}						                
	            });
			}
			var expendInt = window.setInterval(function(){	
				var upDowns=$(layerList.container).find(".esri-layer-list__item-actions-menu");
				if(upDowns.length!=0) {
					expendInt=window.clearInterval(expendInt);
					$(layerList.container).removeClass("esri-hidden");
		            upDowns.off("mouseup");
		            upDowns.on("mouseup", function (jevent) {
		                var child=$(this).find("span").first(), toOpen=child.hasClass("esri-icon-down");
		                if(toOpen) {child.removeClass("esri-icon-down");child.addClass("esri-icon-up");}
		                else {child.removeClass("esri-icon-up");child.addClass("esri-icon-down");}
						var layerOptW= child.parents(".esri-layer-list__item").first().find(".lyr-options-wrapper");
		                if(toOpen){
		                    setTimeout(function(){
								layerOptW= child.parents(".esri-layer-list__item").first().find(".lyr-options-wrapper").first();
		                        if(layerOptW && layerOptW.children().length==1)
		                            othis.addLayersOptions(layerOptW);
								$(layerOptW).show();
								othis.updateOpenedItemsList(layerOptW.attr("id"), true);
							},100); 
		                }
						if(layerOptW && layerOptW.length)
							othis.updateOpenedItemsList(layerOptW.attr("id"), toOpen);
		            });
					var litems= othis.options.useExpand ? $(layerList.content).find(".esri-layer-list__item") : $(layerList.container).find(".esri-layer-list__item");
		            var opItems=layerList.operationalItems, index=0;
		            for(var h=0; h<litems.length; h++){
		                var item=litems.eq(h);
		                if(item && item.parents(".esri-layer-list__item--has-children").length==0) {
							othis.setLayerListItem(item,index,opItems);
							index++
						} 
		            }
				}
			}, 1000); 
        //    layerList.off("trigger-action");
            layerList.on("trigger-action", function(event) {
            // The layer visible in the view at the time of the trigger.
                var curItem = event.item;
    
                // Capture the action id.
                var id = event.action.id;
    
                if (id === "full-extent") {
                    othis.setTargetLayer(curItem.layer.id);
                } else if (id === "information") {
                    // if the information action is triggered, then
                    // open the item details page of the service layer
                    window.open(visibleLayer.url);
                } else if (id === "increase-opacity") {
                    // if the increase-opacity action is triggered, then
                    // increase the opacity of the GroupLayer by 0.25
    
                    if (curItem.layer.opacity < 1) {
                        curItem.layer.opacity += 0.25;
                    }
                } else if (id === "decrease-opacity") {
                    // if the decrease-opacity action is triggered, then
                    // decrease the opacity of the GroupLayer by 0.25
    
                    if (curItem.layer.opacity > 0) {
                        curItem.layer.opacity -= 0.25;
                    }
                }
            });
			if(othis.refresh && othis.refreshing)
				othis.continueRefreshing();
		/*	setTimeout(function(){
				const event = new MouseEvent('mouseup', {
			    view: window, bubbles: true, cancelable: true
				  });
				upDowns.eq(0)[0].dispatchEvent(event);
					            //upDowns.trigger("click");
				},1000); 
		//	upDowns.trigger("mouseup");
			if(othis.refreshIndex && othis.refreshIndex!=-1) {
				setTimeout(function(){
				const event = new MouseEvent('mouseup', {
			    view: window, bubbles: true, cancelable: true
				  });
				$(".esri-layer-list__item-actions-menu-item").eq(othis.refreshIndex)[0].dispatchEvent(event);
					            //upDowns.trigger("click");
				},1000); 
			}*/
			
        },
		isDevTools: function(){
			return this.devTools;
		},
        layerIdFromLItem: function(listItem){
            var ret=null;
            var optW = listItem.find(".lyr-options-wrapper");
            if(optW && optW.length)
                ret=optW.attr("id");
            return ret;
        },
		addScreenshotImage: function() {
			if(!this.ssImage) {
				this.ssImage=$("<div class='mlmScreenshotImage'></div>");
				this.ssImage.appendTo($(".map-container-frame"));
			}			
		},
        getDragImage: function(el) {
            //clone the node and make sure the width/height are preserved so it lays out correctly.
           // var el = $(this.element);
            var width = el.outerWidth();
            var height = el.outerHeight();
            this.dragclone = el.clone().css({"left":el.position().left,"top":el.position().top, "width":width + "px", "height":height + "px"}).removeAttr("id");
            this.dragclone.addClass("dragImage");
			this.dragclone.appendTo("#"+this.mapContainer.id);
            return this.dragclone[0];
        },
		isDataLayer: function(layerId) {
			var othis = this;
			for(var k = 0; k<othis.layerList.length; k++){
               if (othis.layerList[k].id == layerId && othis.layerList[k].dataLayer)
					return true;
			}
			return false;
		},
		isInternalLayer: function(layerId, checkData){
			var othis = this, map=othis.getCurrentMap(), trg = map.findLayerById(layerId), dataL=checkData ? othis.isDataLayer(layerId) : null;
            return dataL || (trg && trg.type=="group" && !(trg.url || trg.portalItem));
		},
        setDragAndDropLayersItem: function (layerItem) {
            var othis = this, map=othis.getCurrentMap();
            var bInsBefore=true; othis.dragclone=null;
			$(layerItem).off("ibx_dragstart ibx_dragover ibx_dragleave ibx_drop");
            $(layerItem).on("ibx_dragstart ibx_dragover ibx_dragleave ibx_drop", function(e)
            {
                e = e.originalEvent;
                var target = $(e.currentTarget);
                if(!target.hasClass("esri-layer-list__item"))
                    target=target.parents(".esri-layer-list__item");
                var dt = e.dataTransfer;
                var tarLId=target ? target.attr("data-layerId") : null, drLayerId=dt.getData("dragLayerId");
                if(tarLId){                
                    if(e.type == "ibx_dragstart" && !othis.dragclone) {
                        dt.setData("dragItem", target.prop("id"));
                        dt.setData("dragLayerId", tarLId);
                        dt.setDragImage(othis.getDragImage(target), -5, -target.height()/2);
                        bInsBefore=true;
                    }
                    else
                    if(e.type == "ibx_dragover")
                    {
                        var dragItem = $("#" + dt.getData("dragItem"));
                        var tId = target.prop("id");
                        var prevId=target.prev().attr("id");
                        var nextId=target.next().attr("id");
                        var dId = dragItem.prop("id");
                   //     if(nextId && dId) {
	                        bInsBefore = e.offsetY < target.height()/2;
	                        if(othis.isInternalLayer(tarLId,false) || e.buttons==2) {
								target.ibxAddClass("drag-target");
	                            dt.dropEffect = "move";
	                            e.preventDefault();
							}
							else if(tId != dId && (dId != prevId || !bInsBefore) && (dId != nextId || bInsBefore)) {
	                            target.ibxAddClass("drag-target");
	                            dt.dropEffect = "copy";
	                            e.preventDefault();
	                        }
				//		}
                    }
                    else
                    if(e.type == "ibx_dragleave")
                    {
                        target.ibxRemoveClass("drag-target");
                    }
                    else
                    if(e.type == "ibx_drop")
                    {
                        target.ibxRemoveClass("drag-target");
						othis.dragclone=null;
						if(e.button==2) {
							let map= othis.getCurrentMap(), layer1 = map.findLayerById(tarLId),
            					layer2 = map.findLayerById(drLayerId);
							if(layer1 && layer2) {
								let msg = "Do you want to group layer " + layer1.title + " with layer " + layer2.title + "?";
								if(confirm(msg))
									othis.createGroupLayer(tarLId, drLayerId);
							}							
						} 
                        else if(dt.dropEffect == "move")
							othis.addLayerToGroup( tarLId, dt.getData("dragLayerId"));
						else 
							setTimeout(function(){ othis.setLayerBefore( tarLId, dt.getData("dragLayerId"),bInsBefore);},50);
                    }
                }
            });           
            //drag-and-drop end
        },
		createGroupLayer: function(layer1Id, layer2Id) {
			let map= this.getCurrentMap(), layer1 = map.findLayerById(layer1Id),
            layer2 = map.findLayerById(layer2Id);
			if(layer1 && layer2) {
				let ttl= layer1.title + " and " + layer2.title, indTr= map.layers.indexOf(layer2Id), comp = { title:ttl, visible:true,opacity:1},
				grLayer = new GroupLayer({title: ttl});
				grLayer.addMany([layer1,layer2]);
				var layerProps = {
	                id: grLayer.id,
	                layer: grLayer,
	                component:comp,
	                layerJson: {}
	            };	

				this.layerList.splice(indTr, 0, layerProps);	
				this.addLayer(layerProps, indTr);
				this.refreshLayersList();
	         //   this.insertLayer(layerProps, grLayer);
			//	this.addLayer(layerProps);
			//	map.reorder(grLayer, indTr);
			}
		},
		setLayerBefore: function (layTargetId, layMovedId, bInsBefore) {
            var moved = this.getCurrentView().map.findLayerById(layMovedId);
            var trg = this.getCurrentView().map.findLayerById(layTargetId);
            var indMvd = this.getCurrentView().map.layers.indexOf(moved);
            var indTrg = this.getCurrentView().map.layers.indexOf(trg);
            var len = this.layerList.length;
            if (bInsBefore && indMvd > indTrg)
                indTrg++;
            this.getCurrentView().map.reorder(moved, indTrg);
        },
		addLayerToGroup: function (layTargetId, layMovedId) {
            var othis=this, map=this.getCurrentMap(), moved = map.findLayerById(layMovedId),
            trg = map.findLayerById(layTargetId);
			if(trg && moved && trg.type=="group"){
				map.remove(moved);
				setTimeout(function(){ 
					trg.add(moved);
					if(moved.blendMode!="normal")
						trg.blendMode=moved.blendMode;
					//othis.refreshLayersList();
					othis.firstTime=false;                     
		   			othis.updateLayersList(othis.getCurrentView().ui.find('layers'),trg);
				},200);   
			}
        },
		getGroupLayerEx: function(layer) {
			let map = this.getCurrentMap();
			for (let i = 0; i < map.layers.length; i++) {
                if(map.layers.items[i].type=="group" && map.layers.items[i].findLayerById(layer.id))
					return map.layers.items[i];
            }			
			return null;
		},
		executeBookmark: function(view, goToParams) {
			let comp=view.ui.find("bookmarks"), gotoV=goToParams.target;
			if(comp && comp.viewModel.activeBookmark) {
				let bm=this.getBookmark(comp.viewModel.activeBookmark.uid);
				if(bm.selected)gotoV=view.viewpoint;
			}
  			return view.goTo(gotoV);
		},
		selectBookmark: function(bmark) {
			let bm=this.getBookmark(bmark.bookmark.uid);
			if(bm && !bm.selected) {
				for(let i = 0; i<this.bookmarksList.length; i++) {
					this.bookmarksList[i].selected=false;
				}
				bm.selected=true;
				let state = bm.mapstate;
				this.reloadMapState(state);
				var othis=this, viewpoint=bmark.bookmark.viewpoint;
				setTimeout(function(){
					othis.getCurrentView().goTo(viewpoint);	}, 20);		
			//	$(".btnRemoveCustom").removeClass("disabledwidget");		
			}
		},
		reloadWithoutBookmarks: function() {
			let state = JSON.stringify(this.options.originalProperties);
			this.reloadMapState(state);
			for(let i = 0; i<this.bookmarksList.length; i++) {
				this.bookmarksList[i].selected=false;
			}
		},
		editBookmark: function(bmark) {
			let bm=this.getBookmark(bmark.bookmark.uid), state = this.getStateToSave(bmark.bookmark.timeExtent);
			if(bm && state) {
				bm.mapstate=state; 
				this.options.savedState=JSON.parse(state);
				bm.name=bmark.bookmark.name; 
				bm.viewpoint=JSON.stringify(bmark.bookmark.viewpoint);
				bm.url= bmark.bookmark.thumbnail ? bmark.bookmark.thumbnail.url :"";
				setTimeout(this.saveCustomizationMapState.bind(this, true),10);				
			}
		},
		removeBookmark: function(event) {
			for(let i = 0; i<this.bookmarksList.length; i++) {
				if(this.bookmarksList[i].id==event.item.uid) {
					this.bookmarksList.splice(i, 1); 
					setTimeout(this.saveCustomizationMapState.bind(this, true),10);
					break;
				}
			}
		},
		addBookmark: function(event) {
			let state = this.getStateToSave(event.item.timeExtent);
			for(let i = 0; i<this.bookmarksList.length; i++)
				this.bookmarksList[i].selected=false;
			this.options.savedState=JSON.parse(state);
			this.bookmarksList.push({"id" : event.item.uid, "mapstate" : state, "name" : event.item.name, 
				"viewpoint": JSON.stringify(event.item.viewpoint), "selected":true, 
				"url": event.item.thumbnail ? event.item.thumbnail.url : ""});
			setTimeout(this.saveCustomizationMapState.bind(this, true),10);
		},
		getBookmark: function(id) {
			for(let i = 0; i<this.bookmarksList.length; i++) {
				if(this.bookmarksList[i].id==id) return this.bookmarksList[i];
			}
			return null;
		},
		serializeBookmarks: function() {
			let arrBmarks=[];
			for(let i = 0; i<this.bookmarksList.length; i++) {
				let bm = this.bookmarksList[i];
				arrBmarks.push(bm);
			}
			return JSON.stringify({"bookmarks":arrBmarks});
		},
		getDefaultAnimationRenderer: function() {
			const aniJson ={
	             "type": "flow",
	         	"density" : 0.5,
	         	"maxPathLength" : 100,
	        	"color" : [0, 0, 255],
	        	"trailLength" : "200px",
	        	"flowSpeed" : 10,  
	        	"trailWidth" : "1.5" 
	        };
			return FlowRenderer.fromJSON(aniJson);
		},
		animationWidget: function(layer, bDntShow, bHide) {
			var othis = this, view=othis.getCurrentView(), cont=null;
			let comp=view.ui.find("animation");
			if(comp) {	
				let vis = $(comp).is(":visible"), curLayer=	$(othis.animation).geoUIAniRenderer("layer"),
				compl=function(){
	                $(othis.animation).geoUIAniRenderer("layer",layer);
	            };			
				if(vis) {
					if(curLayer && layer && layer.id==curLayer.id)
						$(comp).hide({ effect: "blind",  duration: 300});
					else if(layer)
						$(othis.animation).geoUIAniRenderer("layer",layer);
				}	
				else if(layer && !bDntShow && !bHide){
					$(comp).show({ effect: "blind",  duration: 300, complete: compl });
				}				
			}
			else if(!bDntShow && !bHide){
				sProp=othis.getWidgetProperties('layers'); 
				if(sProp.visible || sProp.create) {
					if(!othis.animation) {
						othis.animation = $(document.createElement("div")); 
						othis.animation.attr("id","animation");
						
	            		$(othis.animation).geoUIAniRenderer({ "ibgeo": othis, "layer" : layer});           
		          //      view.ui.add({component: othis.animation[0], position: (sProp.attachTo=="top-left"||sProp.attachTo=="top-right") ? "top-trailing" : "bottom-trailing", 
				//				index: sProp.index});
						view.ui.add({component: othis.animation[0], position: "bottom-left"});
		                othis.activeWidgets.push(othis.animation);
					}
				}
			}			
		},
		setScalerangeLayer: function(layer) {
			var comp=this.getCurrentView().ui.find("scalerange");	
			if(comp) {
				comp.layer=layer;
				comp.maxScale=layer.maxScale;
				comp.minScale=layer.minScale;
				comp.domNode.title=layer.title;
			}				
		},
		setTimesliderActions: function() {
			var view=this.getCurrentView(), comp=view.ui.find('timeslider');
			if(comp) {
				let optBtn=$(comp.container).find(".esri-time-slider__actions");
				$(comp.container).find("#settings").css("display","none");
				optBtn.off("mousedown",this.onTimesliderSettings.bind(this));
			//	optBtn.on("mousedown",(event)=>{event.stopImmediatePropagation();event.preventDefault();this.onTimesliderSettings();});
				optBtn.on("mousedown",this.onTimesliderSettings.bind(this));
			}
		},
		onTimesliderSettings: function() {
			var view=this.getCurrentView(), comp=view.ui.find('timeslider');
			if(comp) {
				if(!this.timeSliderOptions) this.timeSliderOptions=$("<div></div>").geoUITimeSliderOptions({ibigeo: this, timeSlider:comp});
				setTimeout(() => {this.timeSliderOptions.geoUITimeSliderOptions("show");}, 100);				
			}
		},
		resetTimeslider: function() {
			var view=this.getCurrentView(), comp=view.ui.find('timeslider');	
			if(comp){
				comp.fullTimeExtent=comp.timeExtent=null;
				this.timeExtentChanged(comp);
				this.timeInt=window.clearInterval(this.timeInt);				
				//comp.disabled=true;
				//$(comp.container).find(".esri-time-slider__slider").hide();
			}
		},
		addSearchWidget: function(addTo) {
			let searchWidget =new Search({ view: this.getCurrentView(), id: "discoverSearch", 
					autoSelect: false,
					popupEnabled : false});
			searchWidget.container=addTo[0]; var othis=this;
			searchWidget.on("search-complete", function(event){
			  // The results are stored in the event Object[]
				
				if(Array.isArray(event.results) && event.results && event.results) {
					othis.startDriveDiscover("search");
					othis.selectByDrivingTime(event.results[0].results[0].feature.geometry.clone());
				}
			  console.log("Results of the search: ", event);
			});
		},
		addWeatherWidget: function(addTo) {
			let wWidget =new Weather({ view: this.getCurrentView(), id: "weatherWidget",
			visibleElements: { header: false } });
			wWidget.container=addTo[0]; 
		},
		addTimepickerWidget: function(addTo) {
			let tWidget =new TimePicker({ container: addTo[0], value: new Date() });
			return tWidget; 
		},
		addDaylightWidget: function(addTo) {
			let wWidget =new Daylight({ view: this.getCurrentView(), id: "daylightWidget",
			visibleElements: { header: false, timezone: false } });
			wWidget.container=addTo[0]; 
		},
		resetEnvironmentSettings: function() {
			let view=this.getCurrentView(), comp=view.ui.find("weatherWidget");
			if(comp)
				comp.view=view;
			comp=view.ui.find("daylightWidget");
			if(comp)
				comp.view=view;
			if(this.camera) {
				$(this.camera).geoUICamera("outsideUpdates", true);
				$(this.camera).geoUICamera("updateOtherSettings");
			}
		},
		doLocate: function() {
			var comp=this.getCurrentView().ui.find("locate"), othis=this;	
			if(comp)
				comp.locate().then(function(resolvedVal) {
				    	if(othis.options.discoverType =="locate" && resolvedVal.coords) {
							othis.selectByDrivingTime( new Point({
								latitude:resolvedVal.coords.latitude,
								longitude:resolvedVal.coords.longitude}));
						}
				    }).catch(function(error) {
				    alert(error.message);
				});
		},
		discoverWidget: function() {
			var othis = this, view=othis.getCurrentView(), cont=null;
			let comp=view.ui.find("discover"), ret=true;
			if(comp) {	
				let vis = $(comp).is(":visible"),
				compl=function(){
	                $(othis.discover).geoUIDiscover("onShow");
	            };			
				if(vis) {					
					$(comp).hide({ effect: "blind",  duration: 300});		
					ret=false;			
				}	
				else $(comp).show({ effect: "blind",  duration: 300, complete: compl });
				othis.addLocateWidget();					
			}			
			return ret;
		},
		addRouteLayerFromDirection : function(layer) {
			if(layer.portalItem && !this.addingFromDirections) {
				let found=false, map=this.getCurrentMap(), index = this.layersAddedDir.indexOf(layer.portalItem.id);
				if(index==-1) {
					for (let i = 0; i < map.layers.length; i++) {
	                    let lay = map.layers.items[i];
						if(lay.portalItem && lay.portalItem.id == layer.portalItem.id && lay.id != layer.id) {
							found=true;
							break;
						}
					}
					if(!found) {
						this.addingFromDirections=true, apikey=this.getApiKey(), dirWidget=this.getCurrentView().ui.find('direction');
						if(dirWidget && dirWidget.apiKey) apikey= dirWidget.apiKey;
						let adFromPortal = Layer.fromPortalItem({
						  portalItem: new PortalItem({id:layer.portalItem.id})}).then(
					          (response) => {
					            if (response) {
									response.visible=false;
									this.layersAddedDir.push(response.portalItem.id);
									map.add(response);
									response.on("layerview-create", (event)=>{
										//if(!layer.portalId)
										//othis.createRoutePopupTemplates(layer);
										event.layerView.layer.listMode="show"; 
							//			this.saveToPortal(response);	
									});
									this.addingFromDirections=false;														
					            }
					          },
					          (err) => {
								//	alert(portalItemId + " " +err.message);
									this.addingFromDirections=false;
									console.log(err.message);
					          });
					}
				}
			}
		},		
		getTimesliderDefaults: function(tmslider, timeSlVis) {
			let sProp=this.getWidgetProperties('timeslider');
			if(sProp && tmslider) {
				tmslider.fullTimeExtentSaved=tmslider.timeExtentSaved=null;
				tmslider.timeVisible= sProp.timeVisible;
				tmslider.layout=sProp.layout;
				tmslider.loop= sProp.loop;
				tmslider.playRate=sProp.playRate;
				tmslider.mode= sProp.mode;
				tmslider.stops=sProp.hasOwnProperty("stops") ? sProp.stops : {count:10};
				if(timeSlVis)tmslider.fullTimeExtent=sProp.hasOwnProperty("fullTimeExtent") ? sProp.fullTimeExtent : null;	
				else {
					tmslider.fullTimeExtentSaved=tmslider.fullTimeExtent=sProp.hasOwnProperty("fullTimeExtent") ? sProp.fullTimeExtent : null;
					tmslider.fullTimeExtent=null;
				}						
			}
		},
		isIndexNeeded: function(attachTo) {
			return (attachTo == "bottom-leading" || attachTo == "bottom-trailing" || 
					attachTo == "top-leading" || attachTo == "top-trailing" || attachTo == "manual") ? false : true;
		},
		addWidget2View: function(sProp, view, comp, defPosition, move) {
			if(move) {
				if(sProp && this.isIndexNeeded(sProp.attachTo))
					view.ui.move({component: comp, position: sProp.attachTo, index: sProp ? sProp.index : 0});			
				else view.ui.move({component: comp, position: sProp.attachTo});				
			}
			else {
				if(sProp && this.isIndexNeeded(sProp.attachTo))
					view.ui.add({component: comp, position: sProp ? sProp.attachTo : defPosition, index: sProp ? sProp.index : 0});		
				else if(sProp)	
					view.ui.add({component: comp, position: sProp ? sProp.attachTo : defPosition});
				else 
					view.ui.add({component: comp, position: defPosition, index: 0});
				if(this.isPreviewMode()) $(comp).addClass("wfc-map-disabledwidgetPreview");
			}
			if(sProp && sProp.attachTo == "manual" && sProp.index){
				let val=sProp.index, cssT={};
				if(typeof(val) == 'string') {
					if(val.search(':')) {
						let parts=val.replaceAll(';',',').replaceAll('\n','').split(',');
                        for(let i=0; i<parts.length; i++) {
                           	let part=parts[i].split(':');
							if(part.length==2)
                           		cssT[part[0].trim()]=part[1].trim();
                        }						
                        $(comp.container).css(cssT);
					}
					else $(comp.container).addClass(sProp.index);
				}
				else $(comp.container).css(cssT);
			} 
		},
        addViewUI: function (UI, bNoProp) {
            var othis = this, expand=othis.options.useExpand, sProp={},view=othis.getCurrentView();
            var widgets = {
                'search': function () {
					sProp=bNoProp ? null : othis.getWidgetProperties('search');                
                    var searchWidget = null;
					if(!sProp || sProp.visible) {
						searchWidget =new Search({ view: othis.getCurrentView(), id: UI});
						if(!bNoProp)
							othis.addWidget2View(sProp, view, searchWidget, "top-right");
						if(othis.isTooltipEnabled())
	                    view.popup.set("dockOptions", { position: "top-right"});
	                    othis.activeWidgets.push(searchWidget);       
	                    othis.srchInpFocOut=false;
	                    searchWidget.on("search-focus", function(event){
	                        if(!othis.srchInpFocOut){
	                            othis.srchInpFocOut=true;
	                            $(".esri-search__input-container").find("input").focusout(function(event) {
	                                event.stopPropagation();
	                            });
	                        }                        
	                    });
					}
                    return searchWidget;
                },
				'discover': function () {
					sProp=othis.getWidgetProperties('discover'); 
                    othis.discover = null;
					sProp=bNoProp ? null : othis.getWidgetProperties('discover'); 
					if(bNoProp || sProp.create || othis.isPreviewMode()) {
	                    othis.discover = $(document.createElement("div")); 
						othis.discover.attr("id","discover");	
						if(!othis.isPreviewMode())	 	
		        			$(othis.discover).geoUIDiscover({ "ibgeo": othis, "serviceDesc": othis.options.servDesc});
						else {
							$(othis.discover).text(getTransString("discover")).addClass("wfc-map-disabledDiscoverwidget esri-widget__content--empty");
						}
						if(!bNoProp)
							othis.addWidget2View(sProp, view, othis.discover[0], "bottom-left");
					//	measurement.view=view;
						//measurement.activeTool = othis.getWidgetProperties("viewType") === "2d" ? "distance" : "direct-line"; 
	                   othis.activeWidgets.push(othis.discover);
					}
                   return othis.discover;
                },
                'basemaps': function () {
					sProp=othis.getWidgetProperties('basemaps'); 
                    var basemapGallery=null, localBM = [];
                    
					if(expand) {
						basemapGallery = new Expand({
						  expandIconClass: othis.options.inheritEsriTheme ? "esri-icon-basemap" : "ds-icon-map",  					  
						  view: view,
							expandTooltip: getTransString("Switch_Basemap"),
						  id: UI,
						  content: new BasemapGallery({ view: othis.getCurrentView(), container: document.createElement("div") })
						});
					}
					else 
						basemapGallery = new BasemapGallery({/*source:source,*/ view: othis.getCurrentView(), id: UI});
					othis.addWidget2View(sProp, view, basemapGallery, "top-right");
                    othis.activeWidgets.push(basemapGallery);
                    
                    return basemapGallery;
                },
                'legend': function () {
					sProp=othis.getWidgetProperties('legend'); 
                    var legend;
					if(expand) {
						  legend = new Expand({
							  expandIconClass: othis.options.inheritEsriTheme ? "esri-icon-layer-list" : "ds-icon-map-legend",  					  
							  view: view,
							  expandTooltip: getTransString("Legend"),
							  id: UI,
							  content: new Legend({ view: view, container: document.createElement("div"), style:{type:"classic",layout: "side-by-side"} })
						});
					}
					else 
						legend = new Legend({ view: view, id: UI, style:{type:"classic",layout: "side-by-side"} });	
					othis.addWidget2View(sProp, view, legend, "bottom-left");
                   othis.activeWidgets.push(legend);
                   return legend;
                },
				'devTools': function () {
					var cont=null, devTools=null;
					sProp=othis.getWidgetProperties('devTools'); 
					if(sProp.visible || sProp.create) {
						cont=othis.addDevToolsWidget();
	                    devTools = new Expand({
								  expandIconClass: "fa fa-cog",  					  
								  view: view,
								  expandTooltip: getTransString("DevTools"),
								  id: UI,
								  content: cont
						});
						othis.addWidget2View(sProp, view, devTools, "top-right");
						setTimeout(function(){othis.addDevToolsWidget();},2000);
						
	                   othis.activeWidgets.push(devTools);
					}
                   return devTools;
                },
				'camera': function () {
					var cont=null, camera;
					sProp=othis.getWidgetProperties('camera'); 
					if(!othis.isPreviewMode() && (sProp.visible || sProp.create)) {
						cont=othis.addCameraWidget();
	                    camera = new Expand({
							  expandIconClass: "ibx-label-glyph ibx-label-icon ds-icon-configure",  					  
							  view: view,
							  expandTooltip: getTransString("environment"),
							  id: UI,
							  content: cont
						});
						othis.addWidget2View(sProp, view, camera, "top-right");
					//	setTimeout(function(){othis.addCameraWidget();},2000);						
	                    othis.activeWidgets.push(camera);
					}
                   return camera;
                },
				'bookmarks': function () {
					var cont=null, bmarks;
					sProp=othis.getWidgetProperties('bookmarks'); 
					if(sProp.visible || sProp.create || othis.isPreviewMode()) {
						bmarks = new Bookmarks({ view: othis.getCurrentView(), id: UI, bookmarks: othis.restoreBookmarks(),
								editingEnabled:true, goToOverride: othis.executeBookmark.bind(othis) });
						othis.addWidget2View(sProp, view, bmarks, "top-right");
                    	othis.activeWidgets.push(bmarks);
                    	bmarks.on("bookmark-edit", othis.editBookmark.bind(othis));
						bmarks.on("bookmark-select", othis.selectBookmark.bind(othis));
						
						bmarks.when(function(){
						    bmarks.bookmarks.on("before-add", othis.addBookmark.bind(othis));
							bmarks.bookmarks.on("before-remove", othis.removeBookmark.bind(othis));
						}, function(error){
						  // This function will execute if the promise is rejected due to an error
						});
                    	return bmarks;
					}
                   return bmarks;
                },
				'timeslider': function () {
					var cont=null, tmslider;
					sProp=othis.getWidgetProperties('timeslider'); 
					if(sProp.visible || sProp.create || othis.isPreviewMode()) {
					//	let cont=$(".mlm-timeSlider");      
						tmslider = new TimeSlider({ view: othis.getCurrentView(), id: UI, //container:cont[0],
								timeVisible: sProp.timeVisible,	layout: sProp.layout,
								loop: sProp.loop,playRate: sProp.playRate,	mode: sProp.mode,
								actions: [
										{ id:"settings", icon: "configure-popup", title:getTransString("settings")}
								//		,										{ id:"reset_to_default", icon: "reset", title:getTransString("disconnect")}
									]	
							 });
							 
						tmslider.when(function() { 
							othis.setTimesliderActions(); 
							});
							
						if(sProp.hasOwnProperty("stops"))
							tmslider.stops=sProp.stops;	
						if(sProp.hasOwnProperty("fullTimeExtent")) {
							if(sProp.visible)tmslider.fullTimeExtent=sProp.fullTimeExtent;
							else tmslider.fullTimeExtentSaved=sProp.fullTimeExtent;	
						}			
						othis.addWidget2View(sProp, view, tmslider, "bottom-left");                    	
                    	othis.activeWidgets.push(tmslider);
						tmslider.watch("timeExtent", (timeExtent) => {
							if(othis.is3dView() && tmslider.viewModel.state!="playing")
								othis.timeInt=window.clearInterval(othis.timeInt);
							othis.timeExtentChanged(tmslider);
							if(othis.is3dView() && tmslider.viewModel.state=="playing" && !othis.timeInt) {
								othis.timeInt = window.setInterval(()=>{
								//othis.timeInt=window.clearInterval(othis.timeInt);
								  tmslider.viewModel.next();
							   	}, tmslider.playRate);
							}
						});  	
                    	return tmslider;
					}
                   return tmslider;
                },
                'locate': function () {
					var locate = null;
					sProp=bNoProp ? null : othis.getWidgetProperties('locate'); 
					if(bNoProp || sProp || othis.isPreviewMode()) {
	                    locate = new Locate({
	                        view:  view, id: UI });
						if(!bNoProp)
							othis.addWidget2View(sProp, view, locate, "bottom-right");
	                   othis.activeWidgets.push(locate);
					}
                   return locate;
                },
				'location': function () {
					var location = null;
					sProp=bNoProp ? null : othis.getWidgetProperties('locate'); 
					if(bNoProp || sProp.visible || othis.isPreviewMode()) {
	                    location = new CoordinateConversion({
	                        view:  view, id: UI });
						if(!bNoProp)
						othis.addWidget2View(sProp, view, location, "top-right");
	                   othis.activeWidgets.push(location);
					}
                   return location;
                },
				'measurement': function () {
					var measurement = null;
					sProp=bNoProp ? null : othis.getWidgetProperties('measurement'); 
					if(bNoProp || sProp.visible || sProp.create) {
	                    measurement = new Measurement({ linearUnit: "miles", areaUnit: "square-miles",
	                        view:  view, id: UI});
						if(!bNoProp)
							othis.addWidget2View(sProp, view, measurement, "top-right");
					//	measurement.view=view;
						//measurement.activeTool = othis.getWidgetProperties("viewType") === "2d" ? "distance" : "direct-line";
	                   othis.activeWidgets.push(measurement);
					}
                   return measurement;
                },
				'direction': function () {
					var direction = null;
					const routeLayer = othis.addDummyRouteLayer(true);
					sProp=bNoProp ? null : othis.getWidgetProperties('direction'); 
					if((bNoProp || sProp.visible || sProp.create)) {
						let apiKey = othis.getApiKey();
	                    direction = new Directions({ view:  view, id: UI, units:"miles", apiKey: apiKey,
								visibleElements: {
								    saveAsButton: apiKey ? false : true,
								    saveButton: apiKey ? false : true
								  }
								 });
						if(!othis.isPreviewMode())
							direction.layer= routeLayer;
						if(!bNoProp)
							othis.addWidget2View(sProp, view, direction, "top-right");
	                   othis.activeWidgets.push(direction);
					}
                   return direction;
                },
				'sketch': function () {
					var sketch = null;
					const graphLayer = othis.addDummyGraphicsLayer(true);
					sProp=bNoProp ? null : othis.getWidgetProperties('sketch'); 
					if(bNoProp || sProp.visible || sProp.create) {
						
	                    sketch = new Sketch({ view:  view, id: UI, layer: graphLayer,
								visibleElements: {
								    
								  }
								 });
					
						if(!bNoProp)
						othis.addWidget2View(sProp, view, sketch, "top-right");
						sketch.postInitialize = function(){
		                    $(sketch.container).addClass("mlm-symbol-editor-parent");			
		                };       

	                   othis.activeWidgets.push(sketch);
						othis.noteEdit=$("<div></div>");
						if(!othis.isPreviewMode()) {
							othis.noteEdit.geoUISymbolSettings({'ibgeo':othis});
							othis.noteEdit.hide();
							sketch.on("update", othis.sketchGraphicUpdate.bind(othis));
							sketch.on("create", othis.sketchGraphicCreate.bind(othis));		
						}
										
					}
                   return sketch;
                },
				'maintoolbar': function () {
					sProp=othis.getWidgetProperties('maintoolbar');
		            if(othis.showUIControls() && (sProp.visible || othis.devTools || othis.isPreviewMode())) {    
						var tBar = $(".map-container-tbar");      
						tBar.css("visibility", "hidden");      
		                var buttons = tBar.find(".ibx-button");
		                buttons.removeClass("ibx-button"); buttons.addClass("esri-widget--button");
		                buttons = tBar.find(".ibx-radio-button");
		                buttons.removeClass("ibx-radio-button"); buttons.removeClass("ibx-check-box"); 
		                buttons.addClass("esri-widget--button");
		
		                var tbW = new Widget({ view: view, id: "maintoolbar" }), pos=sProp ? sProp.attachTo : "top-center";
		               
		                if(pos=="top-center" || pos=="bottom-center") {
							pos="manual";
							view.ui.add({component: tbW, visible: false, position: pos, index: sProp ? sProp.index : 0});
						}
		                else othis.addWidget2View(sProp, view, tbW, "top-right");
		                
		                tbW.render = function(){
		                    var wCont=$(tbW.container);							
		                    var pLeft= "calc(50% - " + wCont.width()/2 + "px)";
		                    if(sProp.attachTo=="top-center") {
		                        wCont.css({"top": "10px", "left":pLeft});
		                    }
		                    else if(sProp.attachTo=="bottom-center") {
		                        var dist=wCont.height()+25, pTop= "calc(100% - " + dist + "px)";
		                        wCont.css({"top": pTop, "left":pLeft});
		                    }		
							if(!tBar.parent() || !tBar.parent().hasClass("esri-component")) {
								tBar.addClass("esri-popup--shadow");
			                    tBar.appendTo($(wCont));	
								setTimeout(() => {
									tBar.css("visibility", "visible");
									tbW.visible=true;		
								}, 500);												         
							}           
		                    return ( '<div></div>');							
		                };       
		            }      
                },
				'scalebar': function () {
					var scalebar = null;
					sProp=othis.getWidgetProperties(UI); 
                    if (sProp.visible) {
		                scalebar = new ScaleBar({
		                    view: view,
		                    unit: sProp.scalebarUnit,
		                    style: sProp.scalebarStyle,
		                    id: UI
		                });
						othis.addWidget2View(sProp, view, scalebar, "bottom-right");
						othis.activeWidgets.push(scalebar);						
		            }                    
                    return scalebar;
                },
				'scalerange': function () {
					var scalerange = null;
					sProp=othis.getWidgetProperties(UI); 
                    if (sProp.create || othis.isPreviewMode()) {
						scalerange=new ScaleRangeSlider({
							view: view,
							id: UI,
							region: sProp && sProp.hasOwnProperty('region') ? sProp.region : 'US'
						});
						if(sProp.hasOwnProperty('maxScaleLimit'))
							scalerange.maxScaleLimit=sProp.maxScaleLimit;
						if(sProp.hasOwnProperty('minScaleLimit'))
							scalerange.minScaleLimit=sProp.minScaleLimit;
						othis.addWidget2View(sProp, view, scalerange, "bottom-right");
						scalerange.watch(["minScale", "maxScale"], function(value, oldValue, name) {
						  	if(typeof(scalerange.layer)!='undefined' && scalerange.layer) {
								let grLayer=othis.getGroupLayerEx(scalerange.layer);
								//if(scalerange.layer.visible && (!grLayer || grLayer.visible))
									scalerange.layer[name] = value;
							}
						});
						othis.activeWidgets.push(scalerange);
		            }                    
                    return scalerange;
                },
				'navigation-toggle': function () {
					var navT = null;
					sProp=othis.getWidgetProperties('navigation-toggle'); 
                    if (sProp.visible) {
		                navT = new NavigationToggle({
		                    view: view,
		                    id: UI
		                });
						othis.addWidget2View(sProp, view, navT, "bottom-right");
						othis.activeWidgets.push(navT);
		            }                    
                    return navT;
                },
				'compass': function () {
					var compass = null;
					sProp=othis.getWidgetProperties('compass'); 
                    if (sProp.visible) {
		                compass = new Compass({
		                    view: view,
		                    id: UI
		                });
						othis.addWidget2View(sProp, view, compass, "bottom-right");		                
						othis.activeWidgets.push(compass);
		            }                    
                    return compass;
                },
                'layers': function () {
					sProp=othis.getWidgetProperties('layers');
                    var  func= othis.showUIControls() ? othis.defineActions.bind(othis): null;
                    othis.firstTime=true;
					var layerList;
					if(expand) {
					 	layerList = new Expand({
						  expandIconClass: othis.options.inheritEsriTheme ? "esri-icon-layers" : "ds-icon-layers",  					  
						  view: view,
							expandTooltip: getTransString("Layers"),
						  id: UI,
						  content: new LayerList({ view: view, container: document.createElement("div"), listItemCreatedFunction: func })
						});
					}
					else 
						layerList = new LayerList({ view: view, id: UI, listItemCreatedFunction: func });
						othis.addWidget2View(sProp, view, layerList, "top-left");
                    othis.activeWidgets.push(layerList);
                    return layerList;
                }
            };
            if (typeof widgets[UI] !== 'function') {
                //throw new Error('invalid UI type: ' + UI); /* [GIS-1558] Crahsing the app on mistyped property name does not seem to be necessary */
                console.log("WARNING: invalid UI type: '" + UI + "'. Ignored.");
            } else {
                return widgets[UI]();
            }
        },       
        toggleUIwidget: function(wd, add) {
            var ret=true,othis = this, expand=othis.options.useExpand,
            		curView=othis.getCurrentView(), comp=curView.ui.find(wd);            
            if(comp){
				var cont=$(comp.container);
				if(wd=="measurement"){
					var meas=curView.type=='2d' ? cont.find(".measTools") : cont.find(".measTools3d");
					if(!meas || meas.length==0){
						meas=curView.type=='2d' ? $(".measTools") : $(".measTools3d");
						meas.appendTo(cont).css("display","block");
					}
				//	if(!othis.isPreviewMode())
					othis.distMeasurements();
					$(meas.find(".cmdRadioGroup")).ibxHRadioGroup("selected",meas.find(".btnDistToolMs"));
				}
                if(wd=="basemaps" && !othis.isPreviewMode())
                    othis.addCustomBaseMap(expand ? comp.content : comp);
				var wdg = othis.activeWidgets.filter((function (w) {
		             return (w.id === wd);
		        }));
				var hasExp = expand && (wd == "basemaps" || wd == "legend" || wd == "layers"), isExp=hasExp && wdg ? wdg[0].expanded : true,
				 curSt = cont.is(":visible");
                if(curSt && isExp) { 
					cont.fadeOut({duration: 200, complete: function(){
						if(wd=="measurement") othis.clearMeasurements();   
						else if(wd=='timeslider'){
							comp.fullTimeExtentSaved=comp.fullTimeExtent;
							comp.timeExtentSaved=comp.timeExtent;
							comp.fullTimeExtent=comp.timeExtent=null;
						}
					}});
					ret=false;
				}
                else {cont.removeClass("esri-hidden"); cont.fadeIn({duration: 400, complete: function(){
					if(wd=="layers")
						othis.setupLayersList(comp);
					else if(wd=='timeslider') {
						if(comp.fullTimeExtentSaved){
							comp.fullTimeExtent=comp.fullTimeExtentSaved;
							comp.timeExtent=comp.timeExtentSaved;
							comp.fullTimeExtentSaved=comp.timeExtentSaved=null;
						}
						if(comp.fullTimeExtent)
						$(comp.container).find(".esri-time-slider__slider").addClass("esri-time-slider");
					} 					
				}}); ret=true;}
				if(expand && wdg && (!curSt || !isExp))
					wdg[0].expand(); 
            } 
            else if(add)
                othis.addViewUI(wd);
            return ret;
        },
        removeViewUI: function (widget) {
            var othis = this;
            othis.getCurrentView().ui.remove(widget);       
        },     
		hideViewWidget: function (wdID) {
            var curView=this.getCurrentView(), comp=curView.ui.find(wdID);            
            if(comp){
				let cont=$(comp.container);   
				if(cont.is(":visible")) cont.fadeOut(); 
				else if($(comp).is(":visible")) $(comp).fadeOut(); 
			}
        },     
        isWidgetActive: function (widgetId) {
            var othis = this;
            var wdg = othis.activeWidgets.filter((function (w) {
                return (w.id === widgetId)
            }));
            return wdg.length;
        },
        addColorFieldAndValues: function (attributes, colorF, srcField, colorScale) {
            //    var colorIndex = groupDataItems.colorVarName ? d.groupData[groupDataItems.colorVarName] : d.seriesID;
            var colorFn = tdgchart.util.color ? tdgchart.util.color : pv.color;

            //    
            for (var k = 0; k < attributes.length; k++) {
                var record = attributes[k];
                var colorIndex = record[srcField];
                var colorObj = colorFn(colorScale(colorIndex, k));
                //  record[colorF]=colorObj.color;
                record[colorF] = rgba2hex(colorObj.color);
            }
        },
        doMergeObjects: function (mapLayers, moonBeamInst) {
            var merged = [];
            mapLayers.forEach(function (L) {
                if (L.length) {
                    var dest = {};
                    moonBeamInst.mergeObjectsEx(moonBeamInst, dest);
                    for (var i = 0; i < L.length; i++)
                        moonBeamInst.mergeObjectsEx(L[i], dest);
                    merged.push(dest);
                }
            });
            if (merged.length) {
                while (mapLayers.length > 0)
                    mapLayers.pop();
                merged.forEach(function (m) {
                    mapLayers.push(m);
                });
            }
        },
		sketchGraphicCreate: function(event) {		
			if(event.state=='start' && (event.tool=='rectangle' || event.tool=='circle' || event.tool=='point')) {
				let sketch=this.getCurrentView().ui.find('sketch');
				this.options.prevCreationMode=sketch.creationMode;
				sketch.creationMode='update';
			}
			if(!this.noteEdit.parent() || !this.noteEdit.parent().hasClass("esri-sketch__info-panel")) {
			//	let sketch=this.getCurrentView().ui.find('sketch');
           //     this.noteEdit.appendTo($(sketch.container).find(".esri-sketch__info-panel"));				         
			}    
		},
		mapshowlayerById: function(layerId, show) {
			let layer=this.getCurrentMap().findLayerById(layerId);
			if(layer)layer.visible=show;
		},
		sketchGraphicUpdate: function(event) {
			 let sketch=this.getCurrentView().ui.find('sketch');
			 if (event.state === "start" && event.graphics && event.graphics.length) { 
				let layer = this.getCurrentMap().findLayerById(defaultGraphicsLayerId);
				if(layer && layer.listMode=="hide") layer.listMode="show";
				$(sketch.container).find(".esri-sketch__info-panel").appendTo(this.noteEdit.find(".mlm-graphics-settings"));
				setTimeout(() => {
					let prnt=this.noteEdit.parents(".mlm-symbol-editor-parent"),inserted=prnt.length ? true : false;
					if(!inserted) {
						let infoTB=$(sketch.container).find(".esri-sketch__panel");
						this.noteEdit.insertAfter(infoTB);
					}					
					this.noteEdit.fadeIn({ complete:()=>{
						this.noteEdit.geoUISymbolSettings("updateSettings");} });
						
				}, 10);
			  }		
			else if(event.state === "active" && event.tool == "transform") {
				for(let i = 0; i<event.graphics.length; i++) {
					if(event.graphics[i].symbol.type=='text' && event.toolEventInfo.type=='rotate') {
						event.graphics[i].symbol.angle=-parseInt(event.toolEventInfo.angle,10);
						this.noteEdit.geoUISymbolSettings("angleSlider", event.graphics[i].symbol.angle);
					}
				}
			}	  
			else if (event.state === "complete") {		
				this.noteEdit.geoUISymbolSettings("updateSettings", true);
				this.noteEdit.fadeOut(); 
		//		this.noteEdit.appendTo( $(".map-container-frame"));
			}
		},
        removeHighLights: function() {
            var othis=this;
            if(othis.hlhandles.length && !othis.updatingFeature){
                othis.hlhandles.forEach(function(tt){
                    if(tt.handle)
                        tt.handle.remove();
                    else {
                        tt.graphic.attributes["HOVER"]=100;                        
                        var arr=[]; arr.push(tt.graphic);
                        othis.updatingFeature=true;
                        tt.graphic.layer.applyEdits({updateFeatures:arr});
                        
                    }
                });
                othis.hlhandles=[];
            }
            othis.setHighlightOpt(true);
        },
		isGraphicLayer : function(graphic){
            return graphic && graphic.layer && (graphic.layer.type == "graphics" || 
					graphic.layer.type == "vector-tile" || graphic.layer.type == "2d");
        },
		doHLGraphic: function(item, point) {
			var othis=this;
			if(othis.options.hoverHL && item.layer && item.layer.type != "imagery-tile" && (!othis.isGraphicLayer(item) 
						|| (item.layer && othis.isDataLayer(item.layer.id)))) {		                    
                view.whenLayerView(item.layer).then(function(layerView){
                    if(typeof(layerView.highlight)==='function') {                                            
                        othis.setHighlightOpt(false);
                        othis.hlhandles.push({graphic:item,handle:layerView.highlight(item)});     
						if(!othis.is3dView() && othis.isSatelliteLayer(item.layer)){
							othis.currentTT.text(item.attributes.OBJECT_NAME);
							othis.currentTT.css({top:point.y+10 +"px",left:point.x+10+"px"});
			           //     othis.currentTT.css("display","block"); 
							othis.showSatelliteTrack(item);
						}                  
                    }                           
                }).catch(function (error) {

        		});
            }
		},
        doHoverHL: function(event)  {
            var sp = { x: event.x, y: event.y };
            var othis=this, view = othis.getCurrentView();            
            view.hitTest(sp).then(function (response) {
                if (response.results && response.results.length) {
                    var anyOverH=false, arrUpd=[];
                    for (var j = 0; j < response.results.length; j++) {
                        var item = response.results[j].graphic;
                        if (othis.isSameTTGraphic(item,false)) {
                            anyOverH=j==0;
                            break;
                        }
                    }
                    if(!anyOverH) {
                        for (var k = 0; k < response.results.length; k++) {
                            var item = response.results[k].graphic;
                            if (item) {
                                othis.hideTooltips();
						//		if(!othis.showCanst)othis.showSatelliteTrack(item);
                                othis.doHLGraphic(item,event);
                                break;
                            }  
                        }
                    }
                }
                else
                    othis.hideTooltips();
            })
			.catch(function (error) {
				console.log("symbol");
		    });            
        },   
		isCanstGraphic: function(event)  {
            var sp = { x: event.x, y: event.y };
            var othis=this, view = othis.getCurrentView(), clickGR;            
            view.hitTest(sp).then(function (response) {
                if (!response.results || response.results.length==0)                
					othis.restoreOpacity();	
            });            
        },
		openRouteLayer: function(event)  {
            var sp = { x: event.x, y: event.y };
            var othis=this, view = othis.getCurrentView();            
            view.hitTest(sp).then(function (response) {
                if (Array.isArray(response.results)) {
					for (let n = 0; n < response.results.length; n++) {
                        if(response.results[n].type=="route") {
							var rl=response.results[n].layer
							setTimeout(function(){
								let comp=view.ui.find("direction"); 
								if(rl && comp) {
									if(comp && $(comp.container).is(":visible")){
									//	let cont=$(comp.container);
										comp.layer=rl;
								//		if(!cont.is(":visible"))cont.fadeIn({duration: 400});
									}
							}},10); 
							return;
						}
                    }
				} 
            });            
        },    
		generateRoutings: function(layer) {
			let set = this.getLayerSettings(layer);
			if(set) {
				let othis=this, comp = JSON.parse(JSON.stringify(set.component)), L=set.chartLayer, overl={layerType:"route", geometrySourceType :"seriesdata"},
				 lObj = {
                    layer: overl,  
                    bigL: L, 
                    addi: -1,
					component: comp,
                    addup : function () {                                                
                        this.addi = window.clearInterval(this.addi);
                        othis.addDataLayer(this);
                    }
                };
				comp.title=set.component.title+getTransString('direction');   
				comp.name=set.component.name+getTransString('direction');
				comp.visible=layer.visible;
				comp.opacity=layer.opacity;
				this.updating=true;                                         
                lObj.addi=window.setInterval(lObj.addup.bind(lObj), 20); 
			}
		}, 
		showDirections: function(layer) {
			let view= this.getCurrentView(), comp=view.ui.find("direction"); 
			if(!comp) {comp=this.addViewUI('direction',true);
				view.ui.add({component: comp, position: "bottom-right"});
			}
			if(layer && comp) {
				let cont=$(comp.container);
                if(cont.is(":visible") && comp.layer.id==layer.id) {					
					cont.fadeOut({duration: 400, complete: function(){
						cont.find(".esri-directions__clear-route-button").show();
					}});
				}
                else {
                    comp.layer=layer;
					cont.find(".esri-directions__clear-route-button").hide();
    				if(!cont.is(":visible"))cont.fadeIn({duration: 400, complete: function(){
						cont.find(".esri-directions__clear-route-button").hide();
					}});
                }				
			}
		},
		getTravelingMode : function(trMode, trTimeDist) {			
			let temp=this.options.servDesc ? this.options.servDesc.supportedTravelModes : null;
			if(temp && Array.isArray(temp)) {
				for( let i = 0; i < temp.length; i++) {
					let tmp=temp[i];
					if(tmp.type==trMode && (tmp.impedanceAttributeName==trTimeDist || 
						typeof(tmp.impedanceAttributeName)==='string' && tmp.impedanceAttributeName.search(trTimeDist) != -1))
							return temp[i];
				}
			}
			return null;
		},
		updateDirections: function(layer, trMode) {
			if(layer){
				let trModeParam=this.getTravelingMode(trMode, "time");
				layer.solve( {travelMode:trModeParam}).then(function (results) {					 
                     layer.update(results);
					 this.updateStopsNames(layer);
					this.createRoutePopupTemplates(layer);
					// this.createRoutePopupTemplates(layer);					 
                }.bind(this))
                .catch(function (error) {
					let msg=error.details && error.details.error && error.details.error.details.raw.message ? error.details.error.details.raw.message : error.message;
					if(typeof(error.details && error.details.error && error.details.error.details.messages[0])=="string") {
						let prts=error.details.error.details.messages[0].split("  ");
						if(prts.length==2)msg=prts[1];
					}
					alert(msg);
                });
			}
		},
        getDynamicLayerPopupTmp: function(layerId, graphicId) {
            var othis = this;
            for (var i = 0; i < othis.dynamicLayers.length; i++) {
                var dLayObj=othis.dynamicLayers[i];
                if(dLayObj.id == layerId && Array.isArray(dLayObj.graphics)){
                    for (var n = 0; n < dLayObj.graphics.length; n++) {
                        if(dLayObj.graphics[n].attributes["ObjectID"] == graphicId)
                            return dLayObj.graphics[n];
                    }
                }
            }
            return null;
        },
        getRealGraphic: function(fgr){
            if (fgr.layer.source && fgr.attributes["ObjectID"]) {
                var unid = fgr.attributes["ObjectID"] - 1;
                return fgr.layer.source.items[unid];
            }
			else if(fgr.layer.source && fgr.attributes["INTLDES"]) {
               for (var ii = 0; ii < fgr.layer.source.items.length; ii++) {
	                var G = fgr.layer.source.items[ii];
	                if (G.attributes["INTLDES"] == fgr.attributes["INTLDES"])
	                    return G;
	            }
            }
			else if(fgr.layer.source && fgr.attributes["_FID"]) {
                var unid = fgr.attributes["_FID"] - 1;
                return fgr.layer.source.items[unid];
            }
            return null;
        },
		setPopuptemplates: function(layer){
			var othis=this, view = othis.getCurrentView(), tooltips=[];
			for(var k = 0; k<othis.layerList.length; k++){
                if (othis.layerList[k].id == layer.id) { 
					tooltips=othis.layerList[k].tooltips || [];
                    break;
                }
            }
			view.whenLayerView(layer).then(function(layerView){
                layerView.queryFeatures().then(function(results){
					if(results.features.length==tooltips.length){
						for(var kk = 0; kk<results.features.length; kk++) {
							//results.features[kk].popupTemplate={ content: tooltips[kk]};
					//		results.features[kk].popup={ content: tooltips[kk]};
					//		results.features[kk].attributes["POPUP"]={ content: tooltips[kk]};
					//		results.features[kk].attributes["POPUP"]=tooltips[kk].content.outerHTML;
						}
					}
					
                });
			}); 
		},
		getRouteTooltip: function(rLayer) {
			let junk=0;
		},
        getToolTipContent: function (graphics, bAll, index) {
			 var othis=this, view = othis.getCurrentView(), arrToHH=[];
			if(typeof(index)=='undefined') index=0;
           if(graphics.length>0 && graphics[index] && !othis.isDataLayer(graphics[index].layer.id) &&
					 (!graphics[index].layer || graphics[index].layer.type == 'graphics' || layer.type == "2d"))
                return null;
			if(othis.isSatelliteLayer(graphics[index].layer))
				return null;
           
            var res = othis.options.inheritEsriTheme ? $('<div class=""></div>') : $('<div></div>'), tt = "";
            res.css('white-space', 'nowrap'), haveOne=false;
            
            for (var j = index; j < graphics.length; j++) {
                var item = graphics[j];
                if (item) {
                    //cluster_type_WF_RETAIL_LITE_WF_RETAIL_PRODUCT_PRODUCT_CATEGORY
                    var rLayer = item.layer;
              //      if (!rLayer || !this.isDataLayer(rLayer.id))
					if(!rLayer || !this.isDataLayer(rLayer.id))
                        continue;
					if(!bAll && rLayer.updateMarkerPos) bAll=true;
				//	if(rLayer && rLayer.popupEnabled && rLayer.popupTemplate)
				//		return null;
                   // var title = $("<div>" + item.layer.title + "</div>");
                //    title.appendTo(res);
					if(item.attributes["ObjectID"]) {
						var realG = (item.popup || item.popupTemplate) ? item : othis.getRealGraphic(item), appTo=res;

							//var cont2append=$(realG.popupTemplate.content).clone();
							//GIS-1574: clone() does not clone event handlers, so drill downs (initilized in tooltips.js) are not coped over
							//jQuery's clone(true, true) is designed to do so, but - apparently - it is able to clone only jQuery created handlers,
							//(wrapped by jQuery for that purpose). There is no way to read or clone addEventListener-created event handlers
							//Thus removing .clone() entierly and use the original node that has valid click events.
							//Clone would be safer but don't see any side effect  of skipping it.
							var cont2append=$(realG.popupTemplate.content);

						if(haveOne){
							cont2append=cont2append.find("tbody").first();
							appTo=res.find("table").first();
							cont2append.find("table").css("width","100%");
						}
						if (realG && (realG.popup || realG.popupTemplate)) {
							if(realG.popup)
								//GIS-1574 skipping this .clone() for now as I'm unsure of when this code path is used. May need similar change (and testing) as piece above
								$(realG.popup.content).clone().appendTo(appTo);
							else
								cont2append.appendTo(appTo);
							tt += rLayer.title;
						}
						else {
							realG=othis.getDynamicLayerPopupTmp(rLayer.id, unid+1);
							if (realG && realG.popupTemplate) {
								$(realG.popupTemplate.content).appendTo(appTo);
								tt += rLayer.title;
							}
						}
						othis.ttAddedToGraphic(item);
						haveOne=true;
					}
                    else if(item.attributes["cluster_count"]) {
                        
                        var main = $("<div>" + getTransString("features_number") + ": <b>"+item.attributes["cluster_count"]+ "</b></div>");
                        main.addClass(othis.options.inheritEsriTheme ? "esri-feature-content" : "tdgchart-tooltip-name root_container");
						if(rLayer.renderer.field) {
							let most = getTransString("most_of")+" "+ item.attributes["cluster_type_"+rLayer.renderer.field];						
                            $("<p><div class='" + (othis.options.inheritEsriTheme ? "esri-feature-content" : "tdgchart-tooltip-value") + 
									"'>"+ most ? most : ""+"</div></p>").appendTo(main);
						}
                        main.appendTo(res);
                        tt += rLayer.title;
                        othis.ttAddedToGraphic(item);
						haveOne=true;					
                    }
					else if(item.attributes["aggregateCount"]) {
                        
                        var main = $("<div>" + getTransString("features_number") + ": <b>"+item.attributes["aggregateCount"]+ "</b></div>");
                        main.addClass(othis.options.inheritEsriTheme ? "esri-feature-content" : "tdgchart-tooltip-name root_container");
						if(typeof(rLayer.renderer.field) != 'undefined' && typeof(item.attributes["cluster_type_"+rLayer.renderer.field]) != 'undefined')
                            $("<p><div class='" + (othis.options.inheritEsriTheme ? "esri-feature-content" : "tdgchart-tooltip-value") + 
									"'>"+getTransString("most_of")+" "+ item.attributes["cluster_type_"+rLayer.renderer.field]+"</div></p>").appendTo(main);
                        main.appendTo(res);
                        tt += rLayer.title;
                        othis.ttAddedToGraphic(item);
						haveOne=true;
                    }
                    else {
                        var unid = (item.attributes["_FID"] ? item.attributes["_FID"] : item.attributes["FID"]) - 1;
                        if (rLayer.source && rLayer.source.items) {
                            var realG = rLayer.source.items[unid];
                            if (realG && realG.popupTemplate)
                                $(realG.popupTemplate.content).appendTo(res);
                            tt += rLayer.title;
                            othis.ttAddedToGraphic(item);
							haveOne=true;
                        }
                        else {
                            var popup = rLayer.popupTemplate ? rLayer.popupTemplate : rLayer.defaultPopupTemplate;
                            $("<div>        'no content found'</div>").appendTo(res);
                            return null;
                        }                        
                    }
                   // if(othis.selections.length == 0 && !othis.options.multiselect)    
					if(!haveOne) continue;               
                    if (!bAll)
                        break;
                    tt += ", ";
                }                      
            }     
			if(bAll) {
				let allValues=res.find(".mlm-tooltip-values");
				if(allValues && allValues.length) {
					let values=[];
					for(let i = 0; i < allValues.length; i++){
						let val = allValues.eq(i).text(), found=false;
						for(let ii = 0; ii < values.length; ii++){
							if(val==values[ii]) {
								found=true;
								allValues.eq(i).parent("tr").remove();
								break;
							}
						}
						if(!found)values.push(val);
					}
				}
			}     
            return { content: res[0], title: tt };
        },
        doSetSymbol: function (symbolInfo, renderer, bDef, defaultSymbol, layerSettings,sym3d) {            
            if(symbolInfo) {
                var setS = bDef ? "defaultSymbol" : "symbol", defSymb=renderer["defaultSymbol"];
                if(sym3d){
					if(layerSettings.geometryZ) {
						renderer[setS].color=symbolInfo.color ? symbolInfo.color: "red";
					}
					else if(renderer[setS].type == "simple-line"){
						  renderer[setS].type=  "line-3d";
						  renderer[setS].symbolLayers= [{
						    type: "path",
						    profile: "quad",
						    material: {color: symbolInfo.color ? symbolInfo.color: "red"},
						    width: 20, // the width in m
						    height: layerSettings.component.extrusion.maxHeight || 3000, // the height in m
						//    anchor: "bottom", // the vertical anchor is set to the lowest point of the wall
						    profileRotation: "heading"
						  }]
					}
					else {
						renderer[setS].type= "polygon-3d";
	                    renderer[setS].symbolLayers= [{
	                        type: "extrude",  // autocasts as new ExtrudeSymbol3DLayer()
	                   //     size: layerSettings.extrusion.minHeight,  
							castShadows :layerSettings ? layerSettings.component.extrusion.castShadows : true,
	                        material: { color: renderer.symbol.material && renderer.symbol.material.color ? renderer.symbol.material.color: "red" }
	                    }];    
					}
                    
					return;  
                }
                else if(!renderer[setS].type)
                    renderer[setS].type= "simple-fill";
                if (symbolInfo.border && this.isColorSet(symbolInfo.border)){
                	let re = /\_/g;
                    renderer[setS].outline = {
                        width: symbolInfo.border.width,
                        color:  symbolInfo.border.color,
                        style: (symbolInfo.border.hasOwnProperty("dash") && typeof(symbolInfo.border.dash) == 'string') ? symbolInfo.border.dash.replace(re,"-") : "solid"
                    };
                }    
                else if(defaultSymbol && defaultSymbol.outline)
                renderer[setS].outline = defaultSymbol.outline;  
            }
        },
		calculateSlice: function(value1, total) {
			console.log(value1 + " " +total);
			return 20;
		},
		isAcceptablePieSeries: function(L) {
			let series=L.series, num=0;
			for (var ii = 0; ii < series.length; ii++) {
				let attr, index = parseInt(series[ii].series, 10);
                if (!isNaN(index) && series[ii].label && series[ii].series!="all") {
					num++;
					if(series[ii].hasOwnProperty('marker') && 
						series[ii].marker.hasOwnProperty('shape') && series[ii].marker.shape != 'circle')
						return false;
				}				
				else if(series[ii].series=="all" && series[ii].hasOwnProperty('marker') && 
						series[ii].marker.hasOwnProperty('shape') && series[ii].marker.shape != 'circle')
					return false;	
				if(num>10)
					return false;
			}
			return true;
		},
		isBorderSet: function(symbolInfo) {
			return symbolInfo && symbolInfo.border && this.isColorSet(symbolInfo.border) && symbolInfo.border.width!=0;
		},
		
		buildClassBreaksRenderer: function(geomType,layerSettings, symbolInfo,colScale, colorField, contH){
			let classBreakInfos= [], index=0,
			binMarker=colScale.hasOwnProperty("binMarkers") && colScale.binMarkers.hasOwnProperty("concatSymbol") ? colScale.binMarkers.concatSymbol : "-";
			layerSettings.renderer=new ClassBreaksRenderer({  
			  	field: colorField
			});
			colScale.colors.forEach((clItem)=>{
				if(clItem.hasOwnProperty("start")) {
					index++; 		
					if(!clItem.hasOwnProperty("stop") || jQuery.isEmptyObject(clItem.stop)) {
						if(colScale.colors.length>index)
							clItem.stop=colScale.colors[index].start;	
						else clItem.stop="9999999999"
					}
					if(typeof(clItem.start) == "string" && (clItem.start.search("%") != -1 || clItem.stop.search("%") != -1)) {
						let max = layerSettings.labelConfig.max, startPT=parseFloat(clItem.start), stopPT=parseFloat(clItem.stop);
						if(isNaN(stopPT))stopPT=100;
						clItem.start=startPT*max/100;
						clItem.stop=stopPT*max/100;
					}	
					let classBreakInfo={
						minValue: clItem.start,
	  					maxValue: clItem.stop,
					    symbol: { type: symbolTypeFromGeomType(geomType)},
						label: this.getLabel(clItem.start, colorField, layerSettings.labelConfig) + binMarker +
								this.getLabel(clItem.stop, colorField, layerSettings.labelConfig)
					};
					let sm2use=clItem.hasOwnProperty("marker") ? clItem.marker : symbolInfo;
					sm2use.color=clItem.color;
					if(geomType=="bubble")
						this.doSetSymbol2(sm2use, classBreakInfo, false, null, contH, layerSettings,false);
					else {
						classBreakInfo.symbol.style="solid";
						this.doSetSymbol(sm2use, classBreakInfo, false, null, layerSettings,false);
						classBreakInfo.symbol.color=clItem.color;
					}
							
					classBreakInfos.push(classBreakInfo);
				}				
			});
			layerSettings.renderer.classBreakInfos=classBreakInfos;
			layerSettings.renderer3d=layerSettings.renderer;
		},
		buildPieChartRenderer: function(L,layerSettings, sizeField, symbolInfo, contH){
			let series=L.series, othis=this, field2use=(sizeField ? sizeField : layerSettings.renderer.field) +"_", 
			seriesWithColor = series.filter(function(el) {
				return (typeof el.series === 'number' && el.group == null && el.color != null);
			});
			let border=this.isBorderSet(symbolInfo) ? symbolInfo.border : null;
			layerSettings.renderer.attributes =[];
			for (var ii = 0; ii < series.length; ii++) {
                let attr, index = parseInt(series[ii].series, 10);
                if (!isNaN(index) && series[ii].label)  {
                    var nextColor=series[ii].color;
					if(series[ii].series!="all") {
						if(!border && this.isBorderSet(series[ii].marker))	
							border=	series[ii].marker.border;
	                    if (nextColor === undefined)
	                        nextColor= cycleSeries(othis.tdgchart, series,ii-1,seriesWithColor);
	                    attr = {
	                        label: series[ii].label,
	                        color:nextColor,					
							field: field2use+series[ii].label.replace(/[ .]/g, "_")
	                    };
						if(layerSettings.renderer.attributes.length<10)
						layerSettings.renderer.attributes.push(attr);
					}
                }
            }
			if (symbolInfo && symbolInfo.size) {
				let size = symbolInfo.size, bPers = typeof (size) === 'string' && size.search("%") != -1;
            	if(bPers)
					size = contH ? contH * parseFloat(size) / 100 : 16;
				if(size>=1000)
					size=12;
				layerSettings.renderer.size = size; 
			}
			if (border){
				let re = /\_/g;
                layerSettings.renderer.outline = {
                    width: border.width,
                    color:  border.color,
					style:(border.hasOwnProperty("dash") && typeof(border.dash) == 'string') ? border.dash.replace(re,"-") : "solid"
                }	
            }    
		},
		updateMarkerSize: function(zoom) {
			let map=this.getCurrentMap();
			for (let i = 0; i < map.layers.length; i++) {
                let lay = map.layers.items[i];
                if(lay && lay.updateMarkerPos && lay.renderer.type==="unique-value") {
					let radius=7, done=false;
					for(let j = 0; j < lay.renderer.visualVariables.length; j++) {
	                    if(lay.renderer.visualVariables[j].type == "size") {
	                        
	                    }
	                }
					if(!done) {
						lay.renderer.uniqueValueInfos.forEach((uvi)=>{
							let tempSZ=0;
							if(uvi.symbol.type=='picture-marker')
								tempSZ=uvi.symbol.height>uvi.symbol.width ? uvi.symbol.height : uvi.symbol.width;
							else
								tempSZ=uvi.symbol.size;					
							if(radius<tempSZ) radius=tempSZ;
						});
					}
					
					this.updateMarkerPos(lay.renderer.uniqueValueInfos,zoom, radius);
				}					
            } 
		},
		getMatrix4Symbols: function(numOfSymb, matrix) {
			var tryNofRows=2, rows=0, retCode=false; 
			while(1) {
				let columns=parseInt(numOfSymb/tryNofRows,10), rem= numOfSymb % tryNofRows;
				if(columns>tryNofRows+1){
					tryNofRows++;
					continue;
				}
				matrix.rows=tryNofRows+ (rem ? 1 : 0);
				matrix.columns=columns;
				matrix.symblastRow=rem;
				retCode=true; 
				break;
			}
			return retCode;
		},
		updateMarkerPos: function(uniqueValueInfos,zoom, radius) {
			if(Array.isArray(uniqueValueInfos) && uniqueValueInfos.length) {
				let angleInc=360/(uniqueValueInfos.length), angle=0;
				//try stops
				let tempR=0, numOfStops=5;
				if(zoom>3 && zoom<=5)
					tempR=radius*.6;
				else if(zoom>5 && zoom<=8)
					tempR=radius*.75;
				else if(zoom>8 && zoom<=10)
					tempR=radius*.9;
				else if(zoom>10)tempR=radius*1.2;
			//	let tempR=zoom<2 ? 0 : radius*zoom/uniqueValueInfos.length;
			//	if(radius*2>tempR) {
					radius=parseInt(tempR,10); if(tempR % parseInt(tempR,10)>0.5) radius++;
					if(1) {
						var matrix={columns:0, rows:0};
						if(this.getMatrix4Symbols(uniqueValueInfos.length, matrix)) {
							if(!isNaN(matrix.columns) && matrix.columns) {
								var index=0, width=radius*matrix.columns, height=radius*matrix.rows, 
								yOff=height/2-radius/2, xOff=-(width/2+radius/2);
								uniqueValueInfos.forEach((uvi)=>{
									uvi.symbol.xoffset = xOff; 
									uvi.symbol.yoffset = yOff;
									index++;
									if(index==matrix.columns) {
										matrix.rows--;
										yOff-=radius;
										if(matrix.symblastRow && matrix.rows==1)
											width=radius*matrix.symblastRow;
										xOff=-(width/2+radius/2);
										index=0;
									}									
									else
										xOff+=radius;	
								});					
							}
						}
					}
					else {
						uniqueValueInfos.forEach((uvi)=>{
							uvi.symbol.xoffset = Math.cos(angle*0.0174533) * radius; 
							uvi.symbol.yoffset = Math.sin(angle*0.0174533) * radius;
							angle+=angleInc;
						});
					}	
			//	}					
			}
		},
		getUniqueValueInfo: function(L,layerSettings,defaultSymbol,sym3d,point, contH, needBlend){
			var uvi = [], othis=this, mix=new Color(), series=L.series, doBlend=this.options.bubbleUniqueMix || layerSettings.geometryType=='choropleth';
			var seriesWithColor = series.filter(function(el) {
				return (typeof el.series === 'number' && el.group == null && el.color != null);
			});
			var seriesWithLabel = series.filter(function(el) {
				return (typeof el.series === 'number' && el.label);
			});
			if(layerSettings.seriesInfo.exceptionalSeries.length==0) {
				if(doBlend) {
					for (var ii = 0; ii < series.length; ii++) {
		                let index = parseInt(series[ii].series, 10);
		                if ((!isNaN(index) && series[ii].label) || (needBlend && series[ii].series=="all"))  {
		                    var nextColor=series[ii].color;
		                    if (nextColor === undefined) {
								nextColor= cycleSeries(othis.tdgchart, series,ii-1,seriesWithColor);
								series[ii].color=nextColor;
							}                        
							mix=Color.blendColors(new Color(mix), new Color(nextColor),1/(series.length));
						}
					}
				}
	            for (var ii = 0; ii < series.length; ii++) {
	                let index = parseInt(series[ii].series, 10);
	                if ((!isNaN(index) && series[ii].label) || (doBlend && needBlend && series[ii].series=="all"))  {
	                    var nextColor=series[ii].color;
	                 	if(doBlend) {
							if(series[ii].series=="all") {
								nextColor=mix;
								series[ii].label=getTransString("multiple");
							}						
						}
	                    if (nextColor === undefined)
	                        nextColor= cycleSeries(othis.tdgchart, series,ii-1,seriesWithColor);
	                    var t = {
	                        value: series[ii].label,
	                        symbol: {
	                            outline: { color: "white", width: 0 },
								type: symbolTypeFromGeomType(layerSettings.geometryType), 
	                        }
	                    };
	                    if(sym3d){
							t.symbol.material= {color : nextColor ? nextColor : "red"};
						}                             
	                    else t.symbol.color= nextColor ? nextColor : "red";
	                    if(point) 
	                        othis.doSetSymbol2(othis.getSymbolInfo(series, series[ii].label, ii), t, false, defaultSymbol, contH, layerSettings,sym3d); 
	                    else
	                        othis.doSetSymbol(othis.getSymbolInfo(series, series[ii].label, ii), t, false, defaultSymbol, layerSettings,sym3d);    
						if (layerSettings.geometryType === "line") t.symbol.width="3px";                                                       
	                    uvi.push(t);
	                }
	            }
			}
			else {
				series=layerSettings.seriesInfo.exceptionalSeries;				
				//default
				for (let pp = 0; pp < series.length; pp++) {	                
                    var nextColor=series[pp].color;								
                    if (nextColor === undefined)
                        nextColor= cycleSeries(othis.tdgchart, series,pp-1,seriesWithColor);
                    var t = {
						label: pp == 0 ? getTransString("multiple") : othis.getLabelFromGroupNum(series[pp].group,layerSettings),
                        value: pp == 0 ? -1 : parseInt(series[pp].group, 10),
                        symbol: {
                            outline: { color: "white", width: 0 },
							type: symbolTypeFromGeomType(layerSettings.geometryType), 
                        }
                    };
                    if(sym3d)
						t.symbol.material= {color : nextColor ? nextColor : "red"};
                    else t.symbol.color= nextColor ? nextColor : "red";
                    if(point) 
                        othis.doSetSymbol2(othis.getSymbolInfo(series, series[pp].label, pp), t, false, defaultSymbol, contH, layerSettings,sym3d); 
                    else
                        othis.doSetSymbol(othis.getSymbolInfo(series, series[pp].label, pp), t, false, defaultSymbol, layerSettings,sym3d);   
					if (layerSettings.geometryType === "line") t.symbol.width="3px";                                                        
                    uvi.push(t);
	               
	            }
			}
			return uvi
		},
		getLabelFromGroupNum: function(grNum, layerSettings) {
			return grNum;
		},
		getSymbolFromRenderer: function(layerSettings, fieldNameValue, bSat) {
			var othis=this, renderer=othis.is3dView() ? layerSettings.renderer3d : layerSettings.renderer, symbol=null;
			if(renderer) {
				if(renderer.type=="unique-value" && Array.isArray(renderer.uniqueValueInfos)) {
					let items=renderer.uniqueValueInfos.filter(function(item){ return item.value==fieldNameValue; });
					if(Array.isArray(items)) {
						symbol=items.length ? items[0].symbol : renderer.uniqueValueInfos[0].symbol;
					}		
					else symbol=items.symbol;
				}
				else if(bSat){
					
					symbol=JSON.parse(JSON.stringify(renderer.symbol));
					let color="";
					if(layerSettings.hasOwnProperty("groups") && layerSettings.groups && layerSettings.groups[fieldNameValue]) {
						let group=layerSettings.groups[fieldNameValue];
						if(group && group.shape) {
							let url = getUrl(group.shape, this.options.context);
                			//symbol.type = url ? "picture-marker" : "simple-marker";               
							if(url) {
								symbol.type = "picture-marker";
								symbol.url = url;                    
			                    symbol.width = group.size || "30px";
			                    symbol.height = group.size || "30px";
							}
						}
						else {
							if(symbol.size <= 2)symbol.size=4;
							symbol.color=group.color || "darkgray";
						}												
					}
					else {
						switch(fieldNameValue) {
							case 'PRC':
							case 'IND':
							case 'CIS':
								color="red";
								break;
							case 'US': 
								color="white";
								break;
							default:
								color="darkgray";
						}
						if(symbol.size <= 2)symbol.size=4;
						symbol.color=color;
					}					
				}
			}
			return symbol;
		},
		getClassificationMethod: function (m, breaks, sample) {
            var Methods = {
                'equal-interval': function () {
                    return sample.getClassEqInterval(breaks);
                },
                'standard-deviation': function () {
                    return sample.getClassStdDeviation(breaks);
                },
                'quantile': function () {
                    return sample.getClassQuantile(breaks);
                },
                'natural-breaks': function () {
                    return sample.getClassJenks(breaks);
                },
                'geometrical-interval': function () {
                    return sample.getClassGeometricProgression(breaks);
                }
            };
            if (typeof Methods[m] !== 'function') {
                throw new Error('invalid classification method');
            } else {
                return Methods[m]();
            }
        },
		getSymbolInfo: function(series,sname,seriesID,bgetFirstLabel) {
            var info=null, defaultSymbol=null;                                                
            if(series) {
                for (var tts = 0; tts < series.length; tts++) {
                    if(series[tts].series===sname || series[tts].label===sname) {
                        info=series[tts].marker || series[tts] || defaultSymbol;
						if(!info.hasOwnProperty("color") && series[tts].hasOwnProperty("color"))
							info.color=series[tts].color;
                        break;
                    }
                    else if(series[tts].series==="all")
                        defaultSymbol=series[tts].marker;
                }
                if(!info) {
                    var maxSeries=series.length;                                                        
                    var targetSeries = seriesID % maxSeries;
                    if(targetSeries<maxSeries)
                        info=series[targetSeries].marker;
                }
				else if(sname=="all" && bgetFirstLabel) {
					for (let lts = 0; lts < series.length; lts++) {
						if(series[lts].hasOwnProperty("label"))	{
							mergeObjects(info,series[lts].marker,true);
							break;
						}
					}
				}//check series with label 
				else if(defaultSymbol){ //merge with default
					Object.keys(defaultSymbol).forEach(function(key){
                		if(!info.hasOwnProperty(key))
							info[key] = defaultSymbol[key];
            		});
				}
            }                                                
            return info;
        },
        doSetSymbol2: function (symbolInfo, renderer, bDef, defaultSymbol, contH, layerSettings, rend3d) {
            var othis=this;
            if(othis.options.cimSymbol) {
				renderer.symbol = new CIMSymbol({
					  data:  {
					    type: "CIMSymbolReference",
					    symbol: {
					       type: "CIMPointSymbol",
					       symbolLayers: [{
					           type: "CIMVectorMarker",
					           enable: true,
					           size: 32,
					           frame: {
					             xmin: 0,
					             ymin: 0,
					             xmax: 16,
					             ymax: 16
					           },
					           markerGraphics: [{
					             type: "CIMMarkerGraphic",
					             geometry: {
					               rings: [[[8, 16],[0, 0],[16, 0],[8, 16]]]
					             },
					             symbol: {
					               type: "CIMPolygonSymbol",
					               symbolLayers: [{
					                 type: "CIMSolidStroke",
					                 width: 5,
					                 color: [240, 94, 35, 255]
					               }]
					             }
					           }]
					       }]
					    }
					  }
					});
				return;
			}
            if(symbolInfo) {
                var setS = bDef ? "defaultSymbol" : "symbol", defSymb=renderer["defaultSymbol"],
				angle = symbolInfo.rotation || (defaultSymbol ? defaultSymbol.angle : "0"), size=10, borderSet=false;
				if(angle)
                	renderer[setS].angle = angle;                
                if (symbolInfo.size) {
					size = symbolInfo.size, bPers = typeof (size) === 'string' && size.search("%") != -1;
                	if(bPers)
						size = contH ? contH * parseFloat(size) / 100 : 16;
					if(!rend3d && size>=1000)
						size=10;
					renderer[setS].size = size; 
				}
                else if(!rend3d && defaultSymbol && defaultSymbol.outline)
                renderer[setS].outline = defaultSymbol.outline;
                var shape=symbolInfo.shape || (defaultSymbol ? defaultSymbol.style : "circle"),  
                url = getUrl(shape, othis.options.context), extr=layerSettings.component.extrusion;
				if(!url) {
					 if (symbolInfo.border && this.isColorSet(symbolInfo.border) && symbolInfo.border.width!=0){
						let re = /\_/g;
	                    renderer[setS].outline = {
	                        width: symbolInfo.border.width,
	                        color:  symbolInfo.border.color,
							style:(symbolInfo.border.hasOwnProperty("dash") && typeof(symbolInfo.border.dash) == 'string') ? symbolInfo.border.dash.replace(re,"-") : "solid"
	                    }	
						borderSet=true;						
	                }   
					if((shape=="x" || shape=="cross") && renderer[setS].outline.width==0)		
						renderer[setS].outline.width=1; 
					if(symbolInfo.color && !rend3d) renderer[setS].color=symbolInfo.color;
				}
                renderer[setS].type = url ? "picture-marker" : "simple-marker";
                if(rend3d) {
					if(isRegularShape(shape) && shape=="circle")
						shape="sphere";
					renderer[setS].type = "point-3d";
					if(layerSettings.geometryZ) {
						if(url) {
							renderer[setS].type = "picture-marker";
							renderer[setS].url = url;                    
		                    renderer[setS].width = symbolInfo.width || size || (defaultSymbol ? defaultSymbol.angle : "30px");
		                    renderer[setS].height = symbolInfo.height || size || (defaultSymbol ? defaultSymbol.angle : "30px");
						}
						else {							
							renderer[setS].symbolLayers= [
		                        {
		                        // renders points as volumetric objects
		                            type: "object", // autocasts as new ObjectSymbol3DLayer()
		                            resource: { primitive: isRegularShape(shape) ? shape : "cylinder" },
		                      //      material: symbolInfo.color ? {color : symbolInfo.color} : renderer.symbol.material,
									material: renderer.symbol.material ? renderer.symbol.material : {color : symbolInfo.color},
									width: size*5000 || 1000,
									depth:  size*5000 || 1000,
									height: size*5000 || 1000
		                        }
		                    ];
						}						
					}
					else if(extr){
						renderer[setS].symbolLayers= [
	                        {
	                        // renders points as volumetric objects
	                            type: "object", // autocasts as new ObjectSymbol3DLayer()
	                            resource: { primitive: layerSettings ? (isRegularShape(shape) ? shape : extr.shape)  : "cylinder" },
	                            material: symbolInfo.color ? {color : symbolInfo.color} : renderer.symbol.material,
	                            width: layerSettings ? extr.radius*2 : 50000,
								depth: layerSettings ? extr.radius*2 : 50000,
								height: layerSettings ? extr.minHeight : 50000,
								castShadows :layerSettings ? extr.castShadows : true
	                        }
	                    ];
					}
				}
                else if(isRegularShape(shape)) {
					if(shape=="sphere" || shape=="cone" ||shape=="cylinder")
						shape="circle";
                    renderer[setS].style = shape;
                    if (symbolInfo.color) {
                        if(rend3d) renderer[setS].material= {color : symbolInfo.color};
                        else renderer[setS].color = symbolInfo.color;   
                    }  
					if(!borderSet && (shape=="x" || shape=="cross"))		
						renderer[setS].outline.color=symbolInfo.color;                             
                }
                else if(url) {
                    renderer[setS].url = url;                    
                    renderer[setS].width = symbolInfo.width || size || (defaultSymbol ? defaultSymbol.angle : "30px");
                    renderer[setS].height = symbolInfo.height || size || (defaultSymbol ? defaultSymbol.angle : "30px");
                }
                else {
                    renderer[setS].style = 'path';
                    renderer[setS].path = shape;
                }
            }
        },
        getLabel: function(val, field, config, nFormat) {
            var othis=this, formatNumber=othis.tdgchart.formatNumber;
            if (typeof (formatNumber) == 'function')
                return formatNumber.call(othis.tdgchart, val, nFormat ? nFormat : "auto", config);
            return val;
        },
		getcountryWithGeomSource:function(L,data,geometrySources){
			var othis=this, countryWithGeomSource = [],
			fieldsInfo = L.dataBuckets ? L.dataBuckets.buckets : [], sbreak = L.dataBuckets.series_break;
			if (sbreak) {
                for (var ii = 0; ii < L.series.length; ii++) {
                    var index = parseInt(L.series[ii].series, 10);
                    if (!isNaN(index) && index < data.length) {
                        var temp = othis._layerFexParser(data[index], fieldsInfo, geometrySources);
                        if(temp){
                            temp.forEach(function (s) {
                                for (var k = 0; k < sbreak.fields.length; k++) {
                                    var fname = sbreak.fields[k].fieldName.replace(/[ .]/g, "_");
                                    s.attributes.forEach(function (a) {
                                        a[fname] = L.series[ii].label;
                                    });
                                }
                            });
                            countryWithGeomSource = countryWithGeomSource.concat(temp);
                        }
                    }
                }
            }
            else {
				 for (var ii = 0; ii < data.length; ii++) {
					if ((!geometrySources.geometrySources || geometrySources.geometrySources.hasOwnProperty("default"))
							 && data[ii].length && data[ii][0].name == " ")
                    	data[ii].shift();
                    var temp = othis._layerFexParser(data[ii], fieldsInfo, geometrySources);
                	if(temp)
                		countryWithGeomSource = countryWithGeomSource.concat(temp);
				 }
            }
			return countryWithGeomSource;
		},
		/*refreshLayer: function(data,ext){
			var othis=this, overl=null;
			if(othis.refresh && othis.dynLObj){
				for (var kk = 0; kk < ext.overlayLayers.length; kk++) {
					overl = ext.overlayLayers[kk];
	            	if (!overl.url && !overl.hasOwnProperty("smartMapping"))
						break;
					ovel=null;
				}
				if(overl) {
					var data = othis.tdgchart.normalizeData(data, othis.dynLObj.chartLayer.dataArrayMap), 
					countryWithGeomSource=othis.getcountryWithGeomSource(othis.dynLObj.chartLayer, data, overl);
					if (countryWithGeomSource && countryWithGeomSource.length) {
		                //wait for geometry
						othis.getIBJsonQuery(countryWithGeomSource, overl.geometrySources.default, othis.dynLObj);
		                var geomInt = -1;                
		                var geomF = function () {                    
		                    if(othis.dynLObj.records) {
		                        geomInt = window.clearInterval(geomInt);
		                        othis.refreshLayerFromChart();  
		                    }                
		                };
		                geomInt = window.setInterval(geomF, 10);                  
		            }                                         
		            else {
		                othis.refreshLayerFromData();
		                othis.dynLObj.status="readyToLoad";
		            }
				}
			}
		},*/
		getOverLayer: function(layerSettings) {
			var overl=null, extension = layerSettings.chartLayer.extensions['com.ibi.geo.layer'] && 
						layerSettings.chartLayer.extensions['com.ibi.geo.layer'].hasOwnProperty("overlayLayers") ? 
						layerSettings.chartLayer.extensions['com.ibi.geo.layer'] :
									layerSettings.chartLayer.extensions['com.esri.map'];
			if(extension){
				for (var kk = 0; kk < extension.overlayLayers.length; kk++) {
					overl = extension.overlayLayers[kk];
	            	if (!overl.url && !overl.hasOwnProperty("smartMapping"))
						break;
					overl=null;
				}
			}
			return overl;
		},
		getGeometryType: function(overL){
			switch(overL.layerType) {
				case "bubble":
					return "point";
				case "choropleth":
					return "polygon";
			}
			return overL.layerType;
		},
		/*refreshLayerFromChart : function(){
			var othis=this;
			if(othis.refresh && othis.dynLObj){
				var G=[], uvi=[], overL=othis.getOverLayer(othis.dynLObj);
				if(overL){
					othis.dynLObj.dataDelim = overL.dataDelim;
					othis.createGeometries(othis.dynLObj,othis.dynLObj.layer.geometryType,null, G, uvi); 
					if(G.length){
					//	othis.loadLayerFromFex(othis.dynLObj, othis.dynLObj.id);
						var fl = othis.dynLObj.layer.id ? othis.getCurrentMap().findLayerById(othis.dynLObj.layer.id) : null;
                        if(fl) {
                           fl.renderer.uniqueValueInfos = uvi;
                           othis.removeAllFeatures(fl, false, G); 
						//    fl.source=G;
                        }
		                othis.dynLObj.index=0;
					}
				}
			}
		},
		refreshLayerFromData : function(){
			var othis=this;
			if(othis.refresh && othis.dynLObj){
				
			}
		},*/
		isSatelliteLayer: function(layer) {
			if(layer) {
				var othis=this, settings=othis.getLayerSettings(layer), settingsP=layer.parent ? othis.getLayerSettings(layer.parent): null;
				if(settings)
					return settings.component && settings.component.hasOwnProperty("satellite") && settings.component.satellite;
				else if(settingsP)
					return settings.component && settingsP.component.hasOwnProperty("satellite") && settingsP.component.satellite;
			}			
			return false;
		},
	addDataLayer: function(layerObj){
		var othis=this, overl=layerObj.layer, L=layerObj.bigL;
		if(!L.data || L.data.length==0 || typeof(L.dataBuckets)  === 'undefined'){
			if(othis.refresh && othis.dynLObj) {
				for (let i = 0; i < othis.layerList.length; i++) {
					let tempL=othis.layerList[i].layer;
					if(tempL && tempL.id==othis.dynLObj.id) {
						othis.getCurrentView().whenLayerView(tempL).then(function(layerView){
							layerView.queryFeatures().then(function(results){
								tempL.applyEdits({deleteFeatures:results.features});
							});
						}); 
					}
					if(!tempL)	othis.refreshStop(false); 
				}
			}
			othis.wait(false);
			return;	
		}
		var contH=$(othis.options.Settings.container).height(),
			geometrySources = overl, countryWithGeomSource = null, colorVisVar = null, colorVisVar3d = null, sizeVisVar = null, sizeVisVar3d = null,
			keyVarName = overl.hasOwnProperty("geometryDataField") ? overl.geometryDataField : null,
			sizeVarName, colorVarName = 'color', fieldsInfo = L.dataBuckets ? L.dataBuckets.buckets : [], sbreak = L.dataBuckets.series_break, timePos=-1,
			defaultExtr={ units: "meters", minHeight:2500,maxHeight:70000,
				radius:12000, shape:"cylinder", bExtrudeValue:true, castShadows: true};
		layerObj.status="creating";
		othis.createdLayers.push(layerObj);
		if (sbreak)
			fieldsInfo.push({ id: "nameValue", fields: sbreak.fields });

		var seriesInfo = {
			defaultSeries: null,
			series: [],
			exceptionalSeries: []
		};
		var colors=[];
		for (var i = 0; i < L.series.length; i++) {
			var series = L.series[i];
			if(othis.isColorSet(series)) colors.push(series.color);
			if (series.series === 'all') {
				seriesInfo.defaultSeries = series;
				if(!seriesInfo.defaultSeries.color)
					seriesInfo.defaultSeries.color=L.series[i+1].color;
			} else if (series.series != null && series.group == null && series.axis == null &&
				series.col == null && series.row == null && series.page == null) {
				seriesInfo.series[series.series] = series;
			} else {
				seriesInfo.exceptionalSeries.push(series);
			}
		}			

		layerObj.component.satellite  = othis.isSatelliteData(L.data);
		var data=layerObj.component.satellite ? L.data : othis.tdgchart.normalizeData(L.data, L.dataArrayMap);
		//var data=othis.tdgchart.normalizeData(L.data, L.dataArrayMap);
		countryWithGeomSource = othis.getcountryWithGeomSource(L,data,geometrySources);
		if (L.dataArrayMap && L.dataArrayMap.indexOf('color') >= 0) {
			colorVarName = 'color';
		} else if (L.dataArrayMap && L.dataArrayMap.indexOf('value') >= 0 && overl.layerType === 'choropleth') {
			colorVarName = 'value';
		}
		if (L.dataArrayMap && L.dataArrayMap.includes('size') >= 0) {
			sizeVarName = 'size';
		}
		else if (L.dataArrayMap && L.dataArrayMap.includes('value') >= 0 && overl.layerType === 'line') {
			sizeVarName = 'size';
		}
		if(L.dataArrayMap) timePos=L.dataArrayMap.indexOf('time');
		var colorScale, sizeScale;
		var colScale = L.colorScale ? L.colorScale : othis.tdgchart.colorScale,
			colMode = L.colorMode.mode ? L.colorMode.mode : othis.tdgchart.colorMode.mode;

		var colorF = false, sizeF = false;
		if(colors.length==0 || !sbreak)colors = colScale.colors;			
		extrusion = overl.hasOwnProperty("extrusionEffect") ? overl.extrusionEffect : {};
		mergeObjects(extrusion,defaultExtr);
		convertValues(extrusion);
		layerObj.component.extrusion=extrusion;
		var layerSettings = {
			'id': layerObj.component.name || "mapLayer_" + othis.layersLength,
			'component': layerObj.component,				
			'fields': [],
			'fieldsInfo': fieldsInfo,
			'labels': colScale.labels,
			'seriesInfo': seriesInfo,
			'chartLayer': L,
			'geometryType': overl.layerType,
			'sBreakGeo': false,
			'dataDelim' : geometrySources.dataDelim || '|',
		};
		othis.layersLength++;
		if(overl.hasOwnProperty("heatmap") && !layerSettings.component.hasOwnProperty('heatmap'))
			layerSettings.component.heatmap=overl.heatmap;
		if(overl.hasOwnProperty("scale") && !layerSettings.component.hasOwnProperty('scale'))
			layerSettings.component.scale=overl.scale;
		if (countryWithGeomSource && countryWithGeomSource.length) {                
			othis.getIBJsonQuery(countryWithGeomSource, geometrySources.geometrySources.default, layerSettings);                             
			layerSettings.renderer = geometrySources.renderer || overl.renderer;
		}
		else if (overl.geometrySourceType == "seriesdata") {
			layerSettings.renderer = overl.renderer;                                                                                       
			layerSettings.records = data;
		}
		othis.checkGeometryZ(layerSettings);
		if (countryWithGeomSource && countryWithGeomSource.length &&
			countryWithGeomSource[0].hasOwnProperty('attributes') && countryWithGeomSource[0].attributes.length) {
			var geoLev = 1;
			for (var key2 in countryWithGeomSource[0].attributes[0]) {
				if (countryWithGeomSource[0].attributes[0].hasOwnProperty(key2)) {
					if (key2 === "GEOLEVEL2")
						geoLev++;
				}
			}
			layerSettings.sBreakGeo=sbreak && othis.isGeometrySerBreak(countryWithGeomSource[0].attributes[0],layerSettings.seriesInfo.series);
			for (var key in countryWithGeomSource[0].attributes[0]) {
				if (countryWithGeomSource[0].attributes[0].hasOwnProperty(key) && key !== "undefined") {
					var fieldInfo = null;
					if (key !== "COUNTRY" && key !== "ObjectID") {
						for (var k = 0; k < fieldsInfo.length; k++) {
							var temp = fieldsInfo[k].fields[0];
							var fname = temp.fieldName.replace(/[ .]/g, "_");
							if (fieldsInfo[k].id === "name") {
								if (key === "GEOLEVEL1" && (k == 1 || geoLev == 1))
									fieldInfo = temp;
								if (key === "GEOLEVEL2" && k == 0)
									fieldInfo = temp;
							}
							else if ((fieldsInfo[k].id === "value" || fieldsInfo[k].id === "nameValue") && fname == key) {
								if (!fieldInfo)
									fieldInfo = temp;
								if (colorVarName === "value" || (colorVarName === "color" && fieldsInfo[k].id === "nameValue"))
									colorF = key;
								if (fieldsInfo[k].id === "value")
									sizeF = key;
							}
							else if (fieldsInfo[k].id === colorVarName && fname == key) {
								if (!fieldInfo)
									fieldInfo = temp;
								colorF = key;
							}
							else if (fieldsInfo[k].id === sizeVarName && fname == key) {
								if (!fieldInfo)
									fieldInfo = temp;
								sizeF = key;
							}
							else if (fieldsInfo[k].id === "icon" && !layerSettings.iconFname) {
								layerSettings.iconFname=fname;
								layerSettings.fields.push({ "name": fname, "alias":temp.title, "ibifield":temp.fieldName, "type":"string"});
							}
						}
					}
					var field = {
						name: key.replace(/[ .]/g, "_"),
						alias: fieldInfo ? fieldInfo.title : key,
						ibifield: fieldInfo ? fieldInfo.fieldName : key
					};
					if (U._isNumber(countryWithGeomSource[0].attributes[0][key])) {
						field['type'] = 'double';
					} else if (key === "ObjectID") {
						field['type'] = "oid";
					} else {
						field['type'] = 'string';
					}
					layerSettings.fields.push(field);
					// colorF=field.name;
				}
			}
		}
		else {
			//	if(othis.is3dView())
			layerSettings.sBreakGeo=!othis.isSameGeometry(layerSettings.records) && sbreak;
			var objectID = {
				"alias": "_FID",
				"name": "_FID",
				"type": "oid"
			};
			layerSettings.fields.push(objectID);
			for (var k = 0; k < fieldsInfo.length; k++) {
				var temp = fieldsInfo[k].fields[0], type="string";
				var fname = temp.fieldName.replace(/[ .]/g, "_"),
					geom=this.isPropertyGeometry(layerSettings.records, fieldsInfo[k].id);						
				if (fieldsInfo[k].id === "name")
					fieldInfo = temp;
				else if (fieldsInfo[k].id === "value" || fieldsInfo[k].id === "nameValue") {
					fieldInfo = temp;
					if (colorVarName === "value" || (colorVarName === "color" && fieldsInfo[k].id === "nameValue"))
						colorF = fname;
					if (fieldsInfo[k].id === "value")
						sizeF = fname;
				}
				else if (fieldsInfo[k].id === colorVarName) {
					fieldInfo = temp;
					colorF = fname;
				}
				else if (fieldsInfo[k].id === "icon") {
					layerSettings.iconFname=fname;
					fieldInfo = temp;
					//	type = 'double';
				}
				else if (fieldsInfo[k].id === sizeVarName) {
					fieldInfo = temp;
					sizeF = fname;
				}
				var field = {
					name: fname,
					alias: fieldInfo ? fieldInfo.title : fname,
					ibifield: fieldInfo ? fieldInfo.fieldName : fname
				};
				if(geom) field.alias="pseudo";
				else if(sbreak){
					for(let b = 0; b<sbreak.fields.length; b++) {
						if(sbreak.fields[b].fieldName == fieldInfo.fieldName) {
							layerSettings.sBreakGeo=false;
							break;
						}
					}
				}
				if (sizeF == fname || U._isNumber(temp.fieldName))
					type = 'double';
				field['type'] = type;                    
				layerSettings.fields.push(field);
			}			               
		}
		if(!sbreak && colorF) {
			var minMaxC = minMax(data, colorVarName);
			var config = {
				object: 'axis',
				bucketID: "",
				islog: false,
				min: minMaxC.min,
				max: minMaxC.max,
				// isPercent: isPercentScale(chart, null, axis.name)
				isPercent: false
			};
			layerSettings.labelConfig=config; //"colorMode":"continuous"
			if(Array.isArray(colScale.colors) && colScale.colors.length && 
				colScale.colors[0].hasOwnProperty("start") && !(colScale.colorMode=="bin" || colScale.colorMode=="discrete")) {
				colorVisVar = {
					type: "color",
					field: colorF.replace(/[ .]/g, "_")	
				};
				var stopsC = [], index=0,
					binMarker=colScale.hasOwnProperty("binMarkers") && colScale.binMarkers.hasOwnProperty("concatSymbol") ? colScale.binMarkers.concatSymbol : "-";
				colScale.colors.forEach((clItem)=>{
					if(clItem.hasOwnProperty("start")) {
						index++; 				
						if(!clItem.hasOwnProperty("stop") || jQuery.isEmptyObject(clItem.stop)) {
							if(colScale.colors.length>index)
								clItem.stop=colScale.colors[index].start;	
							else clItem.stop="9999999999"
						} 
						if(typeof(clItem.start) == "string" && (clItem.start.search("%") != -1 || clItem.stop.search("%") != -1)) {
							let max = layerSettings.labelConfig.max, startPT=parseFloat(clItem.start), stopPT=parseFloat(clItem.stop);
							if(isNaN(stopPT))stopPT=100;
							clItem.start=startPT*max/100;
							clItem.stop=stopPT*max/100;
						}	
						stopsC.push({
							value: clItem.start,
							color: clItem.color, 
							label: othis.getLabel(clItem.start, colorVisVar.field, layerSettings.labelConfig) + binMarker +
							othis.getLabel(clItem.stop, colorVisVar.field, layerSettings.labelConfig)
						});
					}
				});
				colorVisVar.stops = stopsC;
			}
			else if (colors && colors.length > 1) {
				var desc = colScale.colorMode == "discrete";
				var maxColor=desc ? 6 : 7;
				if(colors.length>maxColor)
					colors.splice(maxColor,colors.length-maxColor);
				var len = desc ? colors.length : colors.length - 1;
				var dataInt = parseFloat((minMaxC.max - minMaxC.min) / len);
				if(GeoStats.prototype.isNumber(dataInt)) {
					if(dataInt==0) {
						dataInt=minMaxC.max;
						minMaxC.min=0;
						colors=colors.slice(colors.length - 2,colors.length - 1);
					}

					colorVisVar = {
						type: "color",
						field: colorF.replace(/[ .]/g, "_"),

					};

					var stopsC = [];

					colors.forEach(function (clr) {
						var val = minMaxC.min + stopsC.length * dataInt;

						stopsC.push({
							value: val,
							color: clr, label: othis.getLabel(val, colorVisVar.field, config)
						});
					});
					if (desc) {
						var val = minMaxC.max;
						stopsC.push({
							value: val,
							color: colors[colors.length - 1], label: othis.getLabel(val, colorVisVar.field, config)
						});
					}
					var extr=layerSettings.component.extrusion;
					colorVisVar.stops = stopsC;
					if(extr.bExtrudeValue && geometrySources.layerType === "choropleth" && sizeF) {
						var stopsS = []
						sizeVisVar3d = {
							type: "size",
							field: sizeF.replace(/[ .]/g, "_"),
							legendOptions: { showLegend: false }
						};
						//	sizeVisVar.axis= "height";
						stopsS.push({
							value: parseInt(minMaxC.min,10), size: extr.minHeight ? extr.minHeight : 1000,
							label: minMaxC.min == 0 ? "" : othis.getLabel(minMaxC.min, sizeVisVar3d.field, config)
						});
						stopsS.push({
							value: parseInt(minMaxC.max,10), size: extr.maxHeight ? extr.maxHeight : 100000,
							label: othis.getLabel(minMaxC.max, sizeVisVar3d.field, config)
						});
						sizeVisVar3d.stops = stopsS;
					}
				}
			}
		}

		var zoomL = 23, minSc = 70.5, symbolInfo = othis.getSymbolInfo(L.series, "all", 0, !sbreak), scale = layerSettings.component.scale; 

		if (sizeF && geometrySources.layerType === "bubble" && L.bubbleMarker) {
			var maxSz = symbolInfo.maxSize || L.bubbleMarker.maxSize || "6%";
			var bPers = typeof (maxSz) === 'string' && maxSz.search("%") != -1;
			var max = bPers ? contH * parseFloat(maxSz) / 100 : parseInt(maxSz,10);//getMaxMarkerSize(L.bubbleMarker.maxSize)
			var min = parseInt(symbolInfo.size,10) || 3, nofz = overl.sizeStops ||  (data.length > 5 ? 3 : 2);
			//if(L.series && L.series.length)
			//	nofz=L.series.length-1;
			var minMaxS = minMax(sbreak ? getFlatData(data) : data, "value");
			var config = {
				object: 'axis',
				bucketID: "",
				islog: false,
				min: minMaxS.min,
				max: minMaxS.max,
				// isPercent: isPercentScale(chart, null, axis.name)
				isPercent: false
			};
			var dataInt = (minMaxS.max - minMaxS.min) / (nofz - 1),
				minSizeV = { type: "size", valueExpression: "$view.scale" },
				maxSizeV = { type: "size", valueExpression: "$view.scale" };
			sizeVisVar = {
				type: "size",
				field: sizeF.replace(/[ .]/g, "_")//,
			};

			var stopsS = [];
			if(dataInt==0) {
				dataInt=minMaxS.max;
				minMaxS.min=0;
				nofz=2, min=0;
			}
			for (var t = 0; t < nofz; t++) {
				var val = minMaxS.min + stopsS.length * dataInt,
					sz = parseInt(getRadForVal(minMaxS.max, max, val),10);                        
				if (sz < min)
					sz = min;
				stopsS.push({
					value: val, size: sz,
					label: val == 0 ? "" : othis.getLabel(val, sizeVisVar.field, config)
				});
			}					
			sizeVisVar.stops = stopsS;  
			if (symbolInfo && scale && scale.enable && scale.size) {
				sizeVisVar.minDataValue=minMaxS.min;
				sizeVisVar.maxDataValue=minMaxS.max;
				sizeVisVar.legendOptions= { customValues: "" };

				var middl = (scale.size.max - scale.size.min) / 2,
					szMin = scale.size.min, szMax = middl, szInc = (szMax - szMin) / (zoomL - 1),
					stopsS = [], prevVal = minSc, midInc = 8, cusVals = [],
					dataInc2 = (minMaxS.max - minMaxS.min) / 4;
				for (var st = 0; st < 5; st++) {
					cusVals.push(Math.round(parseInt(minMaxS.min + cusVals.length * dataInc2, 10)));
				}
				for (var tt = 0; tt < zoomL; tt++) {
					var sz = szMax - szInc * tt;
					if (tt == 0 || tt == zoomL - 1 || tt == midInc)
						stopsS.push({ value: prevVal, size: parseInt(sz, 10) });
					if (tt == midInc)
						midInc += 8;
					prevVal = prevVal * 2;
				}
				minSizeV.stops = stopsS;
				sizeVisVar.minSize = minSizeV;
				stopsS = [], prevVal = minSc, szMin = middl, szMax = scale.size.max, 
					szInc = (szMax - szMin) / (zoomL - 1), midInc = 8;
				for (var tt = 0; tt < zoomL; tt++) {
					var sz = szMax - szInc * tt;
					if (tt == 0 || tt == zoomL - 1 || tt == midInc)
						stopsS.push({ value: prevVal, size: parseInt(sz, 10) });
					if (tt == midInc)
						midInc += 8;
					prevVal = prevVal * 2;
				}
				maxSizeV.stops = stopsS;
				sizeVisVar.maxSize = maxSizeV;
				sizeVisVar.legendOptions.customValues = cusVals;
			}

			sizeVisVar3d= {
				type: "size",
				field: sizeF.replace(/[ .]/g, "_")//,
			};

			var stopsS = [];
			if(dataInt==0) {
				dataInt=minMaxS.max;
				minMaxS.min=0;
				nofz=2, min=0;
			}
			var extr=layerSettings.component.extrusion;
			if(extr.bExtrudeValue) {	
				sizeVisVar3d.axis= "height";
				stopsS.push({
					value: minMaxS.min, size: extr.minHeight ? extr.minHeight : 1000,
					label: minMaxS.min == 0 ? "" : othis.getLabel(minMaxS.min, sizeVisVar3d.field, config)
				});
				stopsS.push({
					value: minMaxS.max, size: extr.maxHeight ? extr.maxHeight : 100000,
					label: othis.getLabel(minMaxS.max, sizeVisVar3d.field, config)
				});
			}
			sizeVisVar3d.stops = stopsS;  stopsS = [];
		}
		else if (symbolInfo && scale && scale.enable && scale.size) {
			var szMax = scale.size.max || 50, szMin = scale.size.min || 4, szInc = (szMax - szMin) / (zoomL - 1);
			sizeVisVar = {
				type: "size",
				valueExpression: "($view.scale)",
				legendOptions: { showLegend: false }
			};

			var stopsS = [], prevVal = minSc, midInc = 5;
			for (var tt = 0; tt < zoomL; tt++) {
				var sz = (szMax - szInc * tt)*(othis.is3dView() ? 25000 : 1);
				if (tt == 0 || tt == zoomL - 1 || tt == midInc)
					stopsS.push({ value: prevVal, size: parseInt(sz, 10) });
				if (tt == midInc)
					midInc += 5;
				prevVal = prevVal * 2;
			}
			sizeVisVar.stops = stopsS;
		}
		var firstAColor = symbolInfo.color || [51, 51, 204, 0.9];
		for (var ii = 0; ii < L.series.length; ii++) {
			var index = parseInt(L.series[ii].series, 10);
			if (L.series[ii].color) {
				firstAColor = L.series[ii].color;
				break;
			}
		}
		if (!layerSettings.renderer) {
			if (!sbreak && layerSettings.seriesInfo.exceptionalSeries.length==0) {
				let breakField2use=colorF ? colorF : sizeF;////"colorMode":"continuous"
				if(breakField2use && Array.isArray(colScale.colors) && colScale.colors.length && colScale.colors[0].hasOwnProperty("start") &&
					colScale.hasOwnProperty("colorMode") && (colScale.colorMode=="bin" || colScale.colorMode=="discrete")) {
					othis.buildClassBreaksRenderer(geometrySources.layerType,layerSettings, symbolInfo, colScale, breakField2use, contH);						
				}
				else if (geometrySources.layerType === "bubble") {                        
					layerSettings.renderer = {
						"type": layerSettings.iconFname ? "unique-value" : "simple",
						"symbol": {
							type: symbolTypeFromGeomType(geometrySources.layerType),
							outline: {  // autocasts as new SimpleLineSymbol()
								color: [128, 128, 128, 0.5],
								width: "0.5px"
							}
						}
					};
					layerSettings.renderer3d = {
						"type": layerSettings.iconFname ? "unique-value" : "simple",
						"symbol": {
							type: symbolTypeFromGeomType(geometrySources.layerType),
							outline: {  // autocasts as new SimpleLineSymbol()
								color: [128, 128, 128, 0.5],
								width: "0.5px"
							}
						}
					};
					if(layerSettings.iconFname) layerSettings.renderer.field=layerSettings.iconFname;
					if (symbolInfo) {
						othis.doSetSymbol2(symbolInfo, layerSettings.renderer, false, null, contH, layerSettings,false);
						othis.doSetSymbol2(symbolInfo, layerSettings.renderer3d, false, null, contH, layerSettings,true);

						if(!colorVisVar && sizeF) {
							var clr=symbolInfo && symbolInfo.color ? symbolInfo.color : firstAColor;                            
							colorVisVar3d = {
								type: "color",
								field: sizeF.replace(/[ .]/g, "_"),
								legendOptions: { showLegend: false },
								stops: [
									{
										value: 1,
										color: clr
									}
								]
							};          
						}
						else
							colorVisVar3d= colorVisVar;
					}
				}
				else {
					layerSettings.renderer = {
						"type": "simple",
						"symbol": {
							type: symbolTypeFromGeomType(geometrySources.layerType),
							style: "solid",
							outline: {  // autocasts as new SimpleLineSymbol()
								color: "white",
								width: 0
							}
						}
					};  

					layerSettings.renderer3d = {
						"type": "simple",
						"symbol": {    
							type: symbolTypeFromGeomType(geometrySources.layerType)               
						}
					};  
					if (geometrySources.layerType === "line") {
						layerSettings.renderer.symbol.width="3px";
						layerSettings.renderer3d.symbol.width="3px";
					}
					if(symbolInfo) {
						othis.doSetSymbol(othis.getSymbolInfo(L.series, "all"), layerSettings.renderer, false, null, layerSettings,false);
						othis.doSetSymbol(othis.getSymbolInfo(L.series, "all"), layerSettings.renderer3d, false, null, layerSettings,true);
					}  
					colorVisVar3d= colorVisVar;                                                
				}
			}
			else {
				var point=geometrySources.layerType === "bubble", fieldUR="";
				if(sbreak)
					fieldUR=sbreak.fields[0].fieldName.replace(/[ .]/g, "_")
				else {
					fieldUR="Group_Number";
					var condF={name:fieldUR, type:"double", defaultValue: -1};            
					layerSettings.fields.push(condF);
				}
				layerSettings.renderer = {
					"type": point && !layerSettings.sBreakGeo && othis.isAcceptablePieSeries(L) && 
					(sizeVisVar || this.isNumericField(layerSettings.fields, fieldUR)) ? "pie-chart" : "unique-value",
					field: fieldUR
				};
				layerSettings.renderer3d = {
					"type": "unique-value",
					field: fieldUR
				};
				if(!sbreak) {
					layerSettings.renderer.legendOptions = { title: " "};
					layerSettings.seriesInfo.exceptionalSeries.splice(0,0,layerSettings.seriesInfo.defaultSeries);
				}
				let needBlend=!layerSettings.sBreakGeo && ((countryWithGeomSource && countryWithGeomSource.length) || (layerSettings.records && Array.isArray(layerSettings.records))) ? true : false;				
				if(layerSettings.renderer.type=="pie-chart") othis.buildPieChartRenderer(L,layerSettings, sizeVisVar ? sizeVisVar.field : null, symbolInfo, contH);
				else layerSettings.renderer.uniqueValueInfos = othis.getUniqueValueInfo(L,layerSettings,layerSettings.renderer.defaultSymbol,false,point,contH,needBlend);
				layerSettings.renderer3d.uniqueValueInfos = othis.getUniqueValueInfo(L,layerSettings,layerSettings.renderer.defaultSymbol,true,point,contH,needBlend);					
			}
		}
		var arrVars = [],arrVars3d = [];

		if (colorVisVar3d)
			arrVars3d.push(colorVisVar3d);
		if (colorVisVar)
			arrVars.push(colorVisVar);
		else if (!sbreak && layerSettings.seriesInfo.exceptionalSeries.length==0) {
			if (!layerSettings.renderer.symbol) {
				layerSettings.renderer.symbol = {
					type: "simple-fill",
					style: "solid",
					outline: {  // autocasts as new SimpleLineSymbol()
						color: "white",
						width: 0
					}
				};
				layerSettings.renderer3d.symbol = {
					type: "simple-fill",
					style: "solid",
					outline: {  // autocasts as new SimpleLineSymbol()
						color: "white",
						width: 0
					}
				};
			}

			if (!layerSettings.renderer.symbol.color)
				layerSettings.renderer.symbol.color = firstAColor;
			if (!layerSettings.renderer3d.symbol.color) 
				layerSettings.renderer3d.symbol.symbolLayers[0].material= {color: firstAColor};
		}
		var geometryType = overl.layerType;
		if (sizeVisVar) 
			arrVars.push(sizeVisVar);  
		if (sizeVisVar3d && !layerSettings.geometryZ) {    
			arrVars3d.push(sizeVisVar3d);             
			if(geometryType === "bubble"){
				var add = {
					type: "size",
					axis: "width-and-depth",
					useSymbolValue: true // uses the width value defined in the symbol layer (50,000)
				};
				arrVars3d.push(add);
			}
		}
		var fnd=false;
		for(var t=0; t<layerSettings.fields.length;t++){
			if(layerSettings.fields[t].name=="data"){
				fnd=true;
				break;
			}
		}          
		if(!fnd)
			layerSettings.fields.push({name:"data", type:"string"});
		if(!othis.options.hoverHL){
			var opf={name:"HOVER", type:"double", defaultValue: 100};            
			layerSettings.fields.push(opf);
			const opacityVisualVariable = {
				type: "opacity",
				field: "HOVER",  
				legendOptions: { showLegend: false },             
				stops: [
					{ value: 0, opacity: 0.5 },
					{ value: 100, opacity: 1 }
				]
			};
			//
			arrVars.push(opacityVisualVariable);
			arrVars3d.push(opacityVisualVariable);
		}
		if(layerSettings.renderer.type != "class-breaks") {
			layerSettings.renderer.visualVariables = arrVars;
			layerSettings.renderer3d.visualVariables = arrVars3d;
		}

		if (countryWithGeomSource && countryWithGeomSource.length) {
			//wait for geometry
			var geomInt = -1;                
			var geomF = function () {                    
				if(layerSettings.records) {
					geomInt = window.clearInterval(geomInt);
					layerObj.status=layerSettings.records==-1 ? "emptyLayer": "readyToLoad"; 
					othis.createLayerFromChart(layerSettings, geometryType); 
				}                
			};
			geomInt = window.setInterval(geomF, 10);                  
		}                                         
		else {
			if(layerSettings.component.hasOwnProperty("satellite") && layerSettings.component.satellite) {
				othis.addSatellitesBundle(layerSettings, geometryType);					
			}	
			else if(geometryType == "route")
				othis.createRouteLayer(layerSettings);				
			else
				othis.createLayerFromData(layerSettings, geometryType);
			layerObj.status="readyToLoad";
		}
	},
		isNumericField: function(fields, fieldName) {
			let found=false;
			if(Array.isArray(fields)) {
				found= fields.filter((field) => {
			        return field["name"] === fieldName && field["type"] == "double";
			    });
			}
			return found && found.length ? true : false;
		},	
        addCssOverride: function(bRem){
            var othis = this;            
    
            var cssoverride=".tdgchart-tooltip-list {padding-left:5px; white-space: break-spaces;}"; 
            cssoverride+=".esri-legend__layer-table { margin-bottom: 2px;}";
            cssoverride+=".esri-layer-list__item-container { padding: 7px 7px 7px 5px;}"; 
                
            var newRules = getCascadeTooltipCSSRules(othis.options.htmlToolTip || othis.tdgchart.htmlToolTip);
            othis.ttStyle = $(document.createElement("style"));
            if (othis.ttStyle) {
                othis.ttStyle.prop("type", "text/css");
                othis.ttStyle.text(cssoverride);
                othis.ttStyle.appendTo("head");
                for (i = 0; i < newRules.length; i++) {
                    insertCSSRule(othis.ttStyle[0].sheet, newRules[i]);
                }                
            }
        },
        setDynamicLayers: function(viewProperties) {
            var othis = this;
            if(viewProperties.hasOwnProperty("dynamicLayers")){
                othis.dynamicLayers=viewProperties.dynamicLayers;
            } 
        },
		removeLayer: function(layerId, refList) {
			var othis = this, map=othis.getCurrentMap(), layer=map.findLayerById(layerId),fileOrName="";
			if(layer){
				
				for(var kk = 0; kk<othis.layerList.length; kk++){
	                if (othis.layerList[kk].id == layerId || (othis.layerList[kk].layer && othis.layerList[kk].layer.id == layerId)) {  
						fileOrName=othis.layerList[kk].fileOrName || (othis.layerList[kk].component ? othis.layerList[kk].component.fileOrName : layerId);
	                    othis.layerList.splice(kk, 1); 						
	                    break;
	                }
	            }
				layer.parent.remove(layer);
				//if(fileOrName && othis.devTools)
				//	$(othis.devTools).geoUIDevTools("removeDLayer",fileOrName);
				if(refList)
					othis.refreshLayersList();
			}
			return fileOrName;
		},
		toggleSatelliteLayerVisibility: function(layer) {
			var othis=this;
			if(othis.satRenderer && othis.is3dView()) {
				layer.visible=!layer.visible;
				othis.hideTooltips(true);
				othis.satRenderer.updateVisibility();
			}
		},
		getMapPortalId: function(layer, viewType) {
			var pId=null, othis=this;
			if(layer.overlayLayers.length && Object.keys(layer.overlayLayers[0]).length){	                
                for (var kk = 0; kk < layer.overlayLayers.length; kk++) {
                    var lyr = layer.overlayLayers[kk];
					if(lyr.smartMapping && ((lyr.smartMapping.webMapInfo.layerTypeEx == "web-map" && viewType=="2d") || 
							(lyr.smartMapping.webMapInfo.layerTypeEx == "web-scene" && viewType=="3d"))) {
                     	pId = othis.getPortalId(lyr);
						//layer.overlayLayers.splice(kk,1);
						break;
					}
				}
			}
			return pId;
		},
		getSavedLayerProperties: function(layer, comp) {
			var savedL=null;
			if(this.options.savedState && this.options.savedState.hasOwnProperty("layers")
				 && Array.isArray(this.options.savedState.layers)){
				 for(let i = 0; i < this.options.savedState.layers.length; i++) {
					savedL=this.options.savedState.layers[i];
					if(!comp) {
						if(savedL.ibiAddLayer && savedL.ibiAddLayer == layer.id)
							break;
					}
					else if(savedL.ibiAddLayer && (savedL.ibiAddLayer == comp.name || savedL.ibiAddLayer == layer.id)) {
						mergeObjects(layer, savedL.options, true);
						mergeObjects(comp, savedL.options, true);
						break;
					}
				}	
			}
			return savedL;
		},
		getSavedLayer: function(layer) {
			var savedL=null;
			if(this.options.savedState && this.options.savedState.hasOwnProperty("layers")
				 && Array.isArray(this.options.savedState.layers)){
				 for(let i = 0; i < this.options.savedState.layers.length; i++) {
					let tempL=this.options.savedState.layers[i];
					if(tempL.ibiAddLayer == layer.id || tempL.id == layer.id) {
						savedL=tempL;
						break;
					}
				}	
			}
			return savedL;
		},
        createLayer: function(layer, L, fileOrName){
            var othis = this;
            if (layer.infoLayers) {
                othis.options.numOfLayers+=layer.infoLayers.length;                                  
                index=othis.Add_InfoMap(layer.infoLayers,othis.index);   
            }
            else if(layer.overlayLayers){
				if(layer.overlayLayers.length && Object.keys(layer.overlayLayers[0]).length){
					othis.addOverlayWidget(false);
	                othis.options.numOfLayers+=layer.overlayLayers.length;
	                for (var kk = 0; kk < layer.overlayLayers.length; kk++) {
						var overl = layer.overlayLayers[kk], lObj=null, lfileOrName=fileOrName;
						if(overl.layerType=="web-map" || overl.layerType=="web-scene") {this.options.numOfLayers--; continue;}
	                    othis.index++;  	                    
	                    if(L.htmlToolTip)
	                        othis.options.htmlToolTip=L.htmlToolTip;
						
						var comp = L.component ? JSON.parse(JSON.stringify(L.component)) : {}; //component=JSON.parse(JSON.stringify(L.component)),
						if(othis.isBookmarksEnabled())
							othis.getSavedLayerProperties(layer,comp);
						var overOp=layer.hasOwnProperty("opacity") ? layer.opacity : (overl.hasOwnProperty("options") && overl.options.hasOwnProperty("opacity") ? overl.options.opacity : (overl.hasOwnProperty("opacity") ? overl.opacity : 1)),
						overIndex=layer.hasOwnProperty("index") ? layer.index : (overl.hasOwnProperty("index") ? overl.index : othis.index),
						overTitle=layer.hasOwnProperty("title") ? layer.title : layer.title || overl.title || document.title,
						overVis=layer.hasOwnProperty("visible") ? layer.visible : (overl.hasOwnProperty("options") && overl.options.hasOwnProperty("visible") ? overl.options.visible : (overl.hasOwnProperty("visible") ? overl.visible : true));
	                    comp.feature_effects = layer.hasOwnProperty("feature_effects") ? layer.feature_effects : true;
						comp.minScale=layer.hasOwnProperty('minScale') ? layer.minScale : 0;
						comp.maxScale=layer.hasOwnProperty('maxScale') ? layer.maxScale : 0;
						comp.webgl=layer.hasOwnProperty('webgl') ? layer.webgl : false;
						comp.effect = layer.hasOwnProperty("effect") ? layer.effect : "";
						comp.blendMode = layer.hasOwnProperty("blendMode") ? layer.blendMode : "normal";	
						if(layer.hasOwnProperty("featureEffect")) comp.featureEffect = layer.featureEffect;
						comp.renderer = layer.hasOwnProperty("renderer") ? layer.renderer : {};	
						comp.renderer3d = layer.hasOwnProperty("renderer3d") ? layer.renderer3d : {};
						comp.timeInfo = layer.hasOwnProperty("timeInfo") ? layer.timeInfo : null;
						comp.opacity=comp.hasOwnProperty('opacity') ? comp.opacity : overOp;
			            comp.visible = comp.hasOwnProperty('visible') ? comp.visible : overVis;  
						comp.save2portal = layer.hasOwnProperty("save2portal") ? layer.save2portal : false;	
						if(typeof(comp.title) !== 'string' || othis.isPreviewMode())
							comp.title=overTitle || L.layerId;   
						if(!comp.hasOwnProperty('index'))
							comp.index= overIndex; 
						if(!comp.hasOwnProperty('fileOrName'))
							comp.fileOrName= lfileOrName;  
						let urlFile= typeof(overl.url) == 'string' &&  overl.url.toLowerCase().search("/wfc/repository") != -1;
						if (!urlFile && (overl.url || overl.portalid || overl.hasOwnProperty("smartMapping"))) {
							comp.save2portal=true;
	                        if(othis.isonPremiseApi() || !othis.Add_UrlLayer(overl,comp, L))
								othis.options.numOfLayers--;
	                    }
						else if(urlFile) {
			                var req=othis.options.context+"/wfirs?IBFS_action=getContent&IBFS_service=ibfs&IBFS_path=";
			                req+=encodeURI(overl.url);
			                req+=othis.addToken();
			                req+="&IBIMR_Random="+Math.random();    
					//		comp.directions= overl.directions;   
							var lObj = {
	                            layer: overl,  
	                            bigL: L, 
								component: comp
	                        }   
							doXmlHttpRequest(req, { asJSON: true, async: true,  GETLimit: 0, curList: lObj, onLoad: this.addDataLayerFromJson.bind(this)}); 
						}
						else if(overl.media) {
							 comp.media=JSON.parse(JSON.stringify(overl.media));
							 if(!othis.addMediaLayer(overl,comp, L))
								othis.options.numOfLayers--;
						}							
	                    else if (overl) {  
							if(layer.hasOwnProperty('scale') || overl.hasOwnProperty('scale'))
								comp.scale= layer.scale || overl.scale;
							let defMarkSet=layer.hasOwnProperty("markerDefault");
							if(layer.hasOwnProperty('heatmap') || overl.hasOwnProperty('heatmap'))
								comp.heatmap= layer.heatmap || overl.heatmap;
							if(layer.hasOwnProperty('cluster') || overl.hasOwnProperty('cluster'))
								comp.cluster= layer.cluster || overl.cluster;
							if(layer.hasOwnProperty('binning') || overl.hasOwnProperty('binning'))
								comp.binning= layer.binning || overl.binning;
							if(defMarkSet) {
								switch(layer.markerDefault)
			                    {
			                        case "cluster":
			                            {
			                                if(comp.cluster) comp.cluster.enable=true; 
											else comp.cluster={enable:true};   
											if(comp.heatmap)comp.heatmap.enable=false;
											if(comp.binning)comp.binning.enable=false;    
			                                break;	
			                            }
			                        case "heatmap":
			                            {
			                                if(comp.heatmap) comp.heatmap.enable=true; 
											else comp.heatmap={enable:true}; 
											if(comp.cluster)comp.cluster.enable=false;
											if(comp.binning)comp.binning.enable=false;
			                                break;	
			                            }
			                        
			                        case "binning":
			                            {
			                                if(comp.binning) comp.binning.enable=true;  
											else comp.binning={enable:true};  
											if(comp.cluster)comp.cluster.enable=false;
											if(comp.heatmap)comp.heatmap.enable=false;      
			                                break;	
			                            }
			                        
			                    }             
							}						
							
							if(( (layer.hasOwnProperty("line2route") && layer.line2route) || (comp.hasOwnProperty("line2route") && comp.line2route)) && overl.layerType=="line")
								overl.layerType="route";                     
	                        lObj = {
	                            layer: overl,  
	                            bigL: L, 
	                            addi: -1,
								component: comp,
	                            addup : function () {                                                
	                                this.addi = window.clearInterval(this.addi);
	                                othis.addDataLayer(this);
	                            }
	                        }                                            
	                        lObj.addi=window.setInterval(lObj.addup.bind(lObj), 20);                                                                                        
	                    }					
					}                                      
                }
            }
        },
		updateView: function(Settings) {
			var othis = this, map=othis.getCurrentMap(), tChart = Settings.moonbeamInstance; 
			othis.start=new Date();	
			if (othis.isPreviewMode() && tChart.chartType === "com.ibi.geo.map") {		
				let layers = tChart.extensions['com.ibi.geo.map'];
				if(layers.hasOwnProperty("overlayLayers") && layers.overlayLayers.length==0){
					for(var kk = 0; kk<othis.layerList.length; kk++){
						let layer=map.findLayerById(othis.layerList[kk].id);
						if(layer)
							layer.parent.remove(layer);
					}
					othis.layerList=[];
				}	
            }
		},
		isDevelopmentMode : function(){
			var othis = this;
			return othis.devTools ? true : false;
		},
		isLoadingInDevMode : function(){
			var othis = this;
			return othis.loadingFiles && othis.loadingFiles.length;
		},
		isPreviewMode: function(){
			var othis = this;
			return othis.previewMode ? true : false;
		},
		doUpdateDevTools: function(){
			var othis = this;
			if(othis.devTools)
				$(othis.devTools).geoUIDevTools("update");
		
		},
	continueLoading: function() {
		var othis = this, mainToAdd=null, options = {};
		othis.keys="";	othis.createdLayers=[];		
		othis.devTools = null, viewType = othis.getWidgetProperties("viewType"), hasView=othis._view || othis._view3d ? true : false;		
		if(othis.tdgchart.units)
			othis.setUnits(othis.tdgchart.units);
		if(!viewType && othis.tdgchart.chartType === "com.ibi.geo.layer" && !othis.tdgchart.extensions["com.ibi.geo.map"])
			viewType="2d"; 
		else if(!viewType && othis.tdgchart.extensions["com.ibi.geo.map"]) viewType=othis.tdgchart.extensions["com.ibi.geo.map"].viewType || "2d";
		if (viewType) {
			othis.setProperty("viewType", viewType);
			var viewProperties = othis.options.Settings.properties.view || othis.options.Settings.properties;
			options.devTools=othis.options.Settings.properties.hasOwnProperty("devTools") && othis.options.Settings.properties.devTools.create;				
			if(options.devTools){
				setTimeout(function(){
					othis.runCatalogFex("geo_srv_map_uris",othis.setmap_uris.bind(othis));
					var adhoc = "TABLE FILE geo_services PRINT ESRI_COUNTRY_NAME MBR_COUNTRY_NAME BY ISO_COUNTRY_NAME WHERE ESRI_COUNTRY_NAME NE ' ' OR MBR_COUNTRY_NAME NE ' '\nON TABLE PCHOLD FORMAT XML\nEND";
					othis.runCatalogFex2(adhoc,othis.setCountryNames.bind(othis)); }, 500);                	
			}
			othis.setDynamicLayers(viewProperties);
			if (othis.tdgchart.chartType === "com.ibi.geo.map" || (othis.tdgchart.extensions['com.ibi.geo.map'] && othis.tdgchart.extensions['com.ibi.geo.map'])) {
				var last = othis.tdgchart.extensions['com.ibi.geo.map'];
				if(last) {
					othis.setMainOptions(last);
					if(last.hasOwnProperty("overlayLayers") && last.overlayLayers.length){
						mainToAdd=last;
						othis.reopenedFile=true;
						othis.setInitialViewInfo(last.baseLayer);
					}	
					else  
						othis.setInitialViewInfo(last.baseLayer);	
					//		othis.options.groups = last.hasOwnProperty("groups") ? last.groups : {};										
				}
				var mapLayers = othis.tdgchart.answerSet;
				if (mapLayers && mapLayers.length) {
					if (Array.isArray(mapLayers[0]))
						othis.doMergeObjects(mapLayers, othis.tdgchart);


					if (!last || !last.baseMapInfo)
						last = mapLayers[mapLayers.length - 1].extensions['com.ibi.geo.layer'];
					if (!last)//try old extension
						last = mapLayers[mapLayers.length - 1].extensions['com.esri.map'];
				}
				if(!hasView)
					othis.setBaseMaps(last);
			}
			else if (othis.tdgchart.chartType === "com.ibi.geo.layer"
				&& othis.options.Settings.properties.baseLayer) {
				othis.setMainOptions(null);
				othis.setBaseMaps(othis.options.Settings.properties);
			}
			if(!hasView)    
				othis.setBaseMaps(othis.options.Settings.properties);//just in case
			if(othis.options.Settings.properties.hasOwnProperty("selectionDistance"))
				othis.setUnits(othis.options.Settings.properties.selectionDistance);
			if(othis.options.Settings.properties.hasOwnProperty("theme"))
				othis.setTheme(othis.options.Settings.properties.theme); 
			if(othis.options.Settings.properties.hasOwnProperty("uiTheme"))
				othis.setUITheme(othis.options.Settings.properties.uiTheme);
			othis.buttonActive= othis.options.inheritEsriTheme ? "radio-group-checked" : "lyr-btn-active";  


			if(viewType === "3d") $(".btnToggleView").addClass(othis.buttonActive);
			var portalId=this.getMapOrScene(viewProperties, viewType);
			if(!portalId && mainToAdd) 
				portalId=othis.getMapPortalId(mainToAdd, viewType);
			if (viewType === "2d") 
				this.addMap(portalId);
			else if (othis.getWidgetProperties("viewType") === "3d")
				this.addScene(portalId);
			othis.loadView(viewType === "2d" ? othis._view : othis._view3d);
		}
		if(!othis.options.reloading) {
			othis.createWidgets();	
			othis.setUIHandlers(true);	
		}

		othis.index=0;
		if (othis.tdgchart.chartType === "com.ibi.geo.map" || (othis.previewMode && othis.tdgchart.answerSet)) {
			if(othis.options.reloading && Array.isArray(othis.options.savedState.layers)) {  //load portal layers from bookmark
				var map = othis.getCurrentMap(), apikey=this.getApiKey(), dirWidget=this.getCurrentView().ui.find('direction');
				if(dirWidget && dirWidget.apiKey && !apikey) apikey= dirWidget.apiKey;
				othis.options.savedState.layers.forEach(function(lay) {
					if (lay.portalid) {
						let layertoload=lay, adFromPortal = Layer.fromPortalItem({
							portalItem: new PortalItem({id:lay.portalid, apiKey:apikey})}).then(
								(response) => {
									if (response) {
										map.add(response);
										response.on("layerview-create", (event)=>{
											event.layerView.layer.listMode="show"; 
											if(layertoload.hasOwnProperty("title")) event.layerView.layer.title=layertoload.title;
											if(layertoload.hasOwnProperty("opacity")) event.layerView.layer.opacity=layertoload.opacity;
											if(layertoload.hasOwnProperty("visible")) event.layerView.layer.visible=layertoload.visible;
										});
										this.addingFromDirections=false;							
									}
								},
								(err) => {
									console.log(err.message);
								});					
					}
				});
			}
			if(mainToAdd) 
				othis.createLayer(mainToAdd, mainToAdd);
			var mapLayers = othis.tdgchart.answerSet; 
			if (mapLayers && mapLayers.length) {
				if (Array.isArray(mapLayers[0]))
					othis.doMergeObjects(mapLayers, othis.tdgchart);
				mapLayers.forEach(function (L) {
					if (L.extensions) {
						var layer = L.extensions['com.ibi.geo.layer'];
						if (!layer)
							layer = L.extensions['com.esri.map'];
						if (!layer)
							layer = L.extensions['com.ibi.geo.map'];
						if (layer) {
							if(L.errorMessage) {
								/* [GIS-1565] Temporary fix not to initialize the layer in an error state (i.e. NO DATA TO GRAPH)
								 * so the map engine does not get stuck in indefinite loading animation.
								 * Final solution should create empty layer any warn the user within the GUI but for now just skip
								 * and let the user know on the console.
								 * That is different then regular chart behavior that would replace whole chart with a full screen 
								 * errorMessage information, but we still want to display a base map and * other layers (that has data). */
								console.warn("MLM skip layer '" + (layer.title||'?')+"':", L.errorMessage);
							} else {
								var lCopy=JSON.parse(JSON.stringify(layer));
								othis.createLayer(lCopy, L, L.component ? L.component.path : "");
							}
						}                                
					}
					else {
						othis.wait(false);
						if(othis.isPreviewMode()) othis.addOverlayWidget(true, $.ibi.CONTAINER_MESSAGE_TYPE_ADD_LAYER);
					}
				});
				if(othis.options.reloading)
					othis.addLayers();
			}
			else {
				othis.wait(false);
				if(othis.isPreviewMode()) othis.addOverlayWidget(true, $.ibi.CONTAINER_MESSAGE_TYPE_ADD_LAYER);
			}
		} else if (othis.tdgchart.chartType === "com.ibi.geo.layer") {
			var L=othis.options.Settings.moonbeamInstance;
			var layer = othis.options.Settings.properties;
			if (layer) 
				othis.createLayer(layer, L);
		}            
		else
			othis.wait(false);
		if (othis.options.Settings.properties.hasOwnProperty("infoLayers") && 
			othis.options.Settings.properties.infoLayers.length) {
			othis.Add_InfoMap(othis.options.Settings.properties.infoLayers);
		}
		othis.options.reloading=false;	
	},
		getMapOrScene: function (viewProperties, vType) {
			var portalId=viewProperties.portalId;
			if(!portalId && (this.tdgchart.chartType === "com.ibi.geo.map" || (this.previewMode && this.tdgchart.answerSet))) {
                var mapLayers = this.tdgchart.answerSet; 
                if (mapLayers && mapLayers.length) {
					if (Array.isArray(mapLayers[0]))
	                	this.doMergeObjects(mapLayers, this.tdgchart);
	                    mapLayers.forEach(function (lay) {
	                        if (lay.extensions && !portalId) {
	                            var layer = lay.extensions['com.ibi.geo.layer'];
	                            if (layer && layer.overlayLayers && layer.overlayLayers.length && Object.keys(layer.overlayLayers[0]).length){
						
					                for (var kk = 0; kk < layer.overlayLayers.length; kk++) {	                    
					                    var overl = layer.overlayLayers[kk];				                   
										if ((overl.layerType=="web-map" && vType == "2d") || (overl.layerType=="web-scene" && vType == "3d")) { 
											portalId = this.getPortalId(overl);    
											break;                         
				                        } 
									}
								}
							}                      
	                  //  }					
                	}.bind(this));
				}
			}
			return portalId;
		},
		doAfterFileProp: function() {
			let othis=this;
			othis.runCatalogFex("geo_srv_map_layers",othis.setRefLayers.bind(othis));
			othis.runCatalogFex("geo_srv_basemaps",othis.setBaseMapsList.bind(othis));
			if(!this.isonPremiseApi()) {
				if(!this.getApiKey()) {
					othis.addRouteProxy();
					othis.routeUrl= "https://route.arcgis.com/arcgis/rest/services/World/ServiceAreas/NAServer/ServiceArea_World/solveServiceArea";           
					othis.addRequestIntersept("route.arcgis.com");
	            	urlUtils.addProxyRule({ urlPrefix: "route.arcgis.com",proxyUrl: othis.getEdaRequestPrefix()+"/GisEsriProxy"}); 
	
					othis.geocodingServiceUrl = "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer" ;          
					othis.addRequestIntersept("geocode-api.arcgis.com");
	            	urlUtils.addProxyRule({ urlPrefix: "geocode-api.arcgis.com",proxyUrl: othis.getEdaRequestPrefix()+"/GisEsriProxy"}); 
	
			//		othis.addRequestIntersept("route-api.arcgis.com");
	         //   	urlUtils.addProxyRule({ urlPrefix: "route-api.arcgis.com",proxyUrl: othis.getEdaRequestPrefix()+"/GisEsriProxy"});    
				}	
			networkService.fetchServiceDescription(esriConfig.routeServiceUrl).then((resolvedVal) => {
			    othis.options.servDesc=resolvedVal;
			  }).catch((error) => {
			    console.log(error);
			  });
			  	
			}	
			if(this.isonPremiseApi())
			esriConfig.kmlServiceUrl = "";
			if(othis.isBookmarksEnabled())
				othis.readCusomizationMapState();
			else othis.continueLoading();
		},
        createView: function (Settings, mapDiv) {
           var othis = this, mainToAdd=null, options = {};
           othis.start=new Date();
            othis.tdgchart = Settings.moonbeamInstance;
			othis.options.context=othis.tdgchart.webappContext || tdgchart.getScriptBasePath() || "/ibi_apps";            
			othis.previewMode = othis.tdgchart.hasOwnProperty("inPreviewMode") && othis.tdgchart.inPreviewMode;	
            othis.options.Settings=Settings;	
			othis.saveOriginalProperties();		
            othis.mapContainer = mapDiv || othis.options.Settings.container; 
			$(othis.mapContainer).addClass("mlm");
			
		//	othis.buttonActive= othis.options.inheritEsriTheme ? "lyr-btn-esri-active" : "lyr-btn-active";			
			if(!othis.previewMode)
				othis.getFileProperties(othis.getMyPath(true,false));
			else
				othis.addScreenshotImage();	
			
			if(othis.previewMode)
				othis.continueLoading();
        },
        setSelectedUnit: function (unit) {
			var othis=this;
            if(typeof(unit) == "string"){
				unit=unit.toLowerCase();				   
				if(othis.units.hasOwnProperty(unit))
					othis.selUnit = unit;
				else {
					Object.keys(othis.units).forEach(function(U){
                		if(U==unit)
							othis.selUnit = othis.units[U];
            		});
				}               
            }
        },
		getRefLayers: function() {
			return this.options.RefLayersList;
		},
		setRefLayers: function(json) {
			this.options.RefLayersList=json ? json.records : [];
		},
		setBaseMapsList: function(json) {
			this.options.basemapsList=json ? json.records : [];
		},
		setCountryNames: function(xmlDoc) {
			this.options.countryNames=xmlDoc;
		},
		setmap_uris: function(json) {
			this.options.setmap_uris=json ? json.records : [];
			
		/*	Ib_EMFObject.geoRoleCol = Ib_EMFObject.getColNum(xmlUriDoc, "RETURNED_GEOROLE");
            Ib_EMFObject.keyCol = Ib_EMFObject.getColNum(xmlUriDoc, "KEY");
            Ib_EMFObject.urlCol = Ib_EMFObject.getColNum(xmlUriDoc, "URL");
            Ib_EMFObject.paramNameCol = Ib_EMFObject.getColNum(xmlUriDoc, "PARM_NAME");
            Ib_EMFObject.paramGeoRoleCol = Ib_EMFObject.getColNum(xmlUriDoc, "PARM_GEOROLE");
            Ib_EMFObject.mbrLevelCol = Ib_EMFObject.getColNum(xmlUriDoc, "MBR_LEVEL");
            Ib_EMFObject.authorizationCol = Ib_EMFObject.getColNum(xmlUriDoc, "AUTHORIZATION");
            Ib_EMFObject.typeCol = Ib_EMFObject.getColNum(xmlUriDoc, "TYPE");*/
		},
		basemapTitle2Name: function(basemap) {
			var othis = this, name="gray-vector", gotit=false;
			if(!basemap)
				name="None";
			else if(Array.isArray(othis.options.basemapsList)) {
				for(var h=0;h<othis.options.basemapsList.length; h++) {
					var ttl=othis.options.basemapsList[h]["TITLE"], nameTest=othis.options.basemapsList[h]["NAME"];
					if(nameTest == basemap.id){
						name=nameTest;
						gotit=true;
						break;
					}
				}
				if(!gotit) {
					for(var h=0;h<othis.options.basemapsList.length; h++) {
						var ttl=othis.options.basemapsList[h]["TITLE"], nameTest=othis.options.basemapsList[h]["NAME"];
						if(basemap.title && ttl==basemap.title.toLowerCase()){
							name=nameTest;
							break;
						}
					}
				}
			}
			return name;
		},
		
		setBasemapsWidget: function(compBM, listIn) {
			var othis = this, curView=othis.getCurrentView(), comp=curView.ui.find("basemaps"),
			list = listIn ? listIn : othis.options.basemapsList;   
			var basemaps=[]; 
	//		comp.source.basemaps.removeAll();
			for(var h=0;h<list.length; h++) {
				var ttl=list[h]["TITLE"], id=list[h]["NAME"],map;
				if(list[h].hasOwnProperty("CUSTOM") && list[h]["CUSTOM"]=="true")  {
					var mapBaseStyle= null, mapBaseLayers=[], portalId=othis.getPortalId2(list[h]);
					if(portalId) {
						map = new Basemap ( {
                            portalItem: {
							    id: portalId
							},
                            thumbnailUrl:list[h]["ICON"],
                            title:ttl,
                            id:id
                        });
						comp.source.basemaps.add(map);                         
						continue;
					}
					if(list[h]["SCRIPT"] && Array.isArray(list[h]["SCRIPT"].baseMapLayers)) {
						
	                	list[h]["SCRIPT"].baseMapLayers.forEach(function(basealyer){
	                        var base=basealyer, style=base.styleUrl, title=base.title ? base.title : ttl, 
								url=basealyer.url;
					
							if(style){
								mapBaseStyle=new VectorTileLayer({ 
		                            url: style, 
		                            title:title
		                        });
							}
							else if(base.url){
								mapBaseStyle = new TileLayer({ 
		                            url: url, 
		                            title: title
		                        });
							}
							if(mapBaseStyle)
	                         	mapBaseLayers.push(mapBaseStyle);
	                    });
					}
					else {
						mapBaseStyle = new TileLayer({ 
                            url: list[h]["URL"], 
                            title: ttl
                        });
						if(mapBaseStyle)
	                       mapBaseLayers.push(mapBaseStyle);
					}
                    if(mapBaseLayers.length) {
                        map = new Basemap ( {
                            baseLayers:mapBaseLayers,
                            thumbnailUrl:list[h]["ICON"],
                            title:ttl,
                            id:id
                        });
						comp.source.basemaps.add(map);
                    }
				}		
			}
		},
        addCustomBaseMap: function (comp){
            var othis=this;
			if(1){
				if(!othis.options.basemapAdded){
					othis.setBasemapsWidget(comp);
					othis.options.basemapAdded=true;
				}
			}
			else {
				if(!othis.options.basemapAdded && typeof(othis.options.basemap) !=='string') {
	                othis.options.basemapAdded=comp.source.basemaps.find(function(bm){
	                    return bm.id== othis.options.basemap && othis.options.basemap.id && bm.title== othis.options.basemap.title;
	                });
	                if(!othis.options.basemapAdded) {
	                    comp.source.basemaps.add(othis.options.basemap);
	                    othis.options.basemapAdded=true;
	                }
	            }
			}
            
        },
		checkCustomBasemaps: function(prop){
			var othis=this, rt=true;
            if (othis.options.basemapsList && prop && prop.baseMapInfo && Array.isArray(prop.baseMapInfo.customBaseMaps)) {
				if(Array.isArray(prop.baseMapInfo.customBaseMaps)) {
					var index=0;
					prop.baseMapInfo.customBaseMaps.forEach(function(baselayer){
                        if(baselayer.hasOwnProperty("ibiBaseLayer")) {
							rt=othis.options.basemapId!=baselayer.ibiBaseLayer;
						//	othis.options.basemapId=baselayer.ibiBaseLayer;
							let list = othis.options.basemapsList;			
							for(let h=0;h<list.length; h++) {
								let id=list[h]["NAME"], portalId=othis.getPortalId2(list[h]);
								if(rt && (portalId==prop.baseMapInfo.customBaseMaps[index].basemapPortalId || (list[h].hasOwnProperty("CUSTOM") && 
										list[h]["CUSTOM"]=="true" && id==baselayer.ibiBaseLayer)))  {
									if(list[h]["SCRIPT"] && Array.isArray(list[h]["SCRIPT"].baseMapLayers))
										prop.baseMapInfo.customBaseMaps[index]=list[h]["SCRIPT"].baseMapLayers[0];
									else prop.baseMapInfo.customBaseMaps[index]=list[h];
									break;						
								}
							}
							index++;
						}
					});
				}
			}
			return rt;
		},
        setBaseMaps: function(prop, update){
            var othis=this;
            if ((!othis.options.basemap || update) && prop && prop.baseMapInfo && Array.isArray(prop.baseMapInfo.customBaseMaps)) {
                var first=prop.baseMapInfo.customBaseMaps[0];
				if(Array.isArray(prop.baseMapInfo.customBaseMaps)) {
					var mapBaseLayers=[], done=false;
                	prop.baseMapInfo.customBaseMaps.forEach(function(basealyer){
                        var mapBaseStyle= null, base=basealyer, style=base.styleUrl, title=base.title || base.TITLE, 
							url=base.url || base.URL, found=false, portalId=othis.getPortalId2(base);
						if(portalId) {
                             othis.options.basemap = new Basemap ( {
                                portalItem: {
								    id: portalId
								}
                            });
							done=true;
						}
						else {
							if(basealyer.baseMapLayers && Array.isArray(basealyer.baseMapLayers)){
								style=basealyer.baseMapLayers[0].styleUrl;
								url=basealyer.baseMapLayers[0].url;
							}
							if(style){
								mapBaseStyle=new VectorTileLayer({ 
		                            url: style, 
		                            title:title,
									effect: prop.baseMapInfo.effect || ""
		                        });
							}
							else if(url){
								mapBaseStyle = new TileLayer({ 
		                            url: url, 
		                            title: title,
									effect: prop.baseMapInfo.effect || ""
		                        });
							}
							if(mapBaseStyle)
	                         	mapBaseLayers.push(mapBaseStyle);
						}
						
						if(!done && basealyer.baseMapLayers && Array.isArray(basealyer.baseMapLayers)){
							style=basealyer.baseMapLayers[0].styleUrl;
							url=basealyer.baseMapLayers[0].url;
						}
						if(!mapBaseStyle){
							if(style){
								mapBaseStyle=new VectorTileLayer({ 
		                            url: style, 
		                            title:title,
									effect: prop.baseMapInfo.effect || ""
		                        });
							}
							else if(base.url){
								mapBaseStyle = new TileLayer({ 
		                            url: url, 
		                            title: title,
									effect: prop.baseMapInfo.effect || ""
		                        });
							}
							if(mapBaseStyle)
	                         mapBaseLayers.push(mapBaseStyle);
						}						
                    });
					if(done) return;
                    if(mapBaseLayers.length) {
                        othis.options.basemap = new Basemap ( {
                            baseLayers:mapBaseLayers,
                            thumbnailUrl:first.thumbnailUrl,
                            title:first.title,
                            id:first.name
                        });
						update=false;
                    }
					else if(!othis.options.basemap || update)
                        othis.options.basemap = first.name || first.ibiBaseLayer;
                }
                else
                    othis.options.basemap = prop.ibiBaseLayer;
            }
            if ((!othis.options.basemap || update) && prop && prop.baseLayer && prop.baseLayer.hasOwnProperty("basemap"))
                othis.options.basemap = prop.baseLayer.basemap || prop.basemap;
        },
		setMeasuringTools: function() {
			var othis=this;
			if(othis.showUIControls()) {
				var buttons = this.is3dView() ? $(".measTools3d").find(".btn-sel-type") : $(".measTools").find(".btn-sel-type"); 
				buttons.removeClass("ibx-radio-button"); buttons.removeClass("ibx-check-box");
			//	if(show) measurement.activeTool = viewType === "2d" ? "distance" : "direct-line";
	            othis.cmdMs = $("<div>").ibxCommand({id:"cmdMeasType",  class: "cmd-meas-type"}).on("ibx_uservaluechanged", function(e){
	                var userValue = $(e.target).ibxWidget("userValue");
	                othis.options.userValueMeas=userValue; 
                    switch(othis.options.userValueMeas)
                    {
                        case "cmdDistMs":
                            {
                                othis.distMeasurements();          
                                break;	
                            }
                        case "cmdAreaMs":
                            {
                                othis.areaMeasurements(); 
                                break;	
                            }
                        
                        case "cmdClearMs":
                            {
                                othis.clearMeasurements();           
                                break;	
                            }
                        
                    }                 
                     
	            });
			}
		},
		distMeasurements: function(){
			var othis=this, view=othis.getCurrentView(), viewType=othis.getWidgetProperties("viewType"),
			measurement=view.ui.find("measurement");            
            if(measurement)
				measurement.activeTool = viewType === "2d" ? "distance" : "direct-line";
				
			if(othis.isPreviewMode())
				measurement.activeTool = null;
		},
		areaMeasurements : function(){
			var othis=this, view=othis.getCurrentView(),measurement=view.ui.find("measurement");            
            if(measurement)
				measurement.activeTool = "area";
		},
		clearMeasurements : function(){
			var othis=this, view=othis.getCurrentView(),wdg=view.ui.find("measurement");
			if(wdg)wdg.clear();
		},
		stopSketch : function(){
			var view=this.getCurrentView(),wdg=view.ui.find("sketch");
			if(wdg) {
				wdg.viewModel.complete();
				wdg.layer=null;
			}
		},
		startSketch : function(){
			var view=this.getCurrentView(),wdg=view.ui.find("sketch");
			if(wdg)wdg.layer=this.getCurrentMap().findLayerById(defaultGraphicsLayerId);
			if(!this.isPreviewMode())
			setTimeout(()=>{this.noteEdit.geoUISymbolSettings("updateSettings"); }, 100);
		},
		clearSearch : function(){
			var othis=this, view=othis.getCurrentView(),wdg=view.ui.find("search");
			if(wdg)wdg.clear();
		},
		createSatelliteLayerEx: function(xmlResult, layerSettings) {
			if (xmlResult && xmlResult.status != '403' && xmlResult.status != '0') {
	            var content = getSingleNode(xmlResult, '//ibfsrpc/rootObject/content');
	            if (content && content.firstChild) {
	                var fileCont = ibiunescape(window.atob(content.firstChild.nodeValue));
					if(typeof(fileCont)==='string') {
						try { layerSettings.groups = JSON.parse(fileCont);}							
						catch (e) {layerSettings.groups =null;}					
					}
				}
			}
			if(!layerSettings.component.hasOwnProperty("layerType"))
				this.createSatelliteLayer2(layerSettings);
			else
				this.createSatelliteLayer(layerSettings,true);
		},
		addSatellitesBundle: function(layerSettings){	
			var othis=this;		
			if (typeof define === 'function' && define.amd)
				define.amd = false;			
			
			ibx.resourceMgr.addBundles([{"src":"../../tdg/jschart/distribution/extensions/com.ibi.geo.map/lib/sat_bundle.xml", "loadContext":"ibx"}]).then(function (){
				if(othis.is3dView()) {
					let view = othis.getCurrentView();
					view.environment.background = {
					      type: "color",
					      color: "#171717"
					    };						
					}
					othis.getAmperInfo(layerSettings.component.hasOwnProperty("amper_name") ? 
						layerSettings.component.amper_name : "COUNTRY_NAME", othis.monitorAmperCountryChanges, layerSettings);
					if(typeof(layerSettings.groups) == 'undefined' && layerSettings.component.hasOwnProperty("groups"))
						othis.getSatelliteGroups(layerSettings.component.groups, layerSettings);
					else othis.createSatelliteLayerEx(null, layerSettings);
			});		
		},
        setUIHandlers : function(doAll){
            var othis=this;
			othis.wait(true);
		
			if(doAll && othis.showUIControls()) {
	            
	            $(".cmd-ToggleBM").on("ibx_triggered", function(e){			
	                //$(".btnToggleBM").css({"color": opened ? "#07a1df" : "black"});	
	                if(othis.toggleUIwidget("basemaps")) $(".btnToggleBM").addClass(othis.buttonActive);
	                else $(".btnToggleBM").removeClass(othis.buttonActive);			
	            });
	            $(".cmd-ToggleLE").on("ibx_triggered", function(e){			
	                if(othis.toggleUIwidget("legend")) $(".btnToggleLE").addClass(othis.buttonActive);
	                else $(".btnToggleLE").removeClass(othis.buttonActive);	
	            });
	            $(".cmd-toggleTOC").on("ibx_triggered", function(e){	
	                if(othis.toggleUIwidget("layers")) $(".btnToggleTOC").addClass(othis.buttonActive);
	                else $(".btnToggleTOC").removeClass(othis.buttonActive);	
	            });
///
				if(othis.isTimesliderEnabled()) {
					$(".cmd-TimeSlider").on("ibx_triggered", function(e){						
						if(othis.toggleUIwidget('timeslider'))$(".btnTimeSlider").addClass(othis.buttonActive);
	                	else {
							$(".btnTimeSlider").removeClass(othis.buttonActive);		
						//	othis.resetTimeslider();						
						}				
		            });
				}					
				else 
					$(".btnTimeSlider").hide();
				if(othis.isBookmarksEnabled()) {
					$(".cmd-SaveCustom").on("ibx_triggered", function(e){	
					//	if(!othis.is3dView()) {
							if(othis.toggleUIwidget("bookmarks")) $(".btnSaveCustom").addClass(othis.buttonActive);
		                	else {$(".btnSaveCustom").removeClass(othis.buttonActive);
								//othis.saveCustomizationMapState(true);
							}
					//	}						
		            });
					$(".cmd-RemoveCustom").on("ibx_triggered", function(e){	
		                othis.reloadWithoutBookmarks();
				//		$(".btnRemoveCustom").addClass("disabledwidget");
		            });
				//	$(".btnRemoveCustom").addClass("disabledwidget");
				}					
				else {
					$(".btnSaveCustom").hide();
					$(".btnRemoveCustom").hide();
				}
				if(othis.isDiscoverEnabled()) {
					$(".cmd-Discover").on("ibx_triggered", function(e){	
						let btn=$(".btnDiscover");
						if(othis.discoverWidget()) $(".btnDiscover").addClass(othis.buttonActive);
	                	else $(".btnDiscover").removeClass(othis.buttonActive);						
		            });					
				}					
				else {
					$(".btnDiscover").hide();					
				}
				if(othis.isScalerangeEnabled()) {
					$(".cmd-ScalerangeSlider").on("ibx_triggered", function(e){	
						let btn=$(".btnScalerangeSlider");
						if(othis.toggleUIwidget('scalerange')) $(".btnScalerangeSlider").addClass(othis.buttonActive);
	                	else $(".btnScalerangeSlider").removeClass(othis.buttonActive);						
		            });					
				}					
				else
					$(".btnScalerangeSlider").hide();
				$(".cmd-ToggleView").on("ibx_triggered", function(e){	
	                othis.toggleViewType();
					setTimeout(function(){othis.updateToolBarButtonsState();
						if(othis.getWidgetProperties("viewType") === "3d") $(".btnToggleView").addClass(othis.buttonActive);
						else $(".btnToggleView").removeClass(othis.buttonActive); }, 500);
	            });
			}
        },
        setSelectionTools : function () {
			 var othis=this;
			if(othis.showUIControls()) {
	            var othis=this;
	            var tBar = $(".map-container-tbar");
	            othis.cmd = $("<div>").ibxCommand({id:"cmdSelType",  class: "cmd-sel-type"}).on("ibx_uservaluechanged", function(e){
	                var userValue = $(e.target).ibxWidget("userValue");
	                othis.options.userValue=userValue; 
	                if(0) {
	                    setTimeout(function(){
	                        switch(othis.options.userValue)
	                        {
	                            case "selExtent":
	                                {
	                                    tBar.find(".sel-extent").find("div").first().attr("class","esri-icon-sketch-rectangle");            
	                                    break;	
	                                }
	                            case "selPolygon":
	                                {
	                                    tBar.find(".sel-extent").find("div").first().attr("class","esri-icon-sketch-rectangle");  
	                                    break;	
	                                }
	                            case "selCustPolygon":
	                                {
	                                    tBar.find(".sel-extent").find("div").first().attr("class","esri-icon-sketch-rectangle");  
	                                    break;	
	                                }
	                            case "selCircle":
	                                {
	                                    tBar.find(".sel-extent").find("div").first().attr("class","esri-icon-sketch-rectangle");               
	                                    break;	
	                                }
	                            
	                        }    },100);                   
	                    }                               
	                othis.doAction(true);
	            });
			}
        },
        isSameTool: function(activeTool){
            return (activeTool=="circle" && this.options.userValue=="selCircle") || 
                    (activeTool=="polygon" && this.options.userValue=="selPolygon") ||
                    (activeTool=="rectangle" && this.options.userValue=="selExtent");
        },
        doAction: function (bUpdateDB) {
            var othis=this; 
            othis.setHighlightOpt(true);   
            if(othis.sketchVM && othis.sketchVM.state=="active" && !othis.isSameTool(othis.sketchVM.activeTool)) {
                var tUV=othis.options.userValue;
                othis.sketchVM.destroy(); othis.sketchVM = null; 
                setTimeout(function(){othis.options.userValue=tUV; othis.doAction(true);},100);
                return;
            }
            switch(othis.options.userValue)
            {
                case "selExtent":
                    {
                        if(bUpdateDB)
                        othis.showDistanceBox(false);                    
                        othis.selectByExtent();                 
                        break;	
                    }
                case "selPolygon":
                    {
                        if(bUpdateDB)
                            othis.showDistanceBox(false);
                        othis.selectWithinPolygon("freehand");     
                        break;	
                    }
                case "selCustPolygon":
                    {
                        if(bUpdateDB)
                            othis.showDistanceBox(false);
                        othis.selectWithinCustomPolygon();     
                        break;	
                    }
                case "selCircle":
                    {
                        if(bUpdateDB)
                            othis.showDistanceBox(true);
                        othis.selectByDistanceFromPoint();   
                        tg=$(".sel-circle");                      
                        break;	
                    }
				case "selPolyline":
                    {
                        if(bUpdateDB)
                            othis.showDistanceBox(true);
                        othis.selectWithPolyLine(); 
                        break;	
                    }                
            }
        },
        isCustomSelectionOn: function() {
        	return this.options.userValue == "selCustPolygon";
        },
        
        isSelectionOn: function() {
            return this.options.userValue == "selCustPolygon" || this.options.userValue == "selExtent" || 
				this.options.userValue == "selCircle" || this.options.userValue == "selPolygon";
        } ,
        showDistanceBox: function (bShow) {
            if(this.isShowUnits()){
                var toolSetBox= $(".selTools"), box = toolSetBox.find($(".distance-box-wrapper"));
                if(box.length > 0)	{
                    var vis = box.is(":visible");
                    if(vis != bShow) {
                        if(bShow) box.show();
                        else box.hide();
                    }
                    if(bShow) {
                        var input = $(".distanceEdit");
                        if(input)
                            input.ibxTextField("option", "text", getTransString('Distance'));
                    }
                } 
                else if(bShow)
                    this.addDistanceBox(toolSetBox, true);
            }
		},
		addDistanceBox: function(toolSetBox, bShow){
			var othis=this;
			var wrapper = $("<div class='distance-box-wrapper'>").ibxHBox({	aligh: "stretch"});           
            
			var distance = $("<div tabindex='0'></div>").ibxTextField({class: "distanceEdit", 
				aria: {label:getTransString('DistanceAnon')},
				text: getTransString('Distance')});
            distance.find("input").addClass("esri-input");
            distance.find("input").css("border","none");
            var unitsMenu = $("<div tabindex='0' title='"+getTransString('Units')+"'></div>").ibxSelect({userValue:"units", 
                aria: {label:getTransString('UnitsAnon')},
                class: "distanceUnits unitsMenu", readonly: true});
            $(unitsMenu).on("ibx_change", function(e, data){
                othis.setSelectedUnit(data.text);
            });				
            $(unitsMenu).css({"padding":0, "border":"none"});
           
            unitsMenu.find("input").addClass("esri-input");
            var btn =  unitsMenu.find(".ibx-button");
            btn.removeClass("ibx-button"); btn.addClass("esri-widget--button"); 
			$(distance).on("ibx_textchanging", function(e){
				var obj=$(this);
				var orgDist = obj.ibxTextField("option", "text");
				if(e.which != $.ui.keyCode.TAB && orgDist==getTransString('Distance'))
					obj.ibxTextField("option", "text", "");				
				switch (e.which)
				{
					case $.ui.keyCode.ENTER:
					case $.ui.keyCode.BACKSPACE:
					case $.ui.keyCode.COMMA:
					case $.ui.keyCode.DELETE:
					case $.ui.keyCode.DOWN:
					case $.ui.keyCode.END:
					case $.ui.keyCode.ESCAPE:
					case $.ui.keyCode.HOME:
					case $.ui.keyCode.LEFT:
					case $.ui.keyCode.PAGE_DOWN:
					case $.ui.keyCode.PAGE_UP:
					case $.ui.keyCode.PERIOD:
					case $.ui.keyCode.RIGHT:
					case $.ui.keyCode.UP:
					case $.ui.keyCode.TAB:
						break;
					default:
					{
						if(isNaN(parseInt( e.key, 10 )))
						{
							e.preventDefault();	
							return false;
						}
					}
				}
			});
			$(distance).on("change", function(e){
				var obj=$(this);
				var input = $(e.target).val();
				if(!input)
					input=getTransString('Distance');
				obj.ibxTextField("option", "text", input);
				othis.doAction(false);
			});
			
            var selOpt=null;
            Object.keys(othis.units).forEach(function(U){
                
                var option = $("<div id='"+U+"'></div>").ibxSelectItem({"align": "stretch"});
                option.ibxSelectItem("option", "text", U);
                if(othis.isSelectedUnit(U))
                    selOpt=option;
                unitsMenu.ibxSelect("addControlItem",option);
            });
            if(selOpt)
                unitsMenu.ibxSelect("selected", selOpt);
			
			wrapper.ibxWidget("add", distance);
			wrapper.ibxWidget("add", $(unitsMenu));
			toolSetBox.ibxWidget("add", wrapper);
		//	unitsMenu.height(distance.height());
			wrapper.find(".ibx-select-open-btn").css("padding",0);
			if(!bShow)
				wrapper.hide();
        },
       
        getSeriesLabel: function(layerSettings, index) {
            var lbl = "";
            if (layerSettings.seriesInfo && layerSettings.seriesInfo.series.length) {
                for (var p = 0; p < layerSettings.seriesInfo.series.length; ++p) {
                    if(p==index) {
                        lbl=layerSettings.seriesInfo.series[p].label;
                        break
                    }                    
                }
                if (!lbl)
                    lbl=layerSettings.seriesInfo.series[0].label;
            }
            return lbl;
        },
        getSeriesDataLabel: function(layerSettings) {
            var lbl = null;
            if (layerSettings.seriesInfo && layerSettings.seriesInfo.series.length) {
                if(layerSettings.seriesInfo.defaultSeries.hasOwnProperty("dataLabels"))
                    lbl = layerSettings.seriesInfo.defaultSeries.dataLabels;
                for (var p = 0; p < layerSettings.seriesInfo.series.length; ++p) {
                    if(layerSettings.seriesInfo.series[p] && layerSettings.seriesInfo.series[p].hasOwnProperty("dataLabels")) {
                        //merge
                        var temp=layerSettings.seriesInfo.series[p].dataLabels;
                        if(!lbl)
                            lbl=temp;
                        else {
                            for(var key in temp) {
                                if(temp.hasOwnProperty(key))
                                    lbl[key]=temp[key];
                            }
                        }
                        break
                    }                    
                }               
            }
            return lbl;
        },
		createLayerLabelInfo: function(dataLObj, geomType) {
            var labelClass = {
                symbol: {
                    type: "text",
                    font: {
                        family: "Sans-Serif",
                        size: '7.5pt',
                    }
                },
				labelState: -1,
                labelExpressionInfo: {},                
            };
            if (dataLObj) {
                var field = "", content=dataLObj.content;
                if (dataLObj.font && typeof (dataLObj.font) === "string") {
					let q = "'", qBegin=dataLObj.font.indexOf(q), qEnd=dataLObj.font.lastIndexOf(q);
	                if (qBegin!=-1 && qEnd!=-1) {
						let ff=dataLObj.font.substring(qBegin+1, qEnd);
	                    labelClass.symbol.font.family = ff;
						dataLObj.font=dataLObj.font.replace("'"+ff+"'","");
	                }
                    let fParts = dataLObj.font.split(" ");
                    if (fParts && fParts.length) {
                        for (let m = 0; m < fParts.length; ++m) {
                            let te = fParts[m], int = parseInt(te, 10);
                            if (!isNaN(int))
                                labelClass.symbol.font.size = te;
                            else if (te == "italic")
                                labelClass.symbol.font.style = te;
                            else if (te == "bold")
                                labelClass.symbol.font.weight = te;
							else if (te == "underline" || te == "line-through")
                                labelClass.symbol.font.decoration = te;
                        }
                    }
                }                
                if (dataLObj.hasOwnProperty("position"))
                    labelClass.labelPlacement = null; 
				if (dataLObj.hasOwnProperty("backgroundColor"))
                    labelClass.symbol.backgroundColor=dataLObj.backgroundColor;
				if (dataLObj.hasOwnProperty("labelPlacement"))
                    labelClass.labelPlacement = geomType=='point' ? dataLObj.labelPlacement : "always-horizontal";
                if (dataLObj.hasOwnProperty("color"))
                    labelClass.symbol.color = dataLObj.color != "auto" ? dataLObj.color : "black"; 
				if (dataLObj.hasOwnProperty('rotation'))
                    labelClass.symbol.angle = dataLObj.rotation; 
                if(typeof(content) === 'string' && content != "auto")
                    labelClass.labelState= (content.search("series_label") != -1 && content.search("metadata_value") != -1) ? 2 : 1;
                else if(!content || content == "auto")
                    labelClass.labelState=0;
            } 
			return labelClass;
		},
		getLabelClass: function(obj) { return new LabelClass(obj); },
        isStickyTT: function() {
            var othis = this;
         
            return othis.isSticky;
        },
        setStickyTT: function(bSticky) {
            this.isSticky=bSticky;
        },
        isTooltipWithMenu: function(graphics) {
            var othis = this;
            for(var h=0;h<graphics.length;h++){
                if(graphics[h].layer) {
                    var lId=graphics[h].layer.id;
                    for (var k in othis.layerList) {
                        if (othis.layerList[k].id == lId){
                            var st=othis.layerList[k].hasOwnProperty("WF_menu");
                            othis.setStickyTT(st);
                            return st ? othis.layerList[k].WF_menu : false;
                        }
                    }					
                }
            }            
            return false;
        },
        getTT: function (layerSettings, recordAttr){
            var tt = null, ttFirst=null;
            if (layerSettings.seriesInfo && layerSettings.seriesInfo.series.length) {
                for (var p = 0; p < layerSettings.seriesInfo.series.length; ++p) {
                    var mod = layerSettings.seriesInfo.series[p];
                    if (mod.tooltip) {                            
                        if(!ttFirst) ttFirst = mod.tooltip;
                        if(layerSettings.seriesInfo.series[p].label == recordAttr[layerSettings.renderer.field] ||
                           (layerSettings.defaultRenderer && 
                            layerSettings.seriesInfo.series[p].label == recordAttr[layerSettings.defaultRenderer.field])) {
                            tt = mod.tooltip;
							tt.color=layerSettings.seriesInfo.series[p].color;
                            break;
                        } 
                    }
                }
                if (!tt)
                    tt = ttFirst || layerSettings.seriesInfo.defaultSeries.tooltip;
            }
            if(tt && tt.hasOwnProperty("WF_menu"))
                layerSettings.WF_menu=tt.WF_menu;
            return tt;
        },       
        setHeatMapRenderer: function(layerSettings) {
            var othis = this, view=othis.getCurrentView();
            var schemes = heatmapSchemes.getSchemes({
                basemap: othis.getCurrentMap().basemap
            });
            var setRen="defaultRenderer";
            var renField="", colors = schemes.primaryScheme.colors;
            if(layerSettings.component.heatmap.enable) {
                layerSettings.defaultRenderer=layerSettings.renderer;
                setRen="renderer";
				setRen3d="renderer3d";
            }            
            if(layerSettings.component.heatmap.hasOwnProperty("colorRamp")){
                colors=[];
                layerSettings.component.heatmap.colorRamp.forEach(function (color) {
                    colors.push(new Color(color));
                });
            }
            if(layerSettings.renderer.visualVariables) {
                for(var i = 0; i < layerSettings.renderer.visualVariables.length; i++) {
                    var temp = layerSettings.renderer.visualVariables[i];
                    if(temp.type == "color") {
                        colors=[];
                        temp.stops.forEach(function (stop) {
                            colors.push(new Color(stop.color));
                        });
                        renField=temp.field;
                        break;
                    }
                }
            }
            layerSettings[setRen]={
                type: "heatmap",
                field: renField,
				referenceScale: null,
                colorStops: othis.createColorStops(colors),
                maxDensity: layerSettings.component.heatmap.maxPixelIntensity || 25,
                minDensity: layerSettings.component.heatmap.minPixelIntensity || 0,
                radius: layerSettings.component.heatmap.blurRadius || 10
            };
        },
        getSeriesTT: function(tt, name, bAddColorCol) {
            var othis=this;
			if(name.time)
			name.time=this.formatDateToLocal(name.time);	
			//var withQ=othis.addQuots(name);
			var ttClone = JSON.parse(JSON.stringify(tt)), subs=false;
			function updateUrl(menuElt) {
				if(menuElt.hasOwnProperty('url')) {
					var url=menuElt.url;
					if(url.search('portalDispatch')!=-1 && typeof(portalDispatch) === 'function'){
						url=url.replace("'{{","\"'{{");
						menuElt.url=url.replace("}}'","}}'\"");
					}
				}
			}
			if(ttClone.hasOwnProperty("WF_menu")) {
				var menu=ttClone.WF_menu;
				if(Array.isArray(menu)){
                	menu.forEach((elt)=>{
						if(elt.hasOwnProperty('children') && Array.isArray(elt)) {
							subs=true;
							elt.forEach((sub)=>{
								updateUrl(sub);
							});
						}
						else updateUrl(elt);
	                });
	            }
			}
			var cont= othis.tdgchart.resolveToolTipSeriesContent(ttClone, name), values=$(cont).find(".tdgchart-tooltip-value");
			if(cont && tt.color && bAddColorCol) {
				let trs=$(cont).find("tr");
				for(let k = 0; k < trs.length; k++) {
					let td = $(document.createElement("td")), clr= k==0 ? "inherit" : tt.color;
					td.css({"background-color": clr, "width":"10px"});
					td.insertBefore(trs.eq(k).find("td").first());
				}
			}
			values.addClass("mlm-tooltip-values");
            if(cont && othis.options.inheritEsriTheme) {	
				var esCont=othis.getTooltipContEsriStyle(), esTbody=esCont.find("tbody"), curUL=$(cont).find("ul").first(); curUL.appendTo(esTbody); cont=esCont[0];
                var names = $(cont).find(".tdgchart-tooltip-name"), subm=$(cont).find(".tdgchart-submenu"), lbls= $(cont).find(".tdgchart-tooltip-label");
               // $(cont).find("table").addClass("esri-widget__table");
                names.removeClass("tdgchart-tooltip-name"); names.addClass("esri-feature-content");
                values.removeClass("tdgchart-tooltip-value"); values.addClass("esri-feature-content");subm.removeClass("tdgchart-submenu-style");  subm.addClass("esri-widget esri-widget__table mapSubmenuShadow");
				lbls.removeClass("tdgchart-tooltip-label"); lbls.addClass("esri-feature-content");
			//	$(cont).css("background-color","inherit");
            }
			else if(cont) {
				$(cont).css("background-color", "black");
				$(cont).find(".tdgchart-submenu").addClass("tdgchart-submenu-style mapSubmenuShadow");
			}
			$(cont).find('ul').first().find(".tdgchart-tooltip-divider").appendTo($(cont).find('ul').first());
            return cont;
        },
        geometry2data: function(geoJson, recLst){
		//recLst comes from FEX (i.e. answerSet[0][].data)
		//i.e.
		//answerSet[0][].extensions.com.ibi.geo.layer.overlayLayers[0].dataDelim == "|"
		//answerSet[0][].extensions.com.ibi.geo.layer.overlayLayers[0].title = "World Cities"
		//answerSet[0][].extensions.com.ibi.geo.layer.overlayLayers[0].geometrySources.default = { "geometryLocateField": [ "NAME", "STATE", "COUNTRY"], "geometrySourceType": "ibijson", "ibiGeometryField": "GEO_ESRI", "url": "/ibi_apps/webconsole/IWAYNODE_EDASERVE/ibiweb.exe?IBIF_ex=_edahome/catalog/gis_ibiweb_ibi MAP='CHOROPLETH',IBI_LEVEL='5',LAST_PARM='COUNTRY'" }
		//i.e. for China
		//answerSet[0][].extensions.com.ibi.geo.layer.overlayLayers[0].geometrySources.China = ... "geometryLocateField": [ "NAME5", "NAME1"],
		//gives
		//recList: { name: "CHINA", source: <as-above>, values: <parsed data>
		//NAME1: - region (i.e. state, voivodeship)
		//NAME5: - city name
		//
		//geoJson is geometry fetched by ibiweb.exe from ibi/WebFOCUS_WFI/srv/home/etc/geomaps filtered by data
		//China: http://localhost:25000/ibi_apps/webconsole/IWAYNODE_EDASERVE/ibiweb.exe?IBIF_ex=_edahome/catalog/gis_ibiweb_mbr ISO_CC2='CN',MAP='CHOROPLETH',MBR_LEVEL='5'
            var fieldGeo1, fieldGeo2,locateField=recLst.source.geometryLocateField;
            if (locateField.length === 2 || locateField.length === 3) {
                fieldGeo1 = locateField[1];
                fieldGeo2 = locateField[0];                        
            } else
                fieldGeo1 = locateField[0];
            if(recLst.attributes && Array.isArray(recLst.attributes)){
                var b = new Date();
                var jlen=geoJson.length;
                recLst.attributes.forEach(function (A) {
                    var geoL1=A['GEOLEVEL1'], geoL2=A['GEOLEVEL2'];
                    jlen=geoJson.length;
                    if (fieldGeo2) {        
                        for (var m = 0; m < jlen; ++m) {    
                            var elt=geoJson[m], cntr=A['COUNTRY'];

                            /* GIS-1549 - missing fields shouldn't crash processing */
                            // this does not resolve issue(s) that may be seen with matching city names with geo hierarchy naming thus some cities
                            // not being mapped or being matched to the wrong administrative boundaries (i.e. whole province containing the city)
                            // that may be subject to another story
                            if(!elt[fieldGeo1] || !elt[fieldGeo2])
                                continue;

                            if((elt[fieldGeo1].toUpperCase() === geoL1 && elt[fieldGeo2].toUpperCase() === geoL2) || (cntr && fieldGeo1 && elt[fieldGeo1].toUpperCase() === cntr)){
                                A["GEO_ESRI"]=elt.GEO_ESRI;
                                geoJson.splice(m,1);
                                break;
                            }
                        }
                    } else {
                        for (var m = 0; m < jlen; ++m) {    
                            var elt=geoJson[m];
                            if (elt[fieldGeo1] && (elt[fieldGeo1].toUpperCase() === geoL1)) {
                                A["GEO_ESRI"]=elt.GEO_ESRI;
                                geoJson.splice(m,1);
                                break;
                            }
                        }
                    }
                });
               // console.log(new Date().getTime()-b.getTime() + " reclist");
            }
        },
		geometryFromData: function(arrGeoms,parmName,parmValues) {
			var geo=null;
			if(parmValues.length==1){
				let parmValue=parmValues[0];
				for (var m = 0; m < arrGeoms.length; ++m) {    
	                var elt=arrGeoms[m];
	                if (elt[parmName] && (elt[parmName] === parmValue)) {
	                    geo=elt.GEO_ESRI;
	                    break;
	                }
	            }
			}
			
			return geo;
		},
		updateSymbol: function(img, orgSymbol) {
			var symb, othis=this, str = JSON.stringify(orgSymbol).replace("{{icon}}", img), symb=JSON.parse(str),
			url = getUrl(img, othis.options.context);
			symb.type=url ? "picture-marker" : "simple-marker";
			if(isRegularShape(img)) {
				symb.style=img;
				delete symb["path"];
			}
			else if(url) {
				symb.url=url;
				delete symb["path"];
				 symb.width = symb.size || "20px";
                 symb.height = symb.size || "20px";
			}
            else {
                symb.style = 'path';
                symb.path = img;
				delete symb["url"];
            }
			
			return symb;
		},
		createGeometries: function(layerSettings, geomType,labelState, arrGeom, uvi, arrPopT, dates) {
			
			var othis=this, dataLObj =  othis.getSeriesDataLabel(layerSettings), labelsAdded=false, images=[], sizeField=null, index=0,
				bGroups=layerSettings.seriesInfo.exceptionalSeries.length!=0, 
				timeIndex=Array.isArray(layerSettings.chartLayer.dataArrayMap) ? layerSettings.chartLayer.dataArrayMap.indexOf("time") : -1,
				doBlend=othis.options.bubbleUniqueMix || layerSettings.renderer.type==="pie-chart" || layerSettings.geometryType == 'choropleth';
			var vvars=layerSettings.renderer3d.visualVariables, 
				bUnqR= layerSettings.renderer && layerSettings.renderer.type==="unique-value" && !layerSettings.sBreakGeo,
				bUnqR3d= layerSettings.renderer3d && layerSettings.renderer3d.type==="unique-value" && !layerSettings.sBreakGeo,
				updateMarkerPos=false;
            if(vvars) {                
                for(var i = 0; i < vvars.length; i++) {                    
                    if(vvars[i].type == "size") {
                        sizeField=vvars[i].field;
                        break;
                    }
                }
            }  
			function isLabelField(infos, field) {
                for (var k = 0; k < infos.length; ++k){
                    var fname=infos[k].fields[0].fieldName, modFname=fname.replace(/[ .]/g, "_");
                    if(field==fname || field==modFname){
                        if((infos[k].id=="name" && (labelState==2 || labelState==0))
                            || (infos[k].id=="value" && (labelState==2 || labelState==1 || labelState==0)) ||
                            (infos[k].id=="nameValue" && (labelState==2 || labelState==0)))
                        return true;
                    }
                } 
                return false;
            }   
			function addSliceField(slicefield, alias) {
				let found= layerSettings.fields.filter(function (field) {
			        return field["name"] === slicefield;
			    });
                if(!found || found.length==0)
                	layerSettings.fields.push({"alias": alias, "name": slicefield, "type":"double"});
            }   
            function getNumberFormat(infos, field){
                var nformat=null;
                for (var k = 0; k < infos.length; ++k){
                    var fname=infos[k].fields[0].fieldName, modFname=fname.replace(/[ .]/g, "_");
                    if(field==fname || field==modFname){
                        nformat=infos[k].fields[0].numberFormat;
                        break;
                    }
                } 
                return nformat;
            }	

                //                attr["GEOLEVEL2"] = splitRecord[0];
			function getGroupNumber(index, label) {
				var retGroup=-1;
				for (let k = 0; k < layerSettings.seriesInfo.exceptionalSeries.length; ++k){
                   if(layerSettings.seriesInfo.exceptionalSeries[k].hasOwnProperty("group") && 
						layerSettings.seriesInfo.exceptionalSeries[k].group === index) {
						retGroup= layerSettings.seriesInfo.exceptionalSeries[k].group;	
						if(layerSettings.renderer && layerSettings.renderer.type=="unique-value") {
							for (let p = 0; p< layerSettings.renderer.uniqueValueInfos.length; ++p){
								let uvi=layerSettings.renderer.uniqueValueInfos[p];
								if(uvi.value==retGroup)	{
									uvi.label=(isNaN(uvi.label) ? ", " : "") + ibiunescape(label);
									break;
								}
							}
							break;
						}
					}						
                } 
				return retGroup;
			}
			if(Array.isArray(layerSettings.records)) {
				layerSettings.records.forEach(function (r) {
	                r.attributes.forEach(function (A) {	                    
	                        var attr = {}, symbol=null, popTc = null, popupTemplate;
	                        for (var key in A) {
	                            if (A.hasOwnProperty(key)) {
	                                if (key == "data") {
	                                    popTc = othis.getSeriesTT(othis.getTT(layerSettings,A), prettyName(A[key], 
											layerSettings.dataDelim),othis.is3dView() ? bUnqR3d && doBlend : bUnqR && doBlend);
										othis.addTimeField(A.data,attr, layerSettings, dates);
	                                    attr[key]=JSON.stringify(A.data);
										if(A.data.hasOwnProperty("icon") && layerSettings.iconFname){
											var img=A.data.icon, found=false, imgShort=img,
											ind = img.lastIndexOf("/"), indexDot = img.lastIndexOf(".");
									        if (ind != -1)
									            imgShort= img.slice(ind + 1, (indexDot != -1 ? indexDot : img.length));
											for(var ii = 0; ii < images.length; ii++) { 
												if(images[ii]==img) {
													found=true;
													break;
												}
											}
											if(!found){
												images.push(img);
					                            uvi.push({value: imgShort,symbol: othis.updateSymbol(img, layerSettings.renderer.symbol)});
											}
											attr[layerSettings.iconFname]=imgShort;
										} 
										if(bGroups)
											attr["Group_Number"] = getGroupNumber(index, A.data.url0 || A.data.name);								
	                                }
	                                else if(key!='GEO_ESRI'){
	                                    var fieldToUse=key.replace(/[ .]/g, "_");
										var val = A[key];
										if(!isNaN(val) && val > 1)
											val=parseInt(val);
	                                    attr[fieldToUse] = val;
										symbol=othis.getSymbolFromRenderer(layerSettings,val);
	                                    if(dataLObj && labelState!=-1 && isLabelField(layerSettings.fieldsInfo,key)) {
	                                        var numFormat=getNumberFormat(layerSettings.fieldsInfo,key);                                            
	                                        if(numFormat) {
	                                            var fValue=othis.getLabel(A[key], key, "", numFormat);
	                                            if(fValue && fValue !==A[key]){
	                                                fieldToUse+="_formated";
	                                                var data={name:"data", type:"string"};
	                                                attr[fieldToUse] =fValue;
	                                                if(!labelsAdded)
	                                                    layerSettings.fields.push({name:fieldToUse, type:"string"});
	                                            }
	                                        }
	                                        if(!labelsAdded) {
	                                            if(isNaN(A[key]) || labelState==0)
	                                                layerSettings.labelField=fieldToUse;
	                                            else
	                                                layerSettings.valueField=fieldToUse;
	                                        }                                            
	                                    }
	                                }
	                            }
	                        }   
	                        labelsAdded=true;
	                        if (popTc && othis.isTooltipEnabled()) {
	                            $(popTc).find("ul").css("list-style-type", "none");
	                            popupTemplate = { content: popTc};  
							//	attr["POPUP"]=popTc.outerHTML;                              
	                        }
	                        
	                        var geom=null, bSimp=geomType != "point" && othis.isOnSimpList(A['GEOLEVEL1']);
							if(A.GEO_ESRI)  {
		                        if(geomType == "point") {
		                            geom = new Point({ x: A.GEO_ESRI.geometry.x,y: A.GEO_ESRI.geometry.y,
		                                spatialReference: A.GEO_ESRI.spatialReference
		                            });      
									if(A.GEO_ESRI.geometry.hasOwnProperty("z"))
										geom.z = A.GEO_ESRI.geometry.z;
								}                                      
		                       else if(Array.isArray(A.GEO_ESRI.geometry.rings)){
		                            geom = new Polygon({rings: A.GEO_ESRI.geometry.rings,spatialReference: A.GEO_ESRI.spatialReference});
		                            geom= othis.doSimplifyGeom(geom);
		                        }								
							}
							let tempGraph = doBlend	? getAddedGraphic(A,arrGeom) : null;
							if(tempGraph && geom && !geometryEngine.equals(geom, tempGraph.geometry)) tempGraph = null;
							if(!updateMarkerPos || !geom) {
								let tg=getAddedGraphic(A,arrGeom);
								if(tg) {
									if(!geom)geom=tg.geometry;
									if(!updateMarkerPos)updateMarkerPos=geometryEngine.equals(geom, tg.geometry);									
								}								
							}								
							if(layerSettings.renderer.type=="pie-chart") {
								let slice=A[layerSettings.renderer.field].replace(/[ .]/g, "_"), field2use2=(sizeField ? sizeField : layerSettings.renderer.field)+"_"+slice;
								if(tempGraph)tempGraph.attributes[field2use2] = sizeField ? A[sizeField] : 10;
								else attr[field2use2] = sizeField ? A[sizeField] : 10;
								addSliceField(field2use2, A[layerSettings.renderer.field]);
							}
							if(geom && !tempGraph) {
								var g = {
		                            geometry: geom,
		                            attributes: attr,
		                            popupTemplate:popupTemplate
		                        };
		                        arrGeom.push(g);
							}
							else {								
								if(tempGraph && tempGraph.attributes) {
									updateMarkerPos=true;
									if(sizeField && tempGraph.attributes[sizeField] < A[sizeField])
										tempGraph.attributes[sizeField]=A[sizeField];
									mergePopupTemplate(tempGraph,popTc,othis.options.inheritEsriTheme);
									if(layerSettings.renderer.uniqueValueInfos && layerSettings.renderer.uniqueValueInfos.length) {
										if(layerSettings.renderer.type=="unique-value")
										tempGraph.attributes[layerSettings.renderer.field]=layerSettings.renderer.uniqueValueInfos[0].value;	
										if(layerSettings.renderer3d.type=="unique-value")
										tempGraph.attributes[layerSettings.renderer3d.field]=layerSettings.renderer3d.uniqueValueInfos[0].value;
									}								
								}
							}	
							index++;
	                });
	            });
			}
			if(updateMarkerPos) {
				if(othis.isPreviewMode())
				this.updateMarkerPos(layerSettings.renderer.uniqueValueInfos, othis.getCurrentView().zoom);
				//this.updateMarkerPos(layerSettings.renderer3d.uniqueValueInfos);
				layerSettings.updateMarkerPos=true;
			}
		},
		
        createLayerFromChart: function (layerSettings, geometryType) {            
            var G = [], geomType, othis = this, uvi=[], renderer; 
            if (geometryType === "bubble"){
                geomType = "point";              
              //  if (layerSettings.component.heatmap) 
              //      othis.setHeatMapRenderer(layerSettings);                
            }
            else
                geomType = "polygon";
			var dataLObj = this.getSeriesDataLabel(layerSettings), labelClass=this.createLayerLabelInfo(dataLObj, geomType), labelState=labelClass.labelState;
            console.log(new Date().getTime()-othis.start.getTime()), gOrig=[], arrPopT=[], dates=[];			
            othis.createGeometries(layerSettings,geomType,labelState, G, uvi, arrPopT,dates); 
		  
		//	layerSettings.fields.push({ "name": "POPUP", "type":"string"});
            if (layerSettings.renderer) {
				if(Array.isArray(uvi) && uvi.length) {
					layerSettings.renderer.uniqueValueInfos=uvi;
					layerSettings.renderer3d.uniqueValueInfos=uvi;
				}
			//	othis.removeEmptyUinfo(layerSettings.renderer);
			//	othis.removeEmptyUinfo(layerSettings.renderer3d);
                renderer = othis.is3dView() ? layerSettings.renderer3d : layerSettings.renderer;
            }
            var popContent = [
                {
                    type: "fields",
                    fieldInfos: [
                    ]
                }
            ];
         //   G.splice(1, 500);
            for(var t=0; t<layerSettings.fields.length;t++){
                if(layerSettings.fields[t].name=="data"){
                    layerSettings.fields.splice(t,1);
                    break;
                }
            } 
			if(layerSettings.renderer.type=="unique-value") {
				for(var tt=0; tt<layerSettings.fields.length;tt++){
	                if(layerSettings.fields[tt].name==layerSettings.renderer.field){
	                    layerSettings.fields[tt].type="string";
	                    break;
	                }
	            }    
			}
			if(layerSettings.renderer3d.type=="unique-value") {
				for(var tt=0; tt<layerSettings.fields.length;tt++){
	                if(layerSettings.fields[tt].name==layerSettings.renderer3d.field){
	                    layerSettings.fields[tt].type="string";
	                    break;
	                }
	            }    
			}      
			
            console.log(new Date().getTime()-othis.start.getTime() + " "+ G.length);
            var fl =  new FeatureLayer ({
                fields: layerSettings.fields,
                renderer: renderer,
                id: layerSettings.id,
                title: layerSettings.component.title || layerSettings.id,
                source: G,
                geometryType: geomType,
				blendMode: layerSettings.component.blendMode || "normal",
				effect: layerSettings.component.effect || "",
                opacity: Number(layerSettings.component.opacity),
                visible: layerSettings.component.visible,
				popupEnabled: false,
				minScale: layerSettings.component.minScale,
				maxScale: layerSettings.component.maxScale,
				timeInfo: othis.getLayerTimeInfo(dates)
                //    spatialReference: new SpatialReference(102100)
            });
			if(layerSettings.component.hasOwnProperty("featureEffect"))
			fl.featureEffect=layerSettings.component.featureEffect;
			if (layerSettings.component.heatmap && layerSettings.component.heatmap.enable)
				this.createHeatmapRenderer(fl, null, null, null, null, null, layerSettings.component);
			if(!othis.isTooltipEnabled()) {
				fl.popupTemplate = fl.createPopupTemplate();
				fl.popupEnabled=true;
			}
			fl.updateMarkerPos=layerSettings.updateMarkerPos;
            if (geomType == "point")
                othis.setClustering(layerSettings,fl);
			
            if(layerSettings.labelField || layerSettings.valueField) { 
                var labels = "$feature." + (layerSettings.labelField ? layerSettings.labelField : layerSettings.valueField); 
                
                if(layerSettings.valueField && layerSettings.labelField){
                    labels += "+TextFormatting.NewLine+";
                    labels += "$feature." + layerSettings.valueField; 
                }
                labelClass.labelExpressionInfo = dataLObj.visible==true ? { expression: labels } : { expression: "" };
                fl.labelingInfo = [labelClass];
            }
            var layerProps = {
				dataLayer: true,
                id: layerSettings.id,
				component:layerSettings.component,
                defaultRenderer: othis.getDefaultRenderer(layerSettings.defaultRenderer, fl),
                chartLayer: layerSettings.chartLayer,
                sizeVisVar : layerSettings.sizeVisVar, 
                valueField: layerSettings.valueField,
                labelField: layerSettings.labelField, 
                labelOrgVisible: dataLObj.visible==true,   
				renderer: layerSettings.renderer, 
				renderer3d: layerSettings.renderer3d,         
                layer: null,
				seriesInfo: layerSettings.seriesInfo,
                gOrig: gOrig
            };
            if(layerSettings.WF_menu)
                layerProps.WF_menu=layerSettings.WF_menu;
            othis.insertLayer(layerProps, fl, G);
        },
		removeEmptyUinfo: function(renderer) {
			if(renderer && renderer.type=="unique-value") {
				var arrVal = renderer.uniqueValueInfos.filter(function(info){
					return info.value ? true : false;
				});
				renderer.uniqueValueInfos=arrVal;
			}
		},
        getDataLabel:function(layerId) {
            var dLableObj={}, othis = this;
            for(var k = 0; k<othis.layerList.length; k++){
                if (othis.layerList[k].id == layerId) {  
                    dLableObj.valueField=othis.layerList[k].valueField;
                    dLableObj.labelField=othis.layerList[k].labelField;
                    dLableObj.labelOrgVisible=othis.layerList[k].labelOrgVisible;
                    break;
                }
            }
            return dLableObj;
        },
        registerEventsFromJSON: function (layer) {
            var othis = this, chart=othis.tdgchart;         
            if (!chart.eventDispatcher) {
                return;
            }
            chart._callbackList = chart._callbackList || [];
            layer.eventDispatcher.events.forEach(function(el) {
                el._eventKey = eventKey(el);
                if (layer._callbackList.every(function(e) {
                    return e._eventKey !== el._eventKey;
                })) {
                    if (typeof el.callback === 'function') {
                        chart.registerEvent(el);
                    } else if (el.url || (typeof el.event === 'string' && el.event.toLowerCase().startsWith('seturl'))) {
                        el.immediate=true;
                        chart.setURL(el);
                    }
                }
            });
        },
        insertLayer: function(layerProps, layer, G, justDoIt) {
            var othis = this, map=othis.getCurrentMap();
			var len = othis.layerList.length,layTargetId=null;
				
            layerProps.layer=layer;
			if(layer.type=="elevation") {
				othis.layerList.push(layerProps); 
				map.ground.layers.add(layer);
				return;
			}		
			if(othis.updating) {
				if(!map.findLayerById(layer.id)){
					othis.layerList.push(layerProps);
					map.add();					
				}
				else {
					alert("update features");
				}
			}
			else if(othis.refresh && othis.dynLObj) {
				layerProps.id=layerProps.layer.id=othis.dynLObj.id;
				if(!othis.isPreviewMode())
					layerProps.component.title=layerProps.layer.title=othis.dynLObj.component.title;
				else
					layerProps.component.title=layerProps.layer.title;
				for (var i = 0; i < len; i++) {
                    var tempL=othis.layerList[i].layer;
                    if(tempL && tempL.id==layerProps.id) {
				//		mergeObjects(othis.layerList[i],layerProps,true);
						if(othis.runtimeRefresh) {
						//	othis.layerList[i].layer=tempL;
							tempL.renderer=layerProps.layer.renderer;
							tempL.featureReduction=layerProps.layer.featureReduction;
							othis.layerList[i].layer=tempL;
						/*	if(Array.isArray(layerProps.toolTips)) {
								var dest=[];
								for (var n = 0; n < layerProps.toolTips.length; n++)
	            					dest.push(layerProps.toolTips[n]);
								othis.layerList[i].toolTips=dest;
							}*/
							othis.layerList[i].toolTips=layerProps.toolTips;
							othis.getCurrentView().whenLayerView(tempL).then(function(layerView){
				                layerView.queryFeatures().then(function(results){
				                	tempL.applyEdits({deleteFeatures:results.features, addFeatures: G});
				                });
	            			}); 
						}
						else {							
							var map=othis.getCurrentMap(), index = map.layers.indexOf(tempL);
							layerProps.options=othis.layerList[i].options;
							layerProps.opened=othis.layerList[i].opened;
							othis.layerList.splice(i, 1, layerProps);
							if(layerProps.layer.opacity === undefined)
							layerProps.layer.opacity=tempL.opacity;
							if(layerProps.layer.visible === undefined)
							layerProps.layer.visible=tempL.visible;							
							map.remove(tempL);
	                        othis.addLayer(layerProps, index);	
							othis.addLayersOptions(layerProps.options,true);
						}                        
				//		map.reorder(layerProps.layer, index);			
                        return;
                    }   
					if(!tempL){
						othis.refreshStop(); 
						return; 
					}                  
                }				
			}	
            else {
	            if(othis.options.layersOrder=="optimal" || othis.isLoadingInDevMode()){
	                var type=layer.type, dataL=layer.type=="feature" && layer.source && layer.source.length;
	                if(len==0)// || (type=="polygon" && ))
	                    othis.layerList.push(layerProps);               
	                else {
	                    var added=false, bDemo=!dataL || type=="map-image", gType=layer.geometryType;
	                    for (var i = 0; i < len; i++) {
	                        var tempL=othis.layerList[i].layer, tempDataL=(tempL.type=="feature" && tempL.source && tempL.source.length);
	                        if((tempDataL && bDemo) || (gType=="polygon" && tempL.geometryType=="point") || 
	                                (gType=="point" && tempL.geometryType=="point" && layer.renderer && layer.renderer.type=="heatmap")) {
								layTargetId=tempL.id;
	                            othis.layerList.splice(i, 0, layerProps);
	                            added=true;
	                            break;
	                        }                       
	                    }
	                    if(!added)
	                        othis.layerList.push(layerProps);  
	                }
	            }
	            else if(othis.options.layersOrder=="as-is" || othis.options.layersOrder=="stupid") {     
	                //use index
	                var layIndex= othis.isPreviewMode() && othis.initFinal ? 0 : layerProps.component.index, added=false;    
	                for (var i = 0; i < len; i++) {
	                    var tempInx=othis.layerList[i].component.index;
	                    if(layIndex<tempInx) {
	                        othis.layerList.splice(i, 0, layerProps);
	                        added=true;
	                        break;
	                    }                       
	                }      
	                if(!added)
	                    othis.layerList.push(layerProps);                
	            }
			}
			if(othis.isLoadingInDevMode() || othis.isPreviewMode() || layer.type == "graphics" || justDoIt) {
				othis.addLayer(layerProps, layIndex);
				if(layTargetId)
					othis.setLayerBefore(layTargetId, layer.id, false);
			}		
        },
        areLayersReady: function(tLayers) {            
            for (var i = 0; i < tLayers.length; i++) {
                if(tLayers[i].status!="readyToLoad" && tLayers[i].status!="emptyLayer")
                    return false;
            }            
            return true;
        },
		isDescribeOn: function() {
			let ret= this.getWidgetProperties("describe");
			if(typeof(ret) === 'undefined') return true;
			return ret;
		},
		isRefreshLayers: function() {
			let ret= this.getWidgetProperties("refreshLayers");
			if(typeof(ret) === 'undefined') return true;
			return ret;
		},
        getCurrentView: function(vType){
			if(!vType) vType=this.getWidgetProperties("viewType");
            return vType == "2d" ? this._view : this._view3d;
        },
        getCurrentMap: function(vType){
			if(!vType) vType=this.getWidgetProperties("viewType");
            return vType == "2d" ? this._map : this._map3d;
        },
		getParametersAndValues2: function (layObj) {
            var ret="", index= layObj.index || 0;
            if (Array.isArray(layObj.parameters)){
                for (var i = 0; i < layObj.parameters.length; i++) {
                    var par=layObj.parameters[i], name=par["name"], value=par["selectedvalue"];
					if(!value && Array.isArray(par.values) && par.values.length) {
						value=par.values[0];
					}
					if(!value) value="_FOC_NULL";
					ret += "&"+ibiescape(name)+"="+ibiescape(value);			
				}
			}
			return ret;
		},
        getParametersAndValues: function (layObj) {
            var ret="", index= layObj.index || 0;
            if (layObj.parameters && Array.isArray(layObj.parameters)){
                for (var i = 0; i < layObj.parameters.length; i++) {
                    var par=layObj.parameters[i];
                    for (var key in par) {
                        if (par.hasOwnProperty(key) ) {
                            if(isNaN(index)) {
                                ret += "&"+key+"="+index;
                            }
                            else {
                                var val=par[key];
                                if(typeof(val)==='string'){
                                    var dsh=val.search("-");
                                    if(dsh!=-1){
                                        var j = val.split(","), f = j[0].split("-");
                                        var t=parseInt(f[0],10)+parseInt(j[1],10)*index;
                                        if(t<parseInt(f[1],10))
                                            ret += "&"+key+"="+t;
                                        else
                                            return null;
                                    }
                                }
                            }
                        }
                    }
                }     
            }
            return ret;
        },
        getHtmlCanvasFile : function(path) {
			var request = this.getContext() + '/wfirs?IBFS_action=get&IBFS_service=ibfs&IBFS_path=' + path,
				ibfs_obj = '<rootObject _jt="IBFSMRObject" ></rootObject>';
	       
	        request += "&IBFS_object=" + ibfs_obj+this.addToken(); 
			doXmlHttpRequest(request, { asJSON: false, async: true, asXML: true, GETLimit: 0, onLoad: this.doImportCanvasMap.bind(this)});
		},
		getSatelliteGroups : function(path, layerSettings) {
			var request = this.getContext() + '/wfirs?IBFS_action=get&IBFS_service=ibfs&IBFS_path=' + path,
				ibfs_obj = '<rootObject _jt="IBFSMRObject" ></rootObject>';
	       
	        request += "&IBFS_object=" + ibfs_obj+this.addToken(); 
			doXmlHttpRequest(request, { asJSON: false, async: true, asXML: true, GETLimit: 0, curList: layerSettings, onLoad: this.createSatelliteLayerEx.bind(this)});
		},
		doImportCanvasMap: function(xmlResult) {
			if (xmlResult && xmlResult.status != '403' && xmlResult.status != '0') {
	            var content = getSingleNode(xmlResult, '//ibfsrpc/rootObject/content');
	            if (content && content.firstChild) {
	                var fileCont = ibiunescape(window.atob(content.firstChild.nodeValue));
					if(typeof(fileCont)==='string') {
						var htmlDoc = document.implementation.createHTMLDocument("example");
					    htmlDoc.documentElement.innerHTML = fileCont;
					    var head = htmlDoc.head;
					    if (head) {
					        var error = htmlDoc.getElementById("errorTitle");
					        if (error) {
					            var container = $("#" + contId);
					            var spBox = $(document.createElement("div"));
					            spBox.html(ajaxResult);
					            container.append(spBox);
					            return;
					        }
							else {
								var xmlDoc = getXmlDoc(htmlDoc);
								if(xmlDoc){
									var othis=this, maps = getNodesArray(xmlDoc,"//html_element[@elementtype='77']");
									maps.forEach(function (mapXml) {
										othis.doConvertMap(mapXml, xmlDoc);
						            });
								}
							}
					    }
					}
				}
	        }
		},
		
		getDemogOrRefLayer: function(name) {
			var othis=this; 
			for(var j = 0; j <othis.options.RefLayersList.length; j++) {				
				if(othis.options.RefLayersList[j]["NAME"] == name) 
					return othis.options.RefLayersList[j];
			}
			return null;
		},
		doConvertMap: function(mapXml, xmlDoc) {
			//alert(mapXml);
			var layers=getNodesArray(mapXml,"./link/condition/data_info"), basemap=mapXml.getAttribute("basemap");
			if(Array.isArray(layers)) {
				var othis=this, arrItems=[], dataLayers=[],
				xmlBody = getSingleNode(mapXml, "//html_elements//html_body"), filePath= xmlBody ? xmlBody.getAttribute("ibif_ex") : "";
				layers.forEach(function(layer){
					if(layer.getAttribute("demographic") == "1") {
						var name = layer.getAttribute("layer_demo_name");
						var item=othis.getDemogOrRefLayer(name);
						if(item)
							arrItems.push(transform(item,othis.getEdaRequestPrefix()));
					}
					else {
						var canvasLayer={dLayer:{type:"htm",path:filePath}}, reportType=layer.getAttribute("sourcetype"), list=layer.getAttribute("requests_list"), reqNode;
					    if (list && reportType=="typeAnyReport") {
					        var arrIds = list.split(g_szStringDelimiter);
					        var len = arrIds.length;
					        for (var j = 0; j < len; j++) {
					            var pattern = "//requests/request[@requestid='" + arrIds[j] + "']";
					            reqNode = getSingleNode(xmlDoc, pattern);
					            if (reqNode)
					                break;
					        }
					    }
	
						if(reqNode) {
							canvasLayer.type=reqNode.getAttribute("sourcetype") == "typeFex" ? "fex" : "json-file";
							canvasLayer.path=reqNode.getAttribute("ibif_ex");
							canvasLayer.title=layer.getAttribute("name");
							canvasLayer.load=true;
							canvasLayer.visible=true;
							canvasLayer.opacity=1;
							canvasLayer.geometryType=layer.getAttribute("georolegeometry");
							canvasLayer.georole=layer.getAttribute("georole");
							
							canvasLayer.uniquefield=layer.getAttribute("emfuniquefield");
							canvasLayer.cluster={"enable":layer.getAttribute("clustering") == "1"};
							canvasLayer.heatmap={"enable":layer.getAttribute("heatmap") == "1"};
							canvasLayer.tooltips={"enable":layer.getAttribute("popups") == "1"};
							canvasLayer.label=layer.getAttribute("labeling");
							canvasLayer.labelField=layer.getAttribute("feature_label_field");
							canvasLayer.marker={
								type:layer.getAttribute("symbol_use"),
								field:layer.getAttribute("symbol_field"),
								size:layer.getAttribute("symbol_size") || layer.getAttribute("symbol_size_field") || 12,
								shape:layer.getAttribute("symbol_shape") ||layer.getAttribute("symbol_image_field") || "circle",
								rotation:layer.getAttribute("symbol_image_angle_field"),
								color:layer.getAttribute("symbol_color") || "red",
								symbol_scheme:layer.getAttribute("symbol_scheme") || "YlGn",
								symbol_method:layer.getAttribute("symbol_method") || "natural-breaks",
								symbol_classes:parseInt(layer.getAttribute("symbol_classes") || 5, 10)
							};
							var sVals=getNodesArray(layer,"./symbol_values/symbol_value"),
								fields=getNodesArray(layer,"./column_desc/col"), 
								georoles=getNodesArray(layer,"./georolefields/georolefield");
							if(canvasLayer.marker.type=='unique') {
								canvasLayer.marker.values=[];
								sVals.forEach(function (val) {
									canvasLayer.marker.values.push({
										name:val.getAttribute('name'),
										shape:val.getAttribute('shape'),
										color:val.getAttribute('color')
									});
					            });
							}
							canvasLayer.fields=[], canvasLayer.georoles=[];
							georoles.forEach(function (geoRole) {
								let role = {"geofieldname": geoRole.getAttribute('geofieldname'), "fexfieldname": geoRole.getAttribute('fexfieldname')};
								canvasLayer.georoles.push(role);
				            });
							fields.forEach(function (valF) {
								canvasLayer.fields.push(valF.getAttribute('fieldname'));
				            });
							canvasLayer.geo_country=getSingleNode(layer, "georolefields/georolefield[@geofieldname='COUNTRY']");
							var parms=getVariablesList(reqNode, false);
							if(Array.isArray(parms)){
								canvasLayer.parameters=[];
								parms.forEach(function (valP) {
									var dInfo= getSingleNode(valP,"./data_info"), staticV=getNodesArray(dInfo,"./static_values/static");
									var parm={
										name : valP.getAttribute("name"),
										datatype: dInfo.getAttribute("datatype"),
										displayfield: dInfo.getAttribute("displayfield"),
										datafield: dInfo.getAttribute("datafield"),
										datasource: dInfo.getAttribute("datasource"),
										sourcetype: dInfo.getAttribute("sourcetype"),
										selectedvalue: dInfo.getAttribute("selectedvalue"),
										operation: dInfo.getAttribute("operation"),
									};
									if(Array.isArray(staticV)){
										parm.values=[];
										staticV.forEach(function (valV) {
											parm.values.push(valV.getAttribute('value'));
							            });
									}
									canvasLayer.parameters.push(parm);
					            });
							}
						}	
						dataLayers.push(canvasLayer);				
					}
				});
				othis.addDemographicLayer(arrItems);
				othis.doAddASDataLayers(dataLayers);
			}
		},
        getTooltipContEsriStyle: function(){
            var othis = this;
            var ttCont=othis.options.inheritEsriTheme ? $('<div class="root_container" ><div class="esri-feature esri-widget"><div class="esri-feature__size-container"> \
                <div class="esri-feature__main-container"><div><div class="esri-feature__fields esri-feature__content-element"> \
                <table class="esri-widget__table"><tbody></tbody></table></div></div></div></div></div></div>') :
                $('<div class="root_container" style="background-color: black;" ><ul class="tdgchart-tooltip-list" role="menu" style="list-style-type: none;"> \
                <li class="tdgchart-tooltip-pad" role="menuitem" tabindex="-1"><table style="border:none; border-spacing:0px;"> \
                </table></li></ul></div>');
            return ttCont;
        },
		addToken: function() {
			return "&"+this.options.csrfTokenName+"="+this.options.csrfTokenValue;
		},
        loadLayerFromStaticFile: function(layObj, layerId) {
            var json, path = layObj.path, othis = this;
            if(layObj.hasOwnProperty("load") && layObj.load && path){
                var req=othis.options.context+"/wfirs?IBFS_action=getContent&IBFS_service=ibfs&IBFS_path=";
                req+=encodeURI(path);
                req+=othis.addToken();
                req+="&IBIMR_Random="+Math.random();                
                json = doXmlHttpRequest(req, { asJSON: true, GETLimit: -1 }), records= json ? json.records : null; 
                var arrTT=layObj.hasOwnProperty("tooltips") ? layObj.tooltips : [];               
                if(Array.isArray(records)) {
                    var geomType=layObj.geometryType || "point", G=[], fields=[];                   
                    var field = {
                        name: "ObjectID",
                        type:"oid"
                    };
                    fields.push(field);
                    
                    records.forEach(function (A) {  
                        var bft=fields.length==1;  
                        if(Array.isArray(A.events)) {      
                            A.events.forEach(function (r) {      
                                if(r.hasOwnProperty("attributes")){    
                                    var geom = {
                                        type: geomType
                                    };
                                    var attr = {};
                                    attr["ObjectID"] = U._generateUid();  
                                    var ttCont=othis.getTooltipContEsriStyle(), tbody= $(ttCont).find(othis.options.inheritEsriTheme ? "tbody" : "table");
                                    for (var key in r.attributes) {                                        
                                        if (geomType == "polyline") 
                                            geom.paths = r.attributes["paths"];
                                        else if (geomType == "point") {
                                            if(key.toUpperCase()=="LATITUDE")
                                                geom.latitude = r.attributes[key];
                                            else if(key.toUpperCase()=="LONGITUDE")
                                                geom.longitude = r.attributes[key];                                  
                                        
                                        if(bft) {
                                            field = {
                                                    name: key,
                                                    type: U._isNumber(r.attributes[key]) ? "double" : "string"
                                                }; 
                                                fields.push(field);
                                            }
                                            attr[key] = U._isNumber(r.attributes[key]) ? parseFloat(r.attributes[key]) : r.attributes[key]; 
                                            if(isTooltipEnabled(arrTT,key)) {
                                                var ttTr=$('<tr></tr>'),  
                                                ttTd=othis.options.inheritEsriTheme ? $('<th class="esri-feature__field-header">' + key +':&nbsp;</th>' ) : 
                                                    $('<td class="tdgchart-tooltip-name">' + key +':&nbsp;</td>' );
                                                $(ttTd).appendTo($(ttTr));
                                                ttTd= othis.options.inheritEsriTheme ?  $('<td class="esri-feature__field-data">' + r.attributes[key] +'</td>' ) :
                                                        $('<td tdgchart-tooltip-value">' + r.attributes[key] +'</td>' ); 
                                                $(ttTd).appendTo($(ttTr));
                                                $(ttTr).appendTo( $(tbody));
                                            }
                                        }                                                                              
                                    }
                                    if(othis.is3dView()){
                                        geom.z=r.attributes.hasOwnProperty("geo_altitude") ? parseInt(r.attributes["geo_altitude"],10) : 0;
                                    }
                                    var symbol= { type: symbolTypeFromGeomType(geomType), outline: { color: "white", width: 0 }};                   
                                    if(geomType == "point") { 
                            
                              //  var shape = r[layObj.marker.shape], url= getUrl(shape); 
                                        symbol.type= "picture-marker";
                                        symbol.size="50px";
                                    //    if(othis.is3dView())
                                    //        geom=othis.get3dGeometry(geom);
                                    }
                                    var g = new Graphic({
                                        geometry: geom,
                                        attributes: attr,
                                        symbol: symbol
                                    });
                                    var popupTemplate = {
                                        content: ttCont[0]
                                    };
                                    g.popupTemplate = popupTemplate;
                                    G.push(g);   
                                }
                            });
                        }  
                    });
                    if(G.length){                        
                        var fl = layerId ? othis.getCurrentMap().findLayerById(layerId) : null;
                        if(fl){
                            layObj.id=layerId;
                            othis.removeAllFeatures(fl, true,G); 
                        }
                        else {
                            layerId = layObj.id || "mapLayer_" + othis.layersLength++, ltitle =layObj.title || layerId;
                            var lRenderer = {
                                "type": "simple",
                                "symbol": {
                                    type: "picture-marker",
                                    url: othis.is3dView() ? othis.options.context+"/approot/flightsim/plain3d.png" : othis.options.context+"/approot/flightsim/planeicon_ltblue.png"                               
                                }
                            };
                            fl = new FeatureLayer({
                                fields: fields,  
                                renderer:lRenderer,                       
                                id: layerId,
                                title: ltitle,
                                source: G,
                                geometryType: geomType,
                                opacity: Number(layObj.presetOpacity),
                                visible: layObj.visible
                            });
                            var layerProps = {
                                id: layerId,                     
                                layer: null,
                                dynLObj: layObj
                            };
                            if(othis.is3dView()) {
                                var currentElevationInfo = {
                                    mode: "relative-to-ground",
                                    offset: 0,
                                    featureExpressionInfo: {
                                    expression: "Geometry($feature).z * 10"
                                    },
                                    unit: "meters"
                                };
                                fl.elevationInfo = currentElevationInfo;
                            }
                            
                            othis.layerList.push(layerProps);
                            othis.getCurrentMap().add(fl); 
                        }
                    }
                }
            }
        },
		addDataLayerFromJson: function(json, layObj) {
            var othis = this,
        	records= json ? json.records : null, layerId=layObj.component.name; 
            var arrTT=layObj.layer.hasOwnProperty("tooltips") ? layObj.layer.tooltips : [];       
			this.createdLayers.push({layer: layObj.layer, status: "readyToLoad"});  
            if(Array.isArray(records)) {
                var geomType="point", G=[], fields=[];                   
                var field = {
                    name: "ObjectID",
                    type:"oid"
                };
                fields.push(field);
                var recLen=records.length, procRec=0;
                records.forEach(function (r) {  
                    var bft=fields.length==1, zCode=false;   
                    if(r.hasOwnProperty("attributes")){    
                        var geom = {
                            type: geomType
                        };
                        var attr = {};
                        attr["ObjectID"] = U._generateUid();  
                        var ttCont=othis.getTooltipContEsriStyle(), tbody= $(ttCont).find(othis.options.inheritEsriTheme ? "tbody" : "table");
                        for (var key in r.attributes) {                                        
                            if (geomType == "polyline") 
                                geom.paths = r.attributes["paths"];
                            else if (geomType == "point") {
                                if(key.toUpperCase()=="LATITUDE")
                                    geom.latitude = r.attributes[key];
                                else if(key.toUpperCase()=="LONGITUDE")
                                    geom.longitude = r.attributes[key];     
								else if(key.toUpperCase()=="ADDRESS"){
									zCode=true;
									var params = {
										countryCode: r.attributes["countrycode"] || "US",
										address: r.attributes[key]
							        };
									locator.addressToLocations(othis.geocodingServiceUrl, params).then(
							          (response) => {
							            if (response) {
											if(response.length) {
												geom.latitude=response[0].location.latitude;
												geom.longitude=response[0].location.longitude;
								                var symbol= { type: symbolTypeFromGeomType(geomType), outline: { color: "white", width: 0 }};                   
			                                    if(geomType == "point") { 
			                                        symbol.type= "simple-marker";
			                                        symbol.size="50px";
			                                    }
			                                    var g = new Graphic({
			                                        geometry: geom,
			                                        attributes: attr,
			                                        symbol: symbol
			                                    });
			                                    var popupTemplate = {
			                                        content: ttCont[0]
			                                    };
			                                    g.popupTemplate = popupTemplate;
			                                    G.push(g);   
											}
											procRec++;
							            }
							          },
							          (err) => {
											console.log(err.message);
											procRec++;
							          //  showPopup("No address found.", pt);
							          }
							        );
								}                     
                                        
                                if(bft) {
                                    field = {
                                            name: key,
                                            type: U._isNumber(r.attributes[key]) ? "double" : "string"
                                        }; 
                                        fields.push(field);
                                    }
                                    attr[key] = U._isNumber(r.attributes[key]) ? parseFloat(r.attributes[key]) : r.attributes[key]; 
                                    if(isTooltipEnabled(arrTT,key) || key=="name") {
                                        var ttTr=$('<tr></tr>'),  
                                        ttTd=othis.options.inheritEsriTheme ? $('<th class="esri-feature__field-header">' + key +':&nbsp;</th>' ) : 
                                            $('<td class="tdgchart-tooltip-name">' + key +':&nbsp;</td>' );
                                        $(ttTd).appendTo($(ttTr));
                                        ttTd= othis.options.inheritEsriTheme ?  $('<td class="esri-feature__field-data">' + r.attributes[key] +'</td>' ) :
                                                $('<td tdgchart-tooltip-value">' + r.attributes[key] +'</td>' ); 
                                        $(ttTd).appendTo($(ttTr));
                                        $(ttTr).appendTo( $(tbody));
                                    }
                                }                                                                              
                            }
                            if(othis.is3dView()){
                                geom.z=r.attributes.hasOwnProperty("geo_altitude") ? parseInt(r.attributes["geo_altitude"],10) : 0;
                            }
							if(!zCode) {
								var symbol= { type: symbolTypeFromGeomType(geomType), outline: { color: "white", width: 0 }};                   
                                if(geomType == "point") { 
                        
                          //  var shape = r[layObj.marker.shape], url= getUrl(shape); 
                                    symbol.type= "picture-marker";
                                    symbol.size="50px";
                                //    if(othis.is3dView())
                                //        geom=othis.get3dGeometry(geom);
                                }
                                var g = new Graphic({
                                    geometry: geom,
                                    attributes: attr,
                                    symbol: symbol
                                });
                                var popupTemplate = {
                                    content: ttCont[0]
                                };
                                g.popupTemplate = popupTemplate;
                                G.push(g);  
								procRec++; 
							}                                    
                        }
                    });
				var monInt = -1,            
         		monitor = function () { 
					if(procRec==recLen) {
						monInt=window.clearInterval(monInt);
						if(G.length){                        
		                        var fl = layerId ? othis.getCurrentMap().findLayerById(layerId) : null;
		                        if(fl){
		                            othis.removeAllFeatures(fl, true,G); 
		                        }
		                        else {
		                          /*  var lRenderer = {
		                                "type": "simple",
		                                "symbol": {
		                                    type: "simple-marker",
		                                    style: "diamond",
											color: "red"                               
		                                }
		                            };*/
									var lRenderer = {
		                                "type": "simple",
		                                "symbol": {
		                                    type: "picture-marker",
                                   			size:"50px",
											url: othis.getContext() +"/wfirs?IBFS1_action=RUNFEX&IBFS_path=IBFS:/WFC/Repository/maps/mlmTesting/developer.jpg"                       
		                                }
		                            };
		                            fl = new FeatureLayer({
		                                fields: fields,  
		                                renderer:lRenderer,                       
		                                id: layerId,
		                                title: layObj.component.title,
		                                source: G,
		                                geometryType: geomType,
		                                opacity: layObj.component.pacity,
		                                visible: layObj.component.visible
		                            });
									var layerProps = {
						                id: layerId,
						                layer: fl,
						                component:layObj.component,
										dataLayer: true,
						                layerJson: {}				
						            };
		                       /*     var layerProps = {
						                id: layObj.title, 
						                layer: fl,
										dataLayer: true,
										component: {visible:true, opacity:1}
						            };
		                            othis.layerList.push(layerProps);
									fl.when(function(){
										othis.goToHomeExtent();
									});
		                            othis.getCurrentMap().add(fl); */
									othis.setClustering(layerProps,fl);
	            					othis.insertLayer(layerProps, fl);
		                        }
		                    }
		                }
					}
	            };
        		monInt = window.setInterval(monitor, 50); 
        },
		doAddDataLayersCsv: function(files) {
			var othis = this, busy=false; 		
			files.forEach(function(filePath) {
				if(!othis.isLayerLoaded(filePath)) {
					if(!busy){othis.wait(true); busy=true;}						
					let title=fileName(filePath), index=0, urlFile = othis.getContext() +"/wfirs?IBFS_action=run&IBFS_service=ibfs&IBFS_path=";
					if(typeof(filePath)==='string'){	
						if(!Array.isArray(othis.loadingFiles))othis.loadingFiles=[];
						othis.loadingFiles.push(filePath);			
						urlFile+=encodeURI(filePath.replace("IBFS:", "").replace(".txt:", ".csv"));	            
			            urlFile+="&IBIMR_Random="+Math.random();
						let csvLayer = new CSVLayer({
						 url: urlFile,
						 copyright: "Satellites",
					//	 latitudeField: "latitude", 
					//	 longitudeField: "longitude", 
						 title: title,
			                visible: true,
			                opacity: 1
						});
						let currentElevationInfo = {
				            mode: "absolute-height",
				            offset: 0,
				            featureExpressionInfo: {
				              expression: "$feature.altitude"
				            },
				            unit: "meters"
				          };
						csvLayer.renderer = {
						  type: "simple",  // autocasts as new SimpleRenderer()
						  symbol: {
						    type: "picture-marker",  // autocasts as new SimpleMarkerSymbol()
						    size: 6,
				
							url: othis.getContext() +"/wfirs?IBFS1_action=RUNFEX&IBFS_path=IBFS:/WFC/Repository/maps/demo/satellite.jpg" 
						    }
						  };
				       csvLayer.elevationInfo = currentElevationInfo;
			            var layerProps = {
			                id: title, 
			                layer: csvLayer,
							component: {visible:true, opacity:1,index:index}
			            };
			            othis.insertLayer(layerProps, csvLayer);   
					}
				}
			});	
		},
		loadLayerFromFex2: function(layObj) {
			var path = layObj.path, othis = this;
			if(layObj.hasOwnProperty("load") && layObj.load && path) {
                var req=othis.options.context+"/wfirs?IBFS_action=run&IBFS_service=ibfs&IBFS_path=";
                req+=encodeURI(path);
                var param=othis.getParametersAndValues2(layObj);
                if(param)
                	req+=param+"&IBIMR_Random="+Math.random();
                req+="&"+othis.options.csrfTokenName+"="+othis.options.csrfTokenValue;                
                doXmlHttpRequest(req, { asJSON: false, asXML: true, async: true, curList: layObj, onLoad: othis.loadLayerFromFex2res.bind(this)});
			}
		},
		loadLayerFromFex2res: function(resultXml, layObj) {
			let othis = this, geometry, tokenName=othis.options.csrfTokenName, tokenValue= othis.options.csrfTokenValue;
			if(layObj.georole == "POI")
				this.loadLayerFromFex2Cont(resultXml, layObj);
			else {
				let request=othis.getEdaRequestPrefix(), uris=othis.options.setmap_uris,
				items=uris.filter(function(currentKey){return (currentKey["RETURNED_GEOROLE"] == layObj.georole) ? currentKey : null;});
				if(Array.isArray(items) && items.length) {
					let columns=getNodesArray(resultXml, "//column_desc/col"), item=items[0],
						records=getNodesArray(resultXml, "//table/tr"), geoKeyField=item["PARM_NAME"]; 
					function getGeometry(json){
						if(json && json.records) {  
							 json.records.forEach(function (r) {
	                            othis._decodeIbiQuantizedJson(r.GEO_ESRI);
	                        });
							othis.loadLayerFromFex2Cont(resultXml, layObj,json.records);
		                }
					}
					request+=item["URL"]+"'"+item["MBR_LEVEL"]+"',LAST_PARM='"+geoKeyField+"',MAP="
							+(layObj.geometryType=="polygon" ? "'CHOROPLETH'" : "'POINT'")
							+",FEXDATA_LENGTH='"+records.length+"'&IBIF_fexdata=";
					var keys= othis.getGeoRoleKeys(resultXml, layObj.geo_country, records);
					if(Array.isArray(layObj.georoles) && layObj.georole == "COUNTRY" && item["MBR_LEVEL"]==0) {
						let Q = [];
						layObj.georoles.forEach(function(role) {
							let field=role.geofieldname, fexfiled=role.fexfieldname,
							col=getColumnNodeEx(resultXml,fexfiled);
							records.forEach(function(r) {
								Q.push('"'+getFieldValueEx(r,col,false).toUpperCase()+'"');
							});
						});
						let valuesString = '{"' + geoKeyField + '":[' + Q + ']}';
						request+=encodeURIComponent(valuesString);
						doXmlHttpRequest(request, { asJSON: true, GETLimit: 0, async: true, onLoad: getGeometry, csrfName: tokenName, csrfValue: tokenValue});
					}
					else if(Array.isArray(layObj.georoles) && keys.length) {
						var url = [], arDefaultCountries = [], geoRoleCol=getColumnNodeEx(resultXml,layObj.georole);
						var col1tds = getNodesArray(othis.options.countryNames, "//tr/td[@colnum = 'c1']");
            			var col0tds = getNodesArray(othis.options.countryNames, "//tr/td[@colnum = 'c0']");
			            for (var i = 0; i < keys.length; i++) {
			                var key = keys[i], keyCol=getColumnNodeEx(resultXml,key), pattern = "//tr[td[@colnum = '" + 
								geoRoleCol + "']= '" + layObj.georole + "' and td[@colnum = '" + keyCol + "']= \"" + key + "\"]";
							var layerNodes = uris.filter(function(currentKey){return (currentKey["RETURNED_GEOROLE"] == layObj.georole && currentKey["KEY"] == key) ? currentKey : null;});
	    				//	var layerNodes = getNodesArray(uris, pattern);
							if (!layerNodes || layerNodes.length == 0) {
								if (col1tds && col1tds.length && col0tds && col0tds.length) {
					                var keyUpper = key.toUpperCase();
					                for (var kk = 0; kk < col1tds.length; kk++) {
					                    var nodeVal = col1tds[kk];
					                    var value = nodeVal.getAttribute("rawvalue");
					                    if (!value)
					                        value = nodeVal.firstChild ? nodeVal.firstChild.nodeValue : "";
					                    if (!value)
					                        continue;
					                    if (value.toUpperCase() == keyUpper) {
					                        var newKey = col0tds[kk].getAttribute("rawvalue");
					                        if (!newKey && col0tds[kk].firstChild)
					                            newKey = col0tds[kk].firstChild.nodeValue;
					                        if (newKey) {
					                            newKey = trimLeftAndRight(newKey, '"');
					                            layerNodes = uris.filter(function(currentKey){return (currentKey["RETURNED_GEOROLE"] == layObj.georole && currentKey["KEY"] == newKey) ? currentKey : null;});
					                        	if (layerNodes && layerNodes.length)
													break;
											}
					                    }
					                }
					            }
							}
						}
						if (layerNodes && layerNodes.length) {
							
						}
			            /*    var obj = this.getGeoRoleInfoByKey(xmlUriDoc, goerole, countryKey, countryFexName, urlBase);
			                if (obj.url != null)
			                    url.push(obj);  "//tr[td[@colnum = 'c0']= 'STATE' and td[@colnum = 'c7']= "United States"]"
			                else
			                    arDefaultCountries.push(countryKey);*/
			          
					}
				}
			}
		},
		getGeoRoleKeys: function (resultXml, countryField, records) {
		    var keys = ["default"], othis=this;
		    if (countryField) {
		        var type = countryField.getAttribute("type");
		        var fexField = getFieldNameFromFullyQualifiedName(countryField.getAttribute("fexfieldname"));
		        if (type == "USER_DEFINED")
		            keys = [fexField];
		        else if (type == "FIELD" || type == null) { // null for old files
		            keys = [];
		            if (records && records.length) {
		                var countryCol =getColumnNodeEx(resultXml,fexField); //Ib_EMFObject.getColNum(this.xmlDocData[0].xmlDataSetDescription, fexField);
		                for (var i = 0; i < records.length; i++) {
		                    var d = records[i];
		                    var pattern = "./td[@colnum = '" + countryCol + "']";
		                    var fieldNode = getSingleNode(d, pattern);
		                    if (fieldNode && fieldNode.firstChild) {
		                        var countryValue = fieldNode.firstChild.nodeValue;
		                        if (countryValue && keys.indexOf(countryValue) < 0)
		                            keys.push(countryValue);
		                    }
		                }
		            }
		        }
		    }
		    return keys;
		},

		loadLayerFromFex2Cont: function(resultXml, layObj, arrGeoms) {
			if(resultXml) {
				var path = layObj.path, othis = this, columns=getNodesArray(resultXml, "//column_desc/col"), layerId = layObj.id || layObj.layerId,
				records=getNodesArray(resultXml, "//table/tr");
            	layObj.curGraphics=[];
				if(Array.isArray(records) && records.length>1) {
					othis.loadingFiles.push(layObj.path);
					var arrTT=layObj.hasOwnProperty("tooltips") ? layObj.tooltips : [],
                    geomType=layObj.geometryType || "point", G=[], fields=[], ttfields=[];
                    var field = {
                        name: "ObjectID",
                        type:"oid"
                    };
                    fields.push(field);
					
                    var rotField=layObj.marker ? layObj.marker.rotation : null;                
                    function isMarkerKey(layObjT, key) {
                    	if(layObjT.marker && (key==layObjT.marker.shape || key==layObjT.marker.size))
                            return true;
                        return false;
                    }
					//colNum by colName
					var name2Num={};
					let uris=othis.options.setmap_uris, parmName=null,parmGeoRole=null;
					items=uris.filter(function(currentKey){return (currentKey["RETURNED_GEOROLE"] == layObj.georole) ? currentKey : null;});
					if(Array.isArray(items) && items.length) {
						parmName=items[0]["PARM_NAME"];
						parmGeoRole=items[0]["PARM_GEOROLE"];
					}
					let columns=getNodesArray(resultXml, "//column_desc/col"), item=items[0];
					columns.forEach(function (col) {
						let fName=col.getAttribute("fieldname");
						name2Num[fName]=col.getAttribute("colnum");
						for(let h=0; h<layObj.fields.length;h++){
							let prts=layObj.fields[h].split(" "), fqn, name;
							if(prts.length==2){
								fqn=prts[0];
								name=prts[1].replace("(","").replace(")","");
							}
							else
								name=layObj.fields[h];
							if(fName==name || fName==fqn || fName==getFieldNameFromFullyQualifiedName(fqn) || fName==getFieldNameFromFullyQualifiedName(name)){
								let found=false;
								for(let j = 0; j <ttfields.length; j++){
									if(ttfields[j]==fqn || ttfields[j]==name) {
										found=true;
										break;
									}
								}
								if(!found) {
									field = {
				                        name: fqn ? fqn.replace(/[ .]/g, "_") : name.replace(/[ .]/g, "_"),
										alias: col.getAttribute("title"),
				                        type: col.getAttribute("datatype") == "char" ? "string" : "double"
				                    };
									fields.push(field);
									ttfields.push(fqn ? fqn : name);
									break;
								}
							}
						}
		            });
					
					function getFieldValue(record,fieldName,display){
						var col = name2Num.hasOwnProperty(fieldName) ? name2Num[fieldName] : name2Num[getFieldNameFromFullyQualifiedName(fieldName)], 
						nodeVal=getSingleNode(record,"./td[@colnum='" + col + "']");
						return (nodeVal && nodeVal.hasAttribute("rawvalue") && !display) ? nodeVal.getAttribute("rawvalue") : 
								(nodeVal && nodeVal.firstChild ? nodeVal.firstChild.nodeValue : "");
					}
					function getColumnNode(fieldName){
						var col = name2Num.hasOwnProperty(fieldName) ? name2Num[fieldName] : name2Num[getFieldNameFromFullyQualifiedName(fieldName)], 
						node=getSingleNode(resultXml,"//column_desc/col[@colnum='" + col + "']");
						return node;
					}
                    var uvi = [];

					if(layObj.marker.type=="unique" && Array.isArray(layObj.marker.values)) {
						layObj.marker.values.forEach(function (val) {
							var t = {
								value: val["name"],
								symbol: {
									type:"simple-marker",
									color: val["color"],
									style: appstudioShape2esriShape(val["shape"]),
									size: layObj.marker.size
								}
							};
							uvi.push(t);
			            });
                    }
					var uValue="";
					var rotField=layObj.marker ? layObj.marker.rotation : null, bGotGeoms=Array.isArray(arrGeoms) && arrGeoms.length;
					if(!layObj.marker.field) 
						layObj.marker.field="SEG01.MAINT_FLAG";
					let mFCol=getColumnNode(layObj.marker.field), bStr=mFCol.getAttribute("datatype")=="char", colorVisVar=null, sizeVisVar=null, arrSymbolVals=[];
					var layerProps = {
                        id: layerId,                     
                        layer: null,
                        dynLObj: layObj,
						component: {
							cluster: layObj.cluster,
							heatmap: layObj.heatmap,
							label: layObj.label,
							visible:layObj.visible, 
							opacity:layObj.opacity,
							fileOrName:layObj.path,
							index:0
						}
                    };
					records.forEach(function (r) {
						var ttCont=othis.getTooltipContEsriStyle(), tbody= $(ttCont).find(othis.options.inheritEsriTheme ? "tbody" : "table");    
						var geom = {
                            type: geomType
                        };
						let geoFVals=[];
						if(bGotGeoms) {							
							if(Array.isArray(layObj.georoles)){
								layObj.georoles.forEach(function (geoRole) {
									let val = getFieldValueEx(r,getColumnNodeEx(resultXml,geoRole["fexfieldname"]),false);
									geoFVals.push(val);
					            });
								let geo=othis.geometryFromData(arrGeoms,parmName,geoFVals);
								if(geo){
									if(geomType == "point")
			                            geom = {
			                                x: geo.geometry.x,
			                                y: geo.geometry.y,
			                                type: "point",
			                                spatialReference: geo.spatialReference
			                            };                                            
			                        else {
			                            geom = {
			                                rings: geo.geometry.rings,
			                                type: "polygon",
			                                spatialReference: geo.spatialReference
			                            };
			                            geom= othis.doSimplifyGeom(geom);
			                        }
								}
							}
							
						}
						else {
							if (geomType == "polyline")
                            	geom.paths = getFieldValue(r,"PATHS");
	                        else if (geomType == "point") {
	                            geom.latitude = getFieldValue(r,"LATITUDE");
	                            geom.longitude = getFieldValue(r,"LONGITUDE"); 
	                            
	                            geom.z= name2Num["ALTITUDE"] ? parseInt(getFieldValue(r,"ALTITUDE"),10) : 0;//*3.28084;
	                        }
						}
                        
                        var attr = {};
                        attr["ObjectID"] = U._generateUid();
						uValue=getFieldValue(r,layObj.marker.field);
						uValue=bStr ? uValue : parseFloat(uValue);
						arrSymbolVals.push(uValue)
						if(uValue == "_FOC_MISSING")
							uValue="N";
						if(layObj.marker.field)
							attr[layObj.marker.field.replace(/[ .]/g, "_")]=uValue;
						if(rotField)
							attr[rotField.replace(/[ .]/g, "_")]=getFieldValue(r,rotField);
						if(layObj.tooltips && layObj.tooltips.enable){
							ttfields.forEach(function (fName) {
								let col=getColumnNode(fName), fValue=getFieldValue(r,fName,true), title = col.getAttribute("title") || 
											getFieldNameFromFullyQualifiedName(fName);
	                            if(1) {                                   
	                                var ttTr=$('<tr></tr>'),  
	                                ttTd=othis.options.inheritEsriTheme ? $('<th class="esri-feature__field-header">' + title +':&nbsp;</th>' ) : 
	                                    $('<td class="tdgchart-tooltip-name">' + title +':&nbsp;</td>' );
	                                $(ttTd).appendTo($(ttTr));
	                                ttTd= othis.options.inheritEsriTheme ?  $('<td class="esri-feature__field-data">' + fValue +'</td>' ) :
	                                        $('<td tdgchart-tooltip-value">' + fValue +'</td>' ); 
	                                $(ttTd).appendTo($(ttTr));
	                                $(ttTr).appendTo( $(tbody));
	                            }         
							});
						}
						var symbol= { type: symbolTypeFromGeomType(geomType), outline: { color: "white", width: 0 }};                   
                        if(geomType == "point" && layObj.marker.type=="dynamic") { 
                            if(1) {
                                var shape = layObj.marker ? getFieldValue(r,layObj.marker.shape) : "circle", url= getUrl(shape, othis.options.context); 
                                symbol.type= url ? "picture-marker" : "simple-marker";
                                symbol.size=layObj.marker ? getFieldValue(r,layObj.marker.size) : "12px";
                                symbol.angle = getFieldValue(r,layObj.marker.rotation);
                                if(url) {
                                    symbol.url = url; 
                                    symbol.width = symbol.height = "20px";
                                
                                    symbol.width = symbol.size || "20px";
                                    symbol.height = symbol.size || "20px";
                                }
								
	                            var found=false;
	                            for(var k=0; k<uvi.length; k++) {
	                            	if(uvi[k].value==uValue) {
	                            		found=true;
	                            		break;
	                            	}
	                            }
	                            if(!found) {
	                            	var t = {
		                                value: uValue,
		                                symbol: symbol
		                            };
		                            uvi.push(t);
	                            }
		                        
                            }
                            else
                                othis.doSetSymbol2(layObj.marker, symbol, false, null, layerProps, layerProps);
                        }
                        var g = new Graphic({
                            geometry: geom,
                            attributes: attr,
                            symbol: symbol
                        });
                        var popupTemplate = {
                            content: ttCont[0]
                        };
                        g.popupTemplate = layObj.tooltips && layObj.tooltips.enable ? popupTemplate : null;
                        G.push(g);   
		            });
					if(G.length){
						let minMax = minMax2(arrSymbolVals),
	                    config = {
	                        object: 'axis',
	                        bucketID: "",
	                        islog: false,
	                        min: minMax.min,
	                        max: minMax.max,
	                        isPercent: false
	                    };
						if(layObj.marker.type=="color"){
						//	let colors = colorSchemes.getSchemes(layObj.marker.symbol_scheme, layObj.marker.symbol_classes ? parseInt(layObj.marker.symbol_classes,10) : 5);
					//		let themes = colorSchemes.getThemes(), schemes = colorSchemes.getSchemes({
				   //             basemap: othis.getCurrentMap().basemap, geometryType :geomType, theme : "high-to-low"
				   //         });
						//	let schemeByName = colorSchemes.getSchemeByName(layObj.marker.symbol_scheme);
							let colors=U._getColorScheme(layObj.marker.symbol_scheme,layObj.marker.symbol_classes);
				       //     let colors = schemes.primaryScheme.colors, colors2= schemeByName ? schemeByName.colors : null;
							colorVisVar = {
		                        type: "color",
		                        field: layObj.marker.field.replace(/[ .]/g, "_"),
		                    };
							
		                    let stopsC = [], dataInt = parseFloat((minMax.max - minMax.min) / colors.length - 1);	
		                    colors.forEach(function (clr) {
		                        var val = minMax.min + stopsC.length * dataInt;
		                        stopsC.push({
		                            value: val,
		                            color: clr, label: othis.getLabel(val, colorVisVar.field, config)
		                        });
		                    });
		             
					//		var extr=layerSettings.component.extrusion;
		                    colorVisVar.stops = stopsC;
						}
						else if(layObj.marker.type=="size"){
							let max = 20, min = 3;
							sizeVisVar={
		                        type: "size",
		                        field: layObj.marker.field.replace(/[ .]/g, "_"),
		                    };
							var stopsS = [], stopsNum=4, dataInt = parseFloat((minMax.max - minMax.min) / stopsNum);
		                    if(dataInt==0) {
		                        dataInt=minMaxS.max;
		                        minMaxS.min=0;
		                        nofz=2, min=0;
		                    }
							for (var t = 0; t < stopsNum; t++) {
		                        var val = minMax.min + stopsS.length * dataInt,
		                            sz = parseInt(getRadForVal(minMax.max, max, val),10);                        
		                        if (sz < min)
		                            sz = min;
		                        stopsS.push({
		                            value: val, size: sz,
		                            label: val == 0 ? "" : othis.getLabel(val, sizeVisVar.field, config)
		                        });
		                    }					
		                  
					//		var extr=layerSettings.component.extrusion;
		                    sizeVisVar.stops = stopsS;
						}
                        let fl = layerId ? othis.getCurrentMap().findLayerById(layerId) : null;
                        if(fl) {
                        	fl.renderer.uniqueValueInfos = uvi;
                           othis.removeAllFeatures(fl, false, G); 
                        }
                        else {
                            layerId = layObj.id || "mapLayer_" + othis.layersLength++, ltitle =layObj.title || layerId; var lRenderer;
							if(layObj.marker.type=="unique" || layObj.marker.type=="dynamic"){
								lRenderer = {
	                               type: "unique-value", 
								   field: layObj.marker.field ? layObj.marker.field.replace(/[ .]/g, "_") : ""
	                            };
								let col=getColumnNode(layObj.marker.field);
								if(col) {
									field = {
				                        name: layObj.marker.field ? layObj.marker.field.replace(/[ .]/g, "_") : "",
										alias: col.getAttribute("title"),
				                        type: col.getAttribute("datatype")=="char" ? "string" : "double"
				                    };
									fields.push(field);
								}
								
								lRenderer.uniqueValueInfos = uvi;
							}
							else if(geomType=="polygon"){
								lRenderer = {
		                            "type": "simple",
		                            "symbol": {
		                                type: symbolTypeFromGeomType(geomType),
		                                outline: {  // autocasts as new SimpleLineSymbol()
		                                    color: [128, 128, 128, 0.5],
		                                    width: "0.5px"
		                                }
		                            }
		                        };
								othis.doSetSymbol(layObj.marker, lRenderer, false, null, null,false);
							}
							else if(geomType=="point"){
								lRenderer = {
		                            "type": "simple",
		                            "symbol": {
		                                type: symbolTypeFromGeomType(geomType),
		                                outline: {  // autocasts as new SimpleLineSymbol()
		                                    color: [128, 128, 128, 0.5],
		                                    width: "0.5px"
		                                }
		                            }
		                        };
								othis.doSetSymbol2(layObj.marker, lRenderer, false, null, null,layerProps);
							}
					/*		else if(layObj.marker.type=="dynamic"){
								lRenderer = {
		                            "type": "simple",
		                            "symbol": {
		                                type: symbolTypeFromGeomType(geomType),
		                                outline: {  // autocasts as new SimpleLineSymbol()
		                                    color: [128, 128, 128, 0.5],
		                                    width: "0.5px"
		                                }
		                            }
		                        };
							}*/
							else if(layObj.marker.type=="single"){
								lRenderer = {
		                            "type": "simple",
		                            "symbol": {
		                                type: symbolTypeFromGeomType(geomType),
										style:appstudioShape2esriShape(layObj.marker.shape),
										color: layObj.marker.color,
		                                outline: {  // autocasts as new SimpleLineSymbol()
		                                    color: [128, 128, 128, 0.5],
		                                    width: "0.5px"
		                                }
		                            }
		                        };
							}
                            var arrVars=[];
							if(sizeVisVar)
								arrVars.push(sizeVisVar);
							if(colorVisVar)
								arrVars.push(colorVisVar);
                            if(rotField){
                                var rotVV= {
                                    type: "rotation",
                                    field: rotField.replace(/[ .]/g, "_"),
                                    rotationType: "geographic"
                                };                            
                                arrVars.push(rotVV); 
                            }
							if(arrVars.length)
                            	lRenderer.visualVariables = arrVars;
                            fl = new FeatureLayer({
                                fields: fields,  
                                renderer:lRenderer,                       
                                id: layerId,
                                title: ltitle,
                                source: G,
                                geometryType: geomType,
                                opacity: Number(layObj.presetOpacity || 1),
                                visible: layObj.visible || true
                            });
                         	layerProps.layer=fl;
                            
                            if (geomType == "point")
                                othis.setClustering(layerProps,fl);
                             var currentElevationInfo = {
                                mode: "relative-to-ground",
                                offset: 0,
                                featureExpressionInfo: {
                                expression: "Geometry($feature).z * 10"
                                },
                                unit: "meters"
                            };
                            fl.elevationInfo = currentElevationInfo;
                           
                            othis.layerList.push(layerProps);
							othis.addLayer(layerProps);
                        //    othis.getCurrentMap().add(fl); 
						}
					}
				}
			}
		},
        loadLayerFromFex: function(layObj, layerId) {
            var path = layObj.path, othis = this;// curGraphicsCopy= layObj.curGraphics && Array.isArray(layObj.curGraphics) ? layObj.curGraphics.slice() : [];
            layObj.curGraphics=[];
            if(layObj.hasOwnProperty("load") && layObj.load && path) {
                var req=othis.options.context+"/wfirs?IBFS_action=run&IBFS_service=ibfs&IBFS_path=";
                req+=encodeURI(path);
                var param=othis.getParametersAndValues(layObj);
                if(!param)
                    return false;
                req+=param+"&IBIMR_Random="+Math.random();
                req+="&"+othis.options.csrfTokenName+"="+othis.options.csrfTokenValue;                
                var json = doXmlHttpRequest(req, { asJSON: true, GETLimit: -1 }), records= json ? json.records : null; 
                if (records && Array.isArray(records) && !isEmptyRecord(records)) {
                    var arrTT=layObj.hasOwnProperty("tooltips") ? layObj.tooltips : [];
                    var geomType=layObj.geometryType || "point", G=[], fields=[];
                    var field = {
                        name: "ObjectID",
                        type:"oid"
                    };
                    fields.push(field);
                    var rotField=layObj.marker ? layObj.marker.rotation : null;                
                    function isMarkerKey(layObjT, key) {
                    	if(layObjT.marker && (key==layObjT.marker.shape || key==layObjT.marker.size))
                            return true;
                        return false;
                    }
                    var uvi = [];
                    records.forEach(function (r) {
                        var geom = {
                            type: geomType
                        };
                        if (geomType == "polyline")
                            geom.paths = r["paths"];
                        else if (geomType == "point") {
                            geom.latitude = r["LATITUDE"];
                            geom.longitude = r["LONGITUDE"];
                            if(othis.is3dView())
                                geom.z= r.hasOwnProperty("ALTITUDE") ? parseInt(r["ALTITUDE"],10) : 0;//*3.28084;
                        }
                        var attr = {};
                        attr["ObjectID"] = U._generateUid();  
                        var bft=fields.length==1;
                        var ttCont=othis.getTooltipContEsriStyle(), tbody= $(ttCont).find(othis.options.inheritEsriTheme ? "tbody" : "table");                                           
                        var uValue="";
                        for (var key in r) {
                            if (r.hasOwnProperty(key) && r[key] && key!=="LATITUDE" && key!=="LONGITUDE" && !isMarkerKey(layObj, key)) {
                                if(bft) {
                                    field = {
                                        name: key,
                                        type: U._isNumber(r[key]) ? "double" : "string"
                                    }; 
                                    fields.push(field);
                                }
                                attr[key] = U._isNumber(r[key]) ? parseFloat(r[key]) : r[key];
                                if(key==layObj.unique_value)
                                	uValue=attr[key];
                                if(isTooltipEnabled(arrTT,key)) {                                   
                                    var ttTr=$('<tr></tr>'),  
                                    ttTd=othis.options.inheritEsriTheme ? $('<th class="esri-feature__field-header">' + key +':&nbsp;</th>' ) : 
                                        $('<td class="tdgchart-tooltip-name">' + key +':&nbsp;</td>' );
                                    $(ttTd).appendTo($(ttTr));
                                    ttTd= othis.options.inheritEsriTheme ?  $('<td class="esri-feature__field-data">' + r[key] +'</td>' ) :
                                            $('<td tdgchart-tooltip-value">' + r[key] +'</td>' ); 
                                    $(ttTd).appendTo($(ttTr));
                                    $(ttTr).appendTo( $(tbody));
                                }                    
                            }                      
                        } 
                     
                        var symbol= { type: symbolTypeFromGeomType(geomType), outline: { color: "white", width: 0 }};                   
                        if(geomType == "point") { 
                            if(1) {
                            	
                                var shape = layObj.marker ? r[layObj.marker.shape] : "circle", url= getUrl(shape, othis.options.context); 
                                symbol.type= url ? "picture-marker" : "simple-marker";
                                symbol.size=layObj.marker ? r[layObj.marker.size] : "8px";
                                symbol.angle = layObj.marker ? r[layObj.marker.rotation] : "0"; 
                                if(url) {
                                    symbol.url = url;            
                                    if(othis.is3dView())   
                                        symbol.width = symbol.height = "60px";
                                    else {     
                                        symbol.width = r[layObj.marker.size] || "50px";
                                        symbol.height = r[layObj.marker.size] || "50px";
                                    }
                                }
                                if(layObj.unique_value) {
	                            	
		                            var found=false;
		                            for(var k=0; k<uvi.length; k++) {
		                            	if(uvi[k].value==uValue) {
		                            		found=true;
		                            		break;
		                            	}
		                            }
		                            if(!found) {
		                            	var t = {
			                                value: uValue,
			                                symbol: symbol
			                            };
			                            uvi.push(t);
		                            }
		                        }
                            }
                            else
                                othis.doSetSymbol2(layObj.marker, symbol, false, null, null, null);
                        }
                        var g = new Graphic({
                            geometry: geom,
                            attributes: attr,
                            symbol: symbol
                        });
                        var popupTemplate = {
                            content: ttCont[0]
                        };
                        g.popupTemplate = popupTemplate;
					//	g.popup = popupTemplate;
                        G.push(g);   
                    });
                    if(G.length){
                        var fl = layerId ? othis.getCurrentMap().findLayerById(layerId) : null;
                        if(fl) {
                        	fl.renderer.uniqueValueInfos = uvi;
                           othis.removeAllFeatures(fl, false, G); 
                        }
                        else {
                            layerId = layObj.id || "mapLayer_" + othis.layersLength++, ltitle =layObj.title || layerId;
                            var lRenderer = {
                               type: "unique-value", 
							   field: layObj.unique_value,
                            /*   defaultSymbol: {
                                    type: "picture-marker",
                                    url: othis.is3dView() ? othis.options.context+"/approot/flightsim/plain3dm.png" : othis.options.context+"/approot/flightsim/planeicon_ltred.png"
                                }*/
                            };
                            var arrVars=[];
                            if(rotField){
                                var rotVV= {
                                        type: "rotation",
                                        field: rotField,
                                        rotationType: "geographic"
                                };                            
                                arrVars.push(rotVV);                            
                                lRenderer.visualVariables = arrVars;
                            }
                            lRenderer.uniqueValueInfos = uvi;
                            fl = new FeatureLayer({
                                fields: fields,  
                                renderer:lRenderer,                       
                                id: layerId,
                                title: ltitle,
                                source: G,
                                geometryType: geomType,
                                opacity: Number(layObj.presetOpacity),
                                visible: layObj.visible
                            });
                            
                            var layerProps = {
                                id: layerId,                     
                                layer: null,
                                dynLObj: layObj,
								layer: fl
                            };
                            if (geomType == "point")
                                othis.setClustering(layerProps,fl);
                       //     if(othis.is3dView()) {
                                var currentElevationInfo = {
                                    mode: "relative-to-ground",
                                    offset: 0,
                                    featureExpressionInfo: {
                                    expression: "Geometry($feature).z * 10"
                                    },
                                    unit: "meters"
                                };
                                fl.elevationInfo = currentElevationInfo;
                     //       }
                            
                            othis.layerList.push(layerProps);
                            othis.getCurrentMap().add(fl); 
                         //   fl.popupTemplate = fl.createPopupTemplate();
                        }                    
                    }
                }
                else {
                    return false;
                }
            }            
            return true;
        },
		startRefresh: function() {
			this.wasrefreshing=false;
			for(var k = 0; k<this.layerList.length; k++) {
				if(this.layerList[k].component.hasOwnProperty("refreshStart") && 
						this.layerList[k].component.refreshStart) {
					if(!this.layerList[k].component.hasOwnProperty("refreshInt"))
						this.layerList[k].component.refreshInt=10;
					this.doRefreshLayer(this.layerList[k].layer.id,this.layerList[k].component.refreshInt, null);
					break;
				}
			}
		},	
		needRefresh: function(settings)	{
			var othis=this, savedBM=othis.getSavedLayerProperties(settings.layer, null);
			if(settings.component.refreshStart)
				return true;
			
			return false;
		},
		setRefreshLayerOptions: function(layerId,optionObj) {
			for(var k = 0; k<this.layerList.length; k++){
                if (this.layerList[k].id == layerId) { 
					this.layerList[k].optionObj=optionObj;
					break;
                }
            }
			if(this.dynLObj && this.dynLObj.id==layerId)this.dynLObj.optionObj=optionObj;
		},
        doRefreshLayer: function(layerId, interval, optionObj) {
            var othis = this, dynL=false; othis.dynLObj=null;//othis.runtimeRefresh=true;
			othis.removeViewGraphics();			
            for(var k = 0; k<othis.layerList.length; k++){
                if (othis.layerList[k].id == layerId) { 
					othis.layerList[k].component.refreshInt=interval;   
					othis.layerList[k].optionObj=optionObj;           
                    if(othis.layerList[k].dynLObj) {
						othis.dynLObj=othis.layerList[k].dynLObj;
                    	othis.dynLObj.id=layerId;
						dynL=true;
					}
                    else othis.dynLObj=othis.layerList[k]; 
                    break;
                }
            }
            if(othis.dynLObj){
                if(!othis.dynLObj.hasOwnProperty("index"))
                    othis.dynLObj.index=0;
                if(dynL)othis.refreshGo(); 
				
				else {
					othis.refresh=true; othis.refreshing=false;
					othis.refreshGo2(othis.dynLObj.component.refreshInt);
				}
            }
        },
		refreshStop: function(bDontZoom){
			var othis = this; othis.refreshIntGlobal=window.clearInterval(othis.refreshIntGlobal);
			if(othis.dynLObj && othis.refresh && !bDontZoom)
				othis.setTargetLayer(othis.dynLObj.id);
			if(othis.dynLObj && othis.dynLObj.optionObj)othis.dynLObj.optionObj.refreshStopped();
			othis.dynLObj=null;	
			othis.refresh=othis.refreshing=false;			
			othis.wait(false);
		},
        refreshGo: function() {
        	var othis = this;
        	if(othis.refresh) {
	        	othis.dynLObj.index+=parseInt(othis.dynLObj.step,10);
	            if(!othis.is3dView())
	                othis.setTargetLayer(othis.dynLObj.id);
				if(othis.dynLObj.hasOwnProperty("dLayer") && othis.dynLObj.dLayer.type=="htm") {
					othis.loadLayerFromFex2(othis.dynLObj);
				}
				else {
					if(!othis.loadLayerFromFex(othis.dynLObj, othis.dynLObj.id)){
		              //  othis.refresh=window.clearInterval(othis.refresh);
		                othis.dynLObj.index=othis.is3dView() ? "_FOC_NULL" : 0;                            
		                othis.loadLayerFromFex(othis.dynLObj, othis.dynLObj.id);
		                othis.dynLObj.index=0;
		            }
				}
	        }
        },
		updateSatelliteLocation: function(graphic) {
			var othis = this;
			if(graphic) {				
				let rlgraphic=!graphic.satrec ? othis.getRealGraphic(graphic) : graphic;	
				var epoch = rlgraphic.attributes.EPOCH ? rlgraphic.attributes.EPOCH : 0;					
				let newPt=getOrbitPoints(null, null, 1, epoch, null, rlgraphic.satrec);
				if(newPt) {
					let clone = rlgraphic.geometry.clone();
					clone.x=newPt.x; clone.y=newPt.y; clone.z=newPt.z;
					rlgraphic.geometry=clone;
				}	
				return rlgraphic;
			}
			return null;
		},
		doMoveSatellites: function() {
			var othis = this, view=othis.getCurrentView(), layer=this.getSatelliteLayer();	
			if(layer.visible && !othis.freeze) {				
				if(layer.type=="graphics") {
					layer.graphics.items.forEach(function (graphic) {
						if(graphic.attributes) {						
							othis.updateSatelliteLocation(graphic);
						}							
					});	
				}	
				else if(layer.type=="feature") {
				//	othis.moveSatellitesInFeatureLayerW(layer);
					othis.moveSatellitesInFeatureLayer(layer);
				}	
			}
			else this.moveInterval = window.clearInterval(this.moveInterval);
		},
		moveSatellitesInFeatureLayer: function(layer) {
			var othis=this;
			if(!othis.freeze) {
				try {
					var gr=[];					
					layer.source.items.forEach(function (graphic) {		
						if(graphic.visible)	{
							othis.updateSatelliteLocation(graphic);	
							gr.push(graphic);
						}
					});
					
					layer.updatingFeature =true;
					layer.applyEdits({ updateFeatures: gr }).then((resolvedVal) => {
					   		setTimeout(function(){othis.moveSatellitesInFeatureLayer(layer); }, 2000);	
					  }, (error) => {
					    console.error(error);
					  });			
																
				}
				catch (e) {
	                console.log("error moving");
	            }
			}		
		},
		moveSatellitesInFeatureLayerW: function(layer) {
			var gr=[],
			worker=this.getSatelliteWorker();
			worker.onmessage = function (e) {
                layer.applyEdits({ updateFeatures: e.data }).then((resolvedVal) => {
			   		setTimeout(function(){}, 2000);	
				});			
            };
				
            worker.postMessage({
                graphics: layer.source.items.map(function (e) {
                    return {
                        satrec: e.satrec,
						epoch: e.attributes.EPOCH
                    };
                })
            });		
			
		},
		getSatelliteWorker: function(){
			var othis = this;
			if(!othis.satWorker)
				othis.satWorker = new Worker(tdgchart.getScriptPath() + "extensions/com.ibi.geo.map/lib/mapWorker.js");
			return othis.satWorker;
		},
		getSatelliteWorkerEsri: function(){
			var othis = this;
			if(!othis.satWorker)
				othis.satWorker = new Worker(tdgchart.getScriptPath() + "extensions/com.ibi.geo.map/lib/mapWorkerEsri.js");
			return othis.satWorker;
		},
		startSatelliteMoveEx: function() {
			var layer=this.getSatelliteLayer();
			this.moveInterval=window.setInterval(this.doMoveSatellites.bind(this), 5000);
		},
		startSatelliteMove: function() {			
			var othis = this;
			if(typeof(othis.freeze) == 'undefined' || othis.freeze) {
				othis.freeze=false; var  layer=othis.getSatelliteLayer();
				
				if(layer && layer.loaded)	{	
					if(layer.type=="group") {					
						layer.layers.forEach(function(lay) {
							othis.doMoveSatellites(lay, true);
						});					
					}
					else
						othis.doMoveSatellites(layer);		
				}		
			}
		},
		stopSatelliteMove: function() {
			this.freeze=true;
		},
		getLayerSettings: function(layerId) {
			let id =typeof(layerId) == 'object' ? layerId.id : layerId;
			for(var k = 0; k<this.layerList.length; k++){
                if (this.layerList[k].id == id) { 
					return this.layerList[k];
                }
            }
			return null;
		},
		restoreOpacity: function() {
			var othis = this;
			if(othis.showCanst){
                othis.showCanst=false;  
				for(var k = 0; k<othis.layerList.length; k++){
	                if (othis.layerList[k].component.satellite) { 
						let layer= othis.getCurrentMap().findLayerById(othis.layerList[k].id);
						if(layer) {
							layer.opacity=othis.layerList[k].saveOpacity;
							othis.startSatelliteMove();
						}
	                }
	            }				
				othis.keepItForNow=false;
				othis.removeViewGraphics(); 
			}
		},
		
		getSatellitesByParamValue: function(layer, paramName, paramValue, arrOut) {
			var othis=this;
			if(layer.type=="group") {
				layer.layers.forEach(function(lay) {
					othis.getSatellitesByParamValue(lay, paramName, paramValue, arrOut);
				});
			}
			else if(layer.visible){
				let items=layer.type=="feature" ? layer.source.items : layer.graphics;
				if(Array.isArray(items)) {	
					items.forEach(function (item) {		
						if(item.attributes.hasOwnProperty(paramName) && 
							paramValue== (paramName=="INTLDES" ? 
								item.attributes[paramName].slice(0,8) : item.attributes[paramName])) {
									let cl=item.clone();
									cl.satrec=item.satrec;
									arrOut.push(cl);
								}
								
					});						
				}
			}			
		},
		selectSatellitesByLaunch: function(graphicIn) {
			if(graphicIn) {
				var othis = this,gr2add=[];
				let map=othis.getCurrentMap(), layerId=graphicIn.layer.id, layer=map.findLayerById(layerId), 
				 paramName="INTLDES";
				if(layer) {
					let paramValue=graphicIn.attributes[paramName];
					if(typeof(paramValue) == 'string') {
						paramValue = paramValue.slice(0,8);
						if(othis.isSatelliteLayer(layer.parent))
							layer=layer.parent;
						var settings=othis.getLayerSettings(layer.id);
						othis.getSatellitesByParamValue(layer,paramName,paramValue,gr2add);						
					/*	var gr2add=graphics.filter(function(graphic) {
							if(graphic.attributes.hasOwnProperty(paramName)) {
								return paramValue == graphic.attributes[paramName].slice(0,8);
							}
							return false;
						});*/
						if(othis.satelliteTracks){
							othis.stopSatelliteMove(layer);
							othis.satelliteTracks.addMany(gr2add);	
							settings.saveOpacity=layer.opacity;
							layer.opacity=0.25;
							othis.showCanst=true;
							setTimeout(function(){
								othis.satelliteTracks.graphics.items.forEach(function (gr) {
									if(gr.geometry.type=='point') 
									othis.showSatelliteTrack(gr);
			                    });
								
							}, 100);
						}						
					}
				}
			}			
		},
		doSelectSatellite: function(layerId, paramName, paramValue) {		
			var othis = this;
			let map=othis.getCurrentMap(), layer=map.findLayerById(layerId);
			if(layer){
				let items=layer.type=="feature" ? layer.source.items : layer.graphics;
				if(Array.isArray(items)) {	
					var gr=	items.filter(function (item) {		
						return item.attributes.hasOwnProperty(paramName) && paramValue==item.attributes[paramName];	
					});	
					
					if(gr.length) {
						let theOne=gr[0];
						othis.getCurrentView().goTo(theOne.geometry).then((resolvedVal) => {
					    othis.updateSatelliteLocation(theOne);
						if(layer.type=="feature") {
							layer.applyEdits({ updateFeatures: gr });
						}
						othis.keepTooltip=true;
						othis.showSatelliteTrack(theOne);					
					  }, (error) => {
					    console.error(error);
					  });		
					}
						
				}
			}			
			othis.restoreOpacity();
			
		},
		doRefreshSatelliteLayer: function(layerId, paramName, paramValue) {
			var othis = this;
			othis.restoreOpacity();
			let map=othis.getCurrentMap(), layer=map.findLayerById(layerId), settings=othis.getLayerSettings(layerId);					
			othis.removeViewGraphics();	
			if(layer && settings && layer.type == "graphics") {		
				var cn=paramName == "COUNTRY_CODE";
		//		othis.wait(cn);	
				
				othis.stopSatelliteMove(layer);		
			//	var graphics=/* settings.filtered && !cn ? settings.filtered :*/settings.graphics;
				var graphics=paramValue == "OBJECT_NAME" ? layer.graphics.items : settings.graphics;	
				if(Array.isArray(graphics)) {					
					var gr2add = [];
					if(paramValue=="_FOC_NULL")
						gr2add=graphics;
					else {
						gr2add=graphics.filter(function(graphic) {
							if(graphic.attributes.hasOwnProperty(paramName)) {
								let grVal=graphic.attributes[paramName];	
								if(Array.isArray(paramValue)) {
									let temp=paramValue.filter(function(val) {
										return val == grVal;
									});	
									return temp.length ? true : false;
								}						
								else return paramValue == grVal;
							}
							return false;
						});
					} 
					if(paramName == "OBJECT_NAME") {
						if(gr2add.length){
						//	layer.addMany(gr2add);
							othis.getCurrentView().goTo(gr2add[0].geometry).then((resolvedVal) => {
							    othis.updateSatelliteLocation(gr2add[0]);
								othis.keepTooltip=true;
								othis.showSatelliteTrack(gr2add[0]);
							
							  }, (error) => {
							    console.error(error);
							  });							
						}
					}						
					else {
						layer.removeAll();
						layer.addMany(gr2add);
					}					
					setTimeout(function(){othis.startSatelliteMove(); }, 1000);
				//	if(cn)
				//		settings.filtered=gr2add;	
										
						
				}
				othis.refreshing=false;
				setTimeout(function(){othis.wait(false); }, 1000);				
			}			
		},
		refreshGo2: function(interval) {
			var othis = this; othis.refreshIntGlobal=window.clearInterval(othis.refreshIntGlobal);
			if(!othis.refreshing && !othis.wasrefreshing) {
				othis.restoreOpacity();
				othis.refreshing=true;
				if(othis.dynLObj && othis.dynLObj.hasOwnProperty("component") && 
					(othis.dynLObj.component.hasOwnProperty("path") || othis.dynLObj.component.hasOwnProperty("fileOrName"))){
					var filePath=othis.dynLObj.component.path || othis.dynLObj.component.fileOrName,
					req=othis.getContext() +"/wfirs?IBFS_action=run&IBFS_service=ibfs&IBFS_path=";
					if(typeof(filePath)==='string'){
						othis.wait(othis.dynLObj.component.refreshInt == -1);
						req+=encodeURI(filePath.replace("IBFS:", ""));	            
			            req+="&IBIMR_Random="+Math.random();
						if(othis.dynLObj.optionObj){

							let params=othis.dynLObj.optionObj.doGetFilters();
							if(params)req+=params;
						}
						else if(othis.dynLObj.component && othis.dynLObj.component.filtersValues)
							req+=othis.dynLObj.component.filtersValues;
						else
							req+=othis.doGetAllFilters();
			            req+="&"+othis.options.csrfTokenName+"="+othis.options.csrfTokenValue; 
						doXmlHttpRequest(req, { asJSON: false, async: true, curList: filePath, requestMethod: "post", onLoad: othis.doAddDataLayerEx.bind(othis)});	
						return;
					}			
				}
				othis.refreshStop(true);
			}
		},
		_onControlChange: function() {
			alert("changed");
		},
		refreshTopLevelControls: function(amperInfo,selItems) {
			//window.parent.jQuery(window.parent.document.body).find('.pd-page').find('.pd-amper-select.pd-amper-control');//.ibxSelectPaged("userValue", selItems);
			const pages=$(window.parent.document.body).find('.pd-page');
			if(pages && pages.length) {
				const filPanels=pages[0].ibaObject.filterPanels();
				if(Array.isArray(filPanels)) {
					for(let i = 0; i < filPanels.length; i++) {
						if(typeof(filPanels[i].ampers === 'function')){
							let tempAmpInfo=filPanels[i].ampers();
							if(tempAmpInfo.length==1 /*&& tempAmpInfo[0].dynField.toUpperCase() === amperInfo.dynField.toUpperCase()*/ && 
								tempAmpInfo[0].name.toUpperCase() === amperInfo.name.toUpperCase()){						
						//		tempAmpInfo[0].curValue=selItems;	
							//	$(pages[0].ibaObject._element).find('.pd-amper-select.pd-amper-ctrl').trigger('ampervalchange');
								break;
							}
						}
					}
				}
			}
			this.executeSatelliteDDEx(selItems);
		},
		executeSatelliteDDEx: function(cNames) {
			var event = this.getSatelliteLayerEvents();
            if(Array.isArray(event)){
                event.forEach(function(elt){
                    this.executeSatelliteDD(elt.hasOwnProperty('url') ? elt.url : elt,cNames,elt.target);
                }.bind(this));
            }
		},
		copyArray: function(src) {
			var tempSel=[];   
			if(typeof(src) === 'string')
				tempSel.push(src);
			else if(Array.isArray(src)){
				for(let k = 0; k < src.length; k++)
					tempSel.push(src[k]);	
			}	
			return tempSel;		
		},
		//a should always be an array
		isSameArray: function(a, b) {
			if(Array.isArray(a)) {
				if(typeof(b) === 'string') return a[0]==b;
				if (a === b) return true;
				if (a == null || b == null) return false;
				if (a.length !== b.length) return false;
				
				for (var i = 0; i < a.length; ++i) {
				    if (a[i] !== b[i]) return false;
				}				
			}
			return true;
		},
		monitorAmperCountryChanges: function() {
			 var monInt = -1, othis=this, 
			 tempSel= othis.copyArray(othis.options.amperInfo.curValue),                
             monitor = function () { 
				if(!othis.isSameArray(tempSel, othis.options.amperInfo.curValue)) {
					monInt=window.clearInterval(monInt);
					tempSel=othis.copyArray(othis.options.amperInfo.curValue);  
					if(othis.is3dView() && othis.satRenderer) othis.satRenderer.updateSatellitesVisibility(null);
					othis.updateSatelliteSelection(null);
					othis.hideTooltips();
				}
            };
            monInt = window.setInterval(monitor, 1000);  
		},
		getAmperInfo: function(amperName, handler, layerSettings) {
			if(this.options.amperInfo) return this.options.amperInfo;
			const pages=$(window.parent.document.body).find('.pd-page');
			if(amperName && pages && pages.length) {
				const filPanels=pages[0].ibaObject.filterPanels();
				if(Array.isArray(filPanels)) {
					for(let i = 0; i < filPanels.length; i++) {
						if(typeof(filPanels[i].ampers === 'function')){
							let tempAmpInfo=filPanels[i].ampers();
							if(tempAmpInfo.length==1 &&	tempAmpInfo[0].name.toUpperCase() === amperName.toUpperCase()){
								this.options.amperInfo =pages[0].ibaObject.filterPanels()[i].ampers()[0];
								layerSettings.groups=null;
								if(handler){
									$(window.parent.document.body).find('.pd-page').find('.pd-amper-select.pd-amper-control').on('ibx_beforeopenpopup', handler.bind(this));
								}
								break;
							}
						}
					}
				}
			}
			if(!this.options.amperInfo) this.options.amperInfo={"name":amperName, curValue: '_FOC_NULL'};
		},
		isSatelliteLoadedByCountry: function(amperInfo, addHandler) {		
			const pages=$(window.parent.document.body).find('.pd-page');
			if(pages && pages.length) {
				const filPanels=pages[0].ibaObject.filterPanels();
				if(Array.isArray(filPanels)) {
					for(let i = 0; i < filPanels.length; i++) {
						if(typeof(filPanels[i].ampers === 'function')){
							let tempAmpInfo=filPanels[i].ampers();
							if(tempAmpInfo.length==1 /*&& tempAmpInfo[0].dynField.toUpperCase() === amperInfo.dynField.toUpperCase()*/ && 
								tempAmpInfo[0].name.toUpperCase() === amperInfo.name.toUpperCase()){						
								amperInfo.values=tempAmpInfo[0].values;	
								var info=tempAmpInfo[0], re=new RegExp("''", "g");	
								if(typeof(tempAmpInfo[0].curValue) === 'string') amperInfo.defValue.push(tempAmpInfo[0].curValue.replace(re,"'"));		
								else if(Array.isArray(tempAmpInfo[0].curValue))	{
									for(let k = 0; k < tempAmpInfo[0].curValue.length; k++)
										amperInfo.defValue.push(tempAmpInfo[0].curValue[k].replace(re,"'"));
								}	
											
								if(addHandler){
									$(window.parent.document.body).find('.pd-page').find('.pd-amper-select.pd-amper-control').on('ibx_beforeopenpopup', function(event) {
										if(this.satRenderer)this.satRenderer.startControlListening();
									}.bind(this));
									$(window.parent.document.body).find('.pd-page').find('.pd-amper-select.pd-amper-ctrl').on('ampervalchange',myVerySpecialFunc);
								/*	$(window.parent.document.body).find('.pd-page').find('.pd-amper-select.pd-amper-ctrl').on('ampervalchange', function(event) {
										//if(this.satRenderer)this.satRenderer.startControlListening();
										alert('ampervalchange');
									}.bind(this));	
									$(window.parent.document.body).find('.pd-page').find('.pd-amper-select.pd-amper-ctrl').on('ibx_change', function(event, data) {
									alert("changed");
								
								});*/
								}			
								
								/*$(window.parent.document.body).find('.pd-page').find('.pd-amper-select.pd-amper-control').on('ibx_uservaluechanged', function(event) {
									alert("ibx_uservaluechanged");
								  
								});
								$(window.parent.document.body).find('.pd-page').find('.pd-amper-select.pd-amper-control').find("input").first().on('change', function(event) {
									alert("changed");
								 
								});
								$(window.parent.document.body).find('.pd-page').find('.pd-amper-select.pd-amper-control').on('ibx_change', function(event, data) {
									alert("changed");
								
								});*/
								return true;
							}	
						}							
					}
				}
			}
			return false;
		},
		getAmperDefaultValues: function(amperInfo,comp) {
			let gotIt=false;
			if(comp && comp.hasOwnProperty("filters")) {
				for(let i =0; i<comp.filters.length; i++) {
					if(amperInfo.name==comp.filters[i].name) {
						amperInfo.defValue=comp.filters[i].value;
						gotIt=true;
						break;
					}
				}
			}
			else {
				const pages=$(window.parent.document.body).find('.pd-page');
				if(pages && pages.length) {
					const filPanels=pages[0].ibaObject.filterPanels();
					if(Array.isArray(filPanels)) {
						for(let i = 0; i < filPanels.length; i++) {
							if(typeof(filPanels[i].ampers === 'function')){
								let tempAmpInfo=filPanels[i].ampers();
								if(tempAmpInfo.length==1 && tempAmpInfo[0].dynField === amperInfo.dynField && 
									tempAmpInfo[0].name === amperInfo.name){
									amperInfo.defValue=[];
									for(let k = 0; k < tempAmpInfo[0].curValue.length; k++)
										amperInfo.defValue.push(tempAmpInfo[0].curValue[k]);
									gotIt=true;
									break;	
								}	
							}							
						}
					}
				}
			}
			return gotIt;
		},
		doGetAllFilters: function(){
			var othis=this, ret="";
			const pages=$(window.parent.document.body).find('.pd-page');
			if(pages && pages.length) {
				const filPanels=pages[0].ibaObject.filterPanels();
				if(Array.isArray(filPanels)) {
					for(let i = 0; i < filPanels.length; i++) {
						if(typeof(filPanels[i].ampers === 'function')){										
							let tempAmpInfo=filPanels[i].ampers();
							for(let p = 0; p < tempAmpInfo.length;p++) 
								ret+="&"+tempAmpInfo[p].name+"="+tempAmpInfo[p].focValue;
						}							
					}
				}
			}
			return ret;
		},
		doWFDescribeCont: function(layerId, callBackFunc, fexPath) {
		   // var ampers = [];
		    var othis=this, wfdObj = "<rootObject _jt='HashMap'><entry><key _jt='string' value='WFDescribe_getValues'/><value _jt='string' value='__noChainData__'/></entry><entry><key _jt='string' value='WFDescribe_userDefValues'/><value _jt='<rootObject _jt='HashMap'><entry><key _jt='string' value='WFDescribe_getValues'/><value _jt='string' value='__noChainData__'/></entry><entry><key _jt='string' value='WFDescribe_userDefValues'/><value _jt='HashMap' loadFactor='0.75' threshold='12'></value></entry></rootObject>HashMap' loadFactor='0.75' threshold='12'></value></entry></rootObject>";
			if(!fexPath) {
				for(var k = 0; k<othis.layerList.length; k++){
	                if (othis.layerList[k].id == layerId) { 
						fexPath=othis.layerList[k].component.path;
	                    break;
	                }
	            }
			}
            
			if(fexPath){
				req = othis.getContext()+ '/wfirs?';
		        req += "IBFS_action=describeFex&IBFS_responseFormat=REDUCED&IBFS_service=ibfs&IBIVAL_returnmode=XMLENFORCE&IBFS_args=" + ibiescape(wfdObj)
		            + "&IBFS_path=" + ibiescape(fexPath) + "&IBIMR_Random=" + Math.random();
				req+="&"+othis.options.csrfTokenName+"="+othis.options.csrfTokenValue; 
				doXmlHttpRequest(req, { asJSON: false, async: true, asXML: true, requestMethod: "post", onLoad: callBackFunc});	
				return true;
			}
			return false;		
		},		
		doWFDescribe: function(layerId, callBackFunc, fexPath) {
		   // var ampers = [];
		    var othis=this;
		    if(this.isDescribeOn()){
				if(!this.descBundleLoaded) {
					if (typeof define === 'function' && define.amd)
						define.amd = false;
						ibx.resourceMgr.addBundles([{"src":"../../tdg/jschart/distribution/extensions/com.ibi.geo.map/lib/ampers_bundle.xml", "loadContext":"ibx"}]).then(
							function (){
								othis.descBundleLoaded=true;
								othis.doWFDescribeCont(layerId, callBackFunc, fexPath);
							}
					);
				}
				else othis.doWFDescribeCont(layerId, callBackFunc, fexPath);
				return true;
			}
			return false;
		},
        addDynamicLayers: function() {
            var othis = this;
            for (var i = 0; i < othis.dynamicLayers.length; i++) {
                var dLay=othis.dynamicLayers[i];
                switch(dLay.type){
                    case "json-file":
                        othis.loadLayerFromStaticFile(dLay);
                    break;
                    case "fex":
                        othis.loadLayerFromFex(dLay);
                    break;
					case "htm":
                        othis.getHtmlCanvasFile(dLay.path);
                    break;
                }
            }
        },	
		doSetRenderer: function(layer, renderer) {
			var settings=this.getLayerSettings(layer.id);
			if(renderer && !jQuery.isEmptyObject(renderer) && settings) {
				settings.defaultRenderer=layer.renderer ? layer.renderer.clone() : {};
				switch(renderer.type) {
					 case "flow":
                    {
                        layer.renderer= FlowRenderer.fromJSON(renderer);  
						if(renderer.hasOwnProperty("color"))
							layer.renderer.color=new Color(renderer.color); 
						layer.legendEnabled=false;     
                        break;	
                    }
                	case "raster-stretch":
                    {
						if(this.isLoadedFromBookmarks())layer.renderer= RasterStretchRenderer.fromJSON(renderer);
						else {
							let ramps = renderer.colorRamp;
							//renderer.delete(colorRamps);
							if(Array.isArray(ramps)) {
								var colorRampsArr=[];
								ramps.forEach(function (ramp) {
					               	let temp = new AlgorithmicColorRamp({
							          algorithm: ramp.algorithm || "lab-lch",
							       	   toColor: new Color(ramp.toColor || "blue"),
							         	fromColor: new Color(ramp.fromColor || "green")
							        });
									colorRampsArr.push(temp);
					            });
								renderer.colorRamp = new MultipartColorRamp({colorRamps:colorRampsArr});
								layer.renderer= renderer;
							}	
						}  
                        break;	
                    }
				}				
			}
		},
		doUpdateRenderer: function(layer, stretchType, slider) {
			var settings=this.getLayerSettings(layer.id);
			if(layer.renderer && layer.renderer.type =="raster-stretch"){	
				var renderer = layer.renderer.clone();
				if(!slider) {
					const colorRamp = new MultipartColorRamp({
			        colorRamps: [
			          new AlgorithmicColorRamp({
			            fromColor: new Color([20, 100, 150, 255]),
			            toColor: new Color([70, 0, 150, 255])
			          }),
			          new AlgorithmicColorRamp({
			            fromColor: new Color([70, 0, 150, 255]),
			            toColor: new Color([170, 0, 120, 255])
			          }),
			          new AlgorithmicColorRamp({
			            fromColor: new Color([170, 0, 120, 255]),
			            toColor: new Color([230, 100, 60, 255])
			          }),
			          new AlgorithmicColorRamp({
			            fromColor: new Color([230, 100, 60, 255]),
			            toColor: new Color([255, 170, 0, 255])
			          }),
			          new AlgorithmicColorRamp({
			            fromColor: new Color([255, 170, 0, 255]),
			            toColor: new Color([255, 255, 0, 255])
			          }),
			        ]
			      });
				   layer.renderer= {
			          colorRamp,
			          "computeGamma": false,
			          "gamma": [1],
			          "useGamma": false,
			          "stretchType": "min-max",
			          "type": "raster-stretch"
        			};
				}
				else {
				  	var bandStat = layer.rasterInfo.statistics[0];
				  	renderer.stretchType = stretchType;
					switch (stretchType) {
				    case "min-max":
				    	renderer.statistics = [
					        {
					          min: slider.ibxRange("option", "value"),
					          max: slider.ibxRange("option", "value2")
					     //     avg: bandStat.avg,
					     //     stdev: bandStat.stddev
					        }
					      ];
					      break;
					    case "standard-deviation":
					      renderer.numberOfStandardDeviations =slider ? slider.ibxSlider("option", "value") : 1;
					      renderer.statistics = [bandStat];
					      break;
					    case "percent-clip":
					      renderer.minPercent =slider.ibxRange("option", "value");
					      renderer.maxPercent = slider.ibxRange("option", "value2");
					      break;
					  }
					  // apply the cloned renderer back to the layer's renderer
					  // changes will be immediate
					  layer.legendEnabled=true;
					  layer.renderer = renderer;
				}		
			 }	  		  
		},
		addLayer: function(listItem, index, groupLayer){
			var othis=this, view=othis.getCurrentView(), hm=false,
			mapLayer = listItem.layer;
            if(mapLayer) {  
                var curRend= mapLayer.renderer;
                if(curRend && curRend.type=="heatmap") {
                    listItem.heatmapRenderer=mapLayer.renderer;
                    mapLayer.renderer=listItem.defaultRenderer;
					hm=true;
                }
				mapLayer.on("layerview-create-error", function(event) {
					if(mapLayer && mapLayer.loadError) 
						alert(mapLayer.loadError.message);
					var fileOrName = othis.removeLayer(mapLayer.id, false);
					othis.allDone(fileOrName,mapLayer);
					event.error.name="AbortError";
				  //console.log("LayerView failed to create for layer with the id: ", mapLayer.id, " in this view: ", event.view);
				});
				if(groupLayer)
					groupLayer.add(mapLayer, index);
				else if(typeof(index)!='undefined')
					othis.getCurrentMap().add(mapLayer, index);
				else
					othis.getCurrentMap().add(mapLayer);
				if((mapLayer.type=="imagery-tile" || mapLayer.type=="imagery") && !this.isLoadedFromBookmarks()){
					var waitForLoad=-1, layToWait=mapLayer;
					var loaded = function() {
						if(layToWait.loaded){
							waitForLoad=window.clearInterval(waitForLoad);
						 	view.whenLayerView(mapLayer)
			                    .then(function () {
			                        othis.doUpdateRenderer(layToWait, "standard-deviation", null);
		                    })
		                    .catch(function (error) {
		
		                    });
						}
					};
					waitForLoad = window.setInterval(loaded,200);
					//view.ui.add("rendererDiv", "top-right");
				}
				let set = othis.getLayerSettings(mapLayer);
				if(set && set.component && set.component.webgl)
					othis.addWindBundle2(mapLayer, set.component)
				//othis.addWindBundle(mapLayer, set.component);
            }
			return hm;
		},		
		getGroupLayer: function(layerSet) {
			var othis = this, grLayer=null, groups=othis.getWidgetProperties("groups");
			if(groups && Array.isArray(groups)) {
				for(let p = 0; p <groups.length; p++) {
					let temp = groups[p];
					if(temp.hasOwnProperty("layers") && Array.isArray(temp.layers)
							&& temp.layers.includes(layerSet.id)) {
						layerSet.component.index=temp.layers.indexOf(layerSet.id);
						if(temp.groupLayer)
							grLayer=temp.groupLayer;
						else {
						    grLayer=temp.groupLayer = new GroupLayer({title: temp.title || layerSet.component.title, 
								visible: temp.visible || layerSet.component.visible || true,
								opacity: temp.opacity || layerSet.component.opacity || 1, 
								blendMode: temp.blendMode || "normal",
								effect: temp.effect || ""});
							othis.getCurrentMap().add(grLayer);
							
							var layerProps = {
				                id: grLayer.id,
				                layer: grLayer,
				                component: { title:grLayer.ttl, visible:grLayer.visible,opacity:grLayer.opacity},
				                layerJson: {}
				            };				
							othis.layerList.splice(p, 0, layerProps);
						}
						break;
					}
				}
			}
			return grLayer;
		},		
        addLayers: function() {            
            var othis = this; othis.addedLrs=true;
            var loadInt=-1;
            var lfunc=function() {
                if(othis.createdLayers && othis.createdLayers.length && 
                        othis.options.numOfLayers == othis.createdLayers.length &&
                        othis.createdLayers.length==othis.layerList.length && 
                        othis.areLayersReady(othis.createdLayers)) {
                    loadInt=clearInterval(loadInt);
                //    console.log(new Date().getTime()-othis.start.getTime());
                    for (var i = 0; i < othis.layerList.length; i++) {
						if(!othis.options.savedState || !othis.needRefresh(othis.layerList[i]))
							othis.addLayer(othis.layerList[i], /*group ? othis.layerList[i].component.index :*/ i,othis.getGroupLayer(othis.layerList[i]));						
                    }
                    othis.addDynamicLayers();
//wait for completion 
					var homeInt = -1,                
	                homemF = function () {    
						let done=true;
						for(let k = 0; k<othis.layerList.length; k++) {
							let layer=othis.layerList[k].layer;
							if(layer && layer.type=="group") {
								done=layer.layers.length>0;
								layer.layers.forEach(function(lay) {
									if(!lay.fullExtent)
										done=false;
								});
							}	
							else if(layer && layer.type=="route")
								done= layer.routeInfo ? true : false;
							else if(layer && layer.type=="stream")
								done= layer.loaded;
							else if(layer && !layer.fullExtent && (!othis.options.savedState || !othis.needRefresh(othis.layerList[k]))) {
								done=false;
								break;
							}
							else if(layer && layer.type=="group" && Array.isArray(layer.allSublayers)) {
								let tracksId = 5;
								let tracksSublayer = layer.allSublayers.find((sublayer) => {
								  return sublayer.id === tracksId;
								});
								let junk = 0;
							}				
						}           
	                    if(done) {
						//	othis.isTimesliderEnabled(true);
							homeInt = window.clearInterval(homeInt);
							if(othis.windlayer)othis.getCurrentMap().layers.add(othis.windlayer);	
							if(othis.camera)
								$(othis.camera).geoUICamera("outsideUpdates", false);						
							if(!othis.options.savedState || othis.options.savedState.home) {
								othis.goToHomeExtent(); 
							}
							else if(othis.options.savedState.hasOwnProperty("mapProp")) {
								setTimeout(function(){ othis.getCurrentView().goTo(Viewpoint.fromJSON(othis.options.savedState.mapProp.viewpoint)); }, 1500);	
							}								
							for(let k = 0; k<othis.layerList.length; k++) {	
								if(othis.layerList[k].dataLayer) {
									let comp=othis.layerList[k].component;
									if(comp && ((comp.hasOwnProperty("maxScale") && comp.maxScale) || 
										(comp.hasOwnProperty("minScale") && comp.minScale))) {
										othis.setScalerangeLayer(othis.layerList[k].layer);	
										break;
									}
								}								
							}
							if(!othis.isPreviewMode())
								setTimeout(function(){othis.startRefresh(); }, othis.wasrefreshing ? 500 : 10);	
						}    
					}
					homeInt = window.setInterval(homemF, 50); 
                }
				else if(othis.options.numOfLayers==0){
					loadInt=clearInterval(loadInt);
					othis.addDynamicLayers();
					othis.doAfterAllLoaded();
					if(!othis.options.savedState)
						othis.goToHomeExtent(); 
				}
            }   
            loadInt=setInterval(lfunc,20);         
        },		
        getDefaultRenderer: function(defaultR, fl){
            var retR=defaultR || fl.renderer;
            if(retR && typeof(retR.clone) != 'function') {
                var temp=fl.renderer;
                fl.renderer=retR;
                retR=fl.renderer;
                fl.renderer=temp;
            }            
            return retR;
        },
        
        Add_InfoMap: function (arr, index) {
            var othis = this;
            arr.forEach(function (lyr) {
                var counter = 0;
                index++;
                othis.Add_InfoLayer(lyr,index);
                othis.createdLayers.push({layer: lyr, status: "readyToLoad"});
            });
            return index;
        },
        Add_InfoLayer: function (lyr, index) {
            var othis = this, urlToUse = lyr.smartMapping && lyr.smartMapping.webMapInfo ? lyr.smartMapping.webMapInfo.itemDataUrl : lyr.url;

            var layer = new MapImageLayer({
                url: lyr.url,
                title: lyr.title || lyr.id,
                visible: lyr.options.visible,
                opacity: lyr.options.opacity
            });
            var layerProps = {
                id: lyr.title || lyr.id,
                layer: layer,
				component: {visible:lyr.options.visible, opacity:lyr.options.opacity,index:index}
            };
            othis.insertLayer(layerProps, layer);   
			return layer;               
        },
        doLoadDLModel: function(result) {
			let res=true;
		},
		doLoadDLModelError: function(result) {
			let res=true;
		},
		isLayerTypeEx: function(lyr) {
            if(lyr.smartMapping && lyr.smartMapping.webMapInfo)
                return lyr.smartMapping.webMapInfo.hasOwnProperty("layerTypeEx") ? lyr.smartMapping.webMapInfo.layerTypeEx : false;
            return false;
        },
		addMediaLayer: function(lyr, comp, layerSettings) {
			let elements=[], layer=null;
			if(Array.isArray(lyr.media)) {
				lyr.media.forEach((media)=> {
					let elt=null, url = typeof(media.url) === 'string' ? resolveUrl(media.url,this.getContext()) : "";
					if(media.type=="video") {
						elt=new VideoElement({
							  video: url,
							  opacity: media.opacity ? media.opacity : 1,
								title: media.title ? media.title : "",
							  georeference: new ExtentAndRotationGeoreference({
							    extent: new Extent({
							      xmin: media.extent ? media.extent.xmin : 0,
							      ymin: media.extent ? media.extent.ymin : 0,
							      xmax: media.extent ? media.extent.xmax : 0,
							      ymax: media.extent ? media.extent.ymax : 0,
							      spatialReference: {
							        wkid: 4326
							      }
							    }),
								rotation: media.rotation ? media.rotation : 0,
								opacity: media.opacity ? media.opacity : 1
							  })
						});						
					}
					else if(media.type=="image") {
						elt=new ImageElement({
							  image: url,
							  opacity: media.opacity ? media.opacity : 1,
							title: media.title ? media.title : "",
							  georeference: new ExtentAndRotationGeoreference({
							    extent: new Extent({
							      xmin: media.extent ? media.extent.xmin : 0,
							      ymin: media.extent ? media.extent.ymin : 0,
							      xmax: media.extent ? media.extent.xmax : 0,
							      ymax: media.extent ? media.extent.ymax : 0,
							      spatialReference: {
							        wkid: 4326
							      }
							    }),								
								rotation: media.rotation ? media.rotation : 0
							  })
						});
					}
					if(elt) elements.push(elt);
				});
			}
			if(elements.length) {
				 layer = new MediaLayer({
				    source: elements,
				    title: comp.title || lyr.title || lyr.id, 
					visible: comp.visible,
					opacity: comp.opacity
				});
				if(layer) {
					this.add_UrlLayerCont(layer,comp,layerSettings);
					this.createdLayers.push({layer: lyr, status: "readyToLoad"});
                    return true;
                }
			}
            return false;
        },
        Add_UrlLayer: function (lyr, comp, layerSettings) {
            var othis = this, cluster=false,
            layer = null, resp={}, bLTypeEx=othis.isLayerTypeEx(lyr),
			portalItemId = othis.getPortalId(lyr), pItem= portalItemId ? { id:portalItemId} : null, lSet=layerSettings;	
			if(portalItemId) {
				var map = othis.getCurrentMap(), mapPid=map.portalItem ? map.portalItem.id : null;
				if(mapPid==portalItemId) {
					if(othis._map3d) 
						othis._map3d.component=component;
					else
						othis._map.component=component;
					othis.wait(false); 
					return null;
				}
				if(lyr.hasOwnProperty('apikey'))
					pItem.apiKey=lyr.apikey;
			}	
			if(!bLTypeEx) {
				pItem ? Layer.fromPortalItem({
					  portalItem: pItem, title: comp.title || lyr.title ||  lyr.id, visible: comp.visible, 							
							blendMode: comp.blendMode || "normal", effect: comp.effect, opacity: comp.opacity}).then(
				          (response) => {
				            if (response) {
								this.createdLayers.push({layer: lyr, status: "readyToLoad"});
								this.add_UrlLayerCont(response,comp,lSet);
				            }
				          },
				          (err) => {
								alert(portalItemId + " " +err.message);
						//		console.log(err.message);
								othis.options.numOfLayers--;
				          })
				: Layer.fromArcGISServerUrl({
					  url: lyr.url,	title: comp.title || lyr.title || lyr.id, visible: comp.visible, 
							blendMode: comp.blendMode || "normal",  effect: comp.effect, opacity: comp.opacity}).then(
				          (response) => {
				            if (response) {
								this.createdLayers.push({layer: lyr, status: "readyToLoad"});
								this.add_UrlLayerCont(response,comp,lSet);
				            }
				          },
				          (err) => {
								alert(lyr.url + " " +err.message);
							//	console.log(err.message);
							//	this.add_UrlLayerAlt(lyr.url,lyr, comp,lSet);
							//	this.addWindBundle(lyr, comp);
								othis.options.numOfLayers--;
				          });
			}
			if(layer)
			this.add_UrlLayerCont(layer,comp,layerSettings);
			return true;  
        },   
		add_UrlLayerAlt: function(url, lyr, comp, layerSettings) {
			const multidimensionalDefinition = [
	          {
	            variableName: "water_temp",
	            dimensionName: "StdTime",
	            values: [1396828800000] // Monday, April 7, 2014 12:00:00 AM GTM
	          },
	          {
	            variableName: "water_temp", // water temp at sea level
	            dimensionName: "StdZ",
	            values: [0]
	          }
	        ];
			let layer = new WCSLayer({url: url,
					  title: comp.title || lyr.title || lyr.id, visible: comp.visible, multidimensionalDefinition: multidimensionalDefinition,
							blendMode: comp.blendMode || "normal",  effect: comp.effect, opacity: comp.opacity});
			if(layer) {				
				this.createdLayers.push({layer: lyr, status: "readyToLoad"});
				this.add_UrlLayerCont(layer,comp,layerSettings);
			}
				
			else this.options.numOfLayers--;
		},
		add_UrlLayerCont: function(layer,comp,layerSettings) {
			var othis=this;
			if(layer) {				
				if(comp.name) layer.id=comp.name;
				if(comp.hasOwnProperty('visible'))
					layer.visible=comp.visible;
				if(comp.hasOwnProperty('title'))
					layer.title=comp.title;
				if(comp.hasOwnProperty('blendMode'))
					layer.blendMode=comp.blendMode;
				if(comp.hasOwnProperty('effect'))
					layer.effect=comp.effect;				
				if(comp.hasOwnProperty('opacity') && layer.type !='point-cloud')
					layer.opacity=comp.opacity;
				var layerProps = {
	                id: layer.id || comp.name,
	                layer: layer,
	                component:comp,
	                layerJson: {}				
	            };
			//	layer.apiKey=this.getApiKey();
				layer.when(function(){
				    othis.doSetRenderer(layer, comp.renderer);
					if(layer.type=='group' && comp.hasOwnProperty('sublayers') && Array.isArray(comp.sublayers)
							&& comp.sublayers.length == layer.layers.items.length) {
						for(let i = 0; i < comp.sublayers.length; i++) {
							let subsaved=comp.sublayers[i], subLay= layer.layers.items[i];
							if(subsaved.hasOwnProperty('blendMode'))
								subLay.blendMode=subsaved.blendMode;
							if(subsaved.hasOwnProperty('effect'))
								subLay.effect=subsaved.effect;
							if(subsaved.hasOwnProperty('featureEffect')) {
								//
								if(subsaved.featureEffect.filter.hasOwnProperty("geometry")) {
									if(subsaved.featureEffect.filter.geometry.hasOwnProperty("paths"))
										subsaved.featureEffect.filter.geometry.type="polyline";
									else subsaved.featureEffect.filter.geometry.type="polygon";
								}
								subLay.featureEffect=FeatureEffect.fromJSON(subsaved.featureEffect);	
							}
						}
					}
					else {
						if(comp.hasOwnProperty('blendMode'))
							layer.blendMode=comp.blendMode;
						if(comp.hasOwnProperty('effect'))
							layer.effect=comp.effect;
						if(comp.hasOwnProperty('featureEffect')) {
							//
							if(comp.featureEffect.filter.hasOwnProperty("geometry")) {
								if(comp.featureEffect.filter.geometry.hasOwnProperty("paths"))
									comp.featureEffect.filter.geometry.type="polyline";
								else comp.featureEffect.filter.geometry.type="polygon";
							}
							layer.featureEffect=FeatureEffect.fromJSON(comp.featureEffect);	
						}
					}
				}, function(error){
				   error.name="cancelled:layerview-create";
				});
				if(layer.type != "group")
					layer.listMode= "hide-children";
				if(layer.type == "route") {
					layer.defaultSymbols=getRouteDefaults();
					layer.on("layerview-create", function(event){
						if(!layer.portalId)
						othis.createRoutePopupTemplates(layer);									  
					});
				}
				if(!layer.title)
				layer.title=comp.title;
				
				if(layer.type=="stream") {
					let hasRend=comp.renderer && comp.renderer.hasOwnProperty('type'), 
					hasRend3d=comp.renderer3d && comp.renderer3d.hasOwnProperty('type');
					layerProps.renderer = hasRend ? comp.renderer : {
						  type: "simple",  // autocasts as new SimpleRenderer()
						  symbol: {
						    type: "simple-marker", 
							path: "M14.5,29 23.5,0 14.5,9 5.5,0z",
						    color: "#ffff00",
						    outline: {  
						      width: 0.5,
						      color: "white"
						    },
							size: 8
						  },
							visualVariables: [
						    {
						      type: "rotation", // indicates that symbols should be rotated based on value in field
						      field: "heading", // field containing aspect values
						      rotationType: "geographic"
						    }
						  ]
						};
						layerProps.renderer3d=hasRend3d ? comp.renderer3d : layerProps.renderer;
					if(!hasRend && layerSettings.series) {
						let contH=$(this.options.Settings.container).height();
						this.doSetSymbol2(this.getSymbolInfo(layerSettings.series,"all",0), layerProps.renderer, false, null, contH, layerSettings, false);
					//	this.doSetSymbol2(this.getSymbolInfo(layerSettings.series,"all",0), layerProps.renderer3d, false, null, contH, layerSettings, true);
					}
					layer.maxReconnectionAttempts=100;
  					layer.maxReconnectionInterval= 10;
					layer.updateInterval=5000;
					layer.renderer= this.is3dView() ? layerProps.renderer3d : layerProps.renderer
					layer.purgeOptions= {
	              			displayCount: 10000
	            		};	
					layer.popupTemplate = layer.createPopupTemplate(); 
					if(comp.timeInfo)layer.timeInfo=comp.timeInfo;
				}
				this.setClustering(layerProps,layer);
	            this.insertLayer(layerProps, layer);
			}
		},
		doDrawResult: function(result) {
			var othis = this, view=othis.getCurrentView();
			const fillSymbol = {
	          type: "simple-fill",
	          color: [226, 119, 40, 0.75],
	          outline: {
	            color: [255, 255, 255],
	            width: 1
	          }
	        };
			const resultFeatures = result.results[0].value.features;

          // Assign each resulting graphic a symbol
          const viewshedGraphics = resultFeatures.map((feature) => {
            feature.symbol = fillSymbol;
            return feature;
          });

          // Add the resulting graphics to the graphics layer
          view.graphics.addMany(viewshedGraphics);
		},
		getPortalId2: function(base) {
			let url=base.url || base.URL;
			if(base.hasOwnProperty("basemapPortalId") && typeof(base.basemapPortalId)==='string' &&
									base.basemapPortalId.length)
				return base.basemapPortalId;
			else if(typeof(url) === 'string' && url.search("id:") == 0)
				return url.replace("id:", "");
		},
		getPortalId: function(lyr) {
			var othis=this, proxy, prefix=null, portalItemId=null, silent=lyr.authorization=="silent", 
				named=lyr.authorization=="named", url=lyr.url || lyr.URL, apikey=false;
            if (typeof (url) == 'string') {
				if(!silent) {
					silent=url.search("silent:")!=-1;
					named=url.search("named:")!=-1;
	                var end = url.lastIndexOf('/');
	                if (end != -1)
						proxy = url.substr(0,end+1);
				}
				else 	
					proxy = othis.getEdaRequestPrefix()+"/GisEsriProxy";
            }
			else if(silent || named)
				proxy = othis.getEdaRequestPrefix()+"/GisEsriProxy";
            if(typeof(lyr.smartMapping && lyr.smartMapping.webMapInfo.queryString) == 'string') {
                var parts=lyr.smartMapping.webMapInfo.queryString.split(':');
                if(parts.length==2 && parts[0]=="id")
                    portalItemId=parts[1];
            }
			else if(lyr.hasOwnProperty("portalid"))
				portalItemId=lyr.portalid;
			else {
				let str2parse=silent && lyr.uri ? lyr.uri : lyr.url;
				if(typeof(str2parse) == 'string' && str2parse.search("portalid:") != -1) {
					str2parse=str2parse.replace("portalid:","");
					if(str2parse.search("urlprefix:") != -1)
						str2parse=str2parse.replace("urlprefix:","");
					if(str2parse.search("apikey:") != -1) {
						str2parse=str2parse.replace("apikey:","");
						apikey=true;
					}						
					let parts=str2parse.split(';');	
					if(parts.length==2) {
						portalItemId=parts[0];
						if(apikey)lyr.apikey=parts[1];
						else prefix=parts[1];
					}
					else if(parts.length==1)
						portalItemId=parts[0];
				}
			}	
			if(!apikey && (silent || named)) {
				if(typeof(lyr.uri) == 'string' && !prefix)  {
                	prefix=lyr.uri.split('/')[2];
				//	lyr.url=lyr.uri;
				}
				else if(typeof(url) == 'string' && !prefix) 
					prefix=url.split('/')[2];
				else if(lyr.hasOwnProperty("urlprefix"))
					prefix=lyr.urlprefix;
			}            
			if(!apikey && !this.getApiKey() && prefix && proxy && (silent || named)) {		
				othis.addRequestIntersept(prefix);
            	urlUtils.addProxyRule({ urlPrefix: prefix,proxyUrl: proxy});
			}	
			return portalItemId;
		},
		getIconFieldName: function(fieldsInfo, fields) {
			if(Array.isArray(fieldsInfo) && Array.isArray(fields)){
				for(var i = 0; i < fieldsInfo.length; i++) {                    
                    if(fieldsInfo[i].id == "icon") {
                        for(var ii = 0; ii < fields.length; ii++) { 
							if(fields[ii].ibifield==fieldsInfo[i].fields[0].fieldName)
								return fields[ii].name;
						}
                    }
                }
			}
			return "";
		},
		json2geometry: function(jGeom) {
			var geom=null;			
			if (jGeom.hasOwnProperty('geometryType') && jGeom.geometryType === "esriGeometryPoint")
                geom = new Point({x: jGeom.geometry.x, y: jGeom.geometry.y,spatialReference: jGeom.spatialReference});
			else if (jGeom.hasOwnProperty('geometryType') && jGeom.geometryType === "esriGeometryPolyline")
                geom = new Polyline({paths: jGeom.geometry.paths, spatialReference: jGeom.spatialReference});
			else if (jGeom.hasOwnProperty('geometryType') && jGeom.geometryType === "esriGeometryPolygon")
	            geom = new Polygon({rings: jGeom.geometry.rings,spatialReference: jGeom.spatialReference});
			return geom;
		},
		isSameGeometry: function(records) {
			if(Array.isArray(records) && records.length>1 && 
				Array.isArray(records[0]) && Array.isArray(records[1])) {
				for (let i = 0; i<records[0].length; i++) {					
					if(records[1].length<=i) return false;
					let rec0=records[0][i], rec1=records[1][i];
					if(rec0.hasOwnProperty('name') && rec1.hasOwnProperty('name') && typeof(rec0.name) === 'object' && typeof(rec1.name) === 'object' && 
						rec0.name.hasOwnProperty('geometry') && rec1.name.hasOwnProperty('geometry')) {
						let geom0=this.json2geometry(rec0.name), geom1=this.json2geometry(rec1.name);
						if(!geometryEngine.equals(geom0, geom1))
							return false;
					}
					//else return false;
				}	
				return true;	
			}
			return false;
		},
		isGeometrySerBreak: function(record, series) {
			let gbreak=false;
			for (var key in record) {
				if(key == "COUNTRY" || key === "GEOLEVEL1" || key === "GEOLEVEL2"  || key === "url0") {
					let val=record[key], found=false;
					for(let i = 0; i < series.length; i++) {
						if(series[i].label && typeof(series[i].label) === 'string' && 
							typeof(val) === 'string' && val.toUpperCase()==series[i].label.toUpperCase()) {
							gbreak=true;
							break;
						}
					}
				}
				if(gbreak)break;
			}
			return gbreak;
		},
		checkGeometryZ: function(layerSettings) {
			if (layerSettings.records && Array.isArray(layerSettings.records)) {
				var firstRecord=null;
                if(Array.isArray(layerSettings.records[0])){
	 				firstRecord=layerSettings.records[0][0];
					if(Array.isArray(firstRecord))
						firstRecord=firstRecord[0];
				}                   
                else
                    firstRecord=layerSettings.records[0];
				if(!firstRecord) return;
				if (firstRecord["name"] && firstRecord["name"].geometry && 
					(firstRecord["name"].geometry.hasOwnProperty("z") || firstRecord["name"].geometry.hasOwnProperty("LINE1")) || 
					(typeof(firstRecord) == 'object' && firstRecord.geometry && 
					(firstRecord.geometry.hasOwnProperty("z") || firstRecord.geometry.hasOwnProperty("LINE1"))))
				{
				//	if(!layerSettings.component.hasOwnProperty("layerType"))
				//		layerSettings.component.layerType="graphics";		
					layerSettings.component.satellite= typeof(firstRecord) == 'object' && firstRecord.geometry ? firstRecord.geometry.hasOwnProperty("LINE1") : 
								firstRecord["name"].geometry.hasOwnProperty("LINE1");		
					layerSettings.geometryZ=true;
				}					
			}
		},		
		isSatelliteData: function(data) {
			if (Array.isArray(data)) {
				var firstRecord=null;
                if(Array.isArray(data[0])){
	 				firstRecord=data[0][0];
					if(Array.isArray(firstRecord))
						firstRecord=firstRecord[0];
				}                   
                
				if (typeof(firstRecord) !== 'undefined' && firstRecord.geometry && (firstRecord.geometry.hasOwnProperty("LINE1")) || 
					(typeof(firstRecord) == 'object' && firstRecord.geometry.hasOwnProperty("LINE1")))
					return true;	
			}
			return false;
		},
		isPropertyGeometry: function(data, propName) {
			if (Array.isArray(data)) {
				var firstRecord=null;
                if(Array.isArray(data[0])){
	 				firstRecord=data[0][0];
					if(Array.isArray(firstRecord))
						firstRecord=firstRecord[0];
				}                   
                
				if (typeof(firstRecord) !== 'undefined' && firstRecord.hasOwnProperty(propName) && firstRecord[propName].geometry || 
					(typeof(firstRecord) == 'object' && firstRecord.hasOwnProperty(propName) && firstRecord[propName].geometry))
					return true;	
			}
			return false;
		},		
		createRoutePopupTemplates: function(rLayer) {
			this.getRouteTemplate(rLayer);
			setTimeout(this.updateRouteTemplate.bind(this, rLayer),3000);
			if(rLayer.directionLines.length) {
				for(let i = 0; i < rLayer.directionLines.length; i++) {                    
                    let dl=rLayer.directionLines.at(i);
					dl.popupTemplate=this.getDirectionLineTemplate(dl);
                }
				for(let i = 0; i < rLayer.directionPoints.length; i++) {                    
                    let dp=rLayer.directionPoints.at(i);
					dp.popupTemplate=this.getDirectionPointTemplate(dp);
                }
				for(let k = 0; k < rLayer.stops.length; k++) {                    
                    let stop=rLayer.stops.at(k);
					stop.popupTemplate=this.getStopTemplate(stop);
				}
			//	othis.updateStopsNames(rl);
			}			
		},
		getStopTemplate: function(stop) {
			let content = getTemlateContentCoreElt();
			addContentLine(content, getTransString('name'), stop.name);
			addContentLine(content, getTransString('route_name'), stop.routeName);
			addContentLine(content, getTransString('sequence'), stop.sequence);
			addContentLine(content, getTransString('arrival_time'), this.formatDateToLocal(stop.arriveTime));
			
			addContentLine(content, getTransString('departure_time'), this.formatDateToLocal(stop.departTime));
			
			addContentLine(content, getTransString('arrival_curb'), stop.arriveCurbApproach);
			addContentLine(content,getTransString('departure_curb'), stop.departCurbApproach);
			addContentLine(content, getTransString('status'), stop.status);
			addContentLine(content, getTransString('location_type'), stop.locationType);
			addContentLine(content, getTransString('cumulative_min'), new Number(parseFloat(stop.cumulativeDuration).toFixed(2)));
			addContentLine(content,getTransString('cumulative_meters'), this.formatDistanceToLocal(stop.cumulativeDistance));
			let template = {							
              title: stop.name,
              content:content.html()
            };
			return 	template;
		},
		getDirectionLineTemplate: function(dl) {
			let content = getTemlateContentCoreElt();
			addContentLine(content, getTransString('line_type'), dl.directionLineType);
			addContentLine(content, getTransString('length_meters'), this.formatDistanceToLocal(dl.distance));
			addContentLine(content, getTransString('duration_min'), new Number(parseFloat(dl.duration).toFixed(2)));
			addContentLine(content, getTransString('direction_point'), dl.directionPointId);
			let template = {							
              title: getTransString('direction_lines'),
              content:content.html()
            };
			return 	template;
		},
		getDirectionPointTemplate: function(dp) {
			let content = getTemlateContentCoreElt();
			addContentLine(content, getTransString('directions_item_type'), dp.directionPointType);
		//	addContentLine(content, "Text to Display", dp.displayText);
			addContentLine(content, getTransString('sequence'), dp.sequence);
			if(dp.stopId)addContentLine(content, getTransString('stop_id'), dp.stopId);
			addContentLine(content, getTransString('maneuver_starts'), this.formatDateToLocal(dp.arrivalTime));
			addContentLine(content, getTransString('offset_utc_min'), dp.arrivalTimeOffset);
			if(dp.branchName)addContentLine(content, getTransString('signpost_branch'), dp.branchName);
			if(dp.towardName)addContentLine(content, getTransString('signpost_toward'), dp.towardName);
			let template = {							
              title: dp.displayText,
              content:content.html()
            };
			return 	template;
		},
		updateRouteTemplate: function(rLayer) {
			let routeInfo=rLayer.routeInfo, content = routeInfo.popupTemplate.content || getTemlateContentCoreElt(),
			name = rLayer.stops.at(0).name + "-" + rLayer.stops.at(rLayer.stops.length-1).name;
			rLayer.routeInfo.name=name;
			$(routeInfo.popupTemplate.content).find(".routeName").text(name);
		},
		getRouteTemplate: function(rLayer) {
			let routeInfo=rLayer.routeInfo, content = getTemlateContentCoreElt(),
			name = rLayer.stops.at(0).name + "-" + rLayer.stops.at(rLayer.stops.length-1).name;
			addContentLine(content, getTransString('route_name'), name || routeInfo.name, "routeName");
			addContentLine(content, getTransString('total_min'), new Number(parseFloat(routeInfo.totalDuration).toFixed(2)));
			addContentLine(content, getTransString('total_meters'), this.formatDistanceToLocal(routeInfo.totalDistance));
			addContentLine(content, getTransString('start_time'), this.formatDateToLocal(routeInfo.startTime));
			addContentLine(content, getTransString('start_time_utc'), routeInfo.startTimeOffset);
			addContentLine(content, getTransString('end_time'),this.formatDateToLocal(routeInfo.endTime));
			addContentLine(content, getTransString('end_time_utc'), routeInfo.endTimeOffset);
			let template = {							
              title: getTransString('route_details'),
              content:content.html()
            };
			
			routeInfo.popupTemplate=template;
		},
		getSatelliteTemplate: function(bNoAction) {
			var template = {							
              title: "{OBJECT_NAME}",
              content:"<div class='satContent esri-widget'><div>Int'l Designator&emsp;&emsp;&emsp;{INTLDES}</div> \
					   <div>Type&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;{OBJECT_TYPE}</div> \
					   <div>Apogee&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;{APOGEE} km</div> \
					   <div>Perigee&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;{PERIGEE} km</div> \
						<div>Inclination&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;{incl} &#176;</div> \
					   <div>Altitude&emsp;&emsp;&emsp;&emsp;&nbsp;&emsp;&emsp;&nbsp;{ALTITUDE} km</div> \
					   <div>Velocity&emsp;&emsp;&emsp;&emsp;&nbsp;&emsp;&emsp;&nbsp;{velocity} km/s</div> \
					   <div>Period&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;{period} min</div> \
					   <div>TLE Requested&emsp;&emsp;&emsp;&nbsp;{epShort}</div></div>"											, //"Launch number {number} of {year}",
			
              actions: [
				 {
                  // Create a popup action to display the satellite track.
                  title: "Go to...",
				//	title: "Find all launch objects...",
                  id: "go-to",
                  className: "esri-icon-zoom-in-magnifying-glass"
                },
                {
                  // Create a popup action to display the satellite track.
                  title: "Find all objects from this launch...",
				//	title: "Find all launch objects...",
                  id: "findLaunch",
                  className: "esri-icon-search"
                }
              ]
            };		
			if(bNoAction) template.actions=[];
			template.overwriteActions = bNoAction ?  false : true;
			return template;
		},
		formatDateToLocal: function(date) {
	//return new Date(date).toLocaleDateString()+ " " + new Date(date).toLocaleTimeString();
			return intl.formatDate(new Date(date));
		},
		formatDistanceToLocal: function(distM) {
			let dist = new Number(parseFloat(distM).toFixed(2));
			
			return intl.formatNumber(dist);
		},
		createSatelliteLayer: function (layerSettings, justAdd) {			
			var selValues=null, done=false, dates=[];
			if(this.options.amperInfo) {
				if(typeof(this.options.amperInfo.curValue) === 'string')
					selValues=[this.options.amperInfo.curValue];
				else selValues=this.options.amperInfo.curValue;
			}				
			var othis = this, geomType = "point";
				view=othis.getCurrentView(), insert=true, grlayer = othis.getCurrentMap().findLayerById(layerSettings.id),
				pLEOalt= layerSettings.component.hasOwnProperty("pLEOaltitude") ? parseInt(layerSettings.component.pLEOaltitude,10) : 2000;
				//othis.getCurrentView().constraints.clipDistance.far *= 4;
				// _view.constraints.clipDistance.far *= 2;
			if(!othis.satelliteTracks) {
				othis.satelliteTracks=new GraphicsLayer({listMode:"hide"}); 
				othis.getCurrentMap().add(othis.satelliteTracks,0);						
			}		
			if(othis.isTooltipEnabled()) view.popup.dockEnabled=true;
			layerSettings.graphics =[];			
			var template=othis.getSatelliteTemplate(true), subDeb=null, objNames=[], debr=[], debrNames=[]; 
			function processRecords(layerSettings, records) {		
				var satPerCntrCount=0, subL=null, dbrGr=[];
                records.forEach(function (r) {
					let s=Array.isArray(r) && r.length ? r[0] : null;
					if(!s)return;
					var obj = typeof(s) == 'object' ? s : s["name"];
					
                    if (obj && obj.geometry && obj.geometry.COUNTRY_CODE) {
						hasZ=obj.geometry.hasOwnProperty("z");
						let line1=null, line2=null, time = null;
                        var geom = {
                            type: geomType,
                            spatialReference: obj.spatialReference
                        }; 
						var attr = {}, ttObj={};
                       
						line1=obj.geometry.LINE1, line2=obj.geometry.LINE2, 
						epoch = obj.geometry.hasOwnProperty("EPOCH") ? new Date(obj.geometry.EPOCH).getTime() : 0;
						timeSinceTleEpoch =new Date().getTime()-epoch;
						
						period = obj.geometry.hasOwnProperty("PERIOD") ? parseInt(obj.geometry.PERIOD.trim(),10) : 0;
					    
			          	try {
			            	
							geom = getOrbitPoints(line1, line2, 1, epoch,ttObj, null);
							if(geom) {
								geom.type=geomType;
								geom.spatialReference=obj.spatialReference;	
							}
						}
			          	catch (error) {}								
								     	
	                    if(obj.geometry.OBJECT_TYPE=="PAYLOAD" && parseInt(ttObj.alti,10) < pLEOalt) {	   		       
	                        attr["ObjectID"] = U._generateUid(); 
							if(r.hasOwnProperty("icon") && layerSettings.iconFname){
								var img=r.icon,
								ind = img.lastIndexOf("/"), indexDot = img.lastIndexOf(".");
						        if (ind != -1)
						            imgShort= img.slice(ind + 1, (indexDot != -1 ? indexDot : img.length));
								for(var ii = 0; ii < images.length; ii++) { 
									if(images[ii]==img) {
										found=true;
										break;
									}
								}
							} 
						    if(geom) {
									let epoShort = typeof(obj.geometry.EPOCH) == 'string' ? obj.geometry.EPOCH.substr(0, obj.geometry.EPOCH.search("T")) : obj.geometry.EPOCH;
									attr["EPOCH"]= obj.geometry.EPOCH;
									attr["period"]= period;
									attr["COUNTRY_CODE"]=obj.geometry.COUNTRY_CODE;
									attr["COUNTRY_NAME"]=obj.geometry.COUNTRY_NAME;
									attr["OBJECT_NAME"]=obj.geometry.OBJECT_NAME;
									attr["INTLDES"]=obj.geometry.INTLDES;
									attr["OBJECT_TYPE"]=obj.geometry.OBJECT_TYPE;
									attr["APOGEE"]=obj.geometry.APOGEE;
									attr["PERIGEE"]=obj.geometry.PERIGEE;
									attr["ALTITUDE"]=ttObj.alti;
									attr["velocity"]=ttObj.velo;
									attr["incl"]=Number(line2.substring(9,14)),
									attr["epShort"]=epoShort;
									attr["GP_TLE_LATEST_EXTRACT_JOINED_GP_TLE_L_COUNTRY_CODE"]=obj.geometry.COUNTRY_CODE;
									attr["sat_id"]= Number(line1.substring(2, 7));
								var fieldValue=othis.getGroupId(attr.sat_id,layerSettings.groups) || obj.geometry.COUNTRY_CODE || t2 || t3 || othis.getSeriesLabel(layerSettings, index);	
								let launch=obj.geometry.INTLDES.slice(0,8);
								r.time=typeof(launch) === 'string' && launch.search('-')!=-1 ? launch.split('-')[0] : launch;
								othis.addTimeField(r,attr, layerSettings, dates);
								var g = new Graphic({
		                            geometry: geom,
		                            attributes: attr,
									symbol: othis.getSymbolFromRenderer(layerSettings,fieldValue, true)
		                        	
								});
								g.satrec=ttObj.satrec;	
								 if(!grlayer.telDate || grlayer.telDate<epoch && !done) {
									grlayer.telDate=epoch; 
									done=true;
								}   
								if(selValues) 
									g.visible= othis.isSatelliteVisible(g.attributes,layerSettings.groups,selValues);
								g.popupTemplate = template;
								layerSettings.graphics.push(g);
								objNames.push({value: obj.geometry.OBJECT_NAME, display : obj.geometry.OBJECT_NAME});
								
								satPerCntrCount++;
							}	
						}						
                    }
                });
            }
			var currentElevationInfo = {
                mode: "absolute-height",
                offset: 0
            };
			let layerProps = null;
			if (layerSettings.records && Array.isArray(layerSettings.records)) {
				if(!grlayer){
					grlayer = new GraphicsLayer({ 
		                id: layerSettings.id,
		                title: layerSettings.component.title || layerSettings.id,                  
		                geometryType: geomType,
		                opacity: Number(layerSettings.component.opacity),
		                visible: layerSettings.component.visible});
					if(justAdd)
						layerProps = {
							dataLayer: true,
							component: layerSettings.component,
							id: layerSettings.id,           
			                chartLayer: layerSettings.chartLayer,      
							seriesInfo: layerSettings.seriesInfo,   
							graphics: layerSettings.graphics,   
					//		objectNames: objNames,        
			                layer: grlayer
			           };		
				}
                if(Array.isArray(layerSettings.records[0])){                    
                    layerSettings.records.forEach(function (rcds) {	
                        processRecords(layerSettings, rcds);                      
                    });
                }
                else
                    processRecords(layerSettings, layerSettings.records);                			
            }		
			
			if(justAdd) {
					grlayer.addMany(layerSettings.graphics);
					othis.insertLayer(layerProps, grlayer);	
				console.log(new Date().getTime()-othis.start.getTime());
					
			}
			else {
				grlayer.objectNames=objNames;
				grlayer.addMany(layerSettings.graphics);
			}
			grlayer.timeInfo= othis.getLayerTimeInfo(dates);
			setTimeout(function(){othis.startSatelliteMoveEx(); }, 2000);
			return grlayer;			
		},
		createSatelliteLayer2: function (layerSettings) {
			var othis = this, satellites=[], geomType = "point", done=false, dates=[],
				view=othis.getCurrentView(), insert=true, grlayer = othis.getCurrentMap().findLayerById(layerSettings.id);
			
			if(this.isTooltipEnabled())view.popup.dockEnabled=true;	
			layerSettings.graphics =[], nocountry=0;			
			
			function processRecords(layerSettings, records) {		
		
                records.forEach(function (r) {
					let s=Array.isArray(r) && r.length ? r[0] : null;
					if(!s)return;
					var obj = typeof(s) == 'object' ? s : s["name"];
					
                    if (obj && obj.geometry && obj.geometry.INTLDES) {
						let line1=null, line2=null;
                        var geom = {
                            type: geomType,
                            spatialReference: obj.spatialReference
                        }; 
						var attr = {}, ttObj={};
						line1=obj.geometry.LINE1, line2=obj.geometry.LINE2, 
						epoch = obj.geometry.hasOwnProperty("EPOCH") ? new Date(obj.geometry.EPOCH).getTime() : 0;
										
						period = obj.geometry.hasOwnProperty("PERIOD") ? parseInt(obj.geometry.PERIOD.trim(),10) : 0;					
			          	try {			            	
							geom = getOrbitPoints(line1, line2, 1, epoch,ttObj, null);
							if(geom) {
								geom.type=geomType;
								geom.spatialReference=obj.spatialReference;	
							}
							else nocountry++;
						}
			          	catch (error) {}								
						satellites.push({
	                        id: Number(line1.substring(2, 7)),
	                        satrec: ttObj.satrec,
	                        selected: false,
	                        highlighted: false,
	                        metadata: {
	                            int: obj.geometry.INTLDES,
	                            name: obj.geometry.OBJECT_NAME,
	                            country: obj.geometry.COUNTRY_CODE,
								countryName: obj.geometry.COUNTRY_NAME,
	                            period: period,
	                            inclination: Number(line2.substring(9,14)),
	                            apogee: obj.geometry.APOGEE,
	                            perigee: obj.geometry.PERIGEE,
								epoch: epoch,
								type: obj.geometry.OBJECT_TYPE,
								epShort: typeof(obj.geometry.EPOCH) == 'string' ? obj.geometry.EPOCH.substr(0, obj.geometry.EPOCH.search("T")) : obj.geometry.EPOCH,
	                      //      size: size,
	                            launch: obj.geometry.INTLDES.slice(0,8),
								alti: ttObj.alti,
								velo:ttObj.velo
	                        }
	                    });	   
						let date=  new Date(obj.geometry.INTLDES.slice(0,8)).getTime();
						if(!isNaN(date))dates.push(date);	
                        if(!grlayer.telDate || grlayer.telDate<epoch && !done) {
							grlayer.telDate=epoch; 
							done=true;
						}   
                        attr["ObjectID"] = U._generateUid();   
						if(Array.isArray(r) && r.length>1)                     
                        	othis.getSeriesTT(othis.getTT(layerSettings,attr), r[1]);
                    }// else nocountry++;
                });
            }
			var template=othis.getSatelliteTemplate(false);
			var currentElevationInfo = {
                mode: "absolute-height",
                offset: 0
            };
			
			if (layerSettings.records && Array.isArray(layerSettings.records)) {
				if(!grlayer){
					grlayer = new GraphicsLayer({ 
								renderer: othis.is3dView() ? layerSettings.renderer3d : layerSettings.renderer,
				                id: layerSettings.id,
				                title: layerSettings.component.title || layerSettings.id, 
				                opacity: Number(layerSettings.component.opacity),
								popupTemplate: template,
				                visible: layerSettings.component.visible});						
	              	
				}
				else {
					insert=false;
					othis.satRenderer.resetAll();	
					othis.hideTooltips();		
					if(othis.isTooltipEnabled())view.popup.close();	
				}					
                if(Array.isArray(layerSettings.records[0])){                    
                    layerSettings.records.forEach(function (rcds) {	
                        processRecords(layerSettings, rcds);                      
                    });
                }
                else
                    processRecords(layerSettings, layerSettings.records);                			
            }	
			if(!insert && othis.satRenderer) {
				othis.satRenderer.resetAll(); 
				ExternalRenderers.remove(
	                view,
	                othis.satRenderer
	         	);		
				delete othis.satRenderer;
				othis.satRenderer=null;
			}
			if(Array.isArray(satellites) && satellites.length) {
				othis.satRenderer = new satRenderer(satellites, $(".map-container-frame"),
				othis.getContext()+"/3rdparty_resources/satellite/worker.js",grlayer, layerSettings.groups, 
				othis.options.amperInfo, othis);
	           ExternalRenderers.add(
	                view,
	                othis.satRenderer
		         );		
		 		if(insert) {
					
					grlayer.elevationInfo = currentElevationInfo;	
					grlayer.timeInfo= othis.getLayerTimeInfo(dates);		
					 let layerProps = {
						dataLayer: true,
						component: layerSettings.component,
						id: layerSettings.id,           
		                chartLayer: layerSettings.chartLayer,      
						seriesInfo: layerSettings.seriesInfo, 
		                layer: grlayer,
						renderer: layerSettings.renderer,
						groups:layerSettings.groups
		            };
					othis.insertLayer(layerProps, grlayer);			
				}
			    else {
					//othis.satRenderer.reloadAll(satellites);
					othis.refresh=othis.refreshing=false;
				//	othis.refreshLayerOptions.refreshWidget({satRenderer:othis.satRenderer, layer:grlayer}); 
				if(layerSettings.optionObj)
					layerSettings.optionObj.refreshWidget({satRenderer:othis.satRenderer, layer:grlayer}); 
				}
			}
			else alert("no satellites found");
			console.log("nocountry " + nocountry);
			othis.wait(false);
		},
		updateStopName: function(rl, response) {
			for(let i = 0; i < rl.stops.length; i++) {  
				let stop=rl.stops.at(i);
				if(Number(parseFloat(response.location.latitude).toFixed(3)) === Number(parseFloat(stop.geometry.latitude).toFixed(3)) && 
					Number(parseFloat(response.location.longitude).toFixed(3)) === Number(parseFloat(stop.geometry.longitude).toFixed(3))) {
					rl.stops.at(i).name=response.address;
					break;	
				}
			}
		},
		updateStopsNames: function(rLayer) {
			var rl=rLayer;
			for(let i = 0; i < rl.stops.length; i++) {                    
                var stop=rl.stops.at(i), params = {
		          location: stop.geometry
		        };
				locator.locationToAddress(this.geocodingServiceUrl, params).then(
		          (response) => {
		            if (response) {
		              //stop.name=response.address;
						this.updateStopName(rl, response);
		            }
		          },
		          (err) => {
						console.log(err.message);
		          //  showPopup("No address found.", pt);
		          }
		        );
            }
		},
		createRouteLayer: function(layerSettings) {
			var othis=this, groupLayer=null, index=0, routs=[];
			function records2stops(records) {		
				var first=false, attr = {}, record=null;
                records.forEach(function (r) {
                    if (r["name"] && r["name"].geometry) {						
						let stops=[];
						if(Array.isArray(r["name"].geometry.paths)) {
							r["name"].geometry.paths.forEach(function (stop) {	
								stops.push({ locationType: "stop",  geometry: { x: stop[1][0], y: stop[1][1] } });					
								stops.push({ locationType: "stop",  geometry: { x: stop[0][0], y: stop[0][1] } });								
		                    });
						}
						var rl=new RouteLayer({ title:r["tooltip1"], stops, 
						defaultSymbols: getRouteDefaults()});
						rl.on("layerview-create", function(event){							
							othis.updateDirections(rl, "automobile");					        
						});
						rl.on("layerview-destroy", function(event){
						//	alert("layerview-destroy");					        
						});
						routs.push(rl);
					}
                });				
            }
			if (layerSettings.records && Array.isArray(layerSettings.records)) {
                if(Array.isArray(layerSettings.records[0])){
                    
                    layerSettings.records.forEach(function (rcds) {						
						records2stops(rcds);
                        index++;
                    });
                }
                else
                    records2stops(layerSettings.records);
				if(routs.length) {
					var fl=null;
					if(routs.length>1) {
						fl = new GroupLayer();
						fl.addMany(routs);
					}
					else
						fl = routs[0];
                    fl.id=layerSettings.id;
					fl.id=layerSettings.id;
					fl.title=layerSettings.component.title || layerSettings.id;
					fl.blendMode=layerSettings.component.blendMode || "normal";
					fl.effect=layerSettings.component.effect || "";
					fl.opacity=Number(layerSettings.component.opacity);
					fl.visible=layerSettings.component.visible;
	                var layerProps = {
						dataLayer: true,
						component: layerSettings.component,
	                    id: layerSettings.id,
	                    defaultRenderer: null,  
						renderer: null, 
						renderer3d: null,    
	                    chartLayer: layerSettings.chartLayer,      
						seriesInfo: layerSettings.seriesInfo,              
	                    layer: null
	                };
	               
	                if(layerSettings.WF_menu)
	                    layerProps.WF_menu=layerSettings.WF_menu;
					let temp = othis.updating;
					othis.updating=false;
	                othis.insertLayer(layerProps, fl, null, temp);
				}				
            }
		},
		addTimeField: function(record, attr, layerSettings, dates) {				
			if(typeof(record) ==='object') {
				let tUse=record.hasOwnProperty("time_std") && record.time_std ? "time_std" : "time";
				if(record.hasOwnProperty(tUse)) {
					let val=record[tUse], date=new Date(val), mtime=date.getTime();
					if(layerSettings.fields) {
						let found= layerSettings.fields.filter(function (field) {
				        	return field["type"] === 'date';
					    });
		                if(!found || found.length==0) {
							layerSettings.fields.push({"alias": getTransString("dateField"), "name": "time", "type":"date", "valueType" : "date-and-time"});
						}	
					}
					
					attr['time']=mtime;	
					dates.push(mtime);	
				}
			}
		},
        createLayerFromData: function (layerSettings, geometryType) {
            var othis = this, G = [], geomType, /*uRenderer = null,*/ uvi=[], index=0, arrGeom=[],images=[], dates=[], sizeField=null,hasZ=false, firstTime=true,
				view3D=othis.is3dView(), colorField=null, colorFieldInd=-1, view=othis.getCurrentView();			
			var vvars=layerSettings.renderer3d.visualVariables, bUnqR= layerSettings.renderer && layerSettings.renderer.type==="unique-value" && !layerSettings.sBreakGeo;
            if(vvars) {                
                for(var i = 0; i < vvars.length; i++) {                    
                    if(vvars[i].type == "size") {
                        sizeField=vvars[i].field;
                    }
					else if(vvars[i].type == "color") {
                        colorField=vvars[i].field;
						for(let h=0; h<layerSettings.fields.length;h++){
			                if(layerSettings.fields[h].name==colorField){
			                    colorFieldInd=h;
			                    break;
			                }
			            }    
                    }
                }
            }  
          //  if (layerSettings.component.heatmap) 
         //       othis.setHeatMapRenderer(layerSettings);
            if (geometryType === "bubble") {
                geomType = "point";
            } else if (geometryType === "line") {
             //   layerSettings.renderer.symbol.width = "4px";
                geomType = "polyline";
            } else {
                geomType = "polygon";
            }
			var dataLObj = this.getSeriesDataLabel(layerSettings), labelClass=this.createLayerLabelInfo(dataLObj, geomType), labelState=labelClass.labelState;
			function getEqualGeometry(geom,arrGeom) {
				for(let ii = 0; ii < arrGeom.length; ii++) {                    
                    if(arrGeom[ii].geometry && geometryEngine.equals(geom, arrGeom[ii].geometry))
                        return arrGeom[ii];
                }
				return null;
			}
			
			function addSliceField(slicefield, alias) {
				let found= layerSettings.fields.filter(function (field) {
			        return field["name"] === slicefield;
			    });
                if(!found || found.length==0)
                	layerSettings.fields.push({"alias": alias, "name": slicefield, "type":"double"});
            }   
			function processRecordsPolyline(layerSettings, records) {		
				var first=false, paths=[], attr = {}, record=null, geom = {
                    type: geomType                    
                };
                records.forEach(function (r) {
                    if (r["name"] && r["name"].geometry) {
						if(!first) {
							first=true;
							hasZ=r["name"].geometry.hasOwnProperty("z");
							geom.spatialReference= r["name"].spatialReference;
							
	                        attr["ObjectID"] = U._generateUid();                        
	                        var n1 = layerSettings.fields.length > 2 ? 1 : 0, n2 = layerSettings.fields.length > 2 ? 2 : 1;
	
	                        var t1 = r["name"], t2 = r["value"], t3 = r["color"];
	                        if (U._isNumber(t1))
	                            layerSettings.fields[n1].type = "double";
	                        if (U._isNumber(t2 ? t2 : t3))
	                            layerSettings.fields[n2].type = "double";
	                        
	                        attr[layerSettings.fields[n2].name] = t2 || t3 || othis.getSeriesLabel(layerSettings, index);
	                        if(layerSettings.renderer.field)
	                            attr[layerSettings.renderer.field] = t2;
							record=r;
						}
						if(r["name"].geometry.paths) {
							geom.paths=r["name"].geometry.paths;
							var g = new Graphic({
			                    geometry: geom,
			                    attributes: attr
			                });
							if(!hasZ) {
			                    var popTc = othis.getSeriesTT(othis.getTT(layerSettings,attr), r);
			                    if (popTc && othis.isTooltipEnabled()) {
			                        $(popTc).find("ul").css("list-style-type", "none");
			                        var popupTemplate = {
			                            content: popTc
			                        };
			                        g.popupTemplate = popupTemplate;
			                    }
							}
			                G.push(g);
						}							
						else
							paths.push([r["name"].geometry.x,r["name"].geometry.y,r["name"].geometry.z]);                        
                    }
                });
				if(paths.length) {
					geom.paths=paths;
					var g = new Graphic({
	                    geometry: geom,
	                    attributes: attr
	                });
					if(!hasZ && othis.isTooltipEnabled()) {
	                    var popTc = othis.getSeriesTT(othis.getTT(layerSettings,attr), record);
	                    if (popTc) {
	                        $(popTc).find("ul").css("list-style-type", "none");
	                        var popupTemplate = {
	                            content: popTc
	                        };
	                        g.popupTemplate = popupTemplate;
	                    }
					}
	                G.push(g);
				}				
            }
            function processRecords(layerSettings, records) {	
                records.forEach(function (r) {
                    if (r["name"] && r["name"].geometry) {
						hasZ=r["name"].geometry.hasOwnProperty("z");						
                        var geom = {
                            type: geomType,
                            spatialReference: r["name"].spatialReference
                        }; 
						var attr = {}, data=JSON.parse(JSON.stringify(r));
						delete data['_s']; delete data['_g']; delete data['name']; 
						attr['data']=JSON.stringify(data);
						othis.addTimeField(r,attr, layerSettings, dates);
                        if (geomType == "polygon") 
                            geom.rings = r["name"].geometry.rings;
                        else if (geomType == "point") {							
							geom.x = r["name"].geometry.x;
                        	geom.y = r["name"].geometry.y;		
							if(hasZ)
								geom.z = r["name"].geometry.z;
                        }						
                       
                        attr["ObjectID"] = U._generateUid();                        
                        var n1 = layerSettings.fields.length > 2 ? 1 : 0, n2 = layerSettings.fields.length > 2 ? 2 : 1;

                        var t1 = r["name"], t2 = r["value"], t3 = r["color"];
                        if (U._isNumber(t1))
                            layerSettings.fields[n1].type = "double";
                        if (U._isNumber(t2 ? t2 : t3))
                            layerSettings.fields[n2].type = "double";
                      //  if(t3===0)
					//		t3=0.1;
                        attr[layerSettings.fields[n2].name] = t2 || t3 || othis.getSeriesLabel(layerSettings, index);
                        if(layerSettings.renderer.field)
                            attr[layerSettings.renderer.field] = typeof(t3) != 'undefined' ? t3 : othis.getSeriesLabel(layerSettings, index);
						else if(colorField && typeof(t3) != 'undefined'){
							attr[colorField] = t3;
							if (U._isNumber(t3) && colorFieldInd!=-1)
                            	layerSettings.fields[colorFieldInd].type = "double";
						}				
				
						if(r['value'])
						console.log(r['value']);
                        geom = (geomType != "polygon" || !geom.rings) ? geom : othis.doSimplifyGeom(geom, attr[layerSettings.fields[n2].name]);
						if(r.hasOwnProperty("icon") && layerSettings.iconFname){
							var img=r.icon, found=false, imgShort=img,
							ind = img.lastIndexOf("/"), indexDot = img.lastIndexOf(".");
					        if (ind != -1)
					            imgShort= img.slice(ind + 1, (indexDot != -1 ? indexDot : img.length));
							for(var ii = 0; ii < images.length; ii++) { 
								if(images[ii]==img) {
									found=true;
									break;
								}
							}
							if(!found){
								images.push(img);
	                            uvi.push({value: imgShort,symbol: othis.updateSymbol(img, layerSettings.renderer.symbol)});
							}
							attr[layerSettings.iconFname]=imgShort;
						} 
						let tempGraph = layerSettings.fieldsInfo.length>1 ? getEqualGeometry(geom,arrGeom) : null;
						if(layerSettings.renderer.type=="pie-chart") {
							let field2use2=(sizeField ? sizeField : layerSettings.renderer.field)+"_"+attr[layerSettings.renderer.field].replace(/[ .]/g, "_");
							if(tempGraph)tempGraph.attributes[field2use2] = sizeField ? attr[sizeField] : 10;
							else attr[field2use2] = sizeField ? attr[sizeField] : 10;
							addSliceField(field2use2, attr[layerSettings.renderer.field]);
						}
						var popTc = othis.getSeriesTT(othis.getTT(layerSettings,attr), r);
						if(!tempGraph) {
							var g = new Graphic({
	                            geometry: geom,
	                            attributes: attr
	                        });
							if(!hasZ && othis.isTooltipEnabled()) {		                        
		                        if (popTc) {
		                            $(popTc).find("ul").css("list-style-type", "none");
		                            var popupTemplate = {
		                                content: popTc
		                            };
		                            g.popupTemplate = popupTemplate;
		                        }
							}
	                        G.push(g);
							arrGeom.push(g);
						}
                        else {
							if(tempGraph && tempGraph.attributes) {
								if(sizeField && tempGraph.attributes[sizeField] < attr[sizeField])
									tempGraph.attributes[sizeField]=attr[sizeField];
								if (popTc)
								mergePopupTemplate(tempGraph,popTc,othis.options.inheritEsriTheme);
								if(layerSettings.renderer.uniqueValueInfos && layerSettings.renderer.uniqueValueInfos.length) {
									if(layerSettings.renderer.type=="unique-value")
									tempGraph.attributes[layerSettings.renderer.field]=layerSettings.renderer.uniqueValueInfos[0].value;		
									if(layerSettings.renderer3d.type=="unique-value")
										tempGraph.attributes[layerSettings.renderer3d.field]=layerSettings.renderer3d.uniqueValueInfos[0].value;	
								}							
							}
						}
                    }
                });
            }
            if (layerSettings.records && Array.isArray(layerSettings.records)) {
                if(Array.isArray(layerSettings.records[0])){
                    
                    layerSettings.records.forEach(function (rcds) {
						if(geomType == "polyline")
							processRecordsPolyline(layerSettings, rcds);
						else
                        	processRecords(layerSettings, rcds);
                        index++;
                    });
                }
                else
                    processRecords(layerSettings, layerSettings.records);
				
				if(Array.isArray(uvi) && uvi.length) {
					layerSettings.renderer.uniqueValueInfos=uvi;
					layerSettings.renderer3d.uniqueValueInfos=uvi;
				}
				if(hasZ){
					if(layerSettings.renderer3d) {
			            var vvars=layerSettings.renderer3d.visualVariables;
			            if(vvars) {                
			                for(var i = 0; i < vvars.length; i++) {                    
			                    if(vvars[i].type == "size") {
			                        layerSettings.sizeVisVar=vvars[i];
			                        vvars.splice(i, 1);
			                        break;
			                    }
			                }
			            }  
					}
				}
				if(layerSettings.renderer.type=="unique-value" || layerSettings.renderer3d.type=="unique-value") {
					for(var tt=0; tt<layerSettings.fields.length;tt++){
		                if(layerSettings.fields[tt].name==layerSettings.renderer.field){
		                    layerSettings.fields[tt].type="string";
		                    break;
		                }
		            }    
				}
				
				//
                var fl = new FeatureLayer({
                    fields: layerSettings.fields,
                    renderer: othis.is3dView() ? layerSettings.renderer3d : layerSettings.renderer,
                    id: layerSettings.id,
                    title: layerSettings.component.title || layerSettings.id,
                    source: G,
					blendMode: layerSettings.component.blendMode || "normal",
					effect: layerSettings.component.effect || "",
                    geometryType: geomType,
                    opacity: Number(layerSettings.component.opacity),
                    visible: layerSettings.component.visible,
					minScale: layerSettings.component.minScale,
					maxScale: layerSettings.component.maxScale,
					timeInfo: othis.getLayerTimeInfo(dates)
                });
				if(layerSettings.component.hasOwnProperty("featureEffect"))
					fl.featureEffect=layerSettings.component.featureEffect;
                if (layerSettings.component.heatmap && layerSettings.component.heatmap.enable)
					this.createHeatmapRenderer(fl, null, null, null, null, null, layerSettings.component);		
				if(hasZ || !othis.isTooltipEnabled()) {
					fl.popupTemplate = fl.createPopupTemplate();
					fl.popupEnabled=true;
				}
                if (geomType == "point")
                    othis.setClustering(layerSettings,fl);
                
	            if(layerSettings.labelField || layerSettings.valueField) { 
	                var labels = "$feature." + (layerSettings.labelField ? layerSettings.labelField : layerSettings.valueField); 
	                
	                if(layerSettings.valueField && layerSettings.labelField){
	                    labels += "+TextFormatting.NewLine+";
	                    labels += "$feature." + layerSettings.valueField; 
	                }
	                labelClass.labelExpressionInfo = dataLObj.visible==true ? { expression: labels } : { expression: "" };
	                fl.labelingInfo = [labelClass];
	            }
                var layerProps = {
					dataLayer: true,
					component: layerSettings.component,
                    id: layerSettings.id,
                    defaultRenderer: othis.getDefaultRenderer(layerSettings.defaultRenderer, fl),  
					renderer: layerSettings.renderer, 
					renderer3d: layerSettings.renderer3d,    
                    chartLayer: layerSettings.chartLayer, 
					 labelField: layerSettings.labelField, 
                	labelOrgVisible: dataLObj.visible==true,        
					seriesInfo: layerSettings.seriesInfo,              
                    layer: null
                };
				var currentElevationInfo = {
                    mode: "relative-to-scene",
                    offset: 0,
                 
                    unit: "meters"
                };
                fl.elevationInfo = currentElevationInfo;
                if(layerSettings.WF_menu)
                    layerProps.WF_menu=layerSettings.WF_menu;
                othis.insertLayer(layerProps, fl,G);
				fl.on("layerview-create", (event)=> {
			 	//	this.setTimeExtentEx(event.layerView.layer);
				});
            }
        },
		getLayerTimeInfo: function(dates) {
			let layerTimeInfo=null;
			if(Array.isArray(dates)) {
				var sortValues = function (first, second) {		           
		            var valueFirst = first, valueSecond = second;					
		            if (valueFirst && valueSecond) {
						if (valueSecond == valueFirst)
                			return 0;
            			return valueFirst > valueSecond ? 1 : -1;
					}		                
		            return 0;
		        }.bind(this);
		        dates.sort(sortValues);
				layerTimeInfo={
					startField: "time",
					endField: "time",
					fullTimeExtent: {
					    start: new Date(dates[0]),
					    end: new Date(dates[dates.length-1])
					},
				
					useTime: false
				};
			}
			return layerTimeInfo;
		},
        setClustering: function(layerSettings, fl) {
           
			if(!layerSettings.component)
				layerSettings.component={featureReduction:""};
			if(layerSettings.component) {
				let clstr=layerSettings.component.cluster, bin=layerSettings.component.binning, colors = ["#d7e1ee", "#cbd6e4", "#b3bfd1", "#c86558", "#991f17"],
				rendColor=layerSettings.renderer && layerSettings.renderer.symbol && layerSettings.renderer.symbol.color ? 
					layerSettings.renderer.symbol.color : "green", vvars=fl.renderer ? fl.renderer.visualVariables : [];
	            layerSettings.component.featureReductionCluster={
	                type: "cluster",
	                clusterRadius: typeof(clstr) === 'object' && clstr.hasOwnProperty("clusterRadius") ? 
	                					clstr.clusterRadius : 60,
	                labelsVisible: typeof(clstr) === 'object' && clstr.hasOwnProperty("labelsVisible") ?
	                					clstr.labelsVisible : true,
					clusterMinSize :typeof(clstr) === 'object' && clstr.hasOwnProperty("clusterMinSize") ?
	                					clstr.clusterMinSize : 16,
					clusterMaxSize :typeof(clstr) === 'object' && clstr.hasOwnProperty("clusterMaxSize") ?
	                					clstr.clusterMaxSize : 37.5,
					labelingInfo: [{
					    labelExpressionInfo: {
					      expression: "$feature.cluster_count"
					    },
					    deconflictionStrategy: "none",
					    labelPlacement: "center-center"
					  }]
					
	            }; 
				let labelInfo=typeof(bin) === 'object' && bin.hasOwnProperty("labelingInfo") ? bin.labelingInfo[0] : null,
				 minScale=labelInfo && labelInfo.hasOwnProperty("minScale") ? labelInfo.minScale : 0,
				 maxScale=labelInfo && labelInfo.hasOwnProperty("maxScale") ? labelInfo.maxScale : 0,
				 stops = bin && bin.hasOwnProperty("stops") ? bin.stops : [];
				if(stops.length==0 && vvars) {
					for(let i = 0; i < vvars.length; i++) {                    
	                    if(vvars[i].type == "color") {
							for(let k = 0; k < vvars[i].stops.length; k++)
	                        	stops.push({ value: k*10, color: vvars[i].stops[k].color });
							break;
	                    }
	                }  
					if(stops.length==0) 
						stops.push({ value: 1, color: rendColor });   
				}
				layerSettings.component.featureReductionBin=new FeatureReductionBinning({
	               // type: "binning",
					fields: [
			          new AggregateField({
			            name: "aggregateCount",
			            statisticType: "count",
						alias: getTransString("features_number")
			          })
			        ],
	                fixedBinLevel : typeof(bin) === 'object' && bin.hasOwnProperty("fixedBinLevel") ? 
	                					bin.fixedBinLevel : 3,
					labelsVisible: typeof(bin) === 'object' && bin.hasOwnProperty("labelsVisible") ?
	                					bin.labelsVisible : true,
					labelingInfo: [{
						minScale: minScale,
            			maxScale: maxScale,
						deconflictionStrategy: "none",
					/*	symbol: {
			              type: "text",  // autocasts as new TextSymbol()
			              color: "white",
			              font: {
			                family: "Noto Sans",
			                size: 10,
			                weight: "bold"
			              },
			              haloColor: colors[4],
			              haloSize: 0.5
			            },*/
					    labelExpressionInfo: {
					      expression: "$feature.aggregateCount"
					    },
					    labelPlacement: "center-center"
					  }
					],
					 renderer:{
					  type: "simple",  
					  symbol: {
					    type: "simple-fill", 
					    outline: { 
					      width: 0.5,
					      color: "white"
					    }
					  },
					  visualVariables: [{
					    type: "color",
					    field: "aggregateCount",
					    stops: stops
					  }]
					}
	            });   
	            if(fl.renderer && vvars) {
	                for(var i = 0; i < vvars.length; i++) {                    
	                    if(vvars[i].type == "size") {
	                        layerSettings.sizeVisVar=vvars[i];
	                        if(layerSettings.component.cluster && layerSettings.component.cluster.enable)
	                            vvars.splice(i, 1);
	                        break;
	                    }
	                }        
		            if(fl.renderer.type!="heatmap" && layerSettings.component.cluster && layerSettings.component.cluster.enable) {
						fl.featureReduction = layerSettings.component.featureReductionCluster;
						this.onUpdateFieldAlias(fl);
					}		                
					if(fl.renderer.type!="heatmap" && layerSettings.component.binning && layerSettings.component.binning.enable)
		                fl.featureReduction = layerSettings.component.featureReductionBin;
				}
			}		
        },
		onUpdateFieldAlias: function(layer) {
			if(Array.isArray(layer.featureReduction.fields)) {
				layer.featureReduction.fields.forEach((field)=> {
					if(field.onStatisticField) {
						layer.fields.forEach((fieldL)=> {
							if(field.onStatisticField==fieldL.name) {
								field.alias=fieldL.alias;
							}
						});
					}
				});
			}
			if(layer.renderer.type=="unique-value" && !this.options.bubbleUniqueMix && !layer.renderer.defaultSymbol) {
				for (let p = 0; p< layer.renderer.uniqueValueInfos.length; ++p){
					let uvi=layer.renderer.uniqueValueInfos[p];
					layer.renderer.defaultSymbol=uvi.symbol.clone();	
					break;
				}
			}
		},
		isLayerLoaded2: function(name, title) {
			var othis=this, ret=false;
			for(var k = 0; k<othis.layerList.length; k++){
				if(othis.layerList[k].component.fileOrName == name || 
						(othis.layerList[k].layer && othis.layerList[k].layer.title == title)) {
					othis.layerList[k].component.fileOrName=name;
					ret=true;	
					break;
				}
			}
			if(!ret) {
				if(othis._map && othis._map.component && (othis._map.component.fileOrName == name || 
					othis._map.component.title == title)) {
					othis._map.component.fileOrName=name;
					ret=true;		
				}
				if(!ret && othis._map3d && othis._map3d.component && (othis._map3d.component.fileOrName == name || 
					othis._map3d.component.title == title)) {
					othis._map3d.component.fileOrName=name;
					ret=true;		
				}
			}
			return ret;
		},
		getLayersInfo: function(content, components, demographic, dynamic, groups, parent){ 
			var othis=this, map=othis.getCurrentMap(), view = othis.getCurrentView();
			if(!parent && map.component) {
				var overl={};
				overl.ibiAddLayer=map.component.fileOrName;
				overl.options= {index:-1};
				demographic.push(overl);
			}
			var leyArr=[],index=0;
			if(!parent)parent=map;
            parent.layers.forEach(function(layer){ leyArr.push(layer); });
            leyArr.forEach(function(layer){
				let onList=false;
                for(var k = 0; k<othis.layerList.length; k++){
                    if (othis.layerList[k].id == layer.id) {
						onList=true;
						index++;
                        if(othis.layerList[k].hasOwnProperty("dataLayer")){
							if(content) {
								var compName=layer.id;
								if(othis.layerList[k].hasOwnProperty("compName"))
									compName=othis.layerList[k].compName;
								else if(othis.layerList[k].component.hasOwnProperty("fileOrName")) {
									var nameFromFile=fileName(othis.layerList[k].component.fileOrName);
									compName= nameFromFile ? nameFromFile.toUpperCase() : "";
									othis.layerList[k].compName=compName;
								}							
								content.push("EMBED COMPONENT AS " + compName);
								content.push("-INCLUDE " + othis.layerList[k].component.fileOrName);
								///////////
								components.push("*GRAPH_JS");
								components.push("*COMPONENT "+compName);
								var comp={component:{title: layer.title, opacity : layer.opacity, visible:layer.visible, index:index, path:othis.layerList[k].component.fileOrName}};
								if(othis.layerList[k].id==othis.options.layerToZoom)
									comp.component.zoomToOnLoad=true;
								components.push(json2Text(comp)); 
								components.push("*END");
							}
							else {
								var overl={};
								overl.ibiAddLayer=othis.layerList[k].id || othis.layerList[k].name;
								overl.options= {opacity : layer.opacity, visible:layer.visible, index:index, 
									blendMode: layer.blendMode, effect: layer.effect};
								if(othis.layerList[k].id==othis.options.layerToZoom)
									overl.options.zoomToOnLoad=true;
								if(othis.layerList[k].optionObj) {
									overl.options.filters=othis.layerList[k].optionObj.doGetFilters2();
									overl.options.filtersValues=othis.layerList[k].optionObj.doGetFilters();
								}
								else
									overl.options.filtersValues=overl.options.filters=false;
								if(layer.featureEffect) overl.options.featureEffect=layer.featureEffect.toJSON();
								demographic.push(overl);
							}
						}
						else if(othis.layerList[k].hasOwnProperty("dynLObj") && othis.layerList[k].dynLObj.hasOwnProperty("dLayer")) {
							//othis.layerList[k].dynLObj.component=othis.layerList[k].component;
							//dynamic.push(othis.layerList[k].dynLObj);
							var dlayer=othis.layerList[k].dynLObj.dLayer, found=false;
							for(var n = 0; n<dynamic.length; n++){
								if(dynamic[n]["path"]==dlayer["path"]){
									found=true;
									break;
								}
							}
							if(!found)dynamic.push(dlayer);
						}
						if(layer.type == "group") {
							let lrsIn=[], subLayers=[];
							layer.layers.forEach(function(layerInTheGrp){
								let set = othis.getLayerSettings(layerInTheGrp.id || layerInTheGrp.name);
								if(set)lrsIn.push(set.id || set.name);
								else if(layerInTheGrp.type == 'feature') {
									var overl={ blendMode: layerInTheGrp.blendMode, effect: layerInTheGrp.effect };
									if(layerInTheGrp.featureEffect) overl.featureEffect=layerInTheGrp.featureEffect.toJSON();
									subLayers.push(overl);
								}
							});
							if(lrsIn.length) {
								groups.push({
									"title": layer.title,
					                "layers": lrsIn,
					                "blendMode": layer.blendMode,
					                "effect": layer.effect 							
								});
								othis.getLayersInfo(content, components, demographic, dynamic,groups, layer);
							}	
							else if(subLayers.length) {
								var overl={};
								overl.ibiAddLayer=othis.layerList[k].component.name;
								overl.options= {opacity : layer.opacity, visible:layer.visible, index:index, 
									blendMode: layer.blendMode, effect: layer.effect, sublayers: subLayers};
								demographic.push(overl);
							}						
						}
						else if(!othis.layerList[k].hasOwnProperty("dataLayer")){
							var overl={};
							overl.ibiAddLayer=othis.layerList[k].component.name;
							overl.options= {opacity : layer.opacity, visible:layer.visible, index:index, 
								blendMode: layer.blendMode, effect: layer.effect};
							if(othis.layerList[k].id==othis.options.layerToZoom)
								overl.options.zoomToOnLoad=true;
							if(layer.renderer && (layer.renderer.type == "flow" || layer.renderer.type == "raster-stretch")) {
								overl.options.renderer=layer.renderer.toJSON();		
								overl.options.renderer.type=layer.renderer.type;					
							}
							if(layer.featureEffect) overl.options.featureEffect=layer.featureEffect.toJSON();
							demographic.push(overl);
						}
                        break;
                    }
                }
				if(!onList) {
					if(layer.type == 'route' && layer.routeInfo && layer.portalItem && layer.id != defaultRouteLayerId) {
						let overl={
							portalid:layer.portalItem.id, 
							title: layer.title,
							apikey : layer.apiKey,
							visible : layer.visible,
							opacity : layer.opacity
						};					
						demographic.push(overl);
					}
					else if(layer.id==defaultGraphicsLayerId) {
						let grs=[];
						layer.graphics.forEach((graphic)=> {
							grs.push(graphic.toJSON());
						});
						var overl={ id : defaultGraphicsLayerId, title: layer.title,
								opacity : layer.opacity, visible:layer.visible, 
								blendMode: layer.blendMode, effect: layer.effect,
							graphics:grs };
						
						demographic.push(overl);
					}
					else if(layer.type == 'feature') {
						var overl={ opacity : layer.opacity, visible:layer.visible, 
								blendMode: layer.blendMode, effect: layer.effect };
						if(layer.featureEffect) overl.featureEffect=layer.featureEffect.toJSON();
						demographic.push(overl);
					}
				}
            });            
		},
		addIncludedLayersScripts: function(content, components){
			if(Array.isArray(content) && Array.isArray(components)) {
				components.forEach(function(item){
					content.push(item);
				});
			}
		},
		getMapTitle: function(){
			if($(this.devTools)) return $(this.devTools).geoUIDevTools("mapTitle");
			return  "";
		},
		addMainInfo: function(exteCoreObj,demographic,dynamic){
			var othis=this, map= othis.getCurrentMap(), view = othis.getCurrentView();
			if(Array.isArray(demographic))
				exteCoreObj.overlayLayers=demographic;
			if(Array.isArray(dynamic))
				exteCoreObj.dynamicLayers=dynamic;
			//exteCoreObj.viewType =this._currentViewType;
			if(othis.is3dView())
				exteCoreObj.baseLayer= { "camera":othis.doCopyCamera(true) };
			else if(view.center)
				exteCoreObj.baseLayer= { "center" : [parseInt(view.center.longitude,10),parseInt(view.center.latitude,10)], "zoom": parseInt(Math.round(view.zoom),10) };
			var basemapName= othis.basemapTitle2Name(map.basemap);	
			exteCoreObj.baseMapInfo= { "customBaseMaps":[ { "ibiBaseLayer": basemapName, 
					"basemapPortalId": map.basemap && map.basemap.portalItem ? map.basemap.portalItem.id : "" }]};
		//	if(map.portalItem && map.portalItem.id)
		//		exteCoreObj.portalId=map.portalItem.id;
			othis.saveSpecialWidgetState(exteCoreObj,"basemaps");
			othis.saveSpecialWidgetState(exteCoreObj,"layers");
			othis.saveSpecialWidgetState(exteCoreObj,"legend");
		},
		addMainInfoBookmarks: function(exteCoreObj,demographic, groups, timeExtent){
			var othis=this, map= othis.getCurrentMap(), view = othis.getCurrentView(), mapProp='mapProp'; exteCoreObj[mapProp]={};
			if(Array.isArray(demographic))
				exteCoreObj.layers=demographic;			
		/*	if(othis.is3dView()) {
				exteCoreObj[mapProp].baseLayer= { "camera":othis.doCopyCamera(true), "zoomType": "camera"};
				exteCoreObj[mapProp].viewType='3d';
			}				
			else if(othis.options.layerToZoom)
				exteCoreObj[mapProp].baseLayer= { "zoomToOnLoad": othis.options.layerToZoom, "zoomType": "layer"};		
			else
				exteCoreObj[mapProp].baseLayer= { "center" : [parseInt(view.center.longitude,10),parseInt(view.center.latitude,10)], 
						"zoom": parseInt(Math.round(view.zoom),10), "zoomType": "center-zoom" };	*/
			exteCoreObj[mapProp].viewType=othis.getWidgetProperties("viewType");
			exteCoreObj[mapProp].spatialReference=view.spatialReference.toJSON();
			exteCoreObj[mapProp].viewpoint=view.viewpoint.toJSON();	
			if(view.environment)
			exteCoreObj[mapProp].environment=view.environment.toJSON();		
			if(groups.length)
				exteCoreObj[mapProp].groups=groups;
			var comp=view.ui.find('timeslider');	
			if(timeExtent) {
				if(comp && comp.fullTimeExtent)
					exteCoreObj[mapProp].fullTimeExtent= comp.fullTimeExtent.toJSON();
				exteCoreObj[mapProp].timeExtent=timeExtent.toJSON();
				//save timeslider state
				exteCoreObj[mapProp].timeslider={
					mode: comp.mode,
					loop: comp.loop,
					playRate: comp.playRate,
					timeVisible: comp.timeVisible,
					layout: comp.layout,
					stops: {}
				};
				if(comp.stops.count)
					exteCoreObj[mapProp].timeslider.stops.count=comp.stops.count;
				if(comp.stops.interval) {
					exteCoreObj[mapProp].timeslider.stops.interval={
						value:comp.stops.interval.value,
						unit:comp.stops.interval.unit
					};
				}
			}
			var basemapName= othis.basemapTitle2Name(map.basemap);	
			exteCoreObj[mapProp].baseMapInfo= { "customBaseMaps":[ { "ibiBaseLayer": basemapName, 
					"basemapPortalId": map.basemap && map.basemap.portalItem ? map.basemap.portalItem.id : "" }]};
		},
		saveSpecialWidgetState: function(prop,wId) {
			var othis=this, view =othis.getCurrentView(), comp=view.ui.find(wId), 
			cont= comp ? $(comp.container) : null;
			if(cont)
				prop[wId].visible=cont.is(":visible");
		},
		getContentToSave: function() {
			var othis=this, map= othis.getCurrentMap(), view = othis.getCurrentView(), content =[], 
				components=[], demographic=[], groups=[],
				dynamic=[],title=othis.getMapTitle();
			
			content.push("EMBED BEGIN PCHOLD FORMAT JSCHART");
		    othis.getLayersInfo(content,components,demographic,dynamic, groups, null);
		    content.push("EMBED MAIN");
		    content.push("GRAPH FILE SYSCOLUM");
		    content.push("HEADING CENTER");
		    content.push('"' + title + '"'); 
		    content.push("SUM CNT.TBNAME");
		    content.push("IF READLIMIT EQ 1");
		    content.push("ON GRAPH HOLD FORMAT JSCHART");
		    content.push("ON GRAPH SET LOOKGRAPH BUBBLEMAP");
		    content.push("ON GRAPH SET AUTOFIT ON");
		    content.push("ON GRAPH SET STYLE *");
		    content.push("CHART-LOOK=com.ibi.geo.map, $");
		    content.push("TYPE=DATA, COLUMN=N1, BUCKET=NULL, $");
			othis.addIncludedLayersScripts(content,components);
			content.push("*GRAPH_JS_FINAL");
			var mainObj={};
			othis.options.Settings.properties.mapTitle=title;
			mainObj.extensions={"com.ibi.geo.map": othis.options.Settings.properties}; 
			othis.addMainInfo(mainObj.extensions["com.ibi.geo.map"],demographic,dynamic);
			content.push(json2Text(mainObj)); 
			content.push("*END");
			content.push("ENDSTYLE");
			content.push("END");
			content.push("EMBED END");
			return content.join("\n");
		},
		getViewImage: function() {
			this.updateScreenShot(true, true);
			return this.screeshotURL ? this.screeshotURL : null;
		},
		updateScreenShot: function(bShow, bImageOnly) {
			var othis=this, view = this.getCurrentView();
			if(view && view.ready && bShow){
				view.takeScreenshot().then(function(screenshot) {
					othis.screeshotURL=screenshot.dataUrl;					
					if(!bImageOnly && othis.ssImage) 						
						othis.ssImage.css({'background-image':"url("+screenshot.dataUrl+")", 'z-index':100, 'display':'block'});
				});
			}
			else if(othis.ssImage)
				othis.ssImage.css({'background-image':"", 'z-index':-1, 'display':'none'}); 
		},
		doRefreshPreviewLayerEx: function(oPreview, preMode){
			if(oPreview) {
				var  othis=this, newScript="", re = /\ /g, layerId=typeof(oPreview.single_layerMap_id) === 'string' ? oPreview.single_layerMap_id.replace(re, "_") : "";
				if(!layerId || othis.layerList.length==0) {
					othis.doRefreshPreviewMapProp(oPreview, preMode);
					return;
				}				
				othis.loadingFiles=[];		
				othis.dynLObj=null; 
	            for(var k = 0; k<othis.layerList.length; k++){
	                if (othis.layerList[k].id == layerId) {                 
	                    othis.dynLObj=othis.layerList[k]; 
						othis.refresh=true;
	                    break;
	                }
	            }
				if(Array.isArray(oPreview.scriptBlocks)) {		
					othis.viewTypeB4=	othis.getWidgetProperties("viewType");				
					var look1="var script", look2="chart.set";othis.wait(true);
					for (var i=0;i<oPreview.scriptBlocks.length;++i){
						var script = oPreview.scriptBlocks[i].scriptBlocks, exp=new RegExp("this\._", "g");
						if(i==0){
							let ind1=script.search(look1), ind2=script.lastIndexOf("}"), temp="";
							if(ind1!=-1 && ind2!=-1) {
								temp=script.substr(ind1, ind2 - ind1);
								var remInd=temp.search("if [(]tdgchart\.WF_charts"), endRem=temp.search("chart\.title");
								if(remInd!=-1 && endRem!=-1)
									temp=temp.replace(temp.slice(remInd,endRem),"").replace(exp,"");
							}
							newScript+=temp;
						}
						else {
							ind1=script.search(look2), ind2=script.lastIndexOf("}");
							if(ind1!=-1 && ind2!=-1)
								newScript+=script.substr(ind1, ind2 - ind1).replace(exp,"");
						}
					}
					othis.doAddDataLayerExCont(newScript, layerId);
				}
				else if(othis.dynLObj) {
					othis.removeLayer(layerId,true);
					othis.dynLObj=null; othis.refresh=false;
				}
			}		
		},
		doRefreshPreviewMapProp: function(oPreview, preMode) {
			if(oPreview) {
				var  othis=this, newScript="", re = /\ /g, layerId=typeof(oPreview.single_layerMap_id) === 'string' ? oPreview.single_layerMap_id.replace(re, "_") : null;
				othis.loadingFiles=[];
				othis.previewMode=preMode; 
				othis.dynLObj=null; 
				othis.viewTypeB4=	othis.getWidgetProperties("viewType");
				if(typeof(oPreview) == 'object' && oPreview.hasOwnProperty("mbscript")) {
					let script=oPreview["mbscript"];
					if(typeof(script) == 'string'){
						
						let look2="[)];", look1='"extensions"', ind1=script.search(look1), ind2=script.search(look2);
						if(ind1!=-1 && ind2!=-1) {
							let json='{'+script.substr(ind1, ind2 - ind1), mapProp={};
							try {
								mapProp = JSON.parse(json);
							} catch (e) {
								mapProp={};
							}
							if(mapProp.hasOwnProperty("extensions") && mapProp.extensions.hasOwnProperty("com.ibi.geo.map")) 
								othis.updateMapProperties(mapProp.extensions["com.ibi.geo.map"], false,0);
						}
						else {
							othis.getCurrentMap().removeAll();
							othis.layerList=[];
						}
					}
				}
				else if(Array.isArray(oPreview.scriptBlocks)) {					
					var look1="var script", look2="chart.set";othis.wait(true);
					for (var i=0;i<oPreview.scriptBlocks.length;++i){
						var script = oPreview.scriptBlocks[i].scriptBlocks, exp=new RegExp("this\._", "g");
						if(i==0){
							let ind1=script.search(look1), ind2=script.lastIndexOf("}"), temp="";
							if(ind1!=-1 && ind2!=-1) {
								temp=script.substr(ind1, ind2 - ind1);
								var remInd=temp.search("if [(]tdgchart\.WF_charts"), endRem=temp.search("chart\.title");
								if(remInd!=-1 && endRem!=-1)
									temp=temp.replace(temp.slice(remInd,endRem),"").replace(exp,"");
							}
							newScript+=temp;
						}
						else {
							ind1=script.search(look2), ind2=script.lastIndexOf("}");
							if(ind1!=-1 && ind2!=-1)
								newScript+=script.substr(ind1, ind2 - ind1).replace(exp,"");
						}
					}
					mlChart = new tdgchart({ backend: 'js', allowBackendFallback: true, chartType: 'com.ibi.geo.map' });
			        if (tdgchart.WF_charts == undefined)
			            tdgchart.WF_charts = {};
		            var re = /chart\./g;
		            newScript = newScript.replace(re, "mlChart.");
		
		            var scrElt = $(document.createElement("script"));
		            scrElt.attr("type", "text/javascript");
					
					scrElt.attr("id", "map_script");
		            $(document.body).append(scrElt);
		            scrElt.text(newScript);
					//var ext = mlChart.extensions['com.ibi.geo.map'];
					//othis.initFinal=false;
			
					othis.tdgchart=mlChart;
					var map = othis.tdgchart.hasOwnProperty("extensions") ? othis.tdgchart.extensions['com.ibi.geo.map'] : nulll;
					var layers=[];
					var mapLayers = othis.tdgchart.answerSet; 
					if(map) othis.updateMapProperties(map, false, mapLayers ? mapLayers.length : 0);	
	                if (mapLayers && mapLayers.length) {
						if (Array.isArray(mapLayers[0]))
	                    	othis.doMergeObjects(mapLayers, othis.tdgchart);
						let nothingNew=true;
						mapLayers.forEach(function (L) {
	                        if (L.extensions) {
	                            var layer = L.extensions['com.ibi.geo.layer'], lId = layerId || (L.component ? L.component.name : "");
								if(layer && !jQuery.isEmptyObject(layer) && !othis.getLayerSettings(lId)) {
									if(L.errorMessage) {
								  		/* [GIS-1565] Temporary fix not to initialize the layer in an error state - see GIS-1565 comment above */
								  		console.warn("MLM skip layer '" + (layer.title||'?')+"':", L.errorMessage);
									  	othis.wait(false);
								  	} else {
										nothingNew=false;
										othis.createLayer(layer, L, L.component ? L.component.name : "");
								  	}
								}
								else if (layer && !jQuery.isEmptyObject(layer))	{
									layer.overlayLayers[0].name=L.component ? L.component.name : layerId;
									layers=layers.concat(layer.overlayLayers);	
								}					
								else if (!layer || jQuery.isEmptyObject(layer)) {
	                                layer = L.extensions['com.esri.map'];
		                            if (!layer)
		                                layer = L.extensions['com.ibi.geo.map'];
		                            if (layer && !jQuery.isEmptyObject(layer)) {
										nothingNew=false;
										othis.createLayer(layer, L, L.component ? L.component.name : "");
									}
								}
	                        }
	                        else othis.wait(false);
	                    });	
						if(othis.isPreviewMode() && !layerId && nothingNew) {
							othis.updateMapStructure(layers);	
							othis.wait(false);
						}						                    
	                }
					else {
						othis.getCurrentMap().removeAll();
						othis.layerList=[];
					} 
				}
			}
		},
		doRefreshPreviewLayer: function(){
			var othis=this;
			if(othis.tdgchart.preview) {
			    othis.previewInt=window.clearInterval(othis.previewInt);
				othis.doRefreshPreviewLayerEx(othis.tdgchart.preview);
				delete othis.tdgchart.preview;
				othis.startPreviewWatch();
			}
		},		
		startPreviewWatch : function(){
			var othis=this,
			previewFunc = function () {  
				othis.doRefreshPreviewLayer();					
            };
			if(!othis.previewInt)
            	othis.previewInt = window.setInterval(previewFunc, 300);
		},
		doAddDataLayerExCont: function(newScriptText, filePath, title) {
			var othis=this;
			mlChart = new tdgchart({ backend: 'js', allowBackendFallback: true, chartType: 'com.ibi.geo.layer' });
	        if (tdgchart.WF_charts == undefined)
	            tdgchart.WF_charts = {};
            var re = /chart\./g;
            newScriptText = newScriptText.replace(re, "mlChart.");

            var scrElt = $(document.createElement("script"));
            scrElt.attr("type", "text/javascript");
			
			scrElt.attr("id", fileName(filePath)+"script");
            $(document.body).append(scrElt);
            scrElt.text(newScriptText);
			if(mlChart.hasOwnProperty("extensions") && mlChart.extensions.hasOwnProperty("com.ibi.geo.map")) 
				othis.updateMapProperties(mlChart.extensions["com.ibi.geo.map"],true);
			var ext = mlChart.extensions['com.ibi.geo.layer'].hasOwnProperty("overlayLayers") ? mlChart.extensions['com.ibi.geo.layer'] :
							mlChart.extensions['com.esri.map'];
			if(!ext.hasOwnProperty("overlayLayers") && mlChart.answerSet) {
				var mapLayers = mlChart.answerSet;
                if (mapLayers && mapLayers.length) {
                    if (Array.isArray(mapLayers[0]))
                        othis.doMergeObjects(mapLayers, othis.tdgchart);
					mlChart=mlChart.answerSet[0];  
                    ext = mlChart.extensions['com.ibi.geo.layer'].hasOwnProperty("overlayLayers") ? mlChart.extensions['com.ibi.geo.layer'] :
							mlChart.extensions['com.esri.map'];
                }				
			}
			if(!ext.hasOwnProperty("overlayLayers")) {
				othis.wait(false);
				console.log("no data here");
				return;
			}
			if(othis.refresh && othis.dynLObj){
			 	if(mlChart.errorMessage) {
				  	/* [GIS-1565] Temporary fix remove the layer in an error state - see GIS-1565 comment above */
				  	console.warn("MLM del layer on:", mlChart.errorMessage);
				  	var map=othis.getCurrentMap();
					let dlayer = map.findLayerById(othis.dynLObj.id);
					if (dlayer) dlayer.parent.remove(dlayer);
					othis.wait(false);
					return;
				}
				var dest={};
				mlChart.mergeObjectsEx(ext, dest);
				mlChart.component={};
				//reset some properties
				othis.dynLObj.component.markerDefault=undefined;
				othis.dynLObj.component.heatmap=undefined;
				othis.dynLObj.component.cluster=undefined;
				othis.dynLObj.component.heatmap=undefined;
				othis.dynLObj.component.binning=undefined;
				mergeObjects(mlChart.component, othis.dynLObj.component, true);
				mlChart.component.visible=true;
				mergeObjects(mlChart.component, dest, true);
			//	othis.dynLObj.component.overlayLayers={};
				
			/*	if(othis.isPreviewMode()) {
					if(!dest.hasOwnProperty("opacity"))
						dest.opacity=1;
					if(!dest.hasOwnProperty("visible"))
						dest.visible=true;
				}
				mlChart.component={
					fileOrName: othis.dynLObj.component.fileOrName,
					name: dest.name || othis.dynLObj.component.name,
					index: othis.dynLObj.component.index,
					path: othis.dynLObj.component.path,
					refreshInt: othis.dynLObj.component.refreshInt,
					title: dest.title || othis.dynLObj.component.title,
					opacity: dest.hasOwnProperty("opacity") ? dest.opacity : othis.dynLObj.component.opacity,
					visible: dest.hasOwnProperty("visible") ? dest.visible : othis.dynLObj.component.visible
				};*/
			//	mlChart.component=othis.dynLObj.component;
				othis.createLayer(dest,mlChart,filePath);
			}
			else {
				var dest={};
				mlChart.mergeObjectsEx(ext, dest);
				mlChart["component"]={"title":title,"visible":true,"opacity":1, "name":fileName(filePath), "path":filePath};
				if(othis.isPreviewMode() && !filePath) {
					othis.updateMapStructure(ext.overlayLayers);	
					othis.wait(false);
				}
				else othis.createLayer(dest,mlChart,filePath);
			}		          
		},
		updateMapStructure: function(layers) {
			var othis=this, map=othis.getCurrentMap();
			//remove all
			for(let k = 0; k<othis.layerList.length; k++){
				let layer = map.findLayerById(othis.layerList[k].id);
                if (layer) 
					layer.parent.remove(layer);
            }
			var arrDest=[];
			for (let kk = 0; kk < layers.length; kk++) {
				let srcL= layers[kk];
				for(let p = 0; p<othis.layerList.length; p++){
					let layObj = othis.layerList[p];
					if(srcL.name === layObj.id) {
						map.add(layObj.layer);
						arrDest.push(layObj);
						break;
					}
				}
            }
			othis.layerList=[];
			othis.layerList=othis.layerList.concat(arrDest);// othis.layerList.reverse();
		},
		updateMapProperty: function(key, props) {
			var othis=this, view = othis.getCurrentView();
			switch(key) {					
				case "theme": {
					othis.setTheme(props[key]);
					break;
				}
				case "groups": {
					othis.setProperty(key,props[key]);
					break;
				}
				case "spatialReference": {
					view.spatialReference=props[key];
					break;
				}
				case "viewpoint": {
				//	view.viewpoint=props[key];
					break;
				}
				case "viewType": {
					if(typeof(othis.viewTypeB4) === 'string' && othis.viewTypeB4 != props[key]) {
						othis.toggleViewType(othis.viewTypeB4);
						setTimeout(function(){othis.addHomeButton(); 
							if(othis.getWidgetProperties("viewType") === "3d") $(".btnToggleView").addClass(othis.buttonActive);
							else $(".btnToggleView").removeClass(othis.buttonActive); }, 500);
					}	
					else if(typeof(othis.viewTypeB4) === 'string')	othis.setProperty("viewType", othis.viewTypeB4);					
					break;
				}
				case "baseLayer": {
					if(!this.options.reloading && !othis.refresh) {
						let baseLayer=props[key];
						if(baseLayer) {
							if(baseLayer.hasOwnProperty("zoomToOnLoad"))						           
			                    othis.setTargetLayer(baseLayer.zoomToOnLoad);
							else {
								view.constraints.snapToZoom=othis.setInitialViewInfo(baseLayer);
								if(view.constraints.snapToZoom)
									view.goTo(othis.initialViewInfo);
								else if(!this.isPreviewMode()) othis.goToHomeExtent();
							}
						}
						else if(!this.isPreviewMode())othis.goToHomeExtent();
					}			
					
					break;
				}	
				case "legend":
				case "zoom":						
				case "layers":
				case "devTools":
				case "basemaps":
				case "navigation-toggle":
				case "compass":
				case "discover":				
				case "bookmarks":
				case "scalerange":
				case "timeslider":
				case "maintoolbar":	{					
					this.updateWidgetSetting(key,props[key]);
					break;
				}	
				case "locate": {
					let btn=$(".btn"+key);					
					if(!props[key] || !props[key].create)btn.hide(); else btn.show();
					break;
				}
				case "scalebar": {
					othis.updateWidgetSetting(key,props[key]);
					let widget=view.ui.find(key);
					if(widget) {
						if(!props[key].hasOwnProperty("scalebarStyle") && widget.style!="line")
							props[key].scalebarStyle="line";
						if(!props[key].hasOwnProperty("scalebarUnit") && widget.unit!="dual")
							props[key].scalebarUnit="dual";
						if(props[key].hasOwnProperty("scalebarStyle") && widget.style!=props[key].scalebarStyle)
							widget.style=props[key].scalebarStyle;
						if(props[key].hasOwnProperty("scalebarUnit") && widget.unit!=props[key].scalebarUnit)
							widget.unit=props[key].scalebarUnit;
					}
					break;
				}
				case "interaction": {
					let searchFound=false, hasCreate=props[key].hasOwnProperty("create"), dflt="";
					othis.updateWidgetSetting(key,props[key]);
					mergeObjects(props[key],othis.tdgchart.extensions["com.ibi.geo.map"]["interaction"]);					
					if(typeof(props[key].members)==="object"){	
						if(!props[key].members.hasOwnProperty("search")) {
							props[key].members.search= {"create":true};
							dflt="search";
						}
						if(props[key].hasOwnProperty("default"))
							dflt=props[key].default;	
						Object.keys(props[key].members).forEach(function(key2){
							if(key2=="search" && !props[key].members[key2].hasOwnProperty("create")) 
								props[key].members[key2].create=true;
							props[key].members[key2].visible=props[key] && props[key].members[key2].create!==false && key2==dflt;
							othis.updateWidgetSetting(key2,props[key].members[key2]);
						});	
					}
					else { //hide all
						var inter=["measurement", "direction", "location", "sketch"];
						inter.forEach((key)=>{
							let btn=$(".btn"+key); 
							btn.hide();
						});
					}
					break;
				}
				case "baseMapInfo": {
					if(!othis.isonPremiseApi() && othis.checkCustomBasemaps(props)) {
						othis.setBaseMaps(props, true);
						othis.getCurrentMap().basemap=othis.options.basemap;
					}							
					break;
				}				
			}
		},
		setInitialViewInfo: function(baseLayer) {
			var ret=false;
			if (baseLayer){
				var othis=this;
				if(!baseLayer.hasOwnProperty("zoomType") || baseLayer.zoomType != "auto") {
					if(baseLayer.hasOwnProperty("camera") && (!baseLayer.zoomType || baseLayer.zoomType == "camera")) {
						var defCamera = {fov:55,heading:0,tilt:0,position:{latitude:20,longitude:20,z:10000000}};
						othis.initialViewInfo=baseLayer;
						mergeObjects(othis.initialViewInfo.camera,defCamera);
						ret=true;
					}
					if(baseLayer.zoomType == "layer"){
						othis.initialViewInfo=baseLayer;
						ret=true;
					}						
					else if(!ret && (baseLayer.zoomType == "center-zoom" || 
							baseLayer.hasOwnProperty("center") || baseLayer.hasOwnProperty("zoom"))) {
                        if(baseLayer.zoom && baseLayer.zoom<2)
                            baseLayer.zoom=2;
                        othis.initialViewInfo= { "center" : baseLayer.center || [0,0], "zoom" : baseLayer.zoom || 2 };
						ret=true;
					}
				}
				else othis.initialViewInfo=null;							
            } 
			return ret;
		},
		updateMapProperties: function(mapJSON, layerOnly, numOfLayers) {
			var othis=this, view = othis.getCurrentView(), changed={};
			if(typeof(mapJSON) === "object" && Object.keys(mapJSON).length>0) {
				changed = JSON.parse(JSON.stringify(mapJSON));
				Object.keys(mapJSON).forEach(function(key){
					othis.updateMapProperty(key, mapJSON);
				});
				if(!mapJSON.hasOwnProperty('locate'))othis.updateMapProperty('locate', mapJSON);
				othis.restoreDefaults(changed);
				if(!layerOnly && ((!mapJSON.hasOwnProperty("overlayLayers") || mapJSON.overlayLayers.length == 0) && numOfLayers === 0)){
					othis.getCurrentMap().removeAll();
					othis.layerList=[];
				}
			}
		},
	
		restoreDefaults: function(changed) {
			var othis=this, defaults=othis.tdgchart.extensions["com.ibi.geo.map"];
			if(typeof(othis.changedProp) === "object") {
				Object.keys(othis.changedProp).forEach(function(key){
					if(!changed.hasOwnProperty(key))
						othis.updateMapProperty(key, defaults);
				});
			}
			othis.changedProp=changed;
		},
		doAddDataLayerEx: function(htmlStr, filePath) {
			var othis=this;
			if(!othis.dynLObj) return;
			var htmlDoc = document.implementation.createHTMLDocument("example");
		    htmlDoc.documentElement.innerHTML = htmlStr;
		    var head = htmlDoc.head;
		    if (head) {
		        var error = htmlDoc.getElementById("errorTitle");
		        if (error) {
					var container = $("#" + contId);
		            var spBox = $(document.createElement("div"));
		            spBox.html(ajaxResult);
		            container.append(spBox);
		            return;
		        }
		    }
		    var scr = $(htmlDoc.body).find("script").first().text();
		    if (typeof (scr) === 'string') {
		       let ind1 = scr.search("chart.data"), ind2 = scr.search("var divId"), ind3 = scr.search("var script"), ind4 = scr.search("var chart");
		       if(ind2==-1)ind2 = scr.search("chart.draw");

			   if (ind1 != -1 && ind2 != -1 && ind3 != -1 && ind4 != -1) {
		            var newScriptText = scr.substr(ind3, ind4 - ind3) + scr.substr(ind1, ind2 - ind1);
					othis.doAddDataLayerExCont(newScriptText,filePath,htmlDoc.title);
		        }
				else {
					//if(othis.refresh && othis.refreshing)othis.continueRefreshing;
				//	else {
						alert("error");
						othis.refreshStop();
						
				//	}
				}
		    }	
		},
		continueRefreshing: function(){
			var othis = this;
			var int=othis.dynLObj && othis.dynLObj.component.hasOwnProperty("refreshInt") ? othis.dynLObj.component.refreshInt : -1;
			othis.refreshing=false;
			if(int != -1) 
				othis.refreshIntGlobal= window.setInterval(othis.refreshGo2.bind(othis,int), int*1000);   
				
			else othis.refreshStop(true);
		},
		isLayerLoaded: function(loadingItem) {
			var othis = this, ret=false;
			for(var k = 0; k<othis.layerList.length; k++){
                if (othis.layerList[k].fileOrName == loadingItem || 
				(othis.layerList[k].component && othis.layerList[k].component.fileOrName == loadingItem)) {
                    ret=true;
                    break;
				}
			}   
			return ret;
		},
		isLayerGroupPart: function(layer) {
			var othis = this, ret=true;
			for(var k = 0; k<othis.layerList.length; k++){
                if (othis.layerList[k].layer && othis.layerList[k].layer.id == layer.id) {
                    ret=false;
                    break;
				}
			}   
			return ret;
		},
		addDemographicLayer: function(layers) {
			var othis = this, busy=false;
			othis.loadingFiles=[];
			othis.toggleView=false;
			for(var kk = 0; kk<layers.length; kk++){
            	var temp=layers[kk];
			//	if(!othis.isLayerLoaded(temp.name) && !othis.isLayerLoaded2(temp.name,temp.title)) {
				if(1) {
					if(!busy){othis.wait(true); busy=true;}
					othis.loadingFiles.push(temp.name);
					var comp = {opacity:1,index:-1,visible:true,title:temp.title,fileOrName:temp.name};
					othis.Add_UrlLayer(temp,comp);
				}
            }
		},
		doAddDataLayers: function(files) {
			var othis = this;
			othis.loadingFiles=files, busy=false;
			othis.toggleView=false;	
			files.forEach(function(filePath) {
				if(!othis.isLayerLoaded(filePath)) {
					if(!busy){othis.wait(true); busy=true;}
					//
					
					//
					var req=othis.getContext() +"/wfirs?IBFS_action=run&IBFS_service=ibfs&IBFS_path=";
		            req+=encodeURI(filePath.replace("IBFS:", ""));
		            
		            req+="&IBIMR_Random="+Math.random();
		            req+="&"+othis.options.csrfTokenName+"="+othis.options.csrfTokenValue; 
					doXmlHttpRequest(req, { asJSON: false, async: true, curList: filePath, onLoad: othis.doAddDataLayerEx.bind(othis)}); 
				}
			});	
		},
		doAddASDataLayers: function(dataLayers) {
			var othis = this;
		//	othis.loadingFiles=dataLayers, busy=false;
			if(othis.toggleView)
				othis.toggleView=false;	
			var busy = othis.loadingFiles && othis.loadingFiles.length;
			dataLayers.forEach(function(layer) {
				if(!othis.isLayerLoaded(layer.path)) {
					if(!busy){othis.wait(true); busy=true;}
					if(layer.type=='fex') {
						othis.loadLayerFromFex2(layer);
					}
				}
			});	
		},
		doAddGroupLayer: function(comp){
			var othis = this;
			if(!comp) 
				comp = { title:getTransString("group"), visible:true,opacity:1};			
			var layer = new GroupLayer({title: comp.title, visible: comp.visible, opacity: comp.opacity});
			var layerProps = {
                id: layer.id,
                layer: layer,
                component:comp,
                layerJson: {}
            };			
            othis.insertLayer(layerProps, layer);
			othis.addLayer(layerProps);
			othis.refreshLayersList();
		},
        getJSON: function (url) {
            esriRequest(url, {
                responseType: "json"
            }).then(function (response) {
                var geoJson = response.data;
                console.log(geoJson);
            });
        },
		getJSON2: function (url, data) {
		//	const data = { username: 'example' };
            fetch(url, {
			  method: 'POST', // or 'PUT'
			  headers: {
			    'Content-Type': 'application/x-www-form-urlencoded'
			  },
			 credentials: 'include',
		//	  mode: 'no-cors',
			redirect: 'follow',
			  body: data
			})
			.then(response => {
			//	response.json();
				console.log('Success:', response);				
			})
			.then(result => {
			  console.log('Success:', result);
			})
			.catch((error) => {
			  console.log('Error:', error);
			});
        },
		isGeometrySrcEsri: function(data) {
			if(data && typeof(data)==='object' && data.hasOwnProperty('source')){
				return data.source.hasOwnProperty('geometrySourceType') && data.source.geometrySourceType == 'esri';
			}
			return false;
		},
        getIBJsonQuery: function (List, dflt, layerSettings) {
            var othis = this,  totalRec=0, tokenName=othis.options.csrfTokenName, tokenValue= othis.options.csrfTokenValue;
            
            var features;
            if (List.length) {
                var total=List.length, index=0;				
                function getRecords(json, recList){   
                    var localF;                     
                    if (json && json.records && !isEmptyRecord(json.records)) {   
                        totalRec+=json.records.length;
                                                                         
                        json.records.forEach(function (r) {
                            othis._decodeIbiQuantizedJson(r.GEO_ESRI);
                        });
                        if(recList)
                           // recList.features=json;
                           othis.geometry2data(json.records,recList);
                        else
                            localF = List[index];   
                        if(localF)
                            localF.features = json;                                    
                    } else if(localF){
                        localF.features = null;
                    }
                    index++;
                    if(total==index){
                        othis.options.totalGeom+=totalRec;
                    //    alert("total records returned "+totalRec);
                        layerSettings.records = List;
                    }                        
                }
                function getRecords2(json, List) {                   
                    if(json && json.records && !isEmptyRecord(json.records)) {  
                        var geoKeyField = List[0].source.geometryLocateField[0];            
                        for(var p=0;p<List.length;p++) {   
                            var geoL1=List[p].values[0];                        
                            for(var pp=0;pp<json.records.length;pp++) {
                                var r=json.records[pp];
                                if(geoL1.toUpperCase()==r[geoKeyField].toUpperCase()){
                                    othis._decodeIbiQuantizedJson(r.GEO_ESRI);
                                 //   var b=[]; b.push(r);
                                    List[p].attributes[0]["GEO_ESRI"]=r.GEO_ESRI;
                                //    List[p].features={records:b};
                                    json.records.splice(pp,1);
                                }
                            }
                        }               
                        layerSettings.records = List;
                    }
					else layerSettings.records=-1;
                }
				function getRecords3(json, List) {                   
                    if(json && json.features) {  
                        var geoKeyField = List[0].source.geometryLocateField[0];            
                        for(var p=0;p<List.length;p++) {   
                            var geoL1=List[p].values[0];                        
                            for(var pp=0;pp<json.features.length;pp++) {
                                var r=json.features[pp];
                                if(geoL1.toUpperCase()==r.attributes[geoKeyField].toUpperCase()){
                                //    othis._decodeIbiQuantizedJson(r.GEO_ESRI);
                                 //   var b=[]; b.push(r);
                                    List[p].attributes[0]["GEO_ESRI"]={"geometry":r.geometry};
                                //    List[p].features={records:b};
                                    json.features.splice(pp,1);
                                }
                            }
                        }               
                        layerSettings.records = List;
                    }
                }
				if(othis.isGeometrySrcEsri(List[0])) {
					let keyField= List[0].source.geometryLocateField, geoRolesFixedValues=[], 
					whereArray = othis.createWhere(List, keyField, geoRolesFixedValues, layerSettings.dataDelim, 0, 2000);
					if (whereArray && whereArray.length > 0) {
						
						var url = List[0].source.url+'/query?f=json';
	                    if (!url.endsWith("?")) {
	                        url += "&where="+encodeURIComponent(whereArray[0].where)+"&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=";
							url+=List[0].source.geometryLocateField+"&outSR=4326";
							url+='&geometryType=' + mapGeoType2esriGeoType(layerSettings.geometryType);
	                    }
	                    doXmlHttpRequest(url, { asJSON: true, GETLimit: 0, async: true, onLoad: getRecords3,  
									onError: getRecords, curList: List});       
						
					}
				}
                else if (List[0].hasOwnProperty('values') && typeof (List[0].values[0]) === 'object') {                    
                    List.forEach(function (C) {                
                        if (C.hasOwnProperty('source') && C.source) {
                            var url = C.source.url;
                            var Q = [];
                            C.values.forEach(function (V) {
                                var val = JSON.stringify(V);                                
                                Q.push(toUnicode(val));
                            });
                            
                            var valuesString = '[' + Q + ']';
                            if (!url.endsWith("?")) {
                                url = url + ",FEXDATA_LENGTH='" + C.values.length + "'&IBIF_fexdata=" + encodeURIComponent(valuesString);
                            }
                            if(othis.options.getGeometry=="async")
                                doXmlHttpRequest(url, { asJSON: true, GETLimit: 0, async: true, onLoad: getRecords, 
									onError: getRecords, curList: C, csrfName: tokenName, csrfValue: tokenValue});    
                            else  
                                getRecords(doXmlHttpRequest(url, { asJSON: true, GETLimit: 0, csrfName: tokenName, csrfValue: tokenValue }));                         
                        }
                  //  }
                    });
                }
                else if (dflt && List[0].hasOwnProperty('values') && !List[0].name) {
                    othis.transIbi=true;
                    var url = List[0].source.url;                    
                    var geoKeyField = List[0].source.geometryLocateField[0];
                    var Q = [];
                    List.forEach(function (C) {
                        Q.push('"'+C.values[0]+'"');
                    });                    
                    var valuesString = '{"' + geoKeyField + '":[' + Q + ']}';
                    if (!url.endsWith("?")) {
                        url = url + ",FEXDATA_LENGTH='" + List.length + "'&IBIF_fexdata=" + encodeURIComponent(valuesString);
                    }
                    doXmlHttpRequest(url, { asJSON: true, GETLimit: 0, async: true, onLoad: getRecords2,  
								onError: getRecords, curList: List, csrfName: tokenName, csrfValue: tokenValue});                   
                }
                else {                    
                    List.forEach(function (C) {
                        if (C.source) {                            
                            var url = C.source.url;
                            var valuesString = "";
                            var geoKeyField = C.source.geometryLocateField[0];
                            if(dflt && dflt.url==url){
                                var Q = [];
                                C.values.forEach(function (V) {
                                    var val = JSON.stringify(V);
                                    val='{"' + geoKeyField + '":'  + val + ',"COUNTRY":"' + C.name + '"}';
                                    Q.push(toUnicode(val));
                                });
                                valuesString = '[' + Q + ']';
                            }
                            else {
                                var noQuotesArray = (C.values).toString().split(',');
                                var quoted = '"' + noQuotesArray.join('","');                                
                                valuesString = '{"' + geoKeyField + '":[' + quoted + '"]}';
                            }
                            if (!url.endsWith("?")) {
                                url = url + ",FEXDATA_LENGTH='" + C.values.length + "'&IBIF_fexdata=" + encodeURIComponent(valuesString);
                            }
                            if(othis.options.getGeometry=="async")
                                doXmlHttpRequest(url, { asJSON: true, GETLimit: 0, async: true, onLoad: getRecords,  
										onError: getRecords, curList: C, csrfName: tokenName, csrfValue: tokenValue});    
                            else  
                                getRecords(doXmlHttpRequest(url, { asJSON: true, GETLimit: 0 }));                              
                        }
                    });
                }
            }
        },//{"NAME":"CIUDAD AUTÓNOMA DE BUENOS AIRES","COUNTRY":"ARGENTINA"}
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
		createWhere: function (dataMap, keyField, geoRolesFixedValues, delim, maxRecordCount, maxRecordRetrieval) {
			var querySize = this.calcMaxRecordCount(maxRecordCount, maxRecordRetrieval), othis = this;

			if (!querySize) {
				return null;
			}

			var valuesArray = [];
	/*		for (var f in dataMap) {
				if (dataMap.hasOwnProperty(f)) {
					valuesArray.push('\'' + this._sqlEscape(f) + '\'');
				}
			}*/
			if(Array.isArray(dataMap)) {
				dataMap.forEach(function(data) {
					if(typeof(data) == 'object' && data.hasOwnProperty("values")) {
						if(Array.isArray(data.values)) {
							data.values.forEach(function(val) {
								if(val !== ' ')
									valuesArray.push('\'' + othis._sqlEscape(val) + '\'');
							});
						}
						else
							valuesArray.push('\'' + othis._sqlEscape(data.values) + '\'');
					}
				});
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
        createGraphicsFromChartData: function (dataFields, data) {

            var fields = [], G = [];

            if (dataFields.constructor === Array) {
                dataFields.forEach(function (F) {
                    var fldArr, fieldName;
                    if (F.hasOwnProperty("fieldName")) {
                        fldArr = F.fieldName.split('.');
                        fieldName = fldArr[fldArr.length - 1];
                    } else {
                        fldArr = F.split('.');
                        fieldName = fldArr[fldArr.length - 1];
                    }
                    fields.push(fieldName);
                });
            } else {
                var fldArr = dataFields.split('.');
                var fieldName = fldArr[fldArr.length - 1];
                fields.push(fieldName);
            }

            data.forEach(function (A) {
                var countryValues = {};
                countryValues.attributes = [];
                var toolTipFields = [];
                var attr = {};

                for (var key in A) {
                    if (A.hasOwnProperty(key) && key !== 'name' && key !== '_g' && key !== '_s') {
                        toolTipFields.push(A[key]);
                    }
                }

                for (var a = 0; a < toolTipFields.length; a++) {
                    attr[fields[a]] = toolTipFields[a];
                }
                attr["ObjectID"] = U._generateUid();

                if (A.name.hasOwnProperty('geometryType') && A.name.geometryType === "esriGeometryPoint") {
                    var pointGeometry = {
                        x: A.name.geometry.x,
                        y: A.name.geometry.y,
                        type: "point",
                        spatialReference: A.name.spatialReference
                    };
                    var pg = new Graphic({
                        geometry: pointGeometry,
                        attributes: attr
                    });
                    G.push(pg);
                } else if (A.name.hasOwnProperty('geometryType') && A.name.geometryType === "esriGeometryPolyline") {
                    var lineGeometry = {
                        paths: A.name.geometry.paths,
                        type: "polyline",
                        spatialReference: A.name.spatialReference
                    };
                    var lg = new Graphic({
                        geometry: lineGeometry,
                        attributes: attr
                    });
                    G.push(lg);
                } else if (A.name.hasOwnProperty('geometryType') && A.name.geometryType === "esriGeometryPolygon") {
                    var polyGeometry = {
                        rings: A.name.geometry.rings,
                        type: "polygon",
                        spatialReference: A.name.spatialReference
                    };
                    var lg = new Graphic({
                        geometry: polyGeometry,
                        attributes: attr
                    });
                    G.push(lg);
                } else {
                    console.log("Error:: Unrecognized geometry-type: " + A.name.geometryType);
                    return;
                }
            });

            return G;
        },

        setUpSketch: function (view, layer) {

            if (!this.sketchVM) {
                return this.sketchVM = new SketchViewModel({
                    view: view,
                    layer: layer,                   
                    defaultUpdateOptions: { enableRotation: false,
                    enableScaling: false,
                    preserveAspectRatio: true,
                    toggleToolOnClick: false }
                });
            } else {
                return this.sketchVM;
            }
        },  
		updateCameraFov :function(fov) {
			if(this.is3dView()) {
				var othis=this, view=othis.getCurrentView(),
				cam =view.camera.clone();
				cam.fov=fov;
				view.camera=cam;
			}
		},     
		getCameraFov: function() {
			return this.is3dView() && this.getCurrentView().camera && this.getCurrentView().camera.fov ? this.getCurrentView().camera.fov : 55;
		},
		updateCameraHeading :function(heading) {
			var othis=this, view=othis.getCurrentView();
			if(this.is3dView()) {
				if (view.camera) { //GIS-1564 - reset only if we have camera already - if switching from (initial) 2d view, camera may be not (yet?) initialized
					var cam =view.camera.clone();
					cam.heading=heading;
					view.camera=cam;
				}
			}
			else {
				view.rotation=heading;
			}			
		}, 
		getCameraHeight: function() {
			return this.is3dView() && this.getCurrentView().camera && this.getCurrentView().camera.position.z;
		},
		updateCameraHeight :function(height) {
			if(this.is3dView()) {
				var othis=this, view=othis.getCurrentView(),
				cam =view.camera.clone();
				cam.position.z=height;
				view.camera=cam;
			}
		},         
		getCameraHeading: function() {
			var othis=this, view=othis.getCurrentView();
			var heading= parseInt((view.camera && view.camera.heading ? view.camera.heading : view.rotation), 10);
			return isNaN(heading)|| heading == 359 || heading == 360 ? 0 : heading;
		},
		updateCameraTilt :function(tilt) {
			if(this.is3dView()) {
				var othis=this, view=othis.getCurrentView(),
				cam =view.camera.clone();
				cam.tilt=tilt;
				view.camera=cam;
			}
		},     
		getCameraTilt: function() {
			var curView=this.getCurrentView();
			return this.is3dView() && curView.camera && curView.camera.tilt ? curView.camera.tilt : 0;
		},
		updateCameraLatitude :function(latitude) {
			if(this.is3dView()) {
				var othis=this, view=othis.getCurrentView(),
				cam =view.camera.clone();
				cam.position.latitude=latitude;
				view.camera=cam;
			}
		},
		updateCameraLongitude :function(longitude) {
			if(this.is3dView()) {
				var othis=this, view=othis.getCurrentView(),
				cam =view.camera.clone();
				cam.position.longitude=longitude;
				view.camera=cam;
			}
		},
		getCameraLongitude: function() {
			var curView=this.getCurrentView();
			return this.is3dView() && curView.camera && curView.camera.position.longitude;
		},
		getCameraLatitude: function() {
			var curView=this.getCurrentView();
			return this.is3dView() && curView.camera && curView.camera.position.latitude;
		},
		gotoExtent: function(extent) {
			this.getCurrentView().goTo(extent);
		},
		gotoFeatureExtent: function(layer,where,geometry){
			var view=this.getCurrentView(), maxscale=layer.maxScale, minscale=layer.minScale;	
			if(where) {
				const query = new Query();
				query.where = where; 		
				layer.queryExtent(query).then(function(results){
					results.extent.expand(1.1);
					view.goTo({target:results.extent}).then((resolvedVal) => {
							if(view.scale<maxscale)view.goTo({scale:maxscale});
					  }, (error) => {
					    console.log(error);
						
					  });
				    
				}.bind(this));
			}
			else if(geometry)
				view.goTo({target:geometry}).then((resolvedVal) => {
							if(view.scale<maxscale)view.goTo({scale:maxscale});
					  }, (error) => {
					    console.log(error);
						
					  });
			else this.zoomToLayer(layer.id);
		},			
		zoomToLayer: function (layerId) {
			var othis=this;
			othis.setTargetLayer(layerId);
			setTimeout(function(){othis.options.layerToZoom=layerId;},1000);
		},
		saveToPortal: function (layer) {
			let settings=this.getLayerSettings(layer.id);
			if(layer.featureEffect)	layer.featureEffect.excludedLabelsVisible=true;
			if(settings && (settings.portalId || layer.portalItem)) layer.save().then(
			          (response) => {
			            if (response) {
							
			            }
			          },
			          (err) => {
							alert(layer.title + " " +err.message);
							console.log(err.message);
			          });
			else {
				var pItem=new PortalItem();
				if(settings && settings.dataLayer)layer.source=null;
				layer.saveAs(pItem, {ignoreUnsupported:true}).then(
			          (response) => {
			            if (response) {
							
			            }
			          },
			          (err) => {
							alert(layer.title + " " +err.message);
							console.log(err.message);
			          });
			}
		},
		toggleStars: function() {
			var othis=this;
			if(othis.is3dView()) {
				var view=othis.getCurrentView();
				view.environment.starsEnabled = view.environment.starsEnabled ? false : true;
			}
		},	
		toggleAtmosphereQuality: function() {
			let view=this.getCurrentView();
			view.environment.atmosphere.quality = view.environment.atmosphere.quality=="low" ? "high" : "low";
		},	
		toggleLightingType: function() {
			let view=this.getCurrentView(), lightingJson=view.environment.lighting.toJSON();
			if(typeof(lightingJson) === 'object'){
				lightingJson.type=lightingJson.type=="sun" ? "virtual" : "sun";
				view.environment.lighting=lightingJson;
			}			
		},	
		toggleAtmosphere: function() {
			let view=this.getCurrentView();
			view.environment.atmosphereEnabled = view.environment.atmosphereEnabled ? false : true;
			return view.environment.atmosphereEnabled;
		},	
		convertEsriColor: function(esriColor) {
			let clr=new Color(esriColor);
			return clr ? {hex:clr.toHex(), opacity:clr.a} : null;
		},
		getEnvBackgroundColor: function(obj) {
			let view=this.getCurrentView();
			if(obj && view.environment.background && view.environment.background.color) {
				let clr = new Color(view.environment.background.color);
				obj.hex=clr.toHex();
				obj.opacity=clr.a;
				return obj;
			}
			return null;
		},
		getGroupLayerExtent: function(groupLayer, extent) {
			var layersThere=groupLayer.layers.items;
			for(var i = 0; i<layersThere.length;i++) {
				if(!layersThere[i].fullExtent)return false;
				extent.push(layersThere[i].fullExtent);
			}
		},
        setTargetLayer: function (layerId) {
            this.targetLayer = this.getCurrentMap().findLayerById(layerId);
            if (this.targetLayer) {
				this.setScalerangeLayer(this.targetLayer);	
                var view=this.getCurrentView(), extent=this.targetLayer.fullExtent, 
					maxscale=this.targetLayer.maxScale, minscale=this.targetLayer.minScale;
				if(typeof(extent) === 'undefined' && this.targetLayer.type === "group") {
					extent =[];
					this.getGroupLayerExtent(this.targetLayer,extent);
				}
				else if(layerId == defaultGraphicsLayerId) {
					extent =[];
					if(Array.isArray(this.targetLayer.graphics.items)) {
						this.targetLayer.graphics.items.forEach((graphic)=> {
							extent.push(graphic.geometry.extent);
						});
					}
				}
				if(!extent)return false;
				var suitGeo = this.getSuitableView(extent);
				view.goTo(suitGeo).then((resolvedVal) => {
					if(view.scale<maxscale)view.goTo({scale:maxscale});
					else if(maxscale==0 && minscale)view.goTo({scale:minscale});
				  }, (error) => {
				    console.log(error);
					
				  });
            }
			return true;
        },
        getTargetLayerId: function () {
            return this.targetLayer ? this.targetLayer.id : null;
        },
        _layerFexParser: function (rawData, fieldsInfo, geometrySources) {
            var data = rawData;
            var fields = [];
            if (fieldsInfo.length) {
                fieldsInfo.forEach(function (F) {
                    //  var item = {fname:F.fields[0].fieldName, type: F.id}
                    if (F.id == "value" || F.id == "color" || F.id == "nameValue")
                        fields.push(F.fields[0].fieldName.replace(/[ .]/g, "_"));
                });
            }
            var countryList = this._getCountriesFromData(data, fields, geometrySources);
            return this._getGeomSourceInfo(countryList, geometrySources);
        },

        _getCountriesFromData: function (Arr, fields, geomSources) {
            var countries = [], othis=this; othis.mapCntrsFlds={};
            function countryExist(country, countryList) {
                var ret;
                if (countryList.length) {
                    countryList.forEach(function (C) {
                        if (C.name === country) {
                            ret = true;
                        }
                    });
                } else {
                    ret = false;
                }
                return ret;
            }
            function countryValueExist(country, value, countryList) {
                var ret;
                countryList.forEach(function (C) {
                    if (C.name === country) {
                        if (C.values.length) {
                            C.values.forEach(function (v) {
                                if (v === value) {
                                    ret = "Exist";
                                } else {
                                    ret = C;
                                }
                            });
                        }
                    }
                });
                return ret;
            }
            function getGeometryLocateField(ctry, geomSources, map) {
                var rcode=map[ctry];
                if(!rcode) {
                    for (var key in geomSources.geometrySources) {
                        if (geomSources.geometrySources.hasOwnProperty(key)) {
                            if (geomSources.geometrySources[key].hasOwnProperty("alt_keys") && geomSources.geometrySources[key]["alt_keys"].hasOwnProperty(U._toTitleCase(ctry))) {
                                map[ctry]=geomSources.geometrySources[key].geometryLocateField;
                                return geomSources.geometrySources[key].geometryLocateField;
                            }
                            else if(key == U._toTitleCase(ctry)) {
                                map[ctry]=geomSources.geometrySources[key].geometryLocateField;
                                return geomSources.geometrySources[key].geometryLocateField;
                            }                                
                        }
                    }
                    map[ctry]=geomSources.geometrySources["default"].geometryLocateField;
                    rcode=geomSources.geometrySources["default"].geometryLocateField;
                    rcode.default=true;
                }
                return rcode;
            } 
            if (Arr.length) {
                var dDelim=geomSources.dataDelim || '|';
                Arr.forEach(function (A) {
					if(A.value==undefined) A.value=0;
                    var countryValues = {};
                    countryValues.attributes = [];
                    if (typeof (A.name) === 'string') {
                        var splitRecord = (A.name).split(dDelim);

                        //if length is >2 VALUES='[{"NAME5":"Baar-Ebenhausen","NAME1":"Bayern"},{"NAME5":"Bad Griesbach I.Rottal","NAME1":"Bayern"}]'
//"NAME",              "COUNTY",              "STATE",              "COUNTRY"],
                        if (splitRecord.length > 2) {
							var nparts=splitRecord.length, cntry=nparts==3 ? splitRecord[2] : splitRecord[3], ce = countryExist(cntry, countries),
								geoFields = getGeometryLocateField(cntry, geomSources, othis.mapCntrsFlds);
                            if (!ce) {
                                var attr = {};
                                attr["data"] = A;
                                attr["COUNTRY"] = cntry;
								if(nparts==4)
									attr["STATE"] = splitRecord[2];
                                attr["GEOLEVEL1"] = splitRecord[1];
                                attr["GEOLEVEL2"] = splitRecord[0];
                                attr["ObjectID"] = U._generateUid();

                                var toolTipFields = [];
                                for (var key in A) {
                                    if (A.hasOwnProperty(key) && key !== 'name' && key !== '_g' && key !== '_s') {
                                        toolTipFields.push(A[key]);
                                    }
                                }

                                for (var a = 0; a < toolTipFields.length; a++) {
                                    attr[fields[a]] = toolTipFields[a];
                                }
                                countryValues.name = cntry;
                                countryValues.attributes.push(attr);
                                countryValues.values = [];       
                                var val = {};
                                val[geoFields[0]] = splitRecord[0];
                                val[geoFields[1]] = splitRecord[1];  
								if(nparts==4)
									val[geoFields[2]] = splitRecord[2];                                
								if(geoFields.default)                                   
                                    val["COUNTRY"] = cntry;                         
                                countryValues.values.push(val);
                                countries.push(countryValues);
                            } else {
                                if ((countryValueExist(cntry, splitRecord[1], countries)) !== "Exist") {
                                    var C = countryValueExist(cntry, splitRecord[1], countries);
                                    var attr = {};
                                    attr["data"] = A;
                                    attr["COUNTRY"] = cntry;
									if(nparts==4)
										attr["STATE"] = splitRecord[2];
                                    attr["GEOLEVEL1"] = splitRecord[1];
                                    attr["GEOLEVEL2"] = splitRecord[0];
                                    attr["ObjectID"] = U._generateUid();
                                    var toolTipFields = [];
                                    for (var key in A) {
                                        if (A.hasOwnProperty(key) && key !== 'name' && key !== '_g' && key !== '_s') {
                                            toolTipFields.push(A[key]);
                                        }
                                    }

                                    for (var a = 0; a < toolTipFields.length; a++) {
                                        attr[fields[a]] = toolTipFields[a];
                                    }
                                    C.attributes.push(attr);
                                    var val = {};
                                    val[geoFields[0]] = splitRecord[0];
                                    val[geoFields[1]] = splitRecord[1];
                                    if(nparts==4)
										val[geoFields[2]] = splitRecord[2];                                
									if(geoFields.default)                                   
	                                    val["COUNTRY"] = cntry;               
                                    C.values.push(val);
                                }
                            }
                        }

                        //if length is 2 VALUES='{"NAME1":["Bayern","Berlin","Brandenburg","Bremen"]}'
                        if (splitRecord.length <= 2) {
                            var ce = countryExist(splitRecord.length==1 ? splitRecord[0] : splitRecord[1], countries);
                            if (!ce) {
                                var attr = {};
                                attr["data"] = A;
                                if(splitRecord.length==1)
                                    attr["GEOLEVEL1"] =splitRecord[0];
                                else {                                 
                                    attr["COUNTRY"] = splitRecord[1];
                                    attr["GEOLEVEL1"] = splitRecord[0];
                                }
                                attr["ObjectID"] = U._generateUid();
                                var toolTipFields = [];
                                for (var key in A) { 
                                    if (A.hasOwnProperty(key) && key !== 'name' && key !== '_g' && key !== '_s' && key !== 'url0') {
                                        toolTipFields.push(A[key]);
                                    }
                                }

                                for (var a = 0; a < toolTipFields.length; a++) {
                                    attr[fields[a]] = toolTipFields[a];
                                }
                                if(splitRecord.length==2)
                                    countryValues.name = splitRecord[1];
                                countryValues.attributes.push(attr);
                                countryValues.values = [];
                                countryValues.values.push(geomSources.geometryDataField ? splitRecord[0].toUpperCase() : splitRecord[0]);
                                countries.push(countryValues);
                            } else {
                                if ((countryValueExist(splitRecord[1], splitRecord[0], countries)) !== "Exist") {
                                    var C = countryValueExist(splitRecord[1], splitRecord[0], countries);
                                    var attr = {};
                                    attr["data"] = A;
                                    attr["COUNTRY"] = splitRecord[1];
                                    attr["GEOLEVEL1"] = splitRecord[0];
                                    attr["ObjectID"] = U._generateUid();
                                    var toolTipFields = [];
                                    for (var key in A) {
                                        if (A.hasOwnProperty(key) && key !== 'name' && key !== '_g' && key !== '_s') {
                                            toolTipFields.push(A[key]);
                                        }
                                    }

                                    for (var a = 0; a < toolTipFields.length; a++) {
                                        attr[fields[a]] = toolTipFields[a];
                                    }
                                    C.attributes.push(attr);
                                    C.values.push(splitRecord[0]);
                                }
                            }
                        }
                    }
                });
            }
            return countries;
        },

        _getGeomSourceInfo: function (CountryList, geomSources) {
            var sourcesList = [];
            if (geomSources.geometrySources) {
                var keys = Object.keys(geomSources.geometrySources);
                if (keys.length === 1 && keys[0] === "default") {
                    CountryList.forEach(function (ctry) {
                        ctry.source = geomSources.geometrySources[keys[0]];
                    });
                } else {
                    var dflt=geomSources.geometrySources[keys[0]];
                    CountryList.forEach(function (ctry) {
                        var ctryObject = {};
                        if (geomSources.geometrySources.hasOwnProperty(U._toTitleCase(ctry.name)) || geomSources.geometrySources.hasOwnProperty(ctry.name)) {
                            ctry.source = geomSources.geometrySources[U._toTitleCase(ctry.name)];
                        } else {
                            for (var key in geomSources.geometrySources) {
                                if (geomSources.geometrySources.hasOwnProperty(key)) {
                                    if (geomSources.geometrySources[key].hasOwnProperty("alt_keys") && geomSources.geometrySources[key]["alt_keys"].hasOwnProperty(U._toTitleCase(ctry.name))) {
                                        ctryObject.fieldValue = ctry.name;
                                        ctry.source = geomSources.geometrySources[key];
                                        break;
                                    } else {
                                        ctry.source = null;
                                    }
                                }
                            }
                            if(!ctry.source)
                                ctry.source=dflt;
                        }
                    });
                }
                return CountryList;
            }
            return null;
        },

        _decodeIbiQuantizedJson: function (featureSet) {

            if (!featureSet || !featureSet.transform)
                return featureSet;

            var scale = featureSet.transform.scale;
            var translate = featureSet.transform.translate;
            var rings = featureSet.geometry.rings;

            var scale_X = scale[0];
            var scale_Y = scale[1];

            var translate_X = translate[0];
            var translate_Y = translate[1];
            this._processRing(rings, translate_X, translate_Y, scale_X, scale_Y);
            return featureSet;
        },

        _processRing: function processRing(ring, translate_x, translate_y, scale_x, scale_y) {

            if (ring[0] instanceof Array && ring[0][0] instanceof Array) {
                for (var i = 0; i < ring.length; ++i)
                    this._processRing(ring[i], translate_x, translate_y, scale_x, scale_y);
                return;
            }
            if (ring.length === 0)
                return;

            var xx = ring[0][0] * scale_x;
            var yy = ring[0][1] * scale_y;

            if (translate_x < 0) {
                xx = xx + translate_x;
                yy = translate_y - yy;
            }
            else {
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
        removeAllFeatures : function(lay, justRet, G) { 
            var othis = this, view=othis.getCurrentView();
            if(othis.dynLObj.addedFeatures) {
            	lay.applyEdits({deleteFeatures:othis.dynLObj.addedFeatures, addFeatures: G});
            	othis.dynLObj.addedFeatures=G;
            }
            else {
	            view.whenLayerView(lay).then(function(layerView){
	                layerView.queryFeatures().then(function(results){
	                	othis.dynLObj.addedFeatures=G;
	                	lay.applyEdits({deleteFeatures:results.features, addFeatures: G});
	                });
	            }); 
	        }     
        },
        doLayerSelection: function (geoSel, continuous, lay) {
            var othis = this, view=othis.getCurrentView();
            var selG = [], unSelG = [], bSel = false,
            bSelExists = othis.getLayerSelectedFeatures(true, lay), bGeoIsLine = geoSel.type == "polyline";
            var typePol = lay.geometryType === "polygon" || lay.geometryType === "polyline";
            view.whenLayerView(lay).then(function(layerView){
                var query = { geometry: geoSel,
                            spatialRelationship: typePol ? "intersects" : "contains" };
                layerView.queryFeatures(query).then(function(results){
                    results.features.forEach(function (G) { 
                        var rc = othis.updateSelectionList(G, layerView, othis.options.userValue);
                    });
                });                  
            });      
        },
     	addSpatialFilter: function(layer) {
			this.spatialFilterLayerID=layer.id;
			this.options.userValue="selExtent";
			this.doAction(true); 
		},
		getGeometryForEffects: function(layer, selType, callback) {
			this.returnGeometryFunc=callback;
			this.options.userValue=selType;
			this.doAction(true); 
		},
        doContSelection: function (geoSel, continuous, exlLayId) {
            var othis = this, view =othis.getCurrentView();
            if ((othis.updatingFeature && continuous) || !geoSel)
                return;
            if(!othis.options.multiselect)
                othis.removeSelHighlights();
            geoSel = webMercatorUtils.webMercatorToGeographic(geoSel);
			if(typeof(this.returnGeometryFunc) == 'function') {
				let clZoom=geoSel.clone();
				othis.resetSketch();
				this.returnGeometryFunc.call(this,clZoom);
				this.returnGeometryFunc=null;
			}
			else if(typeof(othis.spatialFilterLayerID) !== 'undefine' && othis.spatialFilterLayerID) {
				let strLayer = view.map.findLayerById(othis.spatialFilterLayerID);
				if(strLayer && strLayer.type=="stream" && geoSel.extent && strLayer.visible) {
						view.whenLayerView(strLayer).then((streamLayerView) => {            			
							streamLayerView.featureEffect = {
					              filter: {
					                geometry: geoSel.extent
					              },
					              excludedEffect: "grayscale(100%) opacity(30%)"
					            };
						//	lay.geometryDefinition=geoSel.extent;
						});
						let symbol = {
						  type: "simple-fill", 
					//	  color: [ 51,51, 204, 0.25 ],255,50,50,.25
							color: [ 51,51, 204, 0.25 ],
						  style: "none",
						  outline: { 
						//    color: [5, 112, 176],
							color: [255, 50, 50],
						    width: 2
						  }
						}, graphic=new Graphic({
                                geometry: geoSel.clone(),
                                symbol: symbol,
								attributes: {
									private: strLayer.id
								}
                        });
						view.graphics.add(graphic);
						let clZoom=geoSel.extent.clone();
						clZoom.expand(1.3);
						view.goTo(clZoom);
					//	strLayer.spatialGraphic=graphic;
						othis.spatialFilterLayerID=null;
						othis.resetSketch();
					}
			}
			else {
				for (var i = 0; i < view.map.layers.length; i++) {
	                var lay = view.map.layers.items[i];
	                if (!othis.isSelectionValid(lay) || (exlLayId && lay.id==exlLayId))
						continue;				                   
	                othis.doLayerSelection(geoSel, continuous, lay);
	            } 
			}
            
            if(!othis.options.multiselect) {
                setTimeout(function () {
                    othis.drillDownMultiselect(null,null);
                }, 500);
            }               
        },        
        updateClearSelectionButtonsState: function () {
            return;
        },
        selectByDistanceFromPoint: function () {

            var othis = this;
            //        othis.clearAllSelection();

            var distance = parseFloat($(".distanceEdit").ibxTextField("option", "text"));
            if (!isNaN(distance)) {
                othis.selectWithinFixedRadius();
            } else {
                var polylineGraphic = new Graphic();
                othis.clearActiveEventsListeners();

                var centerGeometryAtStart, tGr;
            //    if(othis.sketchVM && othis.sketchVM.state=="active" && othis.sketchVM.activeTool!="circle") {
            //        othis.sketchVM.destroy(); othis.sketchVM = null; }
                var graphicsLayer = new GraphicsLayer();				
                othis.setUpSketch(othis.getCurrentView(), graphicsLayer);
                othis.sketchVM.polygonSymbol = othis.sketchPolygonSymbol;                
                othis.sketchVM.create('circle', { mode: "freehand" });
                //   var unit = $(".unitsMenu").val();
                var units = othis.units[othis.selUnit];
                
                var radiusDistanceEvent = othis.sketchVM.on("create", function (event) {
                    if (event.state === "complete") {
                        if (event.tool !== "circle") {
                            return;
                        } else if (event.graphic) {
                            var gCl = event.graphic.geometry.clone();
                            /*var input = $(".distanceEdit");
                            if (input)
                                input.ibxTextField("option", "text", getTransString('Distance'));*/
                            othis.getCurrentView().graphics.remove(tGr);
                            othis.doContSelection(gCl, false);
                            othis.selectionCompleted();
                            othis.resetSketch();
                           // $(".cmd-sel-type").ibxWidget("userValue", null);

                            othis.updateClearSelectionButtonsState();
                          //  othis.selectByDistanceFromPoint();
                        }

                    } else if (event.state === "start") {
                        centerGeometryAtStart = event.toolEventInfo.added;                        
                        units = othis.units[othis.selUnit];
                    }                    
                    else if (event.state === "cancel") {
                        if(event.graphic){
                            othis.getCurrentView().graphics.remove(tGr);
                            othis.doContSelection(null, false);                               
                        }    
                        othis.resetSketch();       
                    }
                    else if (event.state === "active") {
                      //  othis.doContSelection(event.graphic.geometry.clone(), true);
                        tGr = othis.getGraphicByPrivateId("sketch");
                        if(!tGr) {
                            var text = { type: "text", text: "temp", color: event.graphic.symbol.outline.color,
                                font: { size: 12, weight: "bold", family: "Arial" }};
                            tGr = new Graphic({
                                geometry: event.graphic.geometry,
                                symbol: text,
								attributes: {
									private: "sketch"
								}
                            });
                            othis.getCurrentView().graphics.add(tGr);
                        }                      
                        if (centerGeometryAtStart && event.toolEventInfo && event.toolEventInfo.coordinates
                            && event.toolEventInfo.coordinates.length) {
                            var edgePoint = {
                                x: event.toolEventInfo.coordinates[0],
                                y: event.toolEventInfo.coordinates[1]
                            };

                            var vertices = [
                                [centerGeometryAtStart[0][0], centerGeometryAtStart[0][1]],
                                [edgePoint.x, edgePoint.y]
                            ];
                            polylineGraphic.geometry = new Polyline({
                                paths: vertices,
                                spatialReference: othis.getCurrentView().spatialReference
                            });
							try {
								 var length = geometryEngine.planarLength(
	                                polylineGraphic.geometry, units
	                            );
	                            length = Number(parseFloat(Math.round(length * 100) / 100).toFixed(3));
	                           
	                            tGr.symbol.text=length.toFixed(2)+ " " + othis.selUnit; 
	                            tGr.geometry=event.graphic.geometry;    
							}
                            catch(e){}                       
                        }
                    }
                });
            }
        },

        selectWithinFixedRadius: function () {
            var othis = this;
            //       othis.clearAllSelection();
            othis.clearActiveEventsListeners(true);

            if (this.getCurrentView().map.findLayerById("bufferSelection")) {
                this.getCurrentView().map.remove(this.getCurrentView().map.findLayerById("bufferSelection"));
            }
            setTimeout(function () {
                if (othis.getCurrentView().map.findLayerById("circleSelection"))
                    othis.getCurrentView().map.remove(othis.getCurrentView().map.findLayerById("circleSelection"));
            }, 100);
            var mapCircleEvent = othis.getCurrentView().on("click", function (e) {

                var circleLayer = new GraphicsLayer();
                circleLayer.id = "circleSelection";
                var distance = parseFloat($(".distanceEdit").ibxTextField("option", "text"));
                var circle = new Circle({
                    radius: distance,
                    radiusUnit: othis.units[othis.selUnit],
                    spatialReference: othis.getCurrentView().spatialReference,
                    center: e.mapPoint
                });

                var g = new Graphic({
                    geometry: circle,
                    symbol: othis.sketchPolygonSymbol
                });
                circleLayer.add(g);
                othis.getCurrentView().map.add(circleLayer);                
                othis.doContSelection(circleLayer.graphics.items[0].geometry.clone(), false);
                setTimeout(function () {
                    if (othis.getCurrentView().map.findLayerById("circleSelection"))
                        othis.getCurrentView().map.remove(othis.getCurrentView().map.findLayerById("circleSelection"));
                    othis.clearActiveEventsListeners(true);
                    othis.selectionCompleted();
                    othis.resetSketch();  
                    mapCircleEvent.remove();
                }, 400);                              
            });            
        },
        isSelectionValid: function (layer) {
            var valid = true;
            if (!layer || !layer.visible || !layer.source || !layer.source.items ||
                (layer.renderer && layer.renderer.type === "heatmap") || layer.featureReduction)
                valid = false;
            return valid;
        },
        activateMapPan: function () {
            this.clearActiveEventsListeners();
            this.resetSketch();
        },
        
        selectByExtent: function () {
            var othis = this;
            othis.clearActiveEventsListeners();

         //   if(othis.sketchVM && othis.sketchVM.state=="active" && othis.sketchVM.activeTool!="rectangle") {
        //        othis.sketchVM.destroy(); othis.sketchVM = null; }
            var centerGeometryAtStart, tGr, pgGraphic = new Graphic();
            var graphicsLayer = new GraphicsLayer();
/*
var view = othis.getCurrentView();
		
	const polyline = new Polyline({
          
          paths: [[142.4006138, 49.4111824], [-170.8775129, 58.9182336], [161.1742228, 60.1655249],[124.1122108, 49.4111824],[142.4006138, 49.4111824]],
			spatialReference:  new SpatialReference(4326)
        });
		
		let outSpatialReference = new SpatialReference({
		  wkid: 53045
		});
	
	projection.load().then(function() {
  		let polyline2 = projection.project(polyline, outSpatialReference);
		
		const lineSymbol = {
	          type: "simple-line", // autocasts as SimpleLineSymbol()
	          color: [226, 119, 40],
	          width: 4
	        };
	    const polylineGraphic = new Graphic({
	      geometry: polyline2,
	      symbol: lineSymbol
	    });
		
			view.graphics.addMany([ polylineGraphic,pointGraphic, polygonGraphic]);
	});

     return;
*/

            othis.setUpSketch(othis.getCurrentView(), graphicsLayer);
            othis.sketchVM.polygonSymbol = othis.sketchPolygonSymbol;
            othis.sketchVM.create('rectangle', { mode: "freehand" });
            var selectByExtentEvent = othis.sketchVM.on("create", function (event) {
                if (event.state === "complete") {
                    if (event.tool !== "rectangle") {
                        return;
                    } else {
                        othis.getCurrentView().graphics.remove(tGr);
						if(event.graphic.geometry) {
							othis.doContSelection(event.graphic.geometry.clone(), false);
							othis.selectionCompleted();
						}
                        othis.resetSketch();
                        othis.updateClearSelectionButtonsState();                        
                    }
                }
                
                else if (event.state === "cancel") {
                    if(event.graphic){
                        othis.getCurrentView().graphics.remove(tGr);
                        othis.doContSelection(null, false);                        
                    }   
                    othis.resetSketch();              
                }
                else if (event.state === "start") {
                    centerGeometryAtStart = event.toolEventInfo.added;                        
                    units = othis.units[othis.selUnit];
                }
                else if (event.state === "active") {
                    tGr = othis.getGraphicByPrivateId("sketch");
                    if(!tGr) {
                        var text = { type: "text", text: "temp", color: event.graphic.symbol.outline.color,
                            font: { size: 12, weight: "bold", family: "Arial" }};
                        tGr = new Graphic({
                            geometry: event.graphic.geometry,
                            symbol: text,
							attributes: {
								private: "sketch"
							}
                        });
                        othis.getCurrentView().graphics.add(tGr);
                    }
                    pgGraphic.geometry = event.graphic.geometry.clone();
                    var w = geometryEngine.distance(pgGraphic.geometry.getPoint(0, 0), pgGraphic.geometry.getPoint(0, 1), units);
                    w = Number(parseFloat(Math.round(w * 100) / 100).toFixed(1));
                    var h = geometryEngine.distance(pgGraphic.geometry.getPoint(0, 1), pgGraphic.geometry.getPoint(0, 2), units);
                    h = Number(parseFloat(Math.round(h * 100) / 100).toFixed(1));
                    tGr.symbol.text=w+"x"+h+ " " + othis.selUnit; 
                    tGr.geometry=event.graphic.geometry;
                }
            });
           // if(othis.options.multiselect || othis.selections.length==0)
            //    othis.activeEventListeners.push(selectByExtentEvent);
        },

        selectWithPolyLine: function () {
            var othis = this;

            //   othis.getCurrentView().focus();
            othis.clearActiveEventsListeners(true);
            if (this.getCurrentView().map.findLayerById("circleSelection")) {
                this.getCurrentView().map.remove(this.getCurrentView().map.findLayerById("circleSelection"));
            }
            var distance = parseFloat($(".distanceEdit").ibxTextField("option", "text"));
            var units = othis.units[othis.selUnit];
            var graphicsLayer = new GraphicsLayer();
            var graphicsBufLayer = new GraphicsLayer();
            graphicsBufLayer.id = "bufferSelection";
            othis.setUpSketch(othis.getCurrentView(), graphicsLayer);

            othis.sketchVM.polylineSymbol = othis.sketchLineSymbol;
            othis.sketchVM.create('polyline', { mode: "freehand" });
            var selectPolylineEvent = othis.sketchVM.on("create", function (event) {

                if (event.state === "complete") {
                    if (event.tool !== "polyline") {
                        if (othis.getCurrentView().map.findLayerById("bufferSelection")) {
                            othis.getCurrentView().map.remove(othis.getCurrentView().map.findLayerById("bufferSelection"));
                        }
                        return;
                    } else {
                        if (event.graphic) {
                            var line = event.graphic.geometry.clone();

                            var buffer = null;
                            if (!isNaN(distance)) {
                                buffer = geometryEngine.buffer(event.graphic.geometry.clone(), distance, units, true);
                                var g = new Graphic({
                                    geometry: buffer,
                                    symbol: othis.sketchPolygonSymbol
                                });
                                if (othis.getCurrentView().map.findLayerById("bufferSelection")) {
                                    othis.getCurrentView().map.remove(othis.getCurrentView().map.findLayerById("bufferSelection"));
                                }
                                graphicsBufLayer.add(g);
                                othis.getCurrentView().map.add(graphicsBufLayer);

                            }
                            othis.doContSelection(buffer ? buffer : line, false);
                        }
                        setTimeout(function () {
                            if (othis.getCurrentView().map.findLayerById("bufferSelection")) {
                                othis.getCurrentView().map.remove(othis.getCurrentView().map.findLayerById("bufferSelection"));
                            }
                        }, 2000);
                        othis.selectionCompleted();
                        othis.resetSketch();
                        othis.updateClearSelectionButtonsState();
                    //    othis.selectWithPolyLine();
                    }
                }
                else if (event.state === "active") {
                  /*  if (isNaN(distance))
                        othis.doContSelection(event.graphic.geometry, true);
                    else if (othis.getCurrentView().map.findLayerById("bufferSelection"))
                        othis.getCurrentView().map.remove(othis.getCurrentView().map.findLayerById("bufferSelection"));*/
                }
                             
                else if (event.state === "cancel" && !othis.sketchVM.selType) {
                    if (isNaN(distance))
                        othis.doContSelection(null, false);
                    othis.resetSketch();
                    othis.selectWithPolyLine();
                }
            });
            othis.activeEventListeners.push(selectPolylineEvent);

        },
        selectWithinCustomPolygon: function(bActive) {
			var othis = this;
		},
        selectWithinPolygon: function (drawMode) {
            var othis = this;
            othis.clearActiveEventsListeners();

            var mode = drawMode || "freehand";
                        
         //   if(othis.sketchVM && othis.sketchVM.state=="active" && othis.sketchVM.activeTool!="polygon") {
         //       othis.sketchVM.destroy(); othis.sketchVM = null;}
            var graphicsLayer = new GraphicsLayer();
            othis.setUpSketch(othis.getCurrentView(), graphicsLayer);
            othis.sketchVM.polygonSymbol = othis.sketchPolygonSymbol;
            othis.sketchVM.polylineSymbol = othis.sketchLineSymbol;
            othis.sketchVM.create('polygon', { mode: mode });
            var selectPolygonEvent = othis.sketchVM.on("create", function (event) {
                if (event.state === "complete") {
                    if (event.tool !== "polygon") {
                        return;
                    } else {
                        othis.doContSelection(event.graphic.geometry, false);
                        othis.selectionCompleted();
                        othis.resetSketch();
                        othis.updateClearSelectionButtonsState();
                    }
                }
              /*  else if (event.state === "start")
                    othis.setUpPointSketch(othis.getCurrentView(), "selPolygon");
                else if (event.state === "active")
                    othis.doContSelection(event.graphic.geometry, true);*/
                else if (event.state === "cancel") {
                    if(event.graphic)
                        othis.doContSelection(null, false);
                    othis.resetSketch(); 
                }
            });          
        },

        deSelectByExtent: function () {
            var othis = this;
            othis.clearActiveEventsListeners();

            //   othis.getCurrentView().focus();
            var graphicsLayer = new GraphicsLayer();
            othis.setUpSketch(othis.getCurrentView(), graphicsLayer);
            othis.sketchVM.polygonSymbol = othis.sketchPolygonSymbol;
            othis.sketchVM.create('rectangle', { mode: "freehand" });
            var deselectEvent = othis.sketchVM.on("create", function (event) {
                if (event.state === "complete") {
                    if (event.tool !== "rectangle") {
                        return;
                    } else {
                        var extent = event.graphic.geometry.clone();
                        extent = webMercatorUtils.webMercatorToGeographic(extent);
                        for (var i = 0; i < othis.getCurrentView().map.layers.length; i++) {
                            var lay = othis.getCurrentView().map.layers.items[i];
                            if (!othis.isSelectionValid(lay))
                                continue;
                            var unSelG = [], stillSel = [];
                            lay.source.items.forEach(function (G) {
                                if ((geometryEngine.intersects(G.geometry, extent) || geometryEngine.contains(extent, G.geometry))
                                    && G.attributes["SELECTION"] == 99) {
                                    G.attributes["SELECTION"] = 50;
                                    unSelG.push(G);
                                }
                                else if (G.attributes["SELECTION"] == 99)
                                    stillSel.push(G);
                            });
                            if (unSelG.length && stillSel.length)
                                lay.applyEdits({ updateFeatures: unSelG });
                            else
                                othis.clearLayerSelection(lay);
                        }                        
                        othis.selectionCompleted();
                        othis.resetSketch();

                        var enable = othis.updateClearSelectionButtonsState(true);
                        if (enable)
                            othis.deSelectByExtent();
                    }
                }                
                else if (event.state === "cancel")
                    othis.deSelectByExtent();
            });
            othis.activeEventListeners.push(deselectEvent);
        },

        clearActiveEventsListeners: function (notSelections) {
            var othis = this;
            if (othis.activeEventListeners.length) {
                othis.activeEventListeners.forEach(
                    function (E) {
                        E.remove();
                    }
                )
            }
            othis.activeEventListeners = [];
            if (!notSelections) {
                setTimeout(function () {
                    if (othis.getCurrentView().map.findLayerById("circleSelection"))
                        othis.getCurrentView().map.remove(othis.getCurrentView().map.findLayerById("circleSelection"));
                    if (othis.getCurrentView().map.findLayerById("bufferSelection")) {
                            othis.getCurrentView().map.remove(othis.getCurrentView().map.findLayerById("bufferSelection"));
                        }
                }, 300);               
            }
            if (othis.getCurrentView().popup && othis.getCurrentView().popup.visible && !othis.getCurrentView().popup.currentDockPosition)
                othis.getCurrentView().popup.close();
        },
        selectionCompleted: function () {
            /*if(this.targetLayer) {
                this.getCurrentView().emit("selection-completed", {
                    "layerId": this.targetLayer.id,
                    "data": this.selectionLayer.graphics.items
                });
            }*/
        },
        resetSketch: function () {
            var othis=this;
            if (othis.sketchVM) {
                othis.sketchVM.layer.removeAll();
                othis.sketchVM.cancel();
                othis.sketchVM = null;
            }   // else 
           
            if(othis.options.multiselect) { 
                $(".cmdRadioGroup").ibxHRadioGroup("selected", $(".sel-pan"));
                othis.options.userValue = "selSingle";  
                othis.doAction(true); }
            else othis.endSelection();

        },
        removeSelHighlights: function(clickedGr, justDoIt){
            var othis=this, wasSel=false;
//check discover
			if(this.isDiscoverAtWork() && !justDoIt)
				return null;
            for(var kk=0; kk<othis.selections.length; kk++) {          
                if(clickedGr && !wasSel)
                    wasSel=othis.isSameGraphic(clickedGr,othis.selections[kk].graphic);
				if(wasSel && othis.selections.length==1)
					return wasSel;
                othis.selections[kk].handle.remove();
                if(clickedGr && wasSel){
                    othis.selections.splice(kk,1);
                    return wasSel;
                }
            }
            othis.selections=[];
            return wasSel;
        },
        clearAllSelection: function () {
            var othis=this;
			othis.removeSelHighlights(); 
            if(othis.showUIControls())        
            	othis.endSelection();
            othis.clearActiveEventsListeners();
            othis.resetSketch();
            if (othis.mapCircleEvent) {
                othis.mapCircleEvent.remove();
            }
            othis.selectionCompleted();
            othis.updateClearSelectionButtonsState(true);
        },
        clearLayerSelection: function (lay) {
            var unSelG = [];
            if (lay && lay.source && Array.isArray(lay.source.items)) {
                lay.source.items.forEach(function (G) {
                    if (G.attributes["SELECTION"] == 50 || G.attributes["SELECTION"] == 99) {
                        G.attributes["SELECTION"] = 100;
                        unSelG.push(G);
                    }
                });

                if (unSelG.length)
                    lay.applyEdits({ updateFeatures: unSelG });
            }
        },
		getDefaultEdaServer: function(){
			return this.options.edaNode; 
		},
		getEdaRequestPrefix: function(){
			return this.getContext() + "/webconsole/IWAYNODE_" + this.getDefaultEdaServer();
		},
		getFileProperties: function(file) {
			var othis=this,req = othis.getContext()+ '/wfirs/ibfs?IBFS_action=checkServerAccess';
            req += '&IBFS_pathlist=' + ibiescape(file);
			req+=othis.addToken();
            var callBack = function (xmlDoc) {
                if (xmlDoc && typeof xmlDoc === 'object') {
					var rootNode = getSingleNode(xmlDoc, '//ibfsrpc');
			        if (rootNode) {
		                var xpathnode = getSingleNode(xmlDoc, '//ibfsrpc/rootObject/entry');
		                if(xpathnode) {
		                    var key = getSingleNode(xpathnode, 'key'),
							 value = getSingleNode(xpathnode, 'value');
		                    if (key && value)
		                        othis.options.edaNode = key.getAttribute('value');
		                }
			        }
                }
				esriConfig.apiKey=othis.getWidgetProperties('apikey');
				if(esriConfig.apiKey) othis.doAfterFileProp();
				else othis.getApiKeyEx();				
            };
            doXmlHttpRequest(req, { asJSON: false, asXML: true, async: true, onLoad: callBack});
		},
		runCatalogFex : function(fexName, callBack) {//wfirs
			var othis=this, edasrv = othis.getDefaultEdaServer(), req=othis.getContext()+"/WFServlet.ibfs?IBIC_server=" + edasrv + 
		        "&IBFS1_action=runAdHocFex&IBFS__methodName=runAdHocFex&IBFS_fexContent=EX " + fexName +
		        " FORMAT=JSON&IBFS_path=IBFS:/EDA/" + edasrv;
    		doXmlHttpRequest(req, { asJSON: true, async: true, onLoad: callBack});
		},
		runCatalogFex2 : function(fexContent, callBack) {//wfirs
			var othis=this, edasrv = othis.getDefaultEdaServer(), req=othis.getContext()+"/WFServlet.ibfs?IBIC_server=" + edasrv + 
		         "&IBFS1_action=runAdHocFex&IBFS__methodName=runAdHocFex&IBFS_fexContent=" + fexContent +
        	"&IBFS_path=IBFS:/EDA/" + edasrv+this.addToken();
    		doXmlHttpRequest(req, { asJSON: false, async: true, asXML: true, GETLimit: 0, onLoad: callBack}); 
		},
		getStateToSave: function(timeExtent) {
			var othis=this, demographic=[], groups=[],title=othis.getMapTitle();
	
		    othis.getLayersInfo(null,null,demographic,null,groups, null);			
			var mainObj={};			
		
			othis.addMainInfoBookmarks(mainObj,demographic, groups, timeExtent);
			return JSON.stringify(mainObj);
		},
		isLoadedFromBookmarks: function() {
			return this.options.savedState && !jQuery.isEmptyObject(this.options.savedState);
		},
		saveOriginalProperties: function() {
			//this.options.Settings.properties
			this.options.originalProperties=JSON.parse(JSON.stringify(this.options.Settings.properties));		
			this.options.originalProperties.home=true;	
		},
		destroyLayers: function(parent) {
			if(!parent)parent=this.getCurrentMap();
	//		 parent.layers.forEach(function(layer){ layArr.push(layer); });
             parent.layers.forEach((layer)=>{
				layer.visible =false;
				if(layer.type == "group")
					this.destroyLayers(layer);
				layer.destroy();
			});							
		},
		addDummyRouteLayer: function(justReturn) {
			let dirWidget=this.getCurrentView().ui.find('direction'), routeLayer=null;
			if(dirWidget || justReturn) {
				routeLayer = new RouteLayer({id:defaultRouteLayerId, listMode:"hide"});
					routeLayer.on("layerview-create", (event)=>{
						  var saveInt = window.setInterval(()=>{
							   this.addRouteLayerFromDirection(routeLayer);
								
						  }, 2000);
						  
						 var hideInt=window.setInterval(()=>{
								let dlg=$(".esri-save-layer");
								if(dlg && dlg.length) {
									hideInt=window.clearInterval(hideInt);
									$(".esri-save-layer").parent().hide();	
								}							   							
						  }, 100);							
					});
				this.getCurrentMap().add(routeLayer);
			}
			if(!justReturn && dirWidget) {
				dirWidget.viewModel.reset();
				dirWidget.layer=routeLayer;
			}
			return routeLayer;
		},
		addDummyGraphicsLayer: function(justReturn) {
			var sketchWidget=this.getCurrentView().ui.find('sketch'), sketchLayer=this.getCurrentMap().findLayerById(defaultGraphicsLayerId);
			if(!sketchLayer && (sketchWidget || justReturn)) {
				sketchLayer = new GraphicsLayer({id:defaultGraphicsLayerId, title:getTransString("sketch"), listMode:"hide"});
					sketchLayer.on("layerview-create", (event)=>{						  
						let saved=this.getSavedLayer(sketchLayer);
						if(saved) {
							if(Array.isArray(saved.graphics) && saved.graphics.length) {
								saved.graphics.forEach((gr)=>{
									sketchLayer.add(Graphic.fromJSON(gr));
								});
								sketchLayer.listMode="show";
							}
							else sketchLayer.listMode="hide";
							sketchLayer.visible=saved.visible;
							sketchLayer.opacity=saved.opacity;
							sketchLayer.blendMode=saved.blendMode;
							sketchLayer.effect=saved.effect;
							if(sketchWidget.visible)
							this.startSketch();
						}						
					});
				this.getCurrentMap().add(sketchLayer);
			}
			if(!justReturn && sketchWidget) {
				sketchWidget.viewModel.reset();
				sketchWidget.layer=sketchLayer;
			}
			return sketchLayer;
		},
		reloadMapState: function(state) {
			var othis=this, origView=othis.getCurrentView(); othis.wasrefreshing=true;			
			othis.options.reloading=true, map=othis.getCurrentMap();	
			othis.refreshStop(true);
			othis.options.savedState=JSON.parse(state);						
			othis.hideViewWidget('animation');
			othis.resetTimeslider();
			let dmComp=origView.ui.find("bookmarks"), bmarkVis=dmComp && $(dmComp.container).is(":visible"), 
			tsComp=origView.ui.find('timeslider'), timeSlVis=tsComp && $(tsComp.container).is(":visible"),
			ldComp=origView.ui.find('legend'), ldVis=ldComp && $(ldComp.container).is(":visible"),
			layComp=origView.ui.find('layers'), layVis=layComp && $(layComp.container).is(":visible");
					
			othis.viewTypeB4=	othis.getWidgetProperties("viewType");	
			othis.options.Settings.properties=JSON.parse(JSON.stringify(othis.options.originalProperties));
			othis.tdgchart.extensions['com.ibi.geo.map']=othis.options.Settings.properties;
			othis.stopSketch();
			othis.destroyLayers();	
			map.removeAll();
			othis.updateMapProperties(othis.options.savedState ? othis.options.savedState.mapProp : {});
			if(othis.viewTypeB4=="3d")
				origView.environment=othis.getWidgetProperties("environment") || {};
			othis.viewTypeB4=null;
			othis.wait(true);
			setTimeout(function(){
				othis.refresh=true; 
				othis.initialize(true);  
				othis.continueLoading(); 
				let curView=othis.getCurrentView();
				if(curView.type != origView.type) {
					if(curView.type=="3d") $(".btnToggleView").addClass(othis.buttonActive);
						else $(".btnToggleView").removeClass(othis.buttonActive);
					othis.restoreMainToolbar(origView, curView);					
					if(bmarkVis)
						$(dmComp.container).show();
					if(timeSlVis)
						$(tsComp.container).show();
					let otherComp=curView.ui.find('layers'); 
					if(otherComp) {
						if(layVis)$(otherComp.container).show();
						else $(otherComp.container).hide();
						
					}
					otherComp=curView.ui.find('legend'); 
					if(otherComp) {
						if(ldVis)$(otherComp.container).show();
						else $(otherComp.container).hide();
					}
					if(othis.is3dView())$(".blend-effect-box").hide();
					else $(".blend-effect-box").show();
				}
				othis.restoreTimeExtent(timeSlVis);
				othis.addDummyRouteLayer();
				othis.addDummyGraphicsLayer(true);
				
			},300);
		},
		restoreTimeExtent: function(timeSlVis) {
			var view = this.getCurrentView(), comp=view.ui.find('timeslider');
			if(comp && this.options.savedState && this.options.savedState.mapProp) {	
				comp.fullTimeExtentSaved=comp.timeExtentSaved=null;		
				if(this.options.savedState.mapProp.hasOwnProperty('timeExtent')) {
					if(timeSlVis)comp.timeExtent=this.options.savedState.mapProp.timeExtent;
					else {
						comp.timeExtentSaved=this.options.savedState.mapProp.timeExtent;
						comp.timeExtent=null;
					}
				//	$(comp.container).find(".esri-time-slider__slider").show();
				}					
				if(this.options.savedState.mapProp.hasOwnProperty('fullTimeExtent')) {
					if(timeSlVis)comp.fullTimeExtent=this.options.savedState.mapProp.fullTimeExtent;	
					else {
						comp.fullTimeExtentSaved=this.options.savedState.mapProp.fullTimeExtent;
						comp.fullTimeExtent=null;
					}
				}					
				if(this.options.savedState.mapProp.hasOwnProperty('timeslider')){
					comp.mode=this.options.savedState.mapProp.timeslider.mode;
					comp.loop=this.options.savedState.mapProp.timeslider.loop;
					comp.playRate=this.options.savedState.mapProp.timeslider.playRate;
					comp.timeVisible=this.options.savedState.mapProp.timeslider.timeVisible;
					comp.layout=this.options.savedState.mapProp.timeslider.layout;
					comp.stops=this.options.savedState.mapProp.timeslider.stops;
				}			
			}
			else if(comp)
				this.getTimesliderDefaults(comp, timeSlVis);
			if(comp && $(comp.container).is(":visible")) 
				setTimeout(()=>{
					if(comp.fullTimeExtent)
					$(comp.container).find(".esri-time-slider__slider").addClass("esri-time-slider");//.show();
				},100);
		},
		restoreBookmarks: function(){
			var bms=[]
			for (var ii = 0; ii < this.bookmarksList.length; ii++) {
				let mapState=JSON.parse(this.bookmarksList[ii].mapstate), 
					timeExtentSet=(typeof(mapState)==='object' && mapState.hasOwnProperty("mapProp") && 
						mapState.mapProp.hasOwnProperty('timeExtent')) ? mapState.mapProp.timeExtent : null,
					bm=new Bookmark({name:this.bookmarksList[ii].name, timeExtent : timeExtentSet,
					viewpoint:Viewpoint.fromJSON(JSON.parse(this.bookmarksList[ii].viewpoint))});
				this.bookmarksList[ii].id=bm.uid;
				bm.thumbnail.url=this.bookmarksList[ii].url;
				if(this.bookmarksList[ii].hasOwnProperty("viewpoint"))
					bm.viewpoint=Viewpoint.fromJSON(JSON.parse(this.bookmarksList[ii].viewpoint));
				bms.push(bm);
			}
			return bms;
		},
		cusomizationMapState: function(xmlResult) {
			if (xmlResult && xmlResult.status != '403' && xmlResult.status != '0') {
	            var content = getSingleNode(xmlResult, '//ibfsrpc/rootObject');
	            if (content) {
	                var fileCont = ibiunescape(window.atob(content.getAttribute("value"))), othi;
					if(typeof(fileCont)==='string') {
						try {
							let temp=JSON.parse(fileCont);
							if(temp && Array.isArray(temp.bookmarks)) {
								this.bookmarksList=temp.bookmarks;
								for (var ii = 0; ii < this.bookmarksList.length; ii++) {
							/*	//	if(this.bookmarksList[ii].selected && ii==1) {
									if(ii==1) {
										this.options.savedState=JSON.parse(this.bookmarksList[ii].mapstate);
										this.options.viewpoint=Viewpoint.fromJSON(JSON.parse(this.bookmarksList[ii].viewpoint));							
										mergeObjects(this.options.Settings.properties,this.options.savedState.mapProp,true);
									}
									else*/ this.bookmarksList[ii].selected=false;
								}
							}
							
						} catch (e) {
							this.options.savedState=null;
						}
					}
				}
				this.continueLoading();
	        }
		},		
		readCusomizationMapState: function() {
			if(this.isBookmarksEnabled()) {
				let othis=this, request = othis.getContext() + '/wfirs' + '?IBFS_action=getCustomizationObject&IBFS_custName=MLMBookmarks&IBFS_path=' + 
				encodeURIComponent(othis.getMyPath(true,false)) + "&IBFS_service=ibfs&IBIVAL_returnmode=XMLENFORCE";
		        request += this.addToken(); 
				doXmlHttpRequest(request, { asJSON: false, async: true, asXML: true, GETLimit: -1, onLoad: this.cusomizationMapState.bind(this)});
			}			
		},
		isBookmarksEnabled: function() {
		//	return this.options.bookmarks;
			let sProp=this.getWidgetProperties('bookmarks'); 
			return sProp && sProp.create;
		},
		isTimesliderEnabled: function(checkLayers) {
			let sProp=this.getWidgetProperties('timeslider'),
			rtCode=sProp && sProp.create;
			if(checkLayers) {
				rtCode=this.checkLayersForTimeExtent(null);
				if(!rtCode) $(".btnTimeSlider").hide();
			}
			return rtCode;
		},
		getDateFields: function(layer, retFields) {
			var arrDateFields=[];
			if(Array.isArray(layer.fields))
				arrDateFields=layer.fields.filter(field => field.type==='date');	
			return retFields ? arrDateFields : arrDateFields.length>0;
		},		
		checkLayersForTimeExtent: function(parent) {
			var map=parent ? parent : this.getCurrentMap(), rtCode=false;
			map.layers.forEach((layer)=>{ 
				if(!rtCode) {
					if(layer && layer.type=="group")
						rtCode=this.checkLayersForTimeExtent(layer);
					else if((layer.timeInfo && layer.timeInfo.fullTimeExtent) || this.getDateFields(layer, false))
						rtCode=true;
				}				
			});	
			if(rtCode)
			return rtCode;
		},
		timeExtentChanged: function(tmslider, parent) {
			var map=parent ? parent : this.getCurrentMap(), rtCode=false, curView=this.getCurrentView();
			map.layers.forEach((layer)=>{ 
				if(layer && layer.type=="group")
					this.timeExtentChanged(tmslider, layer);
				else if(layer.timeInfo && layer.timeInfo.fullTimeExtent) {
					if(this.isSatelliteLayer(layer)) {
						let satL=this.getSatelliteLayer(), set=this.getLayerSettings(layer);
						let timeECopy=tmslider.timeExtent;
						if(timeECopy && tmslider.fullTimeExtent) {
							if(tmslider.mode=="cumulative-from-start")
								timeECopy.start=tmslider.fullTimeExtent.start;
							else if(tmslider.mode=="cumulative-from-end")
								timeECopy.end=tmslider.fullTimeExtent.end;
						}						
						if(this.is3dView() && this.satRenderer && satL) {
							this.satRenderer.updateTimeVisibility(timeECopy);
						}
						else {
							let startTime=timeECopy ? new Date(timeECopy.start).getTime() : null, endTime=timeECopy ? new Date(timeECopy.end).getTime() : null;
							layer.graphics.items.forEach((graphic)=> {
								if(graphic.attributes) {	
									let ltime= new Date(graphic.attributes['time']).getTime(), 
									visible=(startTime === null && endTime===null) || endTime>=ltime && startTime<=ltime;							
									graphic.visible=visible;
								}							
							});
						}
						if(set && set.options)
							set.options.geoUISatLayerOptions("refreshWidget",null); 
					}
					else if(!this.is3dView()) {
						curView.whenLayerView(layer).then((layerView)=>{
							/*layerView.featureEffect = tmslider.timeExtent ? {
							    filter: {
							    	timeExtent: tmslider.timeExtent,
							    	geometry: curView.extent
							    },
							    excludedEffect: "grayscale(0.5) opacity(0.3)",
								includedEffect: "brightness(1.25) saturate(1.50) drop-shadow(3.75pt 3.75pt 3.75pt rgba(218, 255, 33, 1))"
							} : null;  */
						}).catch(function (error) {

        				});
					}					
				}
				else {
					let timeFields=this.getDateFields(layer, true);
				/*	if(Array.isArray(timeFields) && timeFields.length) {
				//		layer.timeInfo=null;
					//	layer.timeExtent=null;
						let timeFld=timeFields[0];
						curView.whenLayerView(layer).then((layerView)=>{
							layerView.featureEffect = tmslider.timeExtent ? {
							    filter: {
							    	timeExtent: tmslider.timeExtent,
							    	geometry: curView.extent
							    },
							    excludedEffect: "grayscale(0.5) opacity(0.3)",
								includedEffect: "brightness(1.25) saturate(1.50) drop-shadow(3.75pt 3.75pt 3.75pt rgba(218, 255, 33, 1))"
							} : null;  
						}).catch(function (error) {

        				});
					}*/
				}
			});	
		},				
		isDiscoverEnabled: function(bCheckState) {		
			let sProp=this.getWidgetProperties('discover'), created = sProp && sProp.create, active = true; 
			if(bCheckState)	active = this.options.discoverType && this.options.discoverType=="manual";		
			return created && active;
		},
		isDiscoverAtWork: function() {
			let retCode=false;
			if(this.isDiscoverEnabled()) {
				let comp=this.getCurrentView().ui.find("discover");
				if(comp)
					retCode=comp.container ? $(comp.container).is(":visible") : $(comp).is(":visible");
			}
			return retCode;
		},
		isScalerangeEnabled: function() {		
			let sProp=this.getWidgetProperties('scalerange'), created = sProp && sProp.create; 			
			return created;
		},
		processResult: function(result) {
			if(typeof(result) === 'string')
				alert(getTransString('bookmarksError'));
		},
		saveCustomizationMapState: function(bookmarks) {
			if(this.isBookmarksEnabled()) {
				let othis=this, request = othis.getContext() + '/wfirs' + '?IBFS_action=putCustomization&IBFS_custName=MLMBookmarks&IBFS_path=' + 
					encodeURIComponent(othis.getMyPath(true,false));
				let state= window.btoa(ibiescape(bookmarks ? othis.serializeBookmarks() : othis.getStateToSave()));
				request +="&IBFS_custValue=" + encodeURIComponent(state)+"&IBFS_service=ibfs&IBIVAL_returnmode=XMLENFORCE";
				request += this.addToken(); 
				doXmlHttpRequest(request, { asJSON: false, async: true, asXML: true, GETLimit: 0,  onLoad: this.processResult.bind(this)}); 
			}
		}, 
        getLayerSelectedFeatures: function (firstOnly, lay, arrSelItemsObj) { //selItemsObj.layerId-string, selItemsObj.selFeatures-array
            var othis = this, bSel = false;
            if (!arrSelItemsObj)
                arrSelItemsObj = [];
            var selPerL = [];
            for (var ii = 0; ii < lay.source.items.length; ii++) {
                var G = lay.source.items[ii];
                if (G.attributes["SELECTION"] == 99) {
                    bSel = true;
                    selPerL.push(G);
                }
                if (bSel && firstOnly)
                    return true;
            }
            if (selPerL.length)
                arrSelItemsObj.push({ layerId: lay.id, selFeatures: selPerL });
            return bSel;
        },
        getSelectedFeatures: function (firstOnly, arrSelItemsObj) { //selItemsObj.layerId-string, selItemsObj.selFeatures-array
            var othis = this, bSel = false;
            if (!arrSelItemsObj)
                arrSelItemsObj = [];
            for (var i = 0; i < othis.getCurrentView().map.layers.length; i++) {
                if (othis.isSelectionValid(othis.getCurrentView().map.layers.items[i]) && 
                    othis.getLayerSelectedFeatures(firstOnly, othis.getCurrentView().map.layers.items[i], arrSelItemsObj)) {
                    bSel = true;
                    if (firstOnly)
                        return true;
                }
            }
            return bSel;
        },
        getLegend: function (layer) {

            var lyr = this.getCurrentView().map.findLayerById(layer);
            return new Legend({
                id: layer + "_LegendWdg",
                view: this.getCurrentView(),
                layerInfos: [{
                    layer: lyr,
                    title: getTransString("Legend")
                }]
            });
        },
        createColorStops: function (schemeColors) {
            var colorStops = [];
            var ratio = 0;
            schemeColors.forEach(function (C) {
                var stop;
                if (ratio === 0) {
                    var rgba = C.toRgba();
                    rgba[3] = 0;
                    stop = {
                        color: rgba,
                        ratio: ratio
                    };
                } else {
                    stop = {
                        color: C,
                        ratio: ratio
                    };
                }
                ratio = ratio + 0.083;
                ratio = Number(parseFloat(Math.round(ratio * 100) / 100).toFixed(3));
                colorStops.push(stop);
            });
            return colorStops;
        },
		getHeatmapSchemes: function(theme) {
			let params=theme ? {theme, includedTags: ['heatmap']} : {basemap:this.getCurrentMap().basemap, includedTags: ['heatmap']};
			return heatmapSchemes.getSchemesByTag(params);
		},		
        createHeatmapRenderer: function (lyr, baseMapTheme, layerOptionsHMRenderer, scheme, scale, callBack, component) {
            var fl=lyr, renField=fl.renderer.field,localScale=scale, view=this.getCurrentView(), numeric=this.isNumericField(fl.fields, renField);
			function updateRenderer(renderer) {
				if(typeof(localScale) == 'undefined')
					renderer.referenceScale=fl.minScale || view.scale;
				else if(localScale)
					renderer.referenceScale=localScale;
				if(component && component.hasOwnProperty('heatmap')) {
					if(component.heatmap.hasOwnProperty('maxDensity'))
						renderer.maxDensity=component.heatmap.maxDensity;
					if(component.heatmap.hasOwnProperty('minDensity'))
						renderer.minDensity=component.heatmap.minDensity;
					if(component.heatmap.hasOwnProperty('radius'))
						renderer.radius=component.heatmap.radius;
					if(component.heatmap.hasOwnProperty('referenceScale'))
						renderer.referenceScale=component.heatmap.referenceScale;
				}
				return renderer;
			}
			if(fl.renderer.visualVariables) {
				let found=false;
				for(var i = 0; i < fl.renderer.visualVariables.length; i++) {
                    if(fl.renderer.visualVariables[i].type == "size") {
                        renField=fl.renderer.visualVariables[i].field;
						found=true;
                        break;
                    }
                }
				if(!found && !numeric) {
					for(var i = 0; i < fl.renderer.visualVariables.length; i++) {
	                    if(fl.renderer.visualVariables[i].type == "color") {
	                        renField=fl.renderer.visualVariables[i].field;
	                        break;
	                    }
	                }
				}                
            }
			let heatmapParams = {
			  layer: fl,
			  view: view,
			  field: this.isNumericField(fl.fields, renField) ? renField : null,
			  heatmapScheme: scheme ? heatmapSchemes.getSchemeByName({name:scheme, basemap:this.getCurrentMap().basemap}) 
					: this.getHeatmapSchemes(baseMapTheme)[0]
			};
			if(lyr.heatmapStatistics) {
				heatmapParams.statistics=lyr.heatmapStatistics;
				// when the promise resolves, apply the renderer to the layer
				heatmapRendererCreator.createRenderer(heatmapParams)
				  .then(function(response){				
				    fl.renderer = updateRenderer(response.renderer);					
					if(layerOptionsHMRenderer) layerOptionsHMRenderer=fl.renderer;
					if(callBack)callBack.call();
				 }.bind(this));
			}
			else {
				if(!component) {
					let settings=this.getLayerSettings(fl); 
					component=settings ? settings.component : null;
				}					
				if(component && component.hasOwnProperty('heatmap') && component.heatmap.hasOwnProperty('scheme')) {
					heatmapParams.heatmapScheme=heatmapSchemes.getSchemeByName({name:component.heatmap.scheme, basemap:this.getCurrentMap().basemap});
					lyr.scheme=component.heatmap.scheme;
				}				
				
				heatmapStatistics({
					  layer: fl,
					  view: view,
					  field: this.isNumericField(fl.fields, renField) ? renField : null
					}).then(function(stats){
					  	heatmapParams.statistics=fl.heatmapStatistics=stats;
						// when the promise resolves, apply the renderer to the layer
						heatmapRendererCreator.createRenderer(heatmapParams)
						  .then(function(response){				
						    fl.renderer = updateRenderer(response.renderer);
							if(layerOptionsHMRenderer) layerOptionsHMRenderer=fl.renderer;
							if(callBack)callBack.call();
						 }.bind(this));
				});
			}
        },
        isOnSimpList: function (geomName){
            for(var j=0;j<simplify.length;j++) {
                if(geomName==simplify[j])
                    return true;
            }
            return false;
        },
        doSimplifyGeom: function (geom, geomName){
            if(1) {
                if(totalPoints(geom.rings)>7000)
                    geom= geometryEngine.generalize(geom,this.options.deviation);
            }
            else {
                for(var j=0;j<simplify.length;j++) {
                    if(geomName==simplify[j]) {
                        geom= geometryEngine.simplify(geom);
                        break;
                    }
                }
            }
            return geom;
        },		
//experimental webgl2 code GIS-1426
        addWindBundle2: function(lyr, comp){
			var othis=this,view = othis.getCurrentView(), map=othis.getCurrentMap(), is2d=!othis.is3dView();		
			if (typeof define === 'function' && define.amd)
				define.amd = false;	
		   ibx.resourceMgr.addBundles([{"src":"../../tdg/jschart/distribution/extensions/com.ibi.geo.map/lib/wind_bundle.xml", "loadContext":"ibx"}]).then(function (){     
			
			let CustomLayerView2D = BaseLayerViewGL2D.createSubclass({
			  render: function(renderParameters) {
			     const gl = renderParameters.context, state = renderParameters.state, width=gl.canvas.width, height=gl.canvas.height ;
				if(this.windy) {
					let buckets = [];
					if(this.updateNeeded) {
						let outSpatialReference = new SpatialReference({
						  wkid: 4326
						}), extent2 = projection.project(state.extent, outSpatialReference);	
						buckets = this.windy.start(
			              [[0,0],[width, height]],
			              width,
			              height,	
			              [[extent2.xmin, extent2.ymin],[extent2.xmax, extent2.ymax]]
			            );
						this.updateNeeded=false;
						gl.drawArrays(gl.LINES, 0, 0);
						
					} else buckets = this.windy.getBuckets();
					gl.enable(gl.BLEND);
					gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);	
					gl.viewport(-width,-height,width*2,height*2);									
			//		
			//		
					gl.useProgram(this.program);
					this.bindVertexArray(this.vao);
					
	        		buckets.forEach((bucket, i) => {	
			            if (bucket.length > 0) {
							gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
							var vertices =[];
			                bucket.forEach((particle) => {
								vertices.push(particle.x);
								vertices.push(particle.y);
								vertices.push(particle.xt);
								vertices.push(particle.yt);
			                    particle.y = particle.yt;
								particle.x = particle.xt;
			                });
							gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
							gl.bindBuffer(gl.ARRAY_BUFFER, null);
							gl.drawArrays(gl.LINES, 0, vertices.length);
				        }
				    });
					setTimeout(() => {this.requestRender();}, 50);
				}
			},
			updateWind: function(bUpdate) {
				if(this.windy) {
					this.updateNeeded=true;
					this.requestRender();
				}				
			  },
			   attach: function()  {
			     const gl = this.context; this.updateNeeded=true;
				const vertexSource = `
              precision highp float;
              uniform mat3 u_transform;
              uniform mat3 u_display;
              attribute vec2 a_position;
              attribute vec2 a_offset;
              varying vec2 v_offset;
              const float SIZE = 70.0;
              void main(void) {
                  gl_Position.xy = (u_display * (u_transform * vec3(a_position, 1.0) + vec3(a_offset * SIZE, 0.0))).xy;
                  gl_Position.zw = vec2(0.0, 1.0);
                  v_offset = a_offset;
              }`;
         const vertCode =
            'attribute vec2 coordinates;' + 
            'void main(void) {' + ' gl_Position = vec4(coordinates,0.0, 500.0);' + '}';

         //Create a vertex shader object
         const vertShader = gl.createShader(gl.VERTEX_SHADER);

         //Attach vertex shader source code
         gl.shaderSource(vertShader, vertCode);

         //Compile the vertex shader
         gl.compileShader(vertShader);

         //Fragment shader source code
		  const fragmentSource = `
	              precision highp float;
	
	              uniform float u_current_time;
	
	              varying float v_distance;
	              varying float v_side;
	              varying vec4 v_color;
	
	              const float TRAIL_SPEED = 50.0;
	              const float TRAIL_LENGTH = 300.0;
	              const float TRAIL_CYCLE = 1000.0;
	
	              void main(void) {
	                float d = mod(v_distance - u_current_time * TRAIL_SPEED, TRAIL_CYCLE);
	                float a1 = d < TRAIL_LENGTH ? mix(0.0, 1.0, d / TRAIL_LENGTH) : 0.0;
	                float a2 = exp(-abs(v_side) * 3.0);
	                float a = a1 * a2;
	                gl_FragColor = v_color * a;
	              }`;
         const fragCode = 'void main(void) {' + 'gl_FragColor = vec4(1.0, 0.0, 0.0, 0.8);' + '}';

         // Create fragment shader object
         const fragShader = gl.createShader(gl.FRAGMENT_SHADER);

         // Attach fragment shader source code
         gl.shaderSource(fragShader, fragCode);

         // Compile the fragment shader
         gl.compileShader(fragShader);

         // Create a shader program object to store combined shader program
         this.program = gl.createProgram();

         // Attach a vertex shader
         gl.attachShader(this.program, vertShader); 
         
         // Attach a fragment shader
         gl.attachShader(this.program, fragShader);
		 // Use the combined shader program object
         // Bind attributes.
	            gl.bindAttribLocation(this.program, this.coordinates, "coordinates");
	       //     gl.bindAttribLocation(this.program, this.aOffset, "a_offset");
	        //    gl.bindAttribLocation(this.program, this.aDistance, "a_distance");
	      //      gl.bindAttribLocation(this.program, this.aSide, "a_side");
	            gl.bindAttribLocation(this.program, this.aColor, "a_color");
         // Link both programs
         gl.linkProgram(this.program);
		// Shader objects are not needed anymore.
	            gl.deleteShader(vertShader);
	            gl.deleteShader(fragShader);
         const requestUpdate = () => {
          this.needsUpdate = true;
          this.requestRender();
        };
		 this.vertexBuffer = gl.createBuffer();
         /* Step 4: Associate the shader programs to buffer objects */

         //Bind vertex buffer object
     //    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

         //Get the attribute location
    //     var coord = gl.getAttribLocation(this.program, "coordinates");

         //point an attribute to the currently bound VBO
    //     gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);

         //Enable the attribute
     //    gl.enableVertexAttribArray(coord);
			this.vao = gl.createVertexArray();
	              this.bindVertexArray = (vao) => gl.bindVertexArray(vao);
	              this.deleteVertexArray = (vao) => gl.deleteVertexArray(vao);
				this.bindVertexArray(this.vao);
	           gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	        //    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	            gl.enableVertexAttribArray(this.coordinates);
	       //     gl.enableVertexAttribArray(this.aOffset);
	      //     gl.enableVertexAttribArray(this.aDistance);
	     //       gl.enableVertexAttribArray(this.aSide);
	      //      gl.enableVertexAttribArray(this.aColor);
	            gl.vertexAttribPointer(this.coordinates, 2, gl.FLOAT, false, 0, 0); 
	      //      gl.vertexAttribPointer(this.aOffset, 2, gl.FLOAT, false, 28, 8);
	      //      gl.vertexAttribPointer(this.aDistance, 1, gl.FLOAT, false, 28, 16);
	      //      gl.vertexAttribPointer(this.aSide, 1, gl.FLOAT, false, 28, 20);
	       //     gl.vertexAttribPointer(this.aColor, 4, gl.UNSIGNED_BYTE, true, 28, 24);
	            this.bindVertexArray(null);
this.centerAtLastUpdate = vec2.fromValues(
              this.view.state.center[0],
              this.view.state.center[1]
            );
//initShaders(gl, "attribute vec4 a_Position;  void main() { gl_Position = a_Position; }", 
//			"precision mediump float; uniform vec4 u_FragColor;  void main() { gl_FragColor = u_FragColor;}");
				
			
				let url= othis.getContext()+'/3rdparty_resources/wind/gfs.json';
				projection.load().then((resp) => {
					esriRequest(url, {
		                responseType: "json"
			            }).then((response) => {	              
			                this.windy = new Windy({ canvas: null, data: response.data });
						})
					});
			   },
			  
			  detach: function() {
	            // Stop watching the `layer.graphics` collection.
	         //   this.watcher.remove();
	
	            const gl = this.context;
	
	            // Delete buffers and programs.
	            gl.deleteBuffer(this.vertexBuffer);
	            gl.deleteBuffer(this.indexBuffer);
	            this.deleteVertexArray(this.vao);
	            gl.deleteProgram(this.program);
	          }
			 });
			
			/* let CustomTileLayer = Layer.createSubclass({
			   tileInfo: TileInfo.create({ spatialReference: { wkid: 3857 }}),
			
			   createLayerView(view) {
			     if (view.type === "2d") {
			       return new CustomLayerView2D({
			         view: view,
			         layer: this
			       });
			     }
			   }
			 });*/
				othis.customWebGLLayer = GraphicsLayer.createSubclass({
	          createLayerView: function(view){
	            if (is2d) {
	              return new CustomLayerView2D({
	                view: view,
	                layer: this
	              });
	            }
	          }
	        });
			othis.windlayer = new othis.customWebGLLayer({
          //  graphics: graphics,
			title:"test"
          });
			

		});
		},
		isColorSet: function(object) {
			if(object.hasOwnProperty("color") && object.color) {
				let clr=new Color(object.color); 
				return clr.a != 0;
			}
			return false;
		},
		addWindBundle: function(lyr, comp){	
			var othis=this;		
			if (typeof define === 'function' && define.amd)
				define.amd = false;			
			
			ibx.resourceMgr.addBundles([{"src":"../../tdg/jschart/distribution/extensions/com.ibi.geo.map/lib/wind_bundle.xml", "loadContext":"ibx"}]).then(function (){
			//	if(othis.is3dView()) {
				let view = othis.getCurrentView(), map=othis.getCurrentMap(), rasterLayer=map.findLayerById("TableChart_4"), canvasElt=$("canvas");
				
				function redraw(){
		          windy.stop();
				  let width=canvasElt.width(),height=canvasElt.height();
		          var extent = view.extent;
		          setTimeout(function(){
		            windy.start(
		              [[0,0],[width, height]],
		              width,
		              height,
					  [[-width, -height],[width, height]]
		            );
		          },500);
		        }
			/*	map.on("extent-change", redraw);
	            map.on("resize", function(){});
	            map.on("zoom-start", redraw);
	            map.on("pan-start", redraw);
[
    [-237.1521718749616,-29.265051411568137],[39.00017187496499,74.90291743854453]
]*/
				///
				let url= othis.getContext()+'/3rdparty_resources/wind/gfs.json';
				esriRequest(url, {
	                responseType: "json"
	            }).then((response) => {	              
	                windy = new Windy({ canvas: canvasElt[0], data: response.data });
					let width=canvasElt.width(),height=canvasElt.height();
		          var extent = view.extent;
					
				
				let outSpatialReference = new SpatialReference({
				  wkid: 4326
				});
	
				projection.load().then(function() {
			  		extent = projection.project(extent, outSpatialReference);
					 var buckets=	windy.start(
		              [[0,0],[width, height]],
		              width,
		              height,
	// [[-237.1521718749616,-29.265051411568137],[39.00017187496499,74.90291743854453]]
		              [[extent.xmin, extent.ymin],[extent.xmax, extent.ymax]]
		            );
				let graphics=[], graphics2=[];
				if(Array.isArray(buckets))
					buckets.forEach(function(bucket, i) {
				            if (bucket.length > 0) {	
								let paths=[], clr=null;  
				                bucket.forEach(function(particle) {
					
									let sp= { x: particle.x, y: particle.y}, location=view.toMap(sp);
									paths.push([location.latitude, location.longitude]);
									sp= { x: particle.xt, y: particle.yt};
									location=view.toMap(sp);
									paths.push([location.latitude, location.longitude]);
									if(!clr)
									clr=particle.color;
									paths.push([particle.xt, particle.yt]); 
								/*	let pt1=new Point({x:particle.x, y:particle.y}),pt2=new Point({x:particle.xt, y:particle.yt});
									gr.setPoint(0,index, pt1);
									index++;
									gr.setPoint(0,index, pt2);
									index++;
									paths.push([particle.x, particle.y]);
									paths.push([particle.xt, particle.yt]); 
				                    g.moveTo(particle.x, particle.y);
				                    particle.x = particle.xt;
				                    particle.y = particle.yt;*/
									 let locationGraphic = new Graphic({
								    geometry: {
  type: "point",  // autocasts as new Point()
  longitude:location.latitude,
  latitude: location.longitude
},
								    symbol: {type: "simple-marker",
					          color: particle.color,
			size:10
					          }
					  
					  });
									graphics2.push(locationGraphic);			
				                });	
								let gr={
						              attributes: {
						                "color": clr || [0,0,0]
						              },
						              geometry: {
						                paths: paths,
						                type: "polyline"
						              }
						            };
									graphics.push(gr);			            
				            }
				        });
						const layer = new othis.customWebGLLayer({
				            graphics: graphics,
							title:"test"
				          });
				
				          map.layers.add(layer);//map.layers.add(new GraphicsLayer({graphics: graphics2,title:"test"}));
				 });	      
/*				  var particals=	windy.start(
		              [[0,0],[width, height]],
		              width,
		              height,
		//			  [[-width/2, -height/2],[width/2, height/2]]
		       //       [[extent.xmin, extent.ymin],[extent.xmax, extent.ymax]]
//[[-211.5759999999684, -8.10026289477602],[13.42399999997178, 67.79358596658133]]
		            );
let junk = 0;
const graphics = response.data.map((trip) => {
	            return {
	              attributes: {
	                "color": trip.color
	              },
	              geometry: webMercatorUtils.geographicToWebMercator({
	                paths: [trip.path],
	                type: "polyline",
	                spatialReference: {
	                  wkid: 4326
	                }
	              })
	            };
	          });
	
	          const layer = this.customWebGLLayer({
	            graphics: graphics
	          });
	
	          map.layers.add(layer);
	        });*/
	             //   redraw();
	            },
				(err) => {
	                console.log("Error: ", error.message);
	            });	           
	
	       /*   else {
	            dom.byId("mapCanvas").innerHTML = "This browser doesn't support canvas. Visit <a target='_blank' href='http://www.caniuse.com/#search=canvas'>caniuse.com</a> for supported browsers";
	          }	*/
			});		
		},
    }
});

function styleSelectBox(typeMenu){
	typeMenu.find("input").css({"background-color":"transparent", "border-style":"none"});
    typeMenu.css({"background-color":"transparent"});
    var btn =  typeMenu.find(".ibx-button");
  //  btn.removeClass("ibx-button"); btn.addClass("esri-widget--button"); btn.css({height:"auto", width:"20px"});  
}  
function getTransString(strKey) {
    var retStr= isIbxLoaded() ? ibx.resourceMgr.getString("mlmap."+strKey) : strKey;
    return retStr;
}
function setTransStringAttrs(elt, titlestrKey, labelstrkey) {
    if(labelstrkey && isIbxLoaded())
        elt.ibxWidget("option", "aria.label", getTransString(labelstrkey));
    elt.attr("title", getTransString(titlestrKey));
}

function rgba2hex(orig) {
    var a, isPercent,
        rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
        alpha = (rgb && rgb[4] || "").trim(),
        hex = rgb ?
            (rgb[1] | 1 << 8).toString(16).slice(1) +
            (rgb[2] | 1 << 8).toString(16).slice(1) +
            (rgb[3] | 1 << 8).toString(16).slice(1) : orig;

    if (alpha !== "") { a = alpha; }
    else { a = 01; }
    hex = hex + a;

    return hex;
}
function minMax(data, key, abs) {
    var res, min = Infinity, max = -Infinity;
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        if (Array.isArray(d)) {
            res = minMax(d, key, abs);
        } else if (typeof d === 'object') {
            var value = (d[key] == null) ? d.value || 0 : d[key];
            res = { min: value, max: value };
        } else if (typeof d === 'number') {
            res = { min: d, max: d };
        }
        if (abs) {
            res.min = Math.abs(res.min);
            res.max = Math.abs(res.max);
        }
        min = Math.min(res.min, min || 0);
        max = Math.max(res.max, max || 0);
    }
    return { min: min, max: max };
}
function minMax2(data,abs) {
    var res, min = Infinity, max = -Infinity;
    for (var i = 0; i < data.length; i++) {
		res = { min: data[i], max: data[i] };
       
        if (abs) {
            res.min = Math.abs(res.min);
            res.max = Math.abs(res.max);
        }
        min = Math.min(res.min, min || 0);
        max = Math.max(res.max, max || 0);
    }
    return { min: min, max: max };
}
function lintColorBetween(left, right, perc) {
    var retCol = {}, comp = ["r", "g", "b"];
    for (var i = 0; i < comp.length; i++) {
        var c = comp[i];
        retCol[c] = Math.round(Math.sqrt((left[c] ** 2 + (right[c] ** 2 - left[c] ** 2) * perc)));
    }
    return retCol;
}
function getFlatData(data) {
    var r = [];
    for (var i = 0; i < data.length; i++)
        r = r.concat(data[i]);
    return r;
}
function prettyName(data, delim) {
    if (typeof (data.name) === 'string') {
        if(!delim || delim==='|') delim='[|]';//var re = /\|/g;
        var re =new RegExp(delim, "g");
        data.name = data.name.replace(re, ", ");
    }
    return data;
}
function getRadForVal(maxVal, MaxRad, val) {
    if (val >= maxVal)
        return MaxRad;
    var mArea = Math.PI * MaxRad * MaxRad;
    var vArea = mArea * val / maxVal;
    return Math.sqrt(vArea / Math.PI);
}
function symbolTypeFromGeomType(gtype) {
    var stype = "simple-fill";
    switch (gtype) {
        case "bubble":
		case "point":
            stype = "simple-marker";
            break;
        case "line":
		case "polyline":
            stype = "simple-line";
            break;
        case "choropleth":
		case "polygon":
            stype = "simple-fill";
            break;
    }
    return stype;
}
function mapGeoType2esriGeoType(gtype) { 
    var retType = "esriGeometryEnvelope";
    switch (gtype) {
        case "bubble":
		case "point":
            retType = "esriGeometryPoint";
            break;
        case "line":
		case "polyline":
           retType = "esriGeometryPolyline";
            break;
        case "choropleth":
		case "polygon":
            retType = "esriGeometryPolygon";
            break;
    }
    return retType;
}
function isRegularShape(shape) {
    return shape == "circle" || shape == "square" || shape == "cross" ||  shape == "cone" || shape == "cylinder" || 
            shape == "x" || shape == "diamond" || shape == "triangle" || shape == "sphere"; 
}
function getUrl(shape, context) {
    var url = null;
    if(typeof(shape)==='string' && shape.indexOf('url')!=-1) {
        var brc1 = shape.search('[(]'), brc2 = shape.search('[)]');
        if (brc1 != -1 && brc2 != -1) 
            url = resolveUrl(shape.substr(brc1 + 1, brc2 - brc1 - 1),context);
    }
    else if(typeof(shape)==='string' && (isFullyQualifiedHtppPath(shape) || shape.indexOf('/approot/')!=-1))
        url=context+shape;
    return url;
}          
function resolveUrl(imgSrc,context) {
    if (isFullyQualifiedHtppPath(imgSrc))
        return imgSrc;
    return context+"/WFServlet.ibfs?IBFS1_action=RUNFEX&IBFS_path=" + imgSrc;
}
function isFullyQualifiedHtppPath(imgSrc) {
    var strings = ["http://", "https://"];
    /*  strings.push(WFInstallOption_CGIPath);
      strings.push(WFInstallOption_ibihtml_alias);
      strings.push(WFInstallOption_approot_alias);
      var approot = WFInstallOption_approot_alias;
      if (typeof (approot) == 'string')
          approot = approot.replace(WFInstallOption_CGIPath, "/");
      strings.push(approot);*/
    if (imgSrc) {
        imgSrc = imgSrc.toLowerCase();
        for (var i = 0; i < strings.length; i++) {
            if (imgSrc.search(strings[i].toLowerCase()) == 0)
                return true;
        }
        if (imgSrc.search("/javaassist/") != -1 || imgSrc.search("/dhtml/images") != -1)
            return true;
    }
    return false;
}
//# sourceURL=ibgeo.js
function cycleSeries(chart, m_series, seriesID, seriesWithColor) {

	var seriesRepetitions;
	var maxSeries = seriesWithColor.length;
	var targetSeries = seriesWithColor[seriesID % maxSeries];
	function lightenColor(color) {
		var hsl = color.hsl();
		var dx = (chart.riserCycleEndLightness - hsl.l) / seriesRepetitions;  // How much to brighten on each cycle
		var mx = Math.floor(seriesID / maxSeries);    // Which cycle this series falls into
		hsl.l += dx * mx;
		return hsl.rgb().toString();
	}

	if (targetSeries != null && targetSeries.color != null) {
		var seriesCount = (chart.getColorMode() === 'byGroup') ? chart.groupCount() : m_series.length;
		
		seriesRepetitions = Math.max(1, Math.ceil(seriesCount / maxSeries) - 1);

		var color = tdgchart.util.color(targetSeries.color);
		if (tdgchart.util.color.isGradient(color)) {
			color.stops.forEach(function(el) {
				el[1] = lightenColor(tdgchart.util.color(el[1]));
			});
			return color;
		} else {
			return lightenColor(color);
		}
	}
	return 'black';
}
function doXmlHttpRequest(path, config) {
	var request;
	function onLoad() {
		if (request && request.status === 200 && request.readyState === 4) {
			var res = request.responseText;
			if (config.asJSON) {
				try {
					res = JSON.parse(request.responseText);
				} catch (e) {
					try {
						res = request.responseText;
					} catch (e) {
						// Failure here means we have totally invalid JSON.  Return nothing.
						res = {};
					}
				}
			}
			else if(config.asXML)
				res=request.responseXML || request.responseText;
			if (typeof config.onLoad === 'function') {
                var distPart="";
                if(typeof(postData)==='string'){
                    var index = postData.indexOf(',');
			        if (index >= 0)
                        distPart = postData.substr(0, index); 
                }
				return config.onLoad(res, config.curList);
			}
			return res;
		} else if (config.onError) {
			config.onError(request, config.curList);
		}
		return undefined;
	}
	var protocol = window.location.protocol;
	if (!window.tdgAllowFileRequests && (protocol === 'file:' || protocol === 'content:')) {
		tdg.logError('Could not dynamically load: ' + path);
		if (config.onError) {
			config.onError();
		}
		return null;  // If we're developing locally, don't try loading external resources - always fails
	}

	config = config || {};
	try {
		var postData = null;
		if (config.GETLimit >= 0) {
			var index = path.indexOf('?');
			if (index >= 0) {
				var tempPath = path.substr(0, index); // Gets the first part
				var data = path.substr(index + 1);  // Gets the text part
				if (data.length >= config.GETLimit) {
					postData = data;
					path = tempPath;
				}
			}
		}

		var method = (typeof config.requestMethod === 'string')
			? config.requestMethod.toUpperCase()
			: (postData ? 'POST' : 'GET');
        
		request = new XMLHttpRequest();
		request.open(method, path, config.async || false);
		request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		if(config.hasOwnProperty("csrfName") && config.csrfName!== undefined && method=='POST') 
			request.setRequestHeader(config.csrfName,config.csrfValue);
		if (config.async && config.onLoad) 
			request.onload = onLoad;
		
		request.send(postData);
	} catch (err) {
		request = null;
	}

	if (request && !config.async) {
		return onLoad();
	}
	return null;
}
function isIEBrowser() {
    if (isIEvar == null) {
        if (typeof ActiveXObject != 'undefined')
            isIEvar = true;
        else {
            var xmlDoc = new DOMParser().parseFromString('<xml></xml>', 'text/xml');
            isIEvar = (!xmlDoc || typeof (xmlDoc.evaluate) != 'function') ? true : false;
        }
    }
    return isIEvar;
}
function getSingleNode(xmlNode, pattern) {
    if (typeof (xmlNode) == "object") {
        if (isIEBrowser()) {
            if (typeof (xmlNode.selectSingleNode) != 'undefined')
                return xmlNode.selectSingleNode(pattern);
        }
        else {
            var ownerXml = xmlNode.nodeType == 9 ? xmlNode : xmlNode.ownerDocument;
            try {
                if (typeof (ownerXml.evaluate) != 'undefined') {
                    var nodes = ownerXml.evaluate(pattern, xmlNode, null, 0, null);
                    if (nodes)
                        return nodes.iterateNext();
                }
                else if (typeof (xmlNode.selectSingleNode) != 'undefined')
                    return xmlNode.selectSingleNode(pattern);
                else if (typeof (xmlNode.getElementsByTagName) != 'undefined') {
                    return xmlNode.getElementsByTagName('rootxmlnode')[0];
                }
            }
            catch (e) {
                console.log("ownerXml.evaluate");
            }
        }
    }
    return null;
}
function getNodes(xmlNode, pattern) {
    var ownerXml = xmlNode.nodeType == 9 ? xmlNode : xmlNode.ownerDocument;
    if (typeof (ownerXml.evaluate) != 'undefined')
        return ownerXml.evaluate(pattern, xmlNode, null, 0, null);
    else if (typeof (xmlNode.selectNodes) != 'undefined')
        return xmlNode.selectNodes(pattern);
    return null;
}
function getNodesArray(xmlNode, pattern, arrTempAddTo) {
    var arrTemp = [];
    var nodes = getNodes(xmlNode, pattern);
    if (nodes) {
        var node = nodes.iterateNext(); 
        while (node) {
            arrTemp.push(node);
            if (arrTempAddTo)
                arrTempAddTo.push(node);
            node = nodes.iterateNext();
        }
    }
    return arrTemp;
}
function eventKey(event) {
	return ['event', 'object', 'series', 'group', 'misc', 'row', 'col', 'axis'].map(function(el) {
		return (event[el] == null) ? '' : event[el];
	}).join('');
}
function getDynamicCSSRules(htmlToolTip) {
	var hoverColor = htmlToolTip.cascadeMenuStyle.hover.fill || 'rgba(220,220,220,0.9)';
	var hoverLabelColor = htmlToolTip.cascadeMenuStyle.hover.labelColor || 'white';
	var border = getToolTipBorder(htmlToolTip);
	
	var nameStyle = htmlToolTip.cascadeMenuStyle.nameValue.name || {font: '', color: ''};
	var valueStyle = htmlToolTip.cascadeMenuStyle.nameValue.value || {font: '', color: ''};
	if(valueStyle.color=="black") {
		valueStyle.color="white";
		nameStyle.color="#fff6ce";
	}
	var labelStyle = htmlToolTip.cascadeMenuStyle.label || {font: '', color: valueStyle.color};
		
	var rules = [
		['.tdgchart-tooltip-highlight', '{\n\tbackground: ' + hoverColor + ';\n\tcolor: ' + hoverLabelColor + '; \n\toutline:0;\n}'],
		['.tdgchart-submenu-style', '{\n\tbackground-color: black;\n\tcolor: ' + valueStyle.color + '; \n}'],		
		['.tdgchart-tooltip-hover:focus', '{\n\toutline:0;\n}'],
		//['.tdgchart-tooltip-divider', '{\n\tmargin: 0;border: 0;\n\theight: ' + border.width + 'px;\n\tbackground-color: ' + border.color + '\n}'],
		['.tdgchart-tooltip-label', '{\n\tfont: ' + labelStyle.font + '; color: ' + (labelStyle.color || valueStyle.color) + ';\n}'],
		['.tdgchart-tooltip-name', '{\n\tfont: ' + nameStyle.font + '; color: ' + nameStyle.color + ';\n}'],
		['.tdgchart-tooltip-value', '{\n\tfont: ' + valueStyle.font + '; color: ' + valueStyle.color + ';\n}']
	];

	return rules;
}
function getToolTipBorder(htmlToolTip) {
	var border = htmlToolTip.border || {};
	return {
		color: border.color || defaultBorderColor,
		width: border.width == null ? defaultBorderWidth : border.width,
		cornerRadius: border.cornerRadius == null ? defaultBorderRadius : border.cornerRadius
	};
}
function getCascadeTooltipCSSRules(htmlToolTip) {
	var valueStyle = htmlToolTip.cascadeMenuStyle.nameValue.value || {font: '', color: ''};
	var rules = [ 
		'.tdgchart-tooltip-hover {\n\tposition: relative;\n}',
		'.tdgchart-tooltip-list {\n\tlist-style: none; padding: 0; margin: 0; display: block; outline: none;\n}',
		'.tdgchart-tooltip-pointer {\n\tcursor: pointer;\n}',
		'.tdgchart-submenu {\n\tvisibility: visible; display:none; position: absolute; top: -1px; padding: 5px; padding-bottom: 0px; margin-right: 5px; \n}',
		'.tdgchart-submenu-style {\n\tvisibility: hidden; border-radius:3px;\n}',
		'.tdgchart-tooltip-submenu-pad {\n\tpadding: 3px; \n}',
		'.tdgchart-tooltip-arrow {\n\tfont: bold 12px Helvetica;\n\ttransform: scale(0.7,1.1);\n\tposition: absolute;\n\tleft: auto; right: 4px;\n\ttop: 50%;\n\tmargin-top:-6px\n}\n'
	];

	return rules.concat(getDynamicCSSRules(htmlToolTip).map(function(el) {return el.join(' ');}));
}
function insertCSSRule(sheet, rule, badd) {
    if(typeof(rule)==='string'){
        rule=rule.replace("..",".");
		if (sheet.insertRule) {
            sheet.insertRule(rule, badd ? sheet.cssRules.length : 0);
        } else if (sheet.addRule) {
            var tmp = rule.replace('}', '').split('{');
            sheet.addRule(tmp[0], tmp[1], 0);
        }
    }
}
function isTooltipEnabled(arrTT, field) {
    for(var b=0;b<arrTT.length;b++){
        if(arrTT[b]==field)
            return true;
    }
    return false;
}
function isEmptyRecord(records) {
    var ret=false;
    if(records.length==1){
        var A = records[0];
        ret=true;
        for (var key in A) {
            if (A.hasOwnProperty(key) && A[key] && A[key]!==' ') 
                return false;
        }
    }
    return ret;
}
function totalPoints(rings) {
    var total=0;
    rings.forEach(function(ring){
        total+=ring.length;
    });
    return total;
}
var simplify = ["NEW SOUTH WALES","New South Wales","SCOTLAND","Scotland","TASMANIA","Tasmania","Victoria","VICTORIA"
                ,"WESTERN AUSTRALIA","Western Australia","SOUTH AUSTRALIA","South Australia","CAUCA","Cauca",
                "NORTHERN TERRITORY","Northern Territory","QUEENSLAND","Queensland","VALLE DEL CAUCA","Valle del Cauca"];

function toUnicode( value ) {
    var out = ""
    for (var i = 0; i < value.length; i++) {
        var ch = value.charAt(i);
        var chn = ch.charCodeAt(0);
        if (chn <= 127) out += ch;
        else {
            var hex = chn.toString(16);
            if (hex.length < 4)
                hex = "000".substring(hex.length - 1) + hex;
            out += "\\u" + hex.toUpperCase();
        }
    }
    return out;
}
function mergeObjects(dest,src,update) {
	if(typeof(src) ==='object') {
		Object.keys(src).forEach(function(key){
			if(typeof(src[key]) ==='object' && typeof(dest[key]) ==='object') 
				mergeObjects(dest[key], src[key], update);
			else if(!dest.hasOwnProperty(key) || update)
				dest[key] = src[key];
		});
	}
}
function convertValues(extrusion) {
	switch(extrusion.units){
		case "feet": {
			extrusion.minHeight=parseInt(extrusion.minHeight*0.3048,10);
			extrusion.maxHeight=parseInt(extrusion.maxHeight*0.3048,10);
			extrusion.radius=parseInt(extrusion.radius*0.3048,10);
			break;
		}
		case "km": {
			extrusion.minHeight=extrusion.minHeight*1000;
			extrusion.maxHeight=extrusion.maxHeight*1000;
			extrusion.radius=extrusion.radius*1000;
			break;
		}
		case "mi": {
			extrusion.minHeight=parseInt(extrusion.minHeight*1609.34,10);
			extrusion.maxHeight=parseInt(extrusion.maxHeight*1609.34,10);
			extrusion.radius=parseInt(extrusion.radius*1609.34,10);
			break;
		}
	}
}
if(!window.showModalDialog)
{ 
	window.showModalDialog = function (url, arg, feature) {
        var opFeature = feature.split(";");
       var featuresArray = new Array();
        if (document.all) {
           for (var i = 0; i < opFeature.length - 1; i++) {
                var f = opFeature[i].split("=");
               featuresArray[f[0]] = f[1];
            }
       }
        else {

            for (var i = 0; i < opFeature.length - 1; i++) {
                var f = opFeature[i].split(":");
               featuresArray[f[0].toString().trim().toLowerCase()] = f[1].toString().trim();
            }
       }

       var h = "200px", w = "400px", l = "100px", t = "100px", r = "yes", c = "yes", s = "no";
       if (featuresArray["dialogheight"]) h = featuresArray["dialogheight"];
        if (featuresArray["dialogwidth"]) w = featuresArray["dialogwidth"];
       if (featuresArray["dialogleft"]) l = featuresArray["dialogleft"];
        if (featuresArray["dialogtop"]) t = featuresArray["dialogtop"];
        if (featuresArray["resizable"]) r = featuresArray["resizable"];
       if (featuresArray["center"]) c = featuresArray["center"];
      if (featuresArray["status"]) s = featuresArray["status"];
        var modelFeature = "height = " + h + ",width = " + w + ",left=" + l + ",top=" + t + ",model=yes,alwaysRaised=yes" + ",resizable= " + r + ",status=" + s;
		var model=null;
        try {
			model = window.open(url, "", modelFeature);
			model.dialogArguments = arg;
		}
		catch (e) {
             alert(e);
        }
        
        return model;
    };
}
function addTooltipLine(header, value, esri, append) {
	header=header.replaceAll(" ", "&nbsp;");
	value=value.replaceAll(" ", "&nbsp;");
	var ttTr=$('<tr></tr>'),  
    ttTd=esri ? $('<th class="esri-feature__field-header">' + header +':&nbsp;</th>' ) : 
        $('<td class="tdgchart-tooltip-name">' + header +':&nbsp;</td>' );
	ttTd.css("width","100%");
    $(ttTd).appendTo($(ttTr));
    ttTd= esri ?  $('<td class="esri-feature__field-data">' + value +'</td>' ) :
            $('<td tdgchart-tooltip-value">' + value +'</td>' ); 
	ttTd.css({"width":"100%", "word-break":"normal"});
    $(ttTd).appendTo($(ttTr));
	ttTr.appendTo($(append));
}

function isRunningInPortal() {
	const pages=$(window.parent.document.body).find('.pd-page');
	return pages && pages.length;
}
function isRunningInPageDesigner() {
    var returnVal = false;    
    var parentWin = window.parent;
    try {
        if (window.frameElement) {
         //   var parantCont = $(window.frameElement).parent(".ibx-iframe || .bi-iframe || .ibx-iframe-frame");
            returnVal = $(window.frameElement).hasClass("ibx-iframe-frame") || 
						$(window.frameElement).hasClass("ibx-iframe") ? $(window.frameElement).attr("name") : false;
        }
    }
    catch (e) {
        returnVal = true;
    }
   
    return returnVal;
}
function getFileFromLocation() {
	let wName=isRunningInPageDesigner();
	if(typeof(wName) == 'string') {
		const frames= $(window.parent.document.body).find(".pd-cont-iframe");
		if(frames && frames.length) {
			for(let i = 0; i < frames.length; i++){
				let frmParent = frames.eq(i).parent();
				if(frmParent.attr("data-ibxp-iframe-name") == wName) {
					return frmParent.attr("data-ibxp-path") + frmParent.attr("data-ibxp-file");
				}
			}
		}
	}
	else {
		var loc = getLocationSearch();
	    if (!loc && !isRunningInPortal()) {
	        loc = document.location.pathname;
	        var index = loc.lastIndexOf("/");
	        var indexDot = loc.lastIndexOf(".");
	        if (index != -1) {
	            if (indexDot == -1 || loc.slice(indexDot + 1, loc.length).toLowerCase() == "htm")
	                return loc.slice(index + 1, (indexDot != -1 ? indexDot : loc.length));
	        }
	    }
	    if (typeof (loc) == 'string') {
	        var vars = loc.split("&");
	        var path = "";
	        for (var i = 0; i < vars.length; i++) {
	            var amper1 = vars[i];
	            var nameandvalue = amper1.split("=");
	            if ("BIP_folder" == nameandvalue[0]) {
	                try { /* BIP_folder is double encoded with UTF-8 */
	                    path = decodeURIComponent(decodeURIComponent(nameandvalue[1]));
	                } catch (e) {
	                    path = ibiunescape(nameandvalue[1]);
	                }
	                var index = path.indexOf(":");
	                if (index != -1)
	                    path = path.slice(index + 1, path.length);
	            }
	            if ("BIP_item" == nameandvalue[0] || "item" == nameandvalue[0]) {
	                var bip_item_value = "";
	                try { /* BIP_item is double encoded with UTF-8 */
	                    bip_item_value = decodeURIComponent(decodeURIComponent(nameandvalue[1]));
	                } catch (e1) {
	                    bip_item_value = ibiunescape(nameandvalue[1]);
	                }
	                path += ((path.lastIndexOf("/") != path.length - 1) ? "/" : "") + bip_item_value;
	                return path;
	            }
				if ("IBFS_path" == nameandvalue[0]) {
	                var bip_item_value = "";
	                try { /* BIP_item is double encoded with UTF-8 */
	                    path = decodeURIComponent(decodeURIComponent(nameandvalue[1]));
	                } catch (e1) {
	                    path = ibiunescape(nameandvalue[1]);
	                }
	                return path;
	            }	
	        }
	    }
	}
    
    return null;
}
function getLocationSearch() {
    var loc = document.location.search;
	if (!loc || !loc.length)
		loc=window.parent && window.parent.location ? window.parent.location.search : "";
    if (loc && loc.length)
        loc = loc.replace("?", '');
    return loc;
}
function getLocationSearchSkipPrivate() {
    var retString = "";
    var string = getLocationSearch();
    if (typeof (string) == 'string') {
        var vars = string.split("&");
        var token = getSesTokenName();
        for (var i = 0; i < vars.length; i++) {
            var amper1 = vars[i];
            if (amper1 && amper1.length > 0) {
                var nameandvalue = amper1.split("=");
                if (unescape(nameandvalue[0]) == token)
                    continue;
                var bAdd = true;
                for (var j = 0; j < privateVars.length; j++) {
                    if (unescape(nameandvalue[0]) == privateVars[j]) {
                        bAdd = false;
                        break;
                    }
                }
                if (bAdd) {
                    if (i > 0)
                        retString += "&";
                    retString += amper1;
                }
            }
        }
    }
    return retString;
}
function fileName(path){
	var fName=path;
	if(typeof(path)=='string'){
		var index = path.lastIndexOf("/");
	    if (index != -1) {
	        path = path.slice(index + 1, path.length - 1);
	        var dot = path.indexOf(".");
	        fName = dot != -1 ? path.slice(0, dot) : path;
	    }
	}
	return fName;
}
function ibiescape(str)
{
  if( str !== null )
  {
    str = escape(str);
    str = str.replace(/%u/g,'%25u').replace(/%([89A-F])/g,'%25u00$1');
  }

  return str;
}
function ibiunescape(str)
{
  if( str !== null )
  {
    str = str.replace(/%2525u/g, '%u');
    str = str.replace(/%25/g,    '%');
    str = unescape( str );
  }

  return str;
}
function json2Text(json) {
	var jText=JSON.stringify(json), 
	re = /\,/g, re2 = /\}/g, re3=/\{/g;
	jText=jText.substr(1,jText.length-2)./*replace(re,",\n\t").*/replace(re2,"}\n\t").replace(re3,"{\n\t");
	return jText;
}
function getFieldNameFromFullyQualifiedName(fqNameOrNot, bSplitAnyway) {
    var temp = null;
    var name = null;
    if (fqNameOrNot && typeof (fqNameOrNot) == "object") {
        var t1 = fqNameOrNot[0];
        if (typeof (t1) == "object")
            name = temp = t1.value;
        else
            name = temp = t1;
    }
    else
        name = temp = fqNameOrNot;
    if (name && typeof (name) == "string" && (bSplitAnyway || name.search(" ") == -1)) {
        var parts = temp.split(".");
        var len = parts.length;
        if (len > 1)
            name = parts[len - 1];
    }
    return name;
}
function appstudioShape2esriShape(asShape) {
	var retShape="circle";
	switch(asShape) {
		case "STYLE_DIAMOND":
			retShape="diamond";
		break;
		case "STYLE_SQUARE":
			retShape="square";
		break;
		case "STYLE_CROSS":
			retShape="cross";
		break;
		case "STYLE_TRIANGLE":
			retShape="triangle";
		break;
		case "STYLE_X":
			retShape="x";
		break;
	}
	return retShape;
}
function getFieldValueEx(record,col,display){
	var nodeVal=getSingleNode(record,"./td[@colnum='" + col + "']");
	return (nodeVal && nodeVal.hasAttribute("rawvalue") && !display) ? nodeVal.getAttribute("rawvalue") : 
			(nodeVal && nodeVal.firstChild ? nodeVal.firstChild.nodeValue : "");
}
function getColumnNodeEx(xmlNode, fName){
    var colNode = getSingleNode(xmlNode, "//column_desc/col[@fieldname='" + fName + "']");
	if (!colNode)
		colNode = getSingleNode(xmlNode, "//column_desc/col[@fieldname='" + getFieldNameFromFullyQualifiedName(fName) + "']");
    if (colNode)
        return colNode.getAttribute("colnum");
	return null;
}
function addTTEntry(name, value, appendTo, bEsri){
	let ttTr=$('<tr></tr>'),  
    ttTd=bEsri ? $('<th class="esri-feature__field-header">' + name +':&nbsp;</th>' ) : 
        $('<td class="tdgchart-tooltip-name">' + name +':&nbsp;</td>' );
    $(ttTd).appendTo($(ttTr));
    ttTd= bEsri ?  $('<td class="esri-feature__field-data">' + value +'</td>' ) :
            $('<td class="tdgchart-tooltip-value">' + value +'</td>' ); 
    $(ttTd).appendTo($(ttTr));
    $(ttTr).appendTo( $(appendTo));
}
function transform(item, edaPrefix){
	var retObj={};
	retObj["title"]=item["TITLE"];
	retObj["name"]=item["NAME"];
	retObj["uri"]=item["URI"];
	retObj["layerType"]=item["LAYERTYPE"];
	retObj["options"]={"visible":true,"opacity":"1"};
	retObj["authorization"]=item["AUTHORIZATION"];
	if(item["AUTHORIZATION"]== "silent" || item["AUTHORIZATION"]== "named")
		retObj["url"]=edaPrefix+"/GisEsriProxy/"+item["AUTHORIZATION"]+":"+item["NAME"];
	else
		retObj["url"]=item["URI"];
	try {
		var scriptObj=JSON.parse("{"+item["SCRIPT"]+"}");
		retObj["smartMapping"]=scriptObj.smartMapping;
		retObj["layerObjectType"]=scriptObj.layerObjectType;
	}
	catch(e){
		return retObj;
	}
	return retObj;
}
function addQuotes(str) {
	let retStr=trimLeftAndRight(str);
	if(isNaN(retStr))
	   retStr="'" + retStr + "'";
	return retStr;
}
function trimLeftAndRight(input, charToTrim) {
    var retString = input;
    if (typeof (input) == 'string') {
        if (!charToTrim)
            retString = input.replace(/(^\s+|\s+$)/g, "");
        else {
            if (input[0] == charToTrim && input[input.length - 1] == charToTrim)
                retString = input.substr(1, input.length - 2);
        }
    }
    return retString;
}
function isIbxLoaded() {
    return (typeof(ibxBusy) !== "undefined");
}
function findValueByKey(object,key) {
	Object.keys(object).forEach(function(U){
		if(typeof(object[U]) ==='object') 
			return findValueByKey(object[U],key);
		else if(U==key)
			return object[U];
	});
}
function getAddedGraphic(A,arrGeom){				
	for(let n=0; n<arrGeom.length;n++) {
		let arrAttr=arrGeom[n].attributes;
		if(arrAttr.hasOwnProperty("COUNTRY")){
			if(arrAttr["COUNTRY"] == A["COUNTRY"]) {
				if(arrAttr.hasOwnProperty("GEOLEVEL1")){
					if(arrAttr["GEOLEVEL1"] == A["GEOLEVEL1"]) {
						if(arrAttr.hasOwnProperty("GEOLEVEL2")){
							if(arrAttr["GEOLEVEL2"] == A["GEOLEVEL2"])
								return arrGeom[n];
						}
						else return arrGeom[n];
					}
				}
				else return arrGeom[n];
			}
		} 						
		else if(arrAttr.hasOwnProperty("GEOLEVEL1") && arrAttr["GEOLEVEL1"] == A["GEOLEVEL1"])
			return arrGeom[n];
	}
	return null;
}
function getNodeValue(xmlNode, nodeName) {
    var node = null;
    if (typeof (xmlNode) == "object") {
        var ownerXml = xmlNode.nodeType == 9 ? xmlNode : xmlNode.ownerDocument,
        xpathResult = ownerXml.evaluate(nodeName, xmlNode, null, 0, null);
        node = xpathResult.iterateNext();
        if (node && node.firstChild)
            return node.firstChild.nodeValue;
        return "no value";
    }
    return null;
}

function mergePopupTemplate(graphic, popupToAdd, bEsriTheme) {
	let addTo=graphic.popupTemplate;
	if(addTo) {
		let arrTrsIn=$(addTo.content).find("tr"), arrTrsToMerge=$(popupToAdd).find("tr"), tbl=$(addTo.content).find("table"), list=$(popupToAdd).find(".tdgchart-tooltip-list").first();
		tbl.css("width","100%");
		if(list) {
			if(arrTrsToMerge.length>0) {				 	
				let found=false, tr=arrTrsToMerge.eq(0), tds=tr.find("td");
				for(let n=0; n<arrTrsIn.length;n++) {
					let exsTd=arrTrsIn.eq(n).find("td");
					if(exsTd.length==2 && tds.length==2 && 
						exsTd.eq(0).text() == tds.eq(0).text() && exsTd.eq(1).text() == tds.eq(1).text()) {						
						found=true;
						break;
					}
					else if(exsTd.length==3 && tds.length==3 && 
						exsTd.eq(1).text() == tds.eq(1).text() && exsTd.eq(2).text() == tds.eq(2).text()) {
						found=true;
						break;
					}
				}
				if(found)
					tr.remove();
			}
			list.find("table").css("width","100%");
			if(bEsriTheme) list.appendTo($(addTo.content).find("tbody"));
			else list.appendTo($(addTo.content));
		}
	}
}
//"Altitude":"alti", "Velocity":"velo",
function getOrbitPoints(line1, line2, period, epoch, ttObj, satrec) {
	var nowDate = new Date(), epochDate=new Date(epoch),
    nowJ = jday(nowDate.getUTCFullYear(), nowDate.getUTCMonth() + 1, 
                 nowDate.getUTCDate(), nowDate.getUTCHours(), 
                 nowDate.getUTCMinutes(), nowDate.getUTCSeconds());
    nowJ += nowDate.getUTCMilliseconds() * 1.15741e-8; //days per millisecond   
	if(!satrec) {
		satrec = satellite.twoline2satrec(line1, line2);
		ttObj.satrec=satrec;	
	}		

	let epochJ = jday(epochDate.getUTCFullYear(), epochDate.getUTCMonth() + 1, 
                 epochDate.getUTCDate(), epochDate.getUTCHours(), 
                 epochDate.getUTCMinutes(), epochDate.getUTCSeconds());
    epochJ += epochDate.getUTCMilliseconds() * 1.15741e-8; 
	 //   var period = (2 * Math.PI) / satCache[satId].no  //convert rads/min to min
    let now = (nowJ - epochJ) * 1440.0, timeslice = period / NUM_SEGS, pointsOut=[], gmst = satellite.gstime_from_date(
	    nowDate.getUTCFullYear(),  nowDate.getUTCMonth() + 1,  nowDate.getUTCDate(),
	    nowDate.getUTCHours(),  nowDate.getUTCMinutes(),  nowDate.getUTCSeconds());
	const rad2deg = 180 / Math.PI;	
	for(let i=0; i<period+1; i++) {
	  var t = now + i, obj= satellite.sgp4(satrec, t), position_eci = obj.position, point=null,
				position_gd;
	  try {
		position_gd = satellite.eci_to_geodetic(position_eci, gmst);
		let longitude = position_gd.longitude, latitude = position_gd.latitude, height=position_gd.height;
		if (isNaN(longitude) || isNaN(latitude) || isNaN(height)) {
			if(period==1) return null;
		    continue;
		  }
	  while (longitude < -Math.PI) {
	    longitude += 2 * Math.PI;
	  }
	  while (longitude > Math.PI) {
	    longitude -= 2 * Math.PI;
	  }
		if(period==1) {
			if(ttObj){
				ttObj.alti=parseFloat(height).toFixed(2);
				ttObj.velo = parseFloat(Math.sqrt(obj.velocity.x*obj.velocity.x + 
					obj.velocity.y*obj.velocity.y + obj.velocity.z*obj.velocity.z)).toFixed(2);				
			}
			return {
			    type: "point",
			    x: rad2deg * longitude,
			    y: rad2deg * latitude,
			    z: position_gd.height * 1000
		  };
		}
	  	pointsOut.push([rad2deg * longitude, rad2deg * latitude,  height* 1000]);
	  } catch (ex) {
	    
	  }
	}
	pointsOut.push(pointsOut[0]);
	return pointsOut;
}
function jday(year, mon, day, hr, minute, sec){ //from satellite.js
  'use strict';
  return (367.0 * year -
        Math.floor((7 * (year + Math.floor((mon + 9) / 12.0))) * 0.25) +
        Math.floor( 275 * mon / 9.0 ) +
        day + 1721013.5 +
        ((sec / 60.0 + minute) / 60.0 + hr) / 24.0 
        );
}
function myVerySpecialFunc(result) {
	alert("gotIt");
}
function getTemlateContentCoreElt() {
	let divOut= $("<div></div>"); divOut.html("<div class='esri-feature__content-element'><div class='esri-feature-fields'><div class='esri-feature-element-info'></div> \
<table class='esri-widget__table' summary='List of attributes and values'><tbody></tbody></table></div></div>");
	return divOut;
}
function addContentLine(content, text, value, tdClass) {
	let tb = content.find("tbody"), innerTable=tb.find("table"), useTable=innerTable && innerTable.length, tr=$("<tr>"), 
		th=useTable ? $("<td class='esri-feature-fields__field-header'>") : $("<th class='esri-feature-fields__field-header'>"), td=$("<td class='esri-feature-fields__field-data'>");
	th.appendTo(tr); td.appendTo(tr);  th.text(text); td.text(value); if(tdClass)td.addClass(tdClass);
	if(useTable) tr.appendTo(innerTable);
	else tr.appendTo(tb);
}
function getRouteDefaults() {
	return {
			   directionLines: {
			     type: "simple-line",
			//     color: layerSettings.renderer.symbol.color || [105, 220, 255],
				 color: [105, 220, 255],
			     width: 4,
			     cap: "round",
			     join: "round"
			   },
			   directionPoints: {
			     type: "simple-marker",
			     size:4
			   },
			   routeInfo: {
			     type: "simple-line",
			     width: 2
			   }
		  };

}
function isMobileDevice() {
    if (bIsMobileDevice == null) {
        var uagent = window.navigator.userAgent.toLowerCase();
        bIsMobileDevice = uagent.search("ipad") != -1 || uagent.search("ipod") != -1 ||
            uagent.search("iphone") != -1 || uagent.search("android") != -1 || 
            (uagent.includes("mac") && "ontouchend" in document);
    }
    return bIsMobileDevice;
}
function getTimeExtentEnd(startD, unit, value){
	let endD=startD;
	switch(unit) {
		case "milliseconds":
			endD.setMilliseconds(endD.getMilliseconds()+value);									
		break;
	    case "seconds":
			 
			endD.setSeconds(endD.getSeconds()+value);	
		break;
		case "months":
			 
			endD.setUTCMonth(endD.getUTCMonth()+value);	
		break;
		case "years":
			 
			endD.setUTCFullYear(endD.getUTCFullYear()+value);	
		break;
		case "minutes":
			 
			endD.setUTCMinutes(endD.getUTCMinutes()+value);	
		break;								
		case "hours":
			 
			endD.setUTCHours(endD.getUTCHours()+value);	
		break;
		case "days":
			 
			endD.setUTCDate(endD.getUTCDate()+value);	
		break;
		case "weeks":
			 
			endD.setUTCDate(endD.getUTCDate()+value*7);	
		break;
		case "decades":
			 
			endD.setUTCFullYear(endD.getUTCFullYear()+value*10);	
		break;
		case "centuries":
			 
			endD.setUTCFullYear(endD.getUTCFullYear()+value*100);	
		break;
		default:
			endD=new Date(layer.timeInfo.fullTimeExtent.end);
		break;
	}
	return endD;
}

							
							
function getSatelliteLocation(date, line1, line2) {
 
  const satrec = satellite.twoline2satrec(line1, line2);
  const position_and_velocity = satellite.propagate(
    satrec,
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
  const position_eci = position_and_velocity.position;

  const gmst = satellite.gstime_from_date(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );

  const position_gd = satellite.eci_to_geodetic(position_eci, gmst);

  let longitude = position_gd.longitude;
  let latitude = position_gd.latitude;
  let height = position_gd.height;
  if (isNaN(longitude) || isNaN(latitude) || isNaN(height)) {
    return null;
  }
  
  const rad2deg = 180 / Math.PI;
  while (longitude < -Math.PI) {
    longitude += 2 * Math.PI;
  }
  while (longitude > Math.PI) {
    longitude -= 2 * Math.PI;
  }
  var pt2= {
    type: "point", // Autocasts as new Point()
    x: rad2deg * longitude,
    y: rad2deg * latitude,
    z: height * 1000
  };

	return pt2;
}
