/*global document: false, require: false, phantom: false, JSON: false, window: false, console: false, tdgchart: false */
/* eslint no-implicit-globals: "off" */
'use strict';

/* Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved. */

/*
PhantomJS script that takes in URLs and passes back the results of rendering that URL.

Input:

pass arguments to stdin. Arguments are \n terminated, stringified JSON objects.
eg: "{"url": "http://example.com", "page_size": {"width": 800, "height": 600}, "output_format": "svg"}\n"

Supported input argument properties:

	url: String. A valid HTTP URL to be loaded and rendered.  URLs containing '&' or '?'
		should be encoded with something like JavaScript's encodeURIComponent().
		eg: http://foo.com?bar&baz=fred -> http%3A%2F%2Ffoo.com%3Fbar%26baz%3Dfred");

	in_filename: String. Filename of a local file containing the content to be loaded and rendered.
		If 'url' is specified, 'in_filename' is ignored.

	in_encoding: String. If 'in_filename' is set, 'in_encoding' defines the file encoding for 'in_filename'.
		If in_encoding is not set, 'in_filename' is read assuming UTF-8.  If 'in_filename' includes an
		explicit character encoding (charset), the file will be read a 2nd time using the explicit encoding.

	page: String. The content of the page to be rendered. One of 'url', 'in_filename' or 'page' must be specified.
		If either 'url' or 'in_filename' are specified, 'page' is ignored.

	output_format: String. One of 'png' (default), 'jpeg', 'html', 'pdf', 'svg' (moonbeam_mode=true only)

	img_format: String. Output results will be returned in this format.
		One of 'base64' (default), 'raw' (binary image data), 'file' (save result to local file) or
		'html' (embed image in trivial HTML page).  If output_format is 'svg' or 'html', img_format other than
		'file' are ignored.

	out_filename: String.  If img_format is 'file', output results will be written to this local file
		and *not* stdout.  Result JSON will still be written to stdout.

	page_size: Either 'auto' (guess at best output size), or an object with properties 'width' & 'height'.
		Returned result will be this size.

	render_delay: Number. If specified each render request will wait an additional render_delay miliseconds to
		ensure the entire page's JS and content have executed fully.  If unspecified, defaults to "auto", which
		will try to track the page's content and wait as long as necessary.
		This is not used if moonbeam_mode is true and using the Moonbeam included with this process.

	max_timeout: Number. If specified, each request will wait at most this number of ms before giving up and
		rendering the page's current state.

	moonbeam_mode: Boolean true or false (default).  If true, assume there's exactly one Moonbeam
		chart on the page, and render only that.  If false, do nothing specific to Moonbeam, instead,
		simply render the entire HTML page and return the results.

	moonbeam_url: String. If specified, use the version of Moonbeam found at 'moonbeam_url' instead of
		the Moonbeam bundled with this PhantomJS process.  'moonbeam_url' must refer to a single
		concatenated or minified version of Moonbeam, not the multiple file source version. (TODO: remove this limitation)
		'moonbeam_url' can also be the special string 'external'; this assumes that the requested
		URL page will contain a reference to Moonbeam, and will use that Moonbeam instead of the
		Moonbeam bundled with this PhantomJS process.  'page_size' is ignored for 'external'.

	easelly_mode: Boolean true or false (default).  If true, assumes the page to be rendered is an Easelly
		infographic.  If moonbeam_mode is set, this is ignored.  Enables two features:
		- Page rendering will be delayed until each Moonbeam and Easelly chart have completely rendered.
		- Page content is clipped according to Easelly's convoluted page layout.

	cookies: String. 'key1=value1;key2=value2' style list of key-value pairs of cookies.  Each key-value
		pair will be added as a separate cookie to every page request.

	cookie_domain: String.  If set, and if 'cookies' is also set, will set the cookie's domain to this when creating cookies.

	svg_img_fallback: One of 'png' (default), 'jpeg', 'html' or false.  If set, and if the requested chart type
		does *not* support rendering via SVG, then return an image in this format.

	css_to_svg: Boolean true (default) or false.  If true, and if the request output is SVG, will convert
		all CSS 'style' elements and attributes in the generated SVG into the closest native SVG equivalent
		(if possible), then remove all CSS from the output.

	You can also pass in any additional arguments you want; any unrecognized arguments will be passed
	back in the response.  This is especially useful for attaching a unique ID to each request.  eg:

		stdin: {id: 'bar37', url: "http://foo.com", output_format: 'svg'}
		stdout: {id: 'bar37', output: "<svg>...</svg>", output_format: 'svg', result: 'success'}

Output:

Results are written to stdout as stringified JSON.
eg: "{"output_format": "svg", "output": "<svg>...</svg>", "result": "success"}\n"

Result JSON will include all arguments that were passed into the request, along with:

	output: String. The result of the render.

	result: String. One of 'success', 'fail' (request failed but PhantomJS process is still up & listening
		for more requests) or 'crash' (PhantomJS process is shutting down).

Errors:

Any errors or informative messages are written to stderr.

Any stdin input arguments can also be specified on the command line. All arguments must be quoted.
eg: phantomjs rasterizer.js --run_once --url="http://example.com" --page_size="{width:800, height:600}"

Additional command line only arguments:

	-1, --run_once: If specified, this process will terminate after returning the results of the first request.

	-m=path, --moonbeam_path=path: Set path to the internal version of Moonbeam
*/

var fs = require('fs');
var system = require('system');
var webpage = require('webpage');
var config = require('./config');
var util = require('./util');

log_debug('Launching with config: ' + JSON.stringify(config, null, 4));

function createTracker(name) {
	return {
		name: name,
		waitingOn: {},  // key = unique request id, value = arbitrary request string
		alreadyReceived: {},  // key = unique request id, value = arbitrary request string
		count: function() {
			var count = 0;
			for (var id in this.waitingOn) {
				if (this.waitingOn.hasOwnProperty(id)) {
					count++;
				}
			}
			return count;
		},
		add: function(id, str) {
			if (this.alreadyReceived[id]) {
				delete this.alreadyReceived[id];
			} else if (!this.waitingOn[id]) {
				this.waitingOn[id] = str;
			}
		},
		remove: function(id) {
			if (this.waitingOn.hasOwnProperty(id)) {
				delete this.waitingOn[id];
			} else {
				this.alreadyReceived[id] = true;
			}
		},
		removeContent: function(str) {
			for (var id in this.waitingOn) {
				if (this.waitingOn.hasOwnProperty(id) && this.waitingOn[id].endsWith(str)) {
					this.remove(id);
					return;
				}
			}
		},
		toString: function() {
			return JSON.stringify({
				name: this.name,
				waitList: this.waitListToString(),
				received: this.receivedListToString()
			}, null, 4);
		},
		waitListToString: function() {
			var msg = [];
			for (var key in this.waitingOn) {
				if (this.waitingOn.hasOwnProperty(key)) {
					msg.push('[id: ' + key + ', url: ' + (this.waitingOn[key] + '').slice(0, 300) + ']');
				}
			}
			return msg.join(', ');
		},
		receivedListToString: function() {
			var msg = [];
			for (var key in this.alreadyReceived) {
				if (this.alreadyReceived.hasOwnProperty(key)) {
					msg.push('[id: ' + key + ', url: ' + (this.alreadyReceived[key] + '').slice(0, 300) + ']');
				}
			}
			return msg.join(', ');
		},
		clearQueue: function() {
			this.waitingOn = {};
			this.alreadyReceived = {};
		}
	};
}

var requestTracker = createTracker('requestTracker');  // track outstanding external resource requests
var moonbeamChartTracker;  // track Moonbeam charts on an HTML page to be rendered
var easellyChartTracker;   // track Easelly charts on an HTML page to be rendered

// Wrap all stdio calls so they're easier to manage

function log(msg) {
	// TODO: add verbosity command line args & make them work here
	if (typeof config.log_filename !== 'string' || config.log_filename.toLowerCase() === 'stderr') {
		system.stderr.write(msg + '\n');
	} else {
		try {
			fs.write(config.log_filename, msg + '\n', 'a');
		} catch (e) {
			system.stderr.write('Unable to write to log file: ' + config.log_filename + ', message: ' + msg + '\n');
		}
	}
}

function log_debug(msg) {
	if (config.debug) {
		log(msg);
	}
}

phantom.onError = function(msg, trace) {
	log('Error: ' + msg + '\n' + trace);
};

function input() {
	return system.stdin.readLine();
}

function output(msg, success, args) {
	var res = args || {};
	res.output = msg;
	res.output_format = res.output_format;
	res.img_format = res.img_format;
	res.result = success || 'fail';
	system.stdout.write(JSON.stringify(res) + '\n');
	requestTracker.clearQueue();
	moonbeamChartTracker = easellyChartTracker = null;
}

var outputHTML = function(page, args) {

	page.onLoadFinished = function(status) {  // status is either 'success' or 'fail'
		log_debug(' - onLoadFinished: ' + status);
		if (status !== 'success') {
			return;
		}

		(waitOnRequests('outputHTML', function() {
			log_debug(' - -  outputHTML, initializing wait requests');

			function render() {

				log_debug(' - - outputHTML, inside render');
				var pageSize = calculateClipRect(page, args);
				setClipRect(page, args.output_format, pageSize.width, pageSize.height, pageSize.left, pageSize.top);

				if (args.output_format === 'svg' || args.output_format === 'html') {
					args.output_format = 'html';  // Treat 'svg' as 'html' for non-Moonbeam pages
					if (args.img_format === 'file') {
						fs.write(args.out_filename, page.content, 'w');
						output(args.out_filename, 'success', args);
					} else {
						output(page.content, 'success', args);
					}
				} else {
					outputImage(page, args);
				}
				waitForInput();
			}

			trackEasellyCharts(page, args);

			if (args.render_delay === 'auto') {
				var retryDelay = 50;
				var retryCount = (args.max_timeout || 5000) / retryDelay;
				(waitOnRequests('render', render, [moonbeamChartTracker, easellyChartTracker], retryCount, retryDelay))();
			} else {
				window.setTimeout(function() {
					render();
				}, args.render_delay || 100);
			}
		}, requestTracker, 100, 50))();
	};
};

function outputSVG(page, args) {
	var svg = getSVG(page, args);
	if (args.img_format === 'file') {
		fs.write(args.out_filename, svg, 'w');
		output(args.out_filename, 'success', args);
	} else {
		output(svg, 'success', args);
	}
}

function outputImage(page, args) {
	if (args.img_format === 'file') {
		var quality = (args.output_format === 'png') ? 0 : 100;
		page.render(args.out_filename, {format: args.output_format, quality: quality});
		output(args.out_filename, 'success', args);
	} else {
		var base64 = page.renderBase64(args.output_format);
		if (args.img_format === 'html') {
			args.img_format = 'html';
			var html = '<!DOCTYPE html><html><body><img src="data:image/' + args.output_format + ';base64,' + base64 + '"/></body></html>';
			output(html, 'success', args);
		} else {
			if (args.img_format === 'raw') {
				args.img_format = 'raw';
			} else {
				args.img_format = 'base64';
			}
			output(base64, 'success', args);
		}
	}
}

function outputError(msg, args) {
	log('Error: ' + msg);
	output(msg + '\n', 'fail', args);
}

// Something went horribly wrong - let the world know then shut down this process
function crash(msg) {
	log('Error: ' + msg);
	output('Error: ' + msg + '\n', 'crash');
	phantom.exit(-1);
}

/* eslint-disable no-unused-vars */
function trackerNames(list) {
	return list.map(function(el) {
		return el.name;
	}).join(', ');
}

function trackerListToString(list) {
	return list.map(function(el) {return el.toString();}).join(',\n');
}
/* eslint-enable no-unused-vars */

// Wrap 'fn' function callback in a function that will wait to call 'fn' after any pending HTTP requests return or time out.
function waitOnRequests(name, fn, trackerList, retryCount, timeout) {
	var retries = 0;
	if (!Array.isArray(trackerList)) {
		trackerList = [trackerList];
	}
	trackerList = trackerList.filter(function(el) {return el != null;});
	function innerWait() {
		var maxCount = Math.max.apply(null, trackerList.map(function(el) {return el.count();}));
		if (maxCount > 0 && retries < retryCount) {
			// There are still outstanding requests, but haven't waited as many times as caller wanted, so wait again
			retries++;
			window.setTimeout(util.partial(innerWait, arguments), timeout);
		} else {
			trackerList.forEach(function(el) {
				// There are still outstanding requests, and we've waited long enough.  Clear requests and proceed.
				if (el.count() > 0) {
					log('Ignoring ' + el.count() + ' outstanding requests in ' + el.name + ': ' + el.waitListToString());
				}
				el.clearQueue();
			});
			retries = 0;
			fn.apply(null, arguments);
		}
	}
	return innerWait;
}

// Pause all processing in this PhantomJS thread and wait for input on stdin.
// If there are any outstanding HTTP requests, wait for those to return before blocking for input.
var wait = waitOnRequests('wait', function() {
	log('Waiting for request');
	var data = input();
	log('Received input: ' + data);

	// Allow this wait request to terminate immediately, instead of building a massive
	// useless callstack of wait - handle - wait - handle
	window.setTimeout(function() {
		handleRequest(JSON.parse(data));
	}, 0);
}, requestTracker, 50, 50);

function addPageCallbacks(page) {

	// TODO: this doesn't seem to catch Moonbeam crashes like 'chart' being undefined
	page.onError = function(msg, trace) {
		log('Error: ' + msg + '\n' + trace);
	};
	page.onConsoleMessage = function(msg) {
		log(' - inner page says: ' + msg);
	};
	page.onResourceTimeout = function(msg) {
		log_debug(' - onResourceTimeout: ' + JSON.stringify(msg));
	};
	page.onResourceError = function(msg) {
		if (msg) {
			requestTracker.remove(msg.id);
			log_debug('Request for ' + msg.url + ' failed: ' + msg.errorString);
			if (msg.url && msg.url.includes('html5chart_extensions')) {
				log('Failed to load html5 extension list; rendering chart extensions will likely fail.');
			}
		}
	};
	page.onResourceRequested = function(msg) {
		// Qt doesn't fire resourceReceived events for 'file' based URLs.  Work around this by not tracking
		// such requests (they either come back almost instantly or never anyway).
		if (msg && msg.url && !msg.url.startsWith('file')) {
			log_debug(' - onResourceRequested: ' + (msg.url + '').slice(0, 300) + ', id: ' + msg.id);
			requestTracker.add(msg.id, msg.url);
		}
	};
	page.onResourceReceived = function(msg) {
		// onResourceReceived is called for each received *chunk* of each request.
		// Ignore all but the last chunk when tracking resolved requests.
		if (msg && msg.stage === 'end' && (msg.status != null || msg.url.startsWith('data'))) {
			log_debug(' - onResourceReceived: ' + (msg.url + '').slice(0, 300) + ', id: ' + msg.id + ', stage: ' + msg.stage);
			requestTracker.remove(msg.id);
		}
	};

	/*
	page.onAlert = function(msg) {log(' - onAlert: ' + msg + '!-!');};
	page.onCallback = function(msg) {log(' - onCallback: ' + msg);};
	page.onClosing = function(msg) {log(' - onClosing: ' + msg);};
	page.onConfirm = function(msg) {log(' - onConfirm: ' + msg);};
	page.onFilePicker = function(msg) {log(' - onFilePicker: ' + msg);};
	page.onInitialized = function() {log(' - onInitialized');};
	page.onLoadStarted = function(msg) {log(' - onLoadStarted: ' + msg);};
	page.onNavigationRequested = function(msg) {log(' - onNavigationRequested: ' + msg);};
	page.onPageCreated = function(msg) {log(' - onPageCreated: ' + msg);};
	page.onPrompt = function(msg) {log(' - onPrompt: ' + msg);};
	page.onUrlChanged = function(msg) {log(' - onUrlChanged: ' + msg);};
	*/
}

function createWebPage(config) {
	var page = webpage.create();
	addPageCallbacks(page);
	// Add cookies from command-line parameters to each page upon creation.
	// These parameters (in 'config') now contain 'cookie', 'cookie_domain' (like
	// the request args) and also 'cookie_name_value_delimiter' (see addCookies()).
	// This is required for loading initial resources, such as html5chart_extensions.json,
	// on a secure reporting server, because these resources are loaded before cookies
	// are set by any request. (We still refresh the cookies on each request in case
	// they're different in later server sessions.) [VIZ-161]
	addCookies(page, config);
	return page;
}

function createMoonbeamPage(config) {
	var page = createWebPage(config);
	var content = '<!DOCTYLE html><html><head>' +
		'<script type="text/javascript">' +
		'window.tdgScriptPath = function(){return "' + config.moonbeam_resource_path + '";};' +
		'</script></head><body><div id="chart"></div></body></html>';
	page.viewportSize = {width: 5000, height: 5000};
	page.setContent(content, config.server_protocol + '://' + config.server_ip + ':' + config.server_port + '/');
	return page;
}

function addCookies(page, args) {
	page.clearCookies();
	if (args && typeof args.cookies === 'string') {
		var cookies = args.cookies.split(';');
		// The usual name/value delimiter '=' doesn't work in command-line arguments (can't
		// be quoted), so the server sets cookie_name_value_delimiter to ':' instead:
		var delimiter = args.cookie_name_value_delimiter || '=';

		for (var i = 0; i < cookies.length; i++) {
			var keyValue = cookies[i].split(delimiter);
			if (keyValue.length >= 2) {
				log_debug('Setting cookie key: ' + keyValue[0] + ', value: ' + keyValue[1] + ' on page: ' + page.name);
				page.addCookie({
					name: keyValue[0],
					value: keyValue[1],
					path: '/',
					domain: args.cookie_domain || null
				});
			}
		}
	}
	return page;
}

// Every included JS file is critical - if any fail to load, exit
function importJS(page, url) {
	if (!page.injectJs(url)) {
		crash('Failed to load JS file: ' + url);
	}
}

// Load the Moonbeam that's included with this process, as defined by 'moonbeamPath' (a file system path)
function loadMoonbeam(page, moonbeamPath) {

	//[VIZ-721] load the compatibility layer (polyfills) to provide some of modern ECMAScript feeatures absent in PhantomJS 
	//but required by Moonbeam code or extensions (especially ESRI maps extension)
	var sPath = moonbeamPath.replace(/tdgchart(-[^.]*)?\.js/, '');
	importJS(page, sPath + 'phantomjs_corejs.js');

	// Load Moonbeam into the standalone webpage that will hold the rendered chart.
	if (moonbeamPath.includes('tdgchart-min.js') || moonbeamPath.includes('tdgchart-concat.js')) {
		importJS(page, moonbeamPath);
	} else if (moonbeamPath.includes('tdgchart.js') && fs.isFile(moonbeamPath)) {

		// If we're loading a non-concatenated, multiple file version of Moonbeam, must parse tdgchart.js and inject
		// each listed .js file manually.  PhantomJS doesn't work with the document.write(script) used in tdgchart.js.
		var srcPath = moonbeamPath.replace('tdgchart.js', '');
		var re = new RegExp("[\"']([\\w\\./]+\\.js)[\"'],?");
		var lines = fs.read(moonbeamPath).split('\n');
		for (var i = 0; i < lines.length; i++) {
			var match = lines[i].trim().match(re);
			if (match && match[1]) {
				importJS(page, srcPath + match[1]);
			}
		}
	}

	// This is called indirectly by Moonbeam (or inside any page.evaluate) via window.callPhantom
	page.onCallback = function(result) {
		if (result && result.message === 'ajax') {
			requestTracker.removeContent(result.url);
			log_debug(' - onResourceReceived (sync ajax): ' + result.url);
		} else {
			handleRenderedMoonbeamPage(page, result);
		}
	};

	var moonbeamExists = page.evaluate(function() {  // Check if Moonbeam loaded correctly
		return window.tdgchart != null;
	});

	if (!moonbeamExists) {
		crash('Failed to load internal Moonbeam from path: ' + moonbeamPath);
	}

	page.evaluate(function() {
		window.tdgchart.util.isServerSide = function() { return { engine: "PhantomJS" }; };
	});
	page.evaluate(function() {
		window.tdgchart.util.reUnicode = new RegExp('\\\\u([0-9a-f]{4})','gi');

		window.tdgchart.util.convertUnicodeEscape = function(u) {
			//convert '\uFFFF' Unicde escaped sequences in a string to Unicode (UTF-16) values
			try {
				if (typeof u != 'string')
					return u;
				return u.replace(window.tdgchart.util.reUnicode, function(match, hex) {
					//Would be better to use String.fromCodePoint (instead of String.fromCharCode)
					//that supports Unicdoe>=0x10000 but not available in phantomjs. 
					//But right now we support only \uFFFF notation that does not cover whole Unicode,
					//so no big deal. Would be if we support codepoint \u{F*} notation.
					return String.fromCharCode(parseInt(hex,16));
				});
			} catch(e) {
				return u;
			}
		};


	});

	page.evaluate(function() {
		// There's a bug in Qt's network stack: synchronous ajax calls do *not* trigger the 'resourceReceived'
		// callback.  Work around this by wrapping Moonbeam's built in ajax call so it notifies us if
		// it is ever called synchronously.
		var ajax = tdgchart.util.ajax;
		tdgchart.util.ajax = function(path, config) {
			if (config && config.async !== true) {
				var onLoad = config.onLoad;
				config.onLoad = function(res) {
					window.callPhantom({url: path, message: 'ajax'});
					return typeof onLoad === 'function' ? onLoad(res) : res;
				};
			}
			return ajax(path, config);
		};

		// Draw a chart once on the internal page.  This gives PhantomJS a chance to run Moonbeam's
		// code, and cache & optimize it so that future draws are much faster.
		// This also loads the extension list, so we don't need to do so later.
		var chart = new tdgchart();
		chart.draw('chart');
	});
}

function outputMoonbeamPage(page, args) {

	// Render the requested chart on a PhantomJS webpage and pull out the raw SVG & (optionally) chart size
	var contextResult = page.evaluate(function(args) {

		var res = {innerHTML: null, args: args, supportsSVG: true};
		try {
			document.body.style.margin = 0;  // Turn off all of webkit's automatic page margins

			if (args.moonbeam_url === 'external') {

				// We're in a page that has already rendered a chart via its own included version of Moonbeam
				// Find the rendered chart and return its size & raw html / svg
				var svgNode = document.querySelector('svg.rootPanel');
				if (svgNode && svgNode.parentNode) {
					res.innerHTML = svgNode.parentNode.innerHTML;  // svgNode.outerHTML doesn't work well in PhantomJS
					res.page_size = {
						width: parseInt(svgNode.getAttribute('width'), 10),
						height: parseInt(svgNode.getAttribute('height'), 10)
					};
				}
			} else {

				// We're in a mostly blank page, just a single div with id='chart'.
				// Render a Moonbeam chart then return its size & raw html / svg.
				var chart = new tdgchart();
				if (args && args.url) {
					chart.loadRemoteProperties(args.url, 'jschart', {async: false, onError: function() {
						this.errorMessage = 'AJAX call to load file failed: ' + args.url;
					}});
				} else if (args && args.in_filename_content) {
					var src = args.in_filename_content;

					var convertUnicode = true; /* [VIZ-564] Regular JSCHART engine creates PFJ block 
					from Javascript string statements (script +=  ...) but PhantomJS rasterizer does not do that.
					Instead it parses 'in_filename_content' as a text and extracts PFJ code statements in
					data_loader.js/loadPropertiesPage, then pass it directly to parsePFJString().
					Thus in PhantomJS '\uFFFF' Unicode escaped sequences are not interpreted by Javascript thus not
					converted to regular Unicode (UTF-16 encoded) strings but passed as six ASCII characters instead.
					To workaround: manually convert these sequences here. */
					if (src && convertUnicode && tdgchart.util.convertUnicodeEscape)
						src = tdgchart.util.convertUnicodeEscape(src);

					chart.loadPropertiesPage('jschart', src);
				} else if (args && args.page) {
					chart.loadPropertiesPage('jschart', args.page);
				}

				// Page size has two modes: either passed in via page_size={width, height} argument,
				// or calculated here by the rendered chart inside the requested URL.
				if (args.page_size && args.page_size.width && args.page_size.height) {
					chart.width = args.page_size.width;
					chart.height = args.page_size.height;
				}

				// Copy the final rendered page size to return value
				res.page_size = {
					width: chart.width,
					height: chart.height
				};

				// If chart has been scaled, must apply this scaling to the overall calculated page size too
				if (chart.transform && chart.transform.scale) {
					if (chart.transform.scale == 'auto') {
						// placeholder for 'auto' support if needed
					} else {
						res.page_size.width *= chart.transform.scale;
						res.page_size.height *= chart.transform.scale;
					}
				}

				// Turn off all interactive features and remove any tooltips - none of those things work on the server
				chart.enableBehavior('all', false);
				if (Array.isArray(chart.series)) {
					chart.series.forEach(function(el) {
						el.tooltip = null;
					});
				}

				// TODO: Add 'isAsync' to extension API so we can know if extensions need this async delay or not
				// TODO: Add 'disableAllInteraction' to extension API
				// [VIZ-891] narrative charts is async too due to async call to Yseop server
				var drawAsync = chart.isExtension() || chart.isNarrativeTextEnabled();

				if (drawAsync) {
					var asyncRes = res;
					res = 'async';
					chart.registerEvent(function() {
						// Extensions that draw into HTML containers cannot be returned as SVG.  Fallback to a static image (if allowed)
						var chart = this;  // eslint-disable-line no-invalid-this
						var containerType = (tdgchart.extensionManager.getExtensionProperty(chart, 'containerType') || '').toLowerCase();
						if (containerType === 'html' && asyncRes.args.output_format === 'svg' && asyncRes.args.svg_img_fallback) {
							asyncRes.args.output_format = asyncRes.args.svg_img_fallback;
						}
						// window.callPhantom is a 'magic' function defined by PhantomJS, which triggers this page's 'onCallback'
						window.callPhantom(asyncRes);
					}, 'renderComplete', undefined, { _staticChartPreserveEvent: true });
				}

				chart.catchErrors = true;
				chart.draw('chart');
			}
		} catch (e) {
			var s = '<svg xmlns="http://www.w3.org/2000/svg"><text x="10" y="20" style="font: 12pt arial">' + JSON.stringify(e) + '</text></svg>';
			document.getElementById('chart').innerHTML = s;
		}
		return res;
	}, args);

	if (contextResult !== 'async') {
		window.setTimeout(function() {
			handleRenderedMoonbeamPage(page, contextResult);
		}, 0);
	}
}

// Called after a page has finished rendering.
// 'page' is a Phantom webpage that will contain the recently rendered chart
// 'result' is a {args, page_size, innerHTML} object.  If innerHTML missing, will pull rendered chart from page.
var handleRenderedMoonbeamPage = waitOnRequests('handleRenderedMoonbeam', function(page, result) {

	if (!result) {
		outputError('Received no Moonbeam result at all - cannot handle request');
	}

	if (!result.innerHTML) {
		result.innerHTML = page.evaluate(function() {
			return document.getElementById('chart').innerHTML;
		});
	}

	var args = result.args;
	if (!page || !args) {
		outputError('Invalid Moonbeam result object: ' + JSON.stringify(result));
	}

	if (!result.innerHTML) {
		outputError('Failed to capture the chart rendered on page: ' + args.url, args);
	}

	try {
		if (args.output_format === 'svg') {
			outputSVG(page, args);
		} else if (args.output_format === 'png' || args.output_format === 'jpeg' || args.output_format === 'pdf') {

			// Apply previously calculated page size to the page as a clip rect, to get the exact correct image bounds
			if (result.page_size) {
				setClipRect(page, args.output_format, result.page_size.width, result.page_size.height, 0, 0);
			}

			outputImage(page, args);
		} else {
			outputError('Unrecognized output_format: ' + args.output_format, args);
		}
	} catch (e) {
		outputError('Unrecognized error: ' + e, args);
	}

	waitForInput();
}, requestTracker, 20, 50);

// Open the requested URL.  Call loadCompleteCallback when page is open.
function outputOpenPage(page, url, args, loadCompleteCallback) {
	page.open(url, function(status) {
		if (status !== 'success') {
			outputError('Failed to load URL: ' + url, args);
			waitForInput();
		} else {
			window.setTimeout(function() {  // Give the page some time to completely render everything
				loadCompleteCallback();
			}, args.render_delay || 100);
		}
	});
}

function getSVG(page, args) {

	if (args && args.css_to_svg) {
		inlineCSS(page);
	}

	var html = page.evaluate(function() {
		return document.getElementById('chart').innerHTML;
	});

	return util.prettyPrintXML(html);
}

function calculateClipRect(page, args) {
	var clip;
	if (args.easelly_mode) {
		clip = page.evaluate(function() {
			// Try to nicely crop Easelly output
			var svg = document.getElementsByTagName('svg')[0];
			if (svg) {
				var g = svg.getElementsByTagName('g')[0];
				if (g) {
					return g.getBoundingClientRect();
				}
			}
			return null;
		});
	}
	if (clip == null) {
		if (args.page_size === 'auto') {
			clip = page.evaluate(function() {
				return {
					left: 0,
					top: 0,
					width: document.body.firstElementChild.clientWidth || 5000,
					height: document.body.firstElementChild.clientHeight || 5000
				};
			});
		} else {
			clip = args.page_size;
		}
	}
	return clip;
}

function setClipRect(page, output_format, width, height, left, top) {
	page.clipRect = {left: left, top: top, width: width, height: height};
	if (output_format === 'pdf') {
		var dpiScale = 72 / 96;
		page.paperSize = {width: ((width + 5) * dpiScale) + 'px', height: ((height + 5) * dpiScale) + 'px', margin: '0px'};
		if (top !== 0 || left !== 0) {
			page.evaluate(function(args) {  // PhantomJS does not respect page.clipRect for PDF output (https://github.com/ariya/phantomjs/issues/12936)
				document.body.style.margin = (args.top * -1) + 'px 0px 0px ' + (args.left * -1) + 'px';  // Shift page content up & left according to clipRect offset
				document.body.firstElementChild.style.width = (args.left + args.width) + 'px';
				document.body.firstElementChild.style.height = (args.top + args.height) + 'px';
				document.body.firstElementChild.style.overflow = 'hidden';
			}, {top: top, left: left, width: width, height: height});
		}
	}
}

function inlineCSS(page) {

	page.evaluate(function() {

		// These CSS properties can also be used directly as SVG attributes
		var simpleMappings = [
			'alignment-baseline', 'baseline-shift', 'clip', 'clip-path', 'clip-rule', 'color', 'color-interpolation',
			'color-interpolation-filters', 'color-profile', 'color-rendering', 'cursor', 'direction', 'display',
			'dominant-baseline', 'enable-background', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'flood-color',
			'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style',
			'font-variant', 'font-weight', 'glyph-orientation-horizontal', 'glyph-orientation-vertical',
			'image-rendering', 'kerning', 'letter-spacing', 'lighting-color', 'marker-end', 'marker-mid',
			'marker-start', 'mask', 'opacity', 'overflow', 'pointer-events', 'shape-rendering', 'stop-color',
			'stop-opacity', 'stroke', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin',
			'stroke-miterlimit', 'stroke-opacity', 'stroke-width', 'text-anchor', 'text-decoration',
			'text-rendering', 'unicode-bidi', 'visibility', 'word-spacing', 'writing-mode'
		];

		function applyOneStyle(node, styleString) {
			var styleList = styleString.split(';');
			for (var i = 0; i < styleList.length; i++) {
				var style = styleList[i];
				if (!style || !style.includes(':')) {
					continue;
				}
				style = style.split(':');
				var name = style[0].trim(), value = style[1].trim();
				if (value === 'normal') {
					continue;
				} else if (simpleMappings.includes(name)) {
					node.setAttribute(name, value);
				} else {
					console.log('Ignoring CSS style: ' + name + ', value: ' + value);  // eslint-disable-line no-console
				}
			}
		}

		function inlineOneNode(node) {
			if (node && node.hasAttribute('style')) {
				applyOneStyle(node, node.getAttribute('style'));
				node.removeAttribute('style');
			}
		}

		function inlineCSSAttributes(node) {
			inlineOneNode(node);
			for (var i = 0; i < node.childElementCount; i++) {
				inlineCSSAttributes(node.childNodes[i]);
			}
		}

		function inlineCSSPages() {
			for (var i = 0; i < document.styleSheets.length; i++) {
				var sheet = document.styleSheets[i];
				if (!sheet || sheet.href.includes('leaflet/leaflet')) {
					continue;
				}
				for (var j = 0; j < sheet.rules.length; j++) {
					var rule = sheet.rules[j];
					var nodes = document.querySelectorAll(rule.selectorText);
					for (var k = 0; k < nodes.length; k++) {
						applyOneStyle(nodes[k], rule.style.cssText);
					}
				}
			}
		}

		inlineCSSPages();
		inlineCSSAttributes(document.getElementById('chart'));
	});
}

function toBool(v) {
	if (typeof v === 'boolean') {
		return v;
	}
	v = (v + '').toLowerCase() || 'true';
	return (v === 'false') ? false : true;
}

var imgTypeList = ['png', 'jpeg', 'html', 'svg', 'pdf'];
var imgFormatList = ['base64', 'raw', 'html', 'file'];

function toImgType(v) {
	v = (v + '').toLowerCase() || 'png';
	v = (v === 'jpg') ? 'jpeg' : v;
	return imgTypeList.includes(v) ? v : 'png';
}

function validateArgs(args) {
	args = args || {};

	var defaultArgs = util.cloneObject(config.default_server_settings);
	args = util.mergeObjects(args, defaultArgs);

	args.css_to_svg = toBool(args.css_to_svg);
	args.moonbeam_mode = toBool(args.moonbeam_mode);
	if (args.moonbeam_mode) {
		args.easelly_mode = false;
	}

	args.output_format = toImgType(args.output_format);
	args.svg_img_fallback = toImgType(args.svg_img_fallback);

	args.img_format = (args.img_format + '').toLowerCase();
	args.img_format = (imgFormatList.includes(args.img_format)) ? args.img_format : 'raw';

	if (args.url && args.url.startsWith('file://')) {
		args.in_filename = args.url.replace('file://', '');
		args.url = null;
	}

	if (args.url == null && args.in_filename) {
		if (!fs.isFile(args.in_filename)) {
			return {error: 'Could not open local file for raterization: ' + args.in_filename};
		}
		if (args.in_encoding) {
			args.in_filename_content = fs.read(args.in_filename, {charset: args.in_encoding});
		} else {
			args.in_filename_content = fs.read(args.in_filename);
			var match = (args.in_filename_content || '').match(/charset=([a-zA-Z0-9-_:.]*)/i);
			if (match && match[1] && match[1].toLowerCase() !== 'utf-8') {
				args.in_filename_content = fs.read(args.in_filename, {charset: match[1]});
			}
		}
	}

	// If we're to save generated output into a file, make sure we have a valid, writable file name
	if (args.img_format === 'file') {
		if (!args.out_filename) {
			return {error: '"img_format = file" but "out_filename" is not set.  Cannot save output.'};
		}
	}
	if (args.url == null && args.in_filename == null && args.page == null) {
		return {error: 'No url, page or filename specified.  Nothing to render'};
	}

	if (args.shutdown === true || args.shutdown === 'true') {
		args.shutdown = true;
	} else {
		delete args.shutdown;
	}

	if (config.debug) {
		var args_out = JSON.parse(JSON.stringify(args));
		if (args_out.in_filename_content) {
			args_out.in_filename_content = args_out.in_filename_content.slice(0, 100) + '...';
		}
		log_debug('Request args validation: ' + JSON.stringify(args_out, null, 4));
	}
	return args;
}

function fixChartEngines(page, args) {
	if (!args.easelly_mode) {
		return;
	}

	moonbeamChartTracker = easellyChartTracker = null;

	// This is called indirectly by the page via window.callPhantom()
	page.onCallback = function(result) {
		if (result && result.message === 'ajax') {
			requestTracker.removeContent(result.url);
			log_debug(' - onResourceReceived (sync ajax): ' + result.url);
		} else if (result && result.message === 'fixChartResults') {
			if (result.fix.fixedMoonbeam) {
				moonbeamChartTracker = createTracker('moonbeamChartTracker');
			}
			if (result.fix.fixedEaselly) {
				easellyChartTracker = createTracker('easellyChartTracker');
			}
		} else if (result && result.message === 'MoonbeamRenderComplete') {
			if (moonbeamChartTracker) {
				var id = result.chartID.replace('jschart_HOLD_', '');
				moonbeamChartTracker.remove(id);
			}
		} else if (result && result.message === 'EasellyRenderComplete') {
			if (easellyChartTracker) {
				easellyChartTracker.remove(result.chartID);
			}
		}
	};

	var server_args = {
		server_protocol: config.server_protocol,
		server_ip: config.server_ip,
		server_port: config.server_port,
		resource_path: config.moonbeam_resource_path
	};
	page.onInitialized = function() {
		page.evaluate(function(args) {
			window.tdgAllowFileRequests = true;
			window.tdgScriptPath = function() {
				return args.server_protocol + '://' + args.server_ip + ':' + args.server_port + args.resource_path;
			};

			window.tdgLibraryLoadCallback = function() {
				var results = {};
				if (window.tdgchart && tdgchart.util && tdgchart.util.ajax) {
					// There's a bug in Qt's network stack: synchronous ajax calls do *not* trigger the 'resourceReceived'
					// callback.  Work around this by wrapping Moonbeam's built in ajax call so it notifies us if
					// it is ever called synchronously.
					var ajax = tdgchart.util.ajax;
					tdgchart.util.ajax = function(path, config) {
						if (config && config.async !== true) {
							var onLoad = config.onLoad;
							config.onLoad = function(res) {
								window.callPhantom({url: path, message: 'ajax'});
								return typeof onLoad === 'function' ? onLoad(res) : res;
							};
						}
						return ajax(path, config);
					};

					// Hack Moonbeam's renderComplete callback to notify us when every chart is done drawing
					var renderComplete = tdgchart.prototype.processRenderComplete;
					tdgchart.prototype.processRenderComplete = function(transition) {
						renderComplete.call(this, transition);
						window.callPhantom({chartID: this.documentRoot, message: 'MoonbeamRenderComplete'});
					};
					results.fixedMoonbeam = true;
				}

				// Hack the 3rd party chart.js library so it fires an onAnimationComplete event that we can use to know an Easelly chart is done drawing
				if (window.Chart && window.Chart.defaults && window.Chart.defaults.global) {
					window.Chart.defaults.global.onAnimationComplete = function() {
						var id = this.chart.canvas.getAttribute('id');
						window.callPhantom({chartID: id, message: 'EasellyRenderComplete'});
					};
					results.fixedEaselly = true;
				}
				window.callPhantom({fix: results, message: 'fixChartResults'});
			};
		}, server_args);
	};
}

// Build a list of Moonbeam & Easelly charts on the page, so we can wait for each of them to finish drawing before taking a screenshot
function trackEasellyCharts(page, args) {
	if (!args.easelly_mode) {
		return;
	}
	var chartsOnPage = page.evaluate(function() {
		var charts = {moonbeam: [], easelly: []};
		for (var key in window.ibiData) {
			if (window.ibiData.hasOwnProperty(key) && window.ibiData[key] && window.ibiData[key].componentType === 'graph') {
				if (key.startsWith('wfibchart')) {
					charts.moonbeam.push(key);
				} else {
					charts.easelly.push(key);
				}
			}
		}
		return charts;
	});
	if (moonbeamChartTracker) {
		chartsOnPage.moonbeam.forEach(function(el) {
			moonbeamChartTracker.add(el, el);
		});
	}
	if (easellyChartTracker) {
		chartsOnPage.easelly.forEach(function(el) {
			easellyChartTracker.add(el, el);
		});
	}
}

function handleRequest(args) {

	if (args && args.shutdown) {
		log('Received shutdown request - terminating Phantom process');
		phantom.exit();
		return;
	}

	var newArgs = validateArgs(args);

	if (!newArgs || newArgs.error) {
		outputError(newArgs.error, args);
		waitForInput();
		return;
	}

	args = newArgs;

	log('Rendering: ' + (args.url || 'page string') + ', outFormat: ' + args.output_format + ', imgFormat: ' + args.img_format);

	// Reset clip rect on the page used to render HTML, as previous requests could leave it borked
	// TODO: what should happen with an HTML (non-Moonbeam) request and page_size is not specified?
	if (!args.easelly_mode && args.page_size && args.page_size.width && args.page_size.height) {
		setClipRect(htmlPage, args.output_format, args.page_size.width, args.page_size.height, 0, 0);

	} else {
		args.page_size = 'auto';
		setClipRect(htmlPage, args.output_format, 5000, 5000, 0, 0);
	}

	if (args.cookies) {
		log_debug('Adding cookies to page: ' + args.cookies);
		addCookies(htmlPage, args);
		addCookies(internalMoonbeamPage, args);
		addCookies(externalMoonbeamPage, args);
	}

	if (args.moonbeam_mode) { // Assume url contains a Moonbeam chart; render only the chart

		if (args.moonbeam_url) {

			log('Requesting Moonbeam: ' + args.moonbeam_url);

			if (args.moonbeam_url === 'external') {  // Use Moonbeam that's included in the requested page itself
				if (args.url) {
					outputOpenPage(htmlPage, args.url, args, function() {
						outputMoonbeamPage(htmlPage, args);
					});
				} else if (args.page) {
					htmlPage.content = args.page;
					outputMoonbeamPage(htmlPage, args);
				}
			} else {  // Use some arbitrary Moonbeam from somewhere
				externalMoonbeamPage.includeJs(args.moonbeam_url, function() {
					window.setTimeout(function() {
						outputMoonbeamPage(externalMoonbeamPage, args);
					}, args.render_delay || 100);
				});
			}
		} else {  // Use Moonbeam that's included with this PhantomJS process
			outputMoonbeamPage(internalMoonbeamPage, args);
		}

	} else if (args.url) {  // Render the entire HTML page at the given url
		fixChartEngines(htmlPage, args);
		outputOpenPage(htmlPage, args.url, args, function() {
			outputHTML(htmlPage, args);
		});
	} else if (args.in_filename) {
		var url = 'file:///' + args.in_filename.replace(/\\/g, '/');
		fixChartEngines(htmlPage, args);
		htmlPage.setContent(args.in_filename_content, url);
		outputHTML(htmlPage, args);
	} else if (args.page) {  // Render HTML content string
		fixChartEngines(htmlPage, args);
		htmlPage.content = args.page;
		outputHTML(htmlPage, args);
	}
}

log('Launching Phantom Process');

var waitForInput = wait;

if (system.args && system.args.length > 1) {
	system.args.forEach(function(arg) {
		if (arg === '-1' || arg === '--run_once') {
			waitForInput = function() {
				phantom.exit();
			};
		} else if (typeof arg === 'string') {
			var match = arg.match(/^--(.*)=(.*)$/);
			if (match && match.length > 2 && config.hasOwnProperty(match[1])) {
				config[match[1]] = match[2].replace(/^['"](.*)['"]$/, '$1');
			}
		}
	});
}

log_debug('config with command-line args: ' + JSON.stringify(config, null, 4));

config.moonbeam_resource_path = config.moonbeam_resource_path || '';
if (!config.moonbeam_resource_path.endsWith('/')) {
	config.moonbeam_resource_path += '/';
}

// Page used to render all Moonbeam charts using the Moonbeam bundled with this process
var internalMoonbeamPage = createMoonbeamPage(config);
internalMoonbeamPage.name = 'internal Moonbeam page';

// Page used to render all Moonbeam charts with externally defined Moonbeam libraries
var externalMoonbeamPage = createMoonbeamPage(config);
externalMoonbeamPage.name = 'external Moonbeam page';

// Page used to render all non-Moonbeam HTML pages
var htmlPage = createWebPage(config);
htmlPage.name = 'html content page';

loadMoonbeam(internalMoonbeamPage, config.moonbeam_path);

wait();
