## Creating a WebFOCUS<sup>®</sup> Chart Extension

WebFOCUS<sup>®</sup> now supports the ability to add new, custom chart types to its list of built in charts.  This guide walks through the structure of an extension and the steps necessary to create your own.  The guide uses the [Simple Bar](https://github.com/ibi/wf-extensions-chart/tree/master/com.ibi.simple_bar) as a template to get started quickly.

#### Basics

Chart extensions are written in JavaScript.  The 'visual' part of a visualization can be drawn with HTML, Canvas or SVG.  Extensions can include external CSS and JS libraries (like [d3](http://d3js.org/)), which can be used to quickly build almost any visualization you can imagine.  The WebFOCUS<sup>®</sup> Extension API is limited to new, complete chart types only - it is not possible to add features to existing chart types, and it is not possible to modify or extend parts of WebFOCUS<sup>®</sup> outside of the chart area allocated to your extension.

The extension API includes 'modules'; blocks of features within WebFOCUS<sup>®</sup>'s chart engine that can be reused in your extension.  Modules include stuff like chart titles / headings, chart legend, tooltips and data selection.

WebFOCUS\WebFOCUS82\config\web_resource\extensions`.  See [Installing a WebFOCUS<sup>®</sup> Extension](https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension) for details on installing an existing extension.

#### Getting Started

To start, [download](https://github.com/ibi/wf-extensions-chart/blob/master/com.ibi.simple_bar/com.ibi.simple_bar.zip?raw=true) then [install](https://github.com/ibi/wf-extensions-chart/wiki/Installing-a-WebFocus-Extension) the Simple Bar extension.  This should create a `com.ibi.simple_bar` folder inside WF's `extensions` folder.

#### Extension Structure

The [Simple Bar](https://github.com/ibi/wf-extensions-chart/tree/master/com.ibi.simple_bar) example demonstrates all the required and optional files in an extension, and how those files are typically laid out.

- The extension's ID (`ext_id`) is a string typically in the 'com.your_company.extension_name' form.  You will see this `ext_id` often.  `ext_id` must be all lower case, and can include only letters, numbers, underscore and dots.

- The entire extension lives in a folder named after `ext_id`.

- The core of the extension lives in a file `ext_id`.js.  This file includes code to render the extension as a new chart type within WebFOCUS<sup>®</sup>.

- `properties.json` configures your extension to run within WebFOCUS<sup>®</sup>.  This file includes all the meta-data needed to include your extension in the WebFOCUS<sup>®</sup> user interface, as well as a list of all properties you wish to expose to end users, so they can customize your extension's behavior.

- Additional folders for external 'css' and 'lib' resources (all optional).  If your extension uses any additional CSS or JavaScript library files, you can keep those resources organized in dedicated folders like 'css' and 'lib' as you choose.  External resources are configured and loaded inside your extension's base `ext_id`.js file.

#### Build cycle

Creating an extension often involves cycles of writing, running then debugging code.  Different changes require different steps to be recognized.

When you make changes to your extension's `properties.js`, you need to clear WF's cache for those changes to be recognized.  This is done with the 'Clear cache' link in the WebFOCUS<sup>®</sup> 'Administration Console'.

If you change your extension's .js code (like com.ibi.simple_bar.js), you do not need to make any changes to WF, you only need to clear your own browser's cache, to ensure the new javascript file is downloaded.  The same is true if you change any additional .js files included by your extension.

#### Extension Rendering API

com.ibi.simple_bar.js includes examples of everything that the chart extension API provides.  It is divided into two main parts: chart rendering and extension configuration.

The extension API provides 3 'entry points' that you can use as needed to render your extension.  Each entry point is simply a JS function callback that you write:

- `initCallback(successCallback, config)`: (optional) Invoked by the engine exactly *once* during library load time.  This is a good spot to add any 'document.onload' type of initialization code.  Your callback is passed a `successCallback`, which you *must* invoke with `true` if your initialization code succeeded or `false` if something went wrong.  If you call `successCallback(false)`, no further interaction with your extension will occur and your extension will render as an empty page.

- `preRenderCallback(config)`: (optional) Invoked each time your extension is to be rendered, as the *very first* step in the overall rendering process.  This is a good spot to examine and tweak / override any internal chart properties that will affect the subsequent render.

- `renderCallback(config)`: (required) The workhorse - this is where you add all the code that will actually draw your chart. `config` will contain key properties `width`, `height` (define the size of your chart in px), and `container` (a reference to the DOM node that you render into).  `container` will be either an HTML `DIV` element or an SVG `G` element, depending on your chosen `containerType` extension configuration (see below).

Each of the three entry point callbacks are passed a `config` object, which contains a bunch of useful properties: 

    {
      // Properties that are always available:
      moonbeamInstance: the chart instance currently being rendered
      data: the data set being rendered
      properties: the block of your extension's properties, as they've been set by the user
      modules: the 'modules' object from your extension's config, along with additional API methods
  
      // Properties available only during render callback:
      width: width of the container your extension renders into, in px
      height: height of the container your extension renders into, in px
      containerIDPrefix: the ID of the DOM container your extension renders into.  Prepend this to *all* IDs your extension generates, to ensure multiple copies of your extension work on one page.
      container: DOM node for your extension to render into;
      rootContainer: DOM node containing the specific chart engine instance being rendered.
    }

#### Extension Configuration

Extension configuration is split into two parts: one part which interacts with the chart engine and chart canvas inside WebFOCUS<sup>®</sup>, and one part which interacts with the rest of the WebFOCUS<sup>®</sup> interface, namely the chart type picker and chart data buckets.

##### Chart Engine Configuration

The chart engine configuration lives inside the same `ext_id`.js file used for chart rendering.  Config is easy: create a `config` object with all the info unique to your extension, then tell the extension API about your extension.

The `config` object is straightforward. Required properties are 'id', 'name', 'description' and 'renderCallback':

	var config = {
		id: 'com.ibi.simple_bar',     // string that uniquely identifies this extension
		containerType: 'svg',  // either 'html' or 'svg' (default)
		initCallback: initCallback,  // Refers to your init callback fn (optional)
		preRenderCallback: preRenderCallback,  // Refers to your preRender callback fn (optional)
		renderCallback: renderCallback,  // Refers to your render fn (required)
		resources:  {  // Additional external resources (CSS & JS) required by this extension (optional)
			script: ['lib/d3.min.js'],
			css: ['css/extension.css']
		},
		modules: // More on this later
	}

To reference JavaScript libraries included with the extension API, reference it in the resources.script block within the config object. If different versions of this library are available, you can reference a specific version of the library using the optional version and minified properties, or reference it with just the name property, in which case the most recent included version of the library will be used. Currently, this is d3 version 5.16.0.

For example, use:

	resources: {script: [{name: 'd3', version: '2.10.3'}, 'minified': 'src']},

To load a very specific version of d3, in this case, the uncompressed version of d3 2.10.3. Set the minified property to 'min' to reference d3.min.js.
	
	resources: {script: [{name: 'd3', version: '2'}]},

To load any d3 version 2.

	resources: {script: [{name: 'd3'}]},

To load the most recent version of d3. 

D3 versions 5.12.0, 4.13.0, 3.5.17, and 2.10.3 are available for reference in this way via the extension API. jQuery version 3.2.1 can be referenced by setting the name property to 'jquery'.

The last step: register your extension with the WebFOCUS<sup>®</sup> extension API.  Simply call:

    tdgchart.extensionManager.register(config);

##### WebFOCUS<sup>®</sup> Interface Configuration (properties.json)

The WebFOCUS<sup>®</sup> configuration lives inside a dedicated and required file which must be named `properties.json`.  This file is required.  See the [detailed documentation](https://github.com/ibi/wf-extensions-chart/wiki/Extension-Configuration-with-properties.json) for this file's structure.

#### Build your own

The easiest way to build your own extension is to clone the [Simple Bar](https://github.com/ibi/wf-extensions-chart/tree/master/simple_bar%20example) example, then tweak it. Assume the new extension's ID is `com.foo.bar`:

- Rename root folder to `com.foo.bar`.  Rename `com.ibi.simple_bar.js` to `com.foo.bar.js`.

- In `local_development_template.html`, change `extension_id to `com.foo.bar`, and optionally change `props` and `chart.data` to better match your extension's needs.

- In `com.foo.bar.js`, delete the inner content of the three callback functions.

- In `com.foo.bar.js`, change the entries for each property in `config` to match your extension's needs.

- Add any external resources you need to `lib` & `css`, and load them by setting `config.resources` in `com.foo.bar.js`.

    - **Note:** When applying built-in styling to your extension using CSS files, make sure that they do not use selectors with very low specificity, such as at the body level, since these may override styling in the Designer interface or other contexts where the extension is loaded.

- Implement `renderCallback` in `com.foo.bar.js` to draw your extension.

#### Chart Data and Properties

A full description of the various data formats and the extension data interface is [described here](https://github.com/ibi/wf-extensions-chart/wiki/Extension-Data-Interface).

#### Chart Extension Modules

TBD