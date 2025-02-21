Each extension must include a `properties.json` file, which defines the information needed by WebFOCUS<sup>®</sup> when drawing its user interface.  This file is in a human readable JSON format, and is pretty self-explanatory.

Here is the complete `properties.json` from the [Simple Bar](https://github.com/ibi/wf-extensions-chart/tree/master/simple_bar%20example) demo extension. Details on each block are below:

	{
		// Define some general extension configuration options
		"info": {
			"version": "1.0",  // version number of your extension.
			"implements_api_version": "1.0",  // version number of the WebFocus(R) API used by your extension.
			"author": "Information Builders",
			"copyright": "Information Builders Inc.",
			"url": "https://github.com/ibi/wf-extensions-chart/tree/master/simple_bar%20example",
			"icons": {
				"medium": "icons/medium.png"  // Reference to an image in the extension, used in the WF chart picker
			}
		},
		
		// Define any properties of your extension that end user may want to change.  
		"properties": {
			"exampleProperty": 50
		},
		
		// Define the possible values for each property in 'properties'.
		"propertyAnnotations": {
			"exampleProperty": "number"
		},

		// Define the available data buckets drawn in WF's 'Query' data bucket tree.  
		"dataBuckets":  {
		
			// Choose whether or not to reuse existing WF data buckets.  All optional.
			"tooltip": false,
			"series_break": true,

			// Define your own custom data buckets.  Optional
			"buckets": [
				{
					"id": "value",
					"type": "measure",
					"count": {"min": 1, "max": 5}
				},
				{
					"id": "labels",
					"type": "dimension",
					"count": {"min": 1, "max": 5}
				}
			]
		},

		// Define the set of labels used in the WF interface for buckets and chart type picker.
		"translations": {
			"en": {
				"name": "My Simple Bar Chart",
				"description": "This chart is just a simple bar chart, nothing to see here.",
				"icon_tooltip": "This extension does ...", 
				"value_name": "Value Bucket", 
				"value_tooltip": "Drop a measusre here", 
				"labels_name": "Label Bucket", 
				"labels_tooltip": "Drop a dimension here"
			},
			
			"fr": {
				"name": "Un Bar Chart tres simple",
				"description": "C'est un Bar Chart vraiment simple",
				"icon_tooltip": "This extension does ...", 
				"value_name": "Value Bucket", 
				"value_tooltip": "Drop a measusre here", 
				"labels_name": "Label Bucket", 
				"labels_tooltip": "Drop a dimension here"
			}
		}
	}

##### info

The `info` block defines several general purpose configuration options.  The only required property is `implements_api_version`, which should match the WebFOCUS<sup>®</sup> Extension API version your extension was written against.  At this time, the most recent API version is "1.0".

##### properties and propertyAnnotations

The `properties` and `propertyAnnotations` blocks are used to define any properties of your extension that the end user may want to change.  These properties are exposed to end users via the `GRAPH_JS` blocks in a FEX. For example, to set the `exampleProperty` property of the `com.ibi.simple_bar` extension, a user would include this in their FEX:

	*GRAPH_JS_FINAL
		"extensions": {
			"com.ibi.simple_bar": {
				"exampleProperty": "HELLO!"
			}
		}
	*END

`propertyAnnotations` is used internally to validate the content of `properties`. Everything in `properties` must appear in `propertyAnnotations`.  The possible types of any non-object (leaf) property in `properties` must be notated as one of:
* `"str"`,  
* `"bool"`, 
* `"color"`, 
* `"number"`.  

More annotation options are available, but beyond the scope of this page.

The value for each property in the `"propertyAnnotations"` block determines the type of control that appears in the Extension properties panel in WebFOCUS<sup>®</sup> Designer. This can be set directly as a property value, or by setting the `"typeAnnotation"` property within it, allowing you to specify additional properties for the control. By default, a value of `"str"` creates a text box, `"bool"` creates a check box, `"color"` creates a color picker, and `"number"` creates a spinner. 

When the `"typeAnnotation"` is `"str"`, you can provide an array of values in the `"stringValues"` property to create a drop-down list with those values. When the `"typeAnnotation"` is `"number"`, the default spinner step is 1, with no maximum or minimum value. Use the `"numericRange"` property to set the minimum and maximum value as an array (for example `[0,100]`), and use the `"numericStep"` property to set the interval between each value.  When both of these properties are set, the default control is a slider. Use the property setting `"uiType": "spinner"` to specify to use a spinner instead. For example, the following set of properties in the `"propertyAnnotations"` block creates a control to set the padding to a value from 0 to 1 using a spinner with step increments of 0.05.

	"padding": {
		"typeAnnotation": "number",
		"numericRange": [0,1],
		"numericStep": 0.05,
		"uiType": "spinner"
	},

Two other settings allow you to determine the order and visibility of the chart extension properties as presented in WebFOCUS<sup>®</sup> Designer. Use the property setting `"private": true` to hide a property that you do not want users to see or be able to modify from the WebFOCUS<sup>®</sup> Designer Extension properties window. The following syntax example hides the `"language"` property from the Extension properties window in WebFOCUS<sup>®</sup> Designer.

	"propertyAnnotations": {
		"language": {
			"typeAnnotation": "str",
			"private": true
			},     

You can also set the order in which the properties of a chart extension appear. Use an integer as the value for the `"displayOrder"` property to set the position in which it should appear in the list of properties in the Extension properties window in WebFOCUS<sup>®</sup> Designer. A lower `"displayOrder"` value generates a higher placement in the list.  For example, a property with a `"displayOrder"` of 0 will appear above a property with a `"displayOrder"` of 1. The following syntax example from the properties.json files shows property annotations for four properties. Because of their respective `"displayOrder"` values, the `"circleColor"` property will display first in the Extension properties window because it has the lowest `"displayOrder"`, followed by the `"circleThickness"` property and the `"waveCount"` property.  The `"circleFillGap"` property is hidden because it is set to private.

	"propertyAnnotations": {
		"circleThickness": {
			"typeAnnotation": "number",
			"displayOrder": 1	
				},
		"circleFillGap": {
			"typeAnnotation": "number",
			"displayOrder": 3,
			"private": true
				},
		"circleColor": {
			"typeAnnotation": "str",
			"displayOrder": 0
				},
		"waveCount": {
			"typeAnnotation": "number",
			"displayOrder": 2
				}
			}

When editing the properties of a liquid gauge in WebFOCUS<sup>®</sup> Designer, the properties are ordered and displayed or hidden based on the `"displayOrder"` and `"private"` settings, as shown in the following image.

![Liquid gauge properties ordered. The circleFillGap property is hidden due to being private.](https://webfocusinfocenter.informationbuilders.com/wfdesigner/images/liquid_gauge_props.jpg)

##### dataBuckets

`dataBuckets` defines the set of data buckets that appear in WF's 'Query' bucket pane.  At least one bucket must be defined for an extension to be useful.

There are two types of data buckets: `built-in` and `custom`.  Built-in buckets provide an easy way to reuse WF's existing data bucket logic.  There are currently 2 built-in buckets: `tooltip`, and `series_break`.  Use any of these buckets by setting the associated `dataBuckets` property `true`.  

Each entry in `buckets` defines one `custom` data bucket.  Each custom bucket requires:

- `id`: corresponds exactly to the dataArrayMap and data properties your chart's render function will receive.  

- `type`: define what type of data field this bucket accepts.  One of `"measure"`, `"dimension"` or `"both"`.

- `count`: count.min & count.max define the minimum and maximum number of fields this bucket can accept.  A minimum of `0` means this bucket is optional.

See the [Extension Data Interface](https://github.com/ibi/wf-extensions-chart/wiki/Extension-Data-Interface/_edit) page for details on using these buckets and their impact on the data set passed to the extension.

##### translations

Every label drawn in the WF interface must include translations in various languages. The `translations` is where an extension defines these labels.  The `translation` object has one property for each language the extension supports, keyed by ISO-639 two letter locale strings.