/*global tdgchart: true, document: false, JSON: false, window: false, XMLHttpRequest: false, module: false */

/* Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved. */

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (position == null || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

if (!String.prototype.repeat) {
  String.prototype.repeat = function(count) {
    'use strict';
    if (this == null) {
      throw new TypeError('can\'t convert ' + this + ' to object');
    }
    var str = '' + this;
    count = +count;
    if (count != count) {
      count = 0;
    }
    if (count < 0) {
      throw new RangeError('repeat count must be non-negative');
    }
    if (count == Infinity) {
      throw new RangeError('repeat count must be less than infinity');
    }
    count = Math.floor(count);
    if (str.length == 0 || count == 0) {
      return '';
    }
    // Ensuring count is a 31-bit integer allows us to heavily optimize the
    // main part. But anyway, most current (August 2014) browsers can't handle
    // strings 1 << 28 chars or longer, so:
    if (str.length * count >= 1 << 28) {
      throw new RangeError('repeat count must not overflow maximum string size');
    }
    var rpt = '';
    for (;;) {
      if ((count & 1) == 1) {
        rpt += str;
      }
      count >>>= 1;
      if (count == 0) {
        break;
      }
      str += str;
    }
    return rpt;
  };
}

if (!String.prototype.includes) {
  String.prototype.includes = function() {
    'use strict';
    return String.prototype.indexOf.apply(this, arguments) !== -1;
  };
}

if (!Array.isArray) {
  Array.isArray = function(a) {
    return Object.prototype.toString.call(a) === '[object Array]';
  };
}

if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    'use strict';
    var O = Object(this);
    var len = parseInt(O.length, 10) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1], 10) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) {
        return true;
      }
      k++;
    }
    return false;
  };
}

if (!Array.prototype.every) {
  Array.prototype.every = function(fun /*, thisp */) {

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++) {
      if (i in t && !fun.call(thisp, t[i], i, t))
        return false;
    }
    return true;
  };
}

if (!Array.prototype.some) {
  Array.prototype.some = function(fun) {

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++) {
      if (i in t && fun.call(thisp, t[i], i, t))
        return true;
    }
    return false;
  };
}

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

Math.log10 = Math.log10 || function(x) {
  return Math.log(x) / Math.LN10;
};

(function(DOMParser) {
	"use strict";

	var nativeParse = DOMParser.prototype.parseFromString;
	try {
		if ((new DOMParser()).parseFromString("", "text/html")) {
			return;
		}
	} catch (ex) {}

	DOMParser.prototype.parseFromString = function(markup, type) {
		if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {
			var doc = document.implementation.createHTMLDocument("");
			if (markup.toLowerCase().indexOf('<!doctype') > -1) {
				doc.documentElement.innerHTML = markup;
			} else {
				doc.body.innerHTML = markup;
			}
			return doc;
		} else {
			return nativeParse.apply(this, arguments);
		}
	};
}(DOMParser));

var tdgchart = {util: {}};

(function() {

var tdg = tdgchart.util;

tdgchart.util.ns = {
	svg: "http://www.w3.org/2000/svg",
	xhtml: "http://www.w3.org/1999/xhtml",
	xlink: "http://www.w3.org/1999/xlink",
	xml: "http://www.w3.org/XML/1998/namespace",
	xmlns: "http://www.w3.org/2000/xmlns/"
};

// All functions in this file must have ZERO SIDE EFFECTS!!
// All function argument should be *READ ONLY* - do *NOT* modify any function arguments!
// NO CHART INSTANCES should ever be passed in or used anywhere in this file.

tdgchart.util.identity = function(x) {
	return x;
};

// Convert a string like 'chart.title.text' to an actual chart.title.text property retrieval
// This works for array-based properties too, like 'series[3].border.color'
tdgchart.util.get = tdgchart.util.flattenProperty = function(prop, root, defaultValue) {
	root = root || {};
	prop = (prop + '').split('.');
	for (var i = 0, n = prop.length; i < n; i++) {
		var p = prop[i];
		var match = p.match(/(.*)\[(\d*)\]/);
		if (match && match.length > 2) {
			root = root[match[1]];
			if (root && Array.isArray(root) && root.length >= match[2]) {
				root = root[match[2]];
			} else {
				return defaultValue;
			}
		} else {
			if (root.hasOwnProperty(p) && root[p] != null) {
				root = root[p];
			} else {
				return defaultValue;
			}
		}
	}
	return root;
};

// set 'prop' to 'value' in 'obj'.  'prop' can be a dot notation string like 'title.text'; any  non-existent
// intermediate objects will be created.  'prop' can also include arrays like 'foo[0][0].bar[9] = 12'
tdgchart.util.set = function(prop, value, obj) {
	obj = obj || {};
	var target, match = prop.match(/^([^\.\[]*)[\.]?(.*)$/);
	if (!match || match.length < 3) {
		return;
	}
	if (match[1]) {
		target = match[1];  // simple property case
	} else {
		match = match[2].match(/^\[(\d*)\][\.]?(.*)$/);  // array case
		target = parseInt(match[1], 10);
	}
	if (match[2]) { // Have more props to match - recurse
		obj[target] = obj[target] || (match[2].startsWith('[') ? [] : {});
		tdg.set(match[2], value, obj[target]);
	} else {
		obj[target] = value;  // At final property - set it
	}
};

tdgchart.util.clone = tdgchart.util.cloneObject = function(src) {
	var t = typeof src;
	if (t === 'string' || t === 'number' || t === 'boolean' || src == null) {
		return src;  // Cannot clone immutable primitive types
	}
	if (Array.isArray(src)) {
		return tdg.arrayDeepCopy(src);
	}
	return tdg.mergeObjects(src, {});
};

tdgchart.util.merge = tdgchart.util.mergeObjects = function(src, dest) {
	for (var prop in src) {
		if (src[prop] && src[prop].constructor === Object) {
			if (dest[prop] && dest[prop].constructor !== Object) {
				dest[prop] = {};  // Have a non-object property in dest to be replaced by an object in src; delete dest's prop
			}
			dest[prop] = dest[prop] || {};
			tdg.mergeObjects(src[prop], dest[prop]);
		} else if (src[prop] && Array.isArray(src[prop])) {
			dest[prop] = tdg.arrayDeepCopy(src[prop]);  // Must deep copy arrays - otherwise we overwrite any arrays in the default properties
		} else {
			dest[prop] = src[prop];
		}
	}
	return dest;
};

tdgchart.util.arrayDeepCopy = function(src) {
	return src.map(function(el) {
		if (el && el.constructor === Object) {
			return tdg.cloneObject(el);
		} else if (el && Array.isArray(el)) {
			return tdg.arrayDeepCopy(el);
		}
		return (el === null) ? undefined : el;
	});
};

// Return an array of the property name strings in obj
tdgchart.util.keys = function(obj) {
	var res = [];
	for (var k in obj) {
		if (obj.hasOwnProperty(k)) {
			res.push(k);
		}
	}
	return res;
};

// Return an array of the property values in obj
tdgchart.util.values = function(obj) {
	var res = [];
	for (var k in obj) {
		if (obj.hasOwnProperty(k)) {
			res.push(obj[k]);
		}
	}
	return res;
};

tdgchart.util.uniqueEntries = function(a) {
	var o = {};
	for (var i = 0; i < a.length; i++) {
		o[a[i]] = true;
	}
	return tdgchart.util.keys(o);
};

// Return true if p has no properties of its own, false otherwise
// Works for any data type.
tdgchart.util.isEmpty = function(p) {
	if (typeof p === 'number') {
		return false;
	} else if (typeof p === 'boolean') {
		return !p;
	} else if (Array.isArray(p) || typeof p === 'string') {
		return p.length <= 0;
	}
	for (var x in p) {
		if (p.hasOwnProperty(x)) {
			return false;
		}
	}
	return true;
};

tdgchart.util.isNotEmpty = function(p) {
	return !tdg.isEmpty(p);
};

tdgchart.util.memoize = function(name, fn) {
	return function() {
		var args = Array.prototype.slice.call(arguments);
		var hash = "";
		for (var i = 0; i < args.length; i++) {
			var currentArg = args[i];
			if (currentArg instanceof tdgchart) {
				continue;
			}
			hash += (currentArg === Object(currentArg)) ? JSON.stringify(currentArg) : currentArg;
		}
		if (tdgchart.__internalFnCache[name] == null) {
			tdgchart.__internalFnCache[name] = {};
		}
		if (hash in tdgchart.__internalFnCache[name]) {
			return tdgchart.__internalFnCache[name][hash];
		}
		return tdgchart.__internalFnCache[name][hash] = fn.apply(this, args);
	};
};

tdgchart.util.loadCSSFile = function(id, url) {
	var link = document.createElement('link');
	link.rel = 'stylesheet';
	link.type = 'text/css';
	link.id = id;
	link.href = url;
	document.head.appendChild(link);
};

tdgchart.util.loadCSSString = function(id, cssString) {
	var node = document.createElement('style');
	node.type = 'text/css';
	node.id = id;
	if (node.styleSheet){
		node.styleSheet.cssText = cssString;
	} else {
		node.appendChild(document.createTextNode(cssString));
	}
	document.head.appendChild(node);
};

tdgchart.util.loadScriptFile = function(url, onLoad, onError) {
	var s = document.createElement('script');
	s.async = false;
	s.type = 'text/javascript';
	s.src = url;
	if (onLoad) {
		s.addEventListener('load', onLoad, false);
	}
	if (onError) {
		s.addEventListener('error', onError, false);
	}
	document.head.appendChild(s);
};

// optional config: {asJSON: bool, async: bool, onLoad: fn, onError: fn}
tdgchart.util.ajax = function(path, config) {

	var request;
	
	function onLoad() {
		if (request && request.status === 200 && request.readyState === 4) {
			var res = request.responseText;
			if (config.asJSON) {
				try {
					res = JSON.parse(request.responseText);
				} catch (e) {
					// Non-strict JSON files will fail to parse as JSON.  Try eval instead.
					// TODO: This is a big security hole, but there are too many useful non-strict JSON files out there.
					// Add a new config option that must be explicitly set to allow this non-strict parse for files that need it.
					try {
						res = eval('(' + request.responseText + ')');
					} catch (e) {
						// Failure here means we have totally invalid JSON.  Return nothing.
						res = {};
					}
				}			
			}
			if (typeof config.onLoad === 'function') {
				return config.onLoad(res);
			}
			return res;
		} else if (config.onError) {
			config.onError(request);
		}
		return undefined;
	}

	if (window.location.protocol === 'file:') {
		tdg.logError('Could not dynamically load: ' + path);
		if (config.onError) {
			config.onError();
		}
		return null;  // If we're developing locally, don't try loading external resources - always fails
	}
	
	config = config || {};

	try {
		request = new XMLHttpRequest();
		request.open('GET', path, config.async || false);
		if (config.async && config.onLoad) {
			request.onload = onLoad;
		}
		request.send(null);
	} catch (err) {
		request = null;
	}
	
	if (request && !config.async) {
		return onLoad();
	}
	
	return null;
};

// TODO: replace this with a new getMouseInSVG
tdgchart.util.getMouseInViewPort = function(svgNode, e) {
	var pt = svgNode.createSVGPoint();
	if (e.type.indexOf('touch') >= 0 && e.changedTouches && e.changedTouches.length > 0) {
		e = e.changedTouches[0];
	}
	pt.x = e.clientX;
	pt.y = e.clientY;
	pt = pt.matrixTransform(svgNode.getScreenCTM().inverse());
	return pt;
};

// Get the mouse's position relative to the overall visible page (viewport).
// This does *not* account for scrolling: if a page is scrolled down 20 times and the mouse is moved near the top, y is still 0
// TODO: rename this to getMouseInPage
// TODO: Need an analogous getMouseInSVG, since that's also a very common need
tdgchart.util.getMousePosition = function(e) {
	if (e.type.indexOf('touch') >= 0 && e.changedTouches && e.changedTouches.length > 0) {
		e = e.changedTouches[0];
	}
	return {x: e.clientX, y: e.clientY};
};

tdgchart.util.bind = function(fn, context) {
	return function() {
		var args = Array.prototype.slice.call(arguments);
		return fn.apply(context, args);
	};
};

// Returns a new function which is the partial application of the passed in function
// bound to the specified argument list.  Any null entries in args will be left unbound.
// 'context' is optional; if specified, function will be invoked with context as 'this'.
tdgchart.util.partial = function(fn, args, context) {
	return function() {
		var arg = 0, localArgs = Array.prototype.slice.call(args);
		for (var i = 0; i < localArgs.length && arg < arguments.length; i++) {
			if (localArgs[i] == null) {
				localArgs[i] = arguments[arg++];
			}
		}
		return fn.apply(context || this, localArgs);
	};
};

// A path is absolute if it contains '://' or begins with a single slash.  Relative otherwise.
tdgchart.util.isAbsolutePath = function(path) {
	return path.indexOf('://') >= 0 || path.charAt(0) === '/';
};

// If path is a relative path, prepend the current document's root URL to make the path absolute.
tdgchart.util.makePathAbsolute = function(path) {
	if (!tdg.isAbsolutePath(path)) {
		var url = document.location.pathname;
		path = url.substr(0, url.lastIndexOf('/') + 1) + path;
	}
	return path;
};

tdgchart.util.replaceAll = function(list, search, replace) {
	if (replace == null || tdgchart.util.isEmpty(list)) {
		return list;
	}
	
	// If you want to use a regex solution here instead, make sure it handles special characters like '.'
	if (typeof list === 'string') {
		return list.split(search).join(replace);
	}
};

tdgchart.util.textContainsHTML = function(text) {
	text = text + '';
	var idx = text ? text.indexOf('<') : 0;
	return text && idx >= 0 && text.indexOf('>') > idx;
};

// TODO: this gives slightly different results than chart.measureLabel().width,
// especially on mobile devices.  Either quantify & normalize those differences,
// or get rid of this, as accurately measuring labels is pretty important.
tdgchart.util.measureLabelWidth = (function() {
	
	function canvasLabelWidth(label, font) {

		if (typeof label !== 'string') {
			label = label + '';
		}
		
		if (label === '') {
			label = '.';  // Empty labels still consume space in HTML - account for that
		}
		
		// For now, HTML does not easily render to canvas
		// TODO: evaluate performance of SVG + foreignObject injection into canvas
		// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Drawing_DOM_objects_into_a_canvas
		if (tdg.textContainsHTML(label)) {
			return tdgchart.measureLabel(label, font).width;
		}

		font = font || '10px sans-serif';  // If no font is specified, use Moonbeam's default font
		if (typeof font === 'function') {
			font = font(label);
		}
		
		var cache = tdgchart.util.measureLabelWidth.cache;
		if (cache[font] && cache[font][label] && tdgchart.disableFontCache !== true) {
			return cache[font][label];
		}
		var ctx = tdgchart.util.measureLabelWidth.canvasCtx;
		ctx.font = font;
		var width = Math.ceil(ctx.measureText(label).width);
		cache[font] = cache[font] || {};
		cache[font][label] = width;
		return width;
	}
	
	function noCanvasLabelWidth(label, font) {
		return tdgchart.measureLabel(label, font).width;
	}
	
	var canvas = document.createElement('canvas');
	if (canvas && canvas.getContext) {
		var docFragment = document.createDocumentFragment();
		docFragment.appendChild(canvas);
		canvasLabelWidth.canvasCtx = canvas.getContext('2d');
		canvasLabelWidth.cache = {};
		return canvasLabelWidth;
	} else {
		return noCanvasLabelWidth;
	}
	
})();

tdgchart.util.measureFont = function(font) {
	font = font || '10px sans-serif';  // If no font is specified, use Moonbeam's default font
	if (typeof font === 'function') {
		font = font('W');
	}
	
	if (tdgchart._measureLabelCache.fontSize[font] && tdgchart.disableFontCache !== true) {
		return tdgchart._measureLabelCache.fontSize[font];
	}
	
	if (tdgchart._cachedLabelDiv == null) {
		tdgchart.initLabelDiv();
	}
	
	tdgchart._cachedLabelDiv.singleLineDiv.style.font = font;
	tdgchart._cachedLabelDiv.singleLineDiv.firstChild.textContent = 'W';
	var bbox = tdgchart._cachedLabelDiv.singleLineDiv.getBBox();
			
	var res = tdgchart._measureLabelCache.fontSize[font] = {
		width: Math.round(bbox.width),
		height: Math.round(bbox.height)
	};
	return res;
};

// Given a string full of XML, return another string that's nicely formatted XML
// Adapted from http://stackoverflow.com/questions/376373/pretty-printing-xml-with-javascript
tdgchart.util.prettyPrintXML = function(xml) {

	xml = (xml || '') + '';  // Make sure xml is a string
	
	// Split single XML line into multiple lines with one tag per line.  Only split outside quotes.
	var i, sliceIdx = 0, quoteCount = 0, bracketCount = 0, lines = [];
	for (i = 0; i < xml.length; i++) {
		if (xml.charAt(i) === '<' && !quoteCount) {
			bracketCount = 1;
		}
		if (xml.charAt(i) === '>' && !quoteCount) {
			bracketCount = 0;
			lines.push(xml.substring(sliceIdx, i + 1).trim());
			sliceIdx = i + 1;
		} else if (xml.charAt(i) === '"' && bracketCount) {
			quoteCount = (quoteCount + 1) % 2;
		}
	}
	
	var res = '', indent = 0, prevType = 'other';
	var transitions = {  // indentation needed when moving from one tag type to another
		'single': {
			'single': 0, 'close': -1, 'open': 0, 'other': 0
		},
		'close': {
			'single': 0, 'close': -1, 'open': 0, 'other': 0
		},
		'open': {
			'single': 1, 'close': 0, 'open': 1, 'other': 1
		},
		'other': {
			'single': 0, 'close': -1, 'open': 0, 'other': 0
		}
	};

	for (i = 0; i < lines.length; i++) {
		
		var type = 'other', line = lines[i];
		if (line.match(/^<.+\/>$/)) {
			type = 'single';
		} else if (line.match(/^[^<]*<\/.+>$/)) {
			type = 'close';
		} else if (line.match(/^<[^!].*>$/)) {
			type = 'open';
		}

		indent += transitions[prevType][type];

		if (prevType === 'open' && type === 'close') {
			res = res.slice(0, -1) + line + '\n';  // Merge immediately adjacent open & close tags into one line (strip intermediate \n).
		} else {
			res += '\t'.repeat(Math.max(indent, 0)) + line + '\n';
		}
		prevType = type;
	}
	return res;
};

// Given an object based nested set of labels, return an array of strings with the fully 
// qualified path for each label, delimited with 'concatSymbol' (which defaults to ' > ')
// eg: ['Region 1 > Foo', 'Region 1 > Bar', 'Region 2 > Baz']
tdgchart.util.flattenNestedLabels = function(originalLabels, concatSymbol) {
	var labelList = [];
	originalLabels = originalLabels || [];
	concatSymbol = concatSymbol || ' > ';
	
	function traverse(labels, currentLabel) {
		if (!Array.isArray(labels)) {
			labels = [labels || ''];
		}
		if (labels[0] && typeof labels[0] === 'object') {
			for (var i = 0; i < labels.length; i++) {
				var v = labels[i];
				for (var key in v) {
					if (v.hasOwnProperty(key)) {
						traverse(v[key], currentLabel ? currentLabel + concatSymbol + key : key);
					}
				}
			}
		} else {
			for (var j = 0; j < labels.length; j++) {
				labelList.push(currentLabel + concatSymbol + (labels[j] || ''));
			}
		}
	}
	traverse(originalLabels, '');
	return labelList;
};

// Return true if specified labels are nested, false otherwise
tdgchart.util.isNestedLabels = function(labels) {
	// TODO: once group labels are always basic strings and never String Objects, remove last instanceof check
	return Array.isArray(labels) && !Array.isArray(labels[0]) && typeof labels[0] === 'object' && !(labels[0] instanceof String);
};

// Return the maximum depth of nested arrays.  Checks *only* the *first* array element
tdgchart.util.nestedArrayDepth = function(a) {
	var depth = 0;
	while (a && Array.isArray(a)) {
		a = a[0];
		depth += 1;
	}
	return depth;
};


tdgchart.util.isPercentString = function(v) {
	return (typeof v === 'string' && v.endsWith('%'));
};

tdgchart.util.parsePercent = function(val, min, max) {
	min = (min == null) ? 0.0 : min;
	max = (max == null) ? 1.0 : max;
	return Math.max(Math.min(parseFloat(val) / 100, max), min);
};

tdgchart.util.applyNumOrPercent = function(numberOrPercent, relativeSize) {
	if (tdg.isPercentString(numberOrPercent)) {
		return tdg.parsePercent(numberOrPercent) * relativeSize;
	}
	return numberOrPercent || 0;
};

tdgchart.util.toNum = function(value, defaultValue) {
	if (typeof value === 'string') {
		return parseFloat(value);
	} else if (typeof value === 'number') {
		return value;
	}
	return defaultValue;
};

// Ensure value is between min & max.  min can be a 2 entry array if max is null: bound(2, [0,10])
tdgchart.util.bound = function(value, min, max) {
	if (Array.isArray(min) && max == null) {
		max = min[1];
		min = min[0];
	}
	return Math.min(Math.max(value, min), max);
};

// Check if a is within dt of b
tdgchart.util.eq = function(a, b, dt) {
	return Math.abs(a - (b || 0)) < (dt || 0.00001);
};

// Ensure angle is 0 <= a <= 360, angleType is either 'degrees' or 'radians' (default)
tdgchart.util.boundAngle = function(a, angleType) {
	angleType = angleType || 'radians';
	var incr = (angleType === 'degrees') ? 360 : Math.PI * 2;
	while (a < 0) {
		a += incr;
	}
	while (a > incr) {
		a -= incr;
	}
	return a;
};

tdgchart.util.transpose = function(arrays) {
	var res = [];
	var len = arrays.length;
	var m = tdg.max(arrays, 'length');

	for (var i = 0; i < m; i++) {
		res.push([]);
		for (var j = 0; j < len; j++) {
			res[i].push(arrays[j][i]);
		}
	}
	return res;
};

// Returns a shallow copy of the array in reverse order
tdgchart.util.reverse = function(a) {
	return [].concat(a).reverse();
};

// First argument should be the string to format.  {x} will be replaced
// Subsequent arguments should be the text to replace {x} instances in the format string
// eg: formatString("x: {0}, y: {1}", 10, 20) returns "x: 10, y: 20"
tdgchart.util.formatString = function() {
	var args = Array.prototype.slice.call(arguments, 1);
	return arguments[0].replace(/\{(\d+)\}/g, function(match, number) {
		return args[number] == null ? match : args[number];
	});
};

tdgchart.util.logError = function() {
	if (window.console && typeof window.console.log === 'function') {
		var args = (arguments.length > 1) ? Array.prototype.join.call(arguments, " ") : arguments[0];
		window.console.log(args);
	}
};

function arrayLookup(array, f, i) {
	var key = array[i];
	if (key == null) {
		return null;
	}
	if (typeof f === 'function') {
		return {value: f(key), key: key, index: i};
	} else if (typeof f === 'string' && key != null) {
		if (f.includes('.')) {
			return {value: tdg.get(f, key), key: key, index: i};
		}
		return {value: key[f], key: key, index: i};
	}
	return {value: key, key: key, index: i};
}

tdgchart.util.sum = function(array, f) {
	if (!Array.isArray(array)) {
		return array;  // If first arg isn't an array, throw it back
	}
	if (!array.length) {
		return 0;
	}
	var sum = 0;
	for (var i = 0; i < array.length; i++) {
		var tmp = arrayLookup(array, f, i);
		if (tmp) {
			sum += tmp.value || 0;
		}
	}
	return sum;
};

tdgchart.util.accumulate = function(array) {
	if (!Array.isArray(array) || !array.length) {
		return array;  // If first arg isn't an array, throw it back
	}
	var newArray = [];
	for (var i = 0; i < array.length; i++) {
		newArray[i] = (newArray[i - 1] || 0) + array[i];
	}
	return newArray;
};

function _min(array, f, resultType, recurse) {
	if (!Array.isArray(array)) {
		return array;  // If first arg isn't an array, throw it back
	}
	if (!array.length) {
		return undefined;
	}
	resultType = resultType || 'value';
	var tmp, res, min = Infinity;
	for (var i = 0; i < array.length; i++) {
		if (recurse && Array.isArray(array[i])) {
			tmp = _min(array[i], f, 'all', true);
		} else {
			tmp = arrayLookup(array, f, i);
			if (tmp) {
				tmp.value = tmp.value || 0;
			}
		}
		if (tmp && (tmp.value < min || (tmp.value === Infinity && min === Infinity))) {
			min = tmp.value;
			res = tmp;
		}
	}
	if (res == null) {
		return undefined;
	}
	return resultType === 'all' ? res : res[resultType];
}

function _max(array, f, resultType, recurse) {
	if (!Array.isArray(array)) {
		return array;  // If first arg isn't an array, throw it back
	}
	if (!array.length) {
		return undefined;
	}
	resultType = resultType || 'value';
	var tmp, res, max = -Infinity;
	for (var i = 0; i < array.length; i++) {
		if (recurse && Array.isArray(array[i])) {
			tmp = _max(array[i], f, 'all', true);
		} else {
			tmp = arrayLookup(array, f, i);
			if (tmp) {
				tmp.value = tmp.value || 0;
			}
		}
		if (tmp && (tmp.value > max || (tmp.value === -Infinity && max === -Infinity))) {
			max = tmp.value;
			res = tmp;
		}
	}
	if (res == null) {
		return undefined;
	}
	return resultType === 'all' ? res : res[resultType];
}


// resultType is either 'value' (default), 'key', 'index' or 'all'
// This works for arbitrarily nested, recursive arrays
tdgchart.util.min = function(array, f, resultType) {
	return _min(array, f, resultType, false);
};

// Recursive version of tdgchart.util.min
// resultType is either 'value' (default), 'key', 'index' or 'all'
// This works for arbitrarily nested, recursive arrays
tdgchart.util.minR = function(array, f, resultType) {
	return _min(array, f, resultType, true);
};

// resultType is either 'value' (default), 'key', 'index' or 'all'
// This works for arbitrarly nested, recursive arrays
tdgchart.util.max = function(array, f, resultType) {
	return _max(array, f, resultType, false);
};

// Recursive version of tdgchart.util.max
// resultType is either 'value' (default), 'key', 'index' or 'all'
// This works for arbitrarly nested, recursive arrays
tdgchart.util.maxR = function(array, f, resultType) {
	return _max(array, f, resultType, true);
};

// Return {min, max} for the specified array.
// fmin & fmax are optional accessor functions or keys for array lookup.
// if fmin is specified and fmax is not, use fmin for both min & max lookup.
// resultType is either 'value' (default), 'key', 'index' or 'all'
tdgchart.util.minMax = function(array, fmin, fmax, resultType) {
	return {
		min: _min(array, fmin, resultType, false),
		max: _max(array, fmax || fmin, resultType, false)
	};
};

// Recursive version of tdgchart.util.minMax
// Return {min, max} for the specified array.
// fmin & fmax are optional accessor functions or keys for array lookup.
// if fmin is specified and fmax is not, use fmin for both min & max lookup.
// resultType is either 'value' (default), 'key', 'index' or 'all'
tdgchart.util.minMaxR = function(array, fmin, fmax, resultType) {
	return {
		min: _min(array, fmin, resultType, true),
		max: _max(array, fmax || fmin, resultType, true)
	};
};

tdgchart.util.mean = function(array, f) {
	return tdg.sum(array, f) / array.length;
};

tdgchart.util.variance = function(array, f) {
	if (array.length < 1) {
		return NaN;
	}
	if (array.length === 1) {
		return 0;
	}
	var mean = tdg.mean(array, f), sum = 0, o = {};
	if (!f) {
		f = tdg.identity;
	}
	for (var i = 0; i < array.length; i++) {
		o.index = i;
		var d = f.call(o, array[i]) - mean;
		sum += d * d;
	}
	return sum;
};

tdgchart.util.deviation = function(array, f) {
	return Math.sqrt(tdg.variance(array, f) / (array.length - 1));
};

// Similar to array.map, but accepts simple string key lookups
// tdg.map(a, 'x') is functionally identical to a.map(function(el){return el.x;}).
// If key lookup refers to a function, function will be evaluated with no arguments on each element.
// So, tdg.map(a, 'toString') is functionally identical to a.map(function(el){return el.toString();}).
// This is also faster than built in array.map, and works on fake arrays like DOM node lists.
tdgchart.util.map = function(array, f) {
	var i, l = !!array ? array.length : 0, res = [];
	if (typeof f === 'string') {
		for (i = 0; i < l; i++) {
			var v = array[i];
			if (v && typeof v[f] === 'function') {
				res.push(v[f]());
			} else if (v) {
				res.push(v[f]);
			} else {
				res.push(v);
			}
		}
	} else if (typeof f === 'function') {
		for (i = 0; i < l; i++) {
			res.push(f(array[i], i, array));
		}
	}
	return res;
};

// Similar to array.filter, but accepts simple string key lookups
// tdg.filter(a, 'x') is functionally identical to a.filter(function(el){return !!el.x;})
// If key lookup refers to a function, function will be evaluated with no arguments on each element.
// So, tdg.filter(a, 'toString') is functionally identical to a.filter(function(el){return !!el.toString();}).
// This is also faster than built in array.filter, and works on fake arrays like DOM node lists.
tdgchart.util.filter = function(array, f) {
	var i, l = !!array ? array.length : 0, res = [];
	if (typeof f === 'string') {
		for (i = 0; i < l; i++) {
			var v = array[i];
			if (v && !!v[f]) {
				res.push(v);
			}
		}
	} else if (typeof f === 'function') {
		for (i = 0; i < l; i++) {
			if (f(array[i], i, array)) {
				res.push(array[i]);
			}
		}
	}
	return res;
};

// Return a new array with 'n' copies of 'v'.
tdgchart.util.repeat = function(v, n) {
	n = n || 0;
	var i, res = [];
	if (typeof v === 'object') {
		for (i = 0; i < n; i++) {
			res.push(tdgchart.util.cloneObject(v));
		}
	} else {
		for (i = 0; i < n; i++) {
			res.push(v);
		}
	}
	return res;
};

// Convert array into an object with one key per array entry, using the
// function f to compute each key's value: [a,b,c] => {a: f(a), b: f(b), c: f(c)}
// Arguments to f are the key and its index in array.
tdgchart.util.dict = function(array, f) {
	var res = {}, l = !!array ? array.length : 0;
	for (var i = 0; i < l; i++) {
		if (i in array) {
			var k = array[i];
			res[k] = f(k, i);
		}
	}
	return res;
};

// Returns an array of numbers from 'start' (inclusive) to 'stop' (exclusive), incrementing by 'step'.
// If only one argument is specified, 'start' = 0 and 'stop' = argument.
// If only two arguments are specified, 'step' = 1.
tdgchart.util.range = function(start, stop, step) {
	if (stop == null && step == null) {
		stop = start;
		start = 0;
	}
	if (step == null) {
		step = 1;
	}
	if ((stop - start) / step === Infinity) {
		return undefined;
	}
	var array = [], i = 0, j;
	if (step < 0) {
		while ((j = start + step * i++) > stop) {
			array.push(j);
		}
	} else {
		while ((j = start + step * i++) < stop) {
			array.push(j);
		}
	}
	return array;
};

// Return an array of numbers, starting at 'start', ending at 'stop'
// (inclusive), with 'count'> number of values in the overall array.
// Similar to tdg.range, but gives a way to specify the desired count instead of interval.
tdgchart.util.rangeCount = function(start, stop, count) {
	var gap = (stop - start) / (count - 1);
	var stops = tdg.range(start, stop, gap);
	stops.push(stop);
	return stops;
};

tdgchart.util.isANumber = function(a) {
	return a != null && !isNaN(a) && typeof a === 'number';
};

tdgchart.util.xor = function(a, b) {
	return (a || b) && !(a && b);
};

var radianRatio = Math.PI / 180, degreeRatio = 180 / Math.PI;

tdgchart.util.degrees = function(radians) {
	return degreeRatio * radians;
};

tdgchart.util.radians = function(degrees) {
	return radianRatio * degrees;
};

// Given a text string, font and a max width, returns a font string with
// the font point size changed so that text fits nicely inside maxSize.
tdgchart.util.scaleFontToBox = function(text, font, maxSize) {
	var fontParts = tdg.fontToFontParts(font);
	fontParts.fontSize = "10px";
	var textSize = tdgchart.measureLabel(text, fontParts.toString());
	var size = Math.max(textSize.width, textSize.height);
	var fontSize = 10 / size * maxSize;
	fontParts.fontSize = fontSize.toFixed(3) + 'px';
	return fontParts.toString();
};

// Convert a CSS2 font string (like "italic 12pt Arial") to a font object with 5 members: fontStyle, fontVariant, fontWeight, fontSize, fontFamily
// Returned object includes a handy toString(), which converts the object back to a CSS2 font string.
tdgchart.util.fontToFontParts = function(font) {
	var fullFontParts = {fontStyle: '', fontVariant: '', fontWeight: '', fontSize: '', fontFamily: ''};
	var boldList = ['bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
	var haveFontSize = false;
	font = (font || '') + '';
	
	var fontParts = font.split(/ (?=(?:[^'"]|'[^']*'|"[^"]*")*$)/);
	fontParts.map(function(el) {
		if (el === 'italic' || el === 'oblique') {
			fullFontParts.fontStyle = el;
		} else if (el === 'small-caps') {
			fullFontParts.fontVariant = el;
		} else if (boldList.indexOf(el) >= 0) {
			fullFontParts.fontWeight = el;
		} else if (el) {
			if (!haveFontSize) {
				fullFontParts.fontSize = el;
				haveFontSize = true;
			} else {
				fullFontParts.fontFamily = el;
			}
		}
	});
	
	fullFontParts.toString = function() {
		var family = this.fontFamily.trim();  // If font family name contains a space, need to enclose it in quotes
		if (family.indexOf(' ') >= 0 && family[0] !== '"' && family[0] !== "'") {
			family = '"' + family + '"';
		}
		return [this.fontStyle, this.fontVariant, this.fontWeight, this.fontSize, family].join(' ').trim();
	};
	return fullFontParts;
};

// General purpose geometry module
// any 'pt' or 'ptX' argument is a {x, y} point
// any 'rect' argument is either {x, y, width, height} or {left, top, width, height} or {left, top, right, bottom}
// any 's' or 'sx' (shape) argument is either a point or a rect

tdgchart.util.geom = {};

tdgchart.util.geom.quadrant = function(angle) {
	var pi = Math.PI;
	if (angle < pi / 2) {
		return 1;
	} else if (angle >= pi / 2 && angle < pi) {
		return 2;
	} else if (angle >= pi && angle < 3 * pi / 2) {
		return 3;
	}
	return 4;
};

tdgchart.util.geom.equal = function(s1, s2) {
	if (!isRect(s1) || !isRect(s2)) {
		return tdg.eq(s1.x, s2.x) && tdg.eq(s1.y, s2.y);
	}
	s1 = tdg.geom.normalizeRect(s1);
	s2 = tdg.geom.normalizeRect(s2);
	return tdg.eq(s1.left, s2.left) && tdg.eq(s1.right, s2.right) &&
			tdg.eq(s1.top, s2.top) && tdg.eq(s1.bottom, s2.bottom);
};

// pt is {x, y}, b1 and b2 are {x, y} opposite corners of a box
tdgchart.util.geom.ptInBox = function(pt, b1, b2) {
	return pt.x >= Math.min(b1.x, b2.x) && pt.x <= Math.max(b1.x, b2.x) && 
			pt.y >= Math.min(b1.y, b2.y) && pt.y <= Math.max(b1.y, b2.y);
};

function ptRectIntersect(pt, rect) {
	rect = tdg.geom.normalizeRect(rect);
	return pt.x > rect.left && pt.x <= rect.right &&
			pt.y > rect.top && pt.y <= rect.bottom;
}

function rectIntersect(r1, r2) {
	r1 = tdg.geom.normalizeRect(r1);
	r2 = tdg.geom.normalizeRect(r2);
	return r1.left < r2.right && r2.left < r1.right &&
			r1.top < r2.bottom && r2.top < r1.bottom;
}

// 2 points intersect if their x & y are equal
// 2 rects inteserct if they overlap in any way
// 1 point & 1 rect intersect if point is inside rect
tdgchart.util.geom.intersect = function(s1, s2) {
	if (isRect(s1) && isRect(s2)) {
		return rectIntersect(s1, s2);
	} else if (!isRect(s1) && !isRect(s2)) {
		return tdg.geom.equal(s1, s2);
	} else if (isRect(s1)) {
		return ptRectIntersect(s2, s1);
	} else if (isRect(s2)) {
		return ptRectIntersect(s1, s2);
	}
};

// Return a new rect that fully contains all shapes
tdgchart.util.geom.union = function() {
	var res = {left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity};
	for (var i = 0; i < arguments.length; i++) {
		var s = tdg.geom.normalizeRect(arguments[i]);
		res = {
			left: Math.min(res.left, s.left),
			right: Math.max(res.right, s.right),
			top: Math.min(res.top, s.top),
			bottom: Math.max(res.bottom, s.bottom)
		};
	}
	return tdg.geom.normalizeRect(res);
};

tdgchart.util.geom.rectCenter = function(rect) {
	rect = tdg.geom.normalizeRect(rect);
	return {
		x: rect.left + (rect.width / 2),
		y: rect.top + (rect.height / 2)
	};
};

// Return the distance between each point or rect center
tdgchart.util.geom.distance = function(s1, s2) {
	s1 = isRect(s1) ? tdg.geom.rectCenter(s1) : s1;
	s2 = isRect(s2) ? tdg.geom.rectCenter(s2) : s2;
	return Math.sqrt(Math.pow(s1.x - s2.x, 2) + Math.pow(s1.y - s2.y, 2));
};

// Convert a rect from any format into the most flexible {top, right, bottom, left, width, height, x, y}
// Convert points into zero-width & height rects with left = right = x and top = bottom = y
tdgchart.util.geom.normalizeRect = function(s) {
	
	if (!isRect(s)) {
		return {left: s.x, x: s.x, right: s.x, top: s.y, y: s.y, bottom: s.y, width: 0, height: 0};
	}
	
	var left = (s.left != null) ? s.left : s.x || 0;
	var top = (s.top != null) ? s.top : s.y || 0;
	var right = (s.right != null) ? s.right : (left + s.width) || 0;
	var bottom = (s.bottom != null) ? s.bottom : (top + s.height) || 0;
	
	return {
		left: left, top: top, right: right, bottom: bottom,
		x: left, y: top,
		width: right - left, 
		height: bottom - top
	};
};

// Return true if rect has 4 well defined numeric sides and width > 0 and height > 0, false otherwise
tdgchart.util.geom.isValidRect = function(rect) {
	rect = tdg.geom.normalizeRect(rect);
	return tdg.isANumber(rect.top) && 
		tdg.isANumber(rect.y) && 
		tdg.isANumber(rect.right) && 
		tdg.isANumber(rect.bottom) && 
		tdg.isANumber(rect.left) && 
		tdg.isANumber(rect.x) && 
		rect.width > 0 && rect.height > 0;
};

// Add 'grow / 2' to the top, right, bottom, left side of 'rect'.  This makes 'rect' wider & taller by 'grow'.
tdgchart.util.geom.grow = function(rect, grow) {
	rect = tdg.geom.normalizeRect(rect);
	grow /= 2;
	return {
		width: grow + rect.width + grow,
		height: grow + rect.height + grow,
		top: rect.top - grow,
		y: rect.y - grow,
		right: rect.right + grow,
		bottom: rect.bottom + grow,
		left: rect.left - grow,
		x: rect.x - grow
	};
};

function isRect(s) {
	return s.width != null || s.right != null;
}

// Eventually, *all* pre-render DOM related code should be isolated and wrapped by functions here in util.dom
tdgchart.util.dom = {};

function ensureVisible(node, fn) {
	var dsp = node.getAttribute('display');
	if (dsp === 'none' || dsp == null) {
		node.setAttribute('display', 'inline');
	}
	var res = node[fn]();
	if (dsp === 'none') {
		node.setAttribute('display', 'none');
	} else if (dsp == null) {
		node.removeAttribute('display');
	}
	return res;
}

tdgchart.util.dom.bbox = function(node) {
	return ensureVisible(node, 'getBBox');
};

tdgchart.util.dom.ctm = function(node) {
	return ensureVisible(node, 'getCTM');
};

// Remove all children from node
tdgchart.util.dom.empty = function(node) {
	while (node.firstChild) {
		node.removeChild(node.firstChild);
	}
};

// Return true iff a is an ancestor of e. This is useful for ignoring 
// mouseout and mouseover events that are contained within the target element.
tdgchart.util.dom.ancestor = function(a, e) {
	while (e) {
		if (e === a) {
			return true;
		}
		e = e.parentNode;
	}
	return false;
};

tdgchart.util.dom.walk = function(node, preFn, postFn) {
	if (preFn) {
		preFn(node);
	}
	node = node ? node.firstChild : null;
	while (node) {
		tdgchart.util.dom.walk(node, preFn, postFn);
		node = node.nextSibling;
	}
	if (postFn) {
		postFn(node);
	}
};

tdgchart.util.traceDebug = function traceDebug(traceLine) {
	return traceit("DEBUG", "Moonbeam", traceLine);
};

tdgchart.util.traceInfo = function traceInfo(traceLine) {
	return traceit("INFO", "Moonbeam", traceLine);
};

tdgchart.util.traceWarn = function traceWarn(traceLine) {
	return traceit("WARN", "Moonbeam", traceLine);
};

tdgchart.util.traceError = function traceError(traceLine) {
	return traceit("ERROR", "Moonbeam", traceLine);
};

function traceit(traceLevel, traceArea, traceLine) {

	// If logging is disabled or missing info or if timeout is expired, we're done here.
	if (!window.ibiLog || !window.ibiLog.url || !window.ibiLog.urlId || !window.ibiLog.monId || !window.ibiLog.timeout || window.ibiLog.timeout < stop) {
		return;
	}

	if (!isLogLevel(traceLevel)) {
		return;
	}
	
	// Send logging data as URL parameters via GET
	var url = window.ibiLog.url + "?" +
		"IBIMON_area="  + traceArea + "&" +
		"IBIMON_level=" + traceLevel + "&" +
		"IBIMON_monId=" + window.ibiLog.monId + "&" +
		"IBIMON_urlId=" + window.ibiLog.urlId + "&" +
		"IBIMON_trace=" + traceLine;
	var req = new XMLHttpRequest();
	req.open('POST', url, true);
	req.send(null);
}

function isLogLevel(traceLevel) {
	var levels = [];
	levels.push(levels.FATAL = "FATAL");
	levels.push(levels.ERROR = ["ERROR", levels.FATAL]);
	levels.push(levels.WARN =  ["WARN", levels.ERROR]);
	levels.push(levels.INFO =  ["INFO", levels.WARN]);
	levels.push(levels.DEBUG = ["DEBUG", levels.INFO]);
	levels.push(levels.TRACE = ["TRACE", levels.DEBUG]);

	var acceptedLevel = [];
	
	function translateLogLevel(obj) {
		if (obj instanceof Array) {
			acceptedLevel.push(obj[0]);
			translateLogLevel(obj[1]);
		} else if (typeof obj === 'string' || obj instanceof String) {
			acceptedLevel.push(obj);
		}
	}
	var ibiLevel = window.ibiLog.level;
	levels[ibiLevel].forEach(function (lvl) {
		translateLogLevel(lvl);
	});
	return acceptedLevel.includes(traceLevel);
}

})();

if (typeof module === 'object' && typeof module.exports === 'object') {
	module.exports = tdgchart.util;
}
