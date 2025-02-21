Each time an extension is rendered, the extension's render callback is passed the end user's current data set via the `renderConfig.data` argument.  The data set's overall structure is defined by the set of [buckets](https://github.com/ibi/wf-extensions-chart/wiki/Extension-Configuration-with-properties.json#databuckets) listed in the extension's [`properties.json`](https://github.com/ibi/wf-extensions-chart/wiki/Extension-Configuration-with-properties.json), while the data's specific content is defined by the data fields the end user has added to each data bucket.

Some example data:

Car | Country | Seats
----|---------|------:
BMW | Germany | 5
Audi | Germany | 4
Peugeot | France | 5
Alfa Romeo | Italy | 4
Maserati | Italy | 2
Toyota | Japan | 4

Each example will show the JSON used in the `dataBuckets` block of `properties.json`, the end user's choices from the above data set in the WF bucket UI, and the resulting data set passed into the extension's render callback.

The data set is passed into an extension via the `data` property of the render callback's first argument, typically named `renderConfig`.  Additional information about the current set of fields in each bucket is in `renderConfig.dataBuckets`.

A data set is represented in JavaScript as arrays of (potentially deeply nested arrays of) objects.  If an extension defines only custom buckets, the data set will be a flat array of objects.  If an extension uses some built-in buckets, the data set may contain deeply nested arrays of arrays.  `renderConfig.dataBuckets.depth` will be set to the number of array dimensions in the current data set.

#### Custom Buckets

Each innermost object within the arrays of data is called a 'datum'. Each datum object will have one property for each data bucket that contains a field.  Each property will be the `id` of a custom bucket, as defined in the `dataBuckets.buckets` section of `properties.json`.  The type of values of these properties depend on the bucket type: `dimension` buckets have string values while `measure` buckets have numeric values. eg: 

```
properties.json:
    dataBuckets: 
        buckets: [
            {id: "label", type: "dimension"}
        ]

WF bucket UI:
    "Car" -> "label" bucket

Extension's render callback:
    renderConfig.data = [
        {label: "BMW"},
        {label: "Audi"},
        {label: "Peugeot"}, 
        {label: "Alfa Romeo},
        {label: "Maserati"},
        {label: "Toyota"}
    ]
    renderConfig.dataBuckets = {
        depth: 1, buckets: {label: {title: "Car"}}
    }
```

If a bucket contains more than one field, the associated property in each datum will be an array of string or number values.  eg:

```
properties.json:
    dataBuckets: 
        buckets: [
            {id: "label", type: "dimension"},
            {id: "value", type: "measure"}
        ]

WF bucket UI:
    "Car" -> "label" bucket
    "Country" -> "label" bucket
    "Seats" -> "value" bucket

Extension's render callback:
    renderConfig.data = [
        {labels: ["Alfa Romeo", "Italy"], value: 4},
        {labels: ["Audi", "Germany"], value: 4},
        {labels: ["BMW", "Germany"], value: 5},
        {labels: ["Maserati", "Italy"], value: 2},
        {labels: ["Peugeot", "France"], value: 5},
        {labels: ["Toyota", "Japan"], value: 4}
    ]
    renderConfig.dataBuckets = {
        depth: 1,
        buckets: {
            label: {title: ["Car", "Country"]},
            value: {title: "Seats"}
        }
    }
```

#### Built-in Buckets

An extension can also use buckets that are built-in and predefined by WebFOCUS<sup>®</sup>.  These buckets will affect more than just the data set; each bucket will also set specific chart engine properties, to pass in additional information related to that bucket.  The chart properties used by each bucket are listed below.

##### Standard vs. Break buckets

Each built in WebFOCUS<sup>®</sup> bucket is either a 'standard' bucket or a 'break' bucket.  These two bucket types alter the data set in very different ways.  

'Standard' buckets behave exactly like `custom` buckets: the data set remains a single array, and each datum object will include an additional property named after the bucket.

'Break' buckets will divide up the data set into additional arrays of data.  For each break bucket used, each datum object will be 'broken' up and transformed into a full array of datum objects.  The number of datum objects in each array will remain unchanged, but the number of arrays or datum arrays will correspond to the number of entries in the break field.  Each break bucket is described in detail next.

##### `series-break` break bucket

The `series-break` built-in data bucket will break the data set up into one array for each entry in the series break field chosen by the user.  From the previous example, if we move the 'Country' field out of `labels` and into the `series-break` bucket:

```
properties.json:
    dataBuckets:
        series_break: true,
        buckets: [
            {id: "label", type: "dimension"},
            {id: "value", type: "measure"}
        ]

WF bucket UI:
    "Country" -> "series_break" bucket
    "Car" -> "label" bucket
    "Seats" -> "value" bucket

Extension's render callback:
    renderConfig.data = [
        [{labels: "PEUGEOT", value: 5}],
        [{labels: "ALFA ROMEO", value: 4}, {labels: "MASERATI", value: 2],
        [{labels: "TOYOTA", value: 4}],
        [{labels: "AUDI" ,value: 4}, {labels: "BMW", value: 5}]
    ]
    renderConfig.dataBuckets = {
        depth: 2,
        series_break: {title: "Country"},
        buckets: {
            label: {title: "Car"},
            value: {title: "Seats"}
        }
    }
```

Note how the name of each 'Country' is no longer in the data set. That's because `series-break` uses the chart engine's 'series-dependent' properties, and the Country names are now listed in those series-dependent properties.  Each entry in the series-break field will generate a corresponding series property object in the chart engine, retrievable with `renderConfig.moonbeamInstance.getSeries(x)', where `x` is an integer for the series to be retrieved.  `getSeries` returns an object with properties like `color` and `label`, which are unique to the chosen series.

##### `matrix` break bucket

Similar to `series-break`, the built-in `matrix` break bucket will also add more array dimensions to the data set.  `matrix` is broken into `column` and `row` sub-buckets.  If either the `row` or `column` buckets contain any fields, the data set will contain *two* additional dimensions of data, even if one of the matrix buckets is empty.  In other words, the data set will either contain neither row nor column data, or both row and column data, never just one or the other.  `bucket.depth` will always be at least `3`.  Eg:
```
properties.json:
    dataBuckets:
        matrix: true,
        buckets: [
            {id: "label", type: "dimension"},
            {id: "value", type: "measure"}
        ]

WF bucket UI:
    "Country" -> "matrix - row" bucket
    "Car" -> "label" bucket
    "Seats" -> "value" bucket

Extension's render callback:
    renderConfig.data = [
        [ [{labels: "PEUGEOT", value: 5}] ],
        [ [{labels: "ALFA ROMEO", value: 4}, {labels: "MASERATI", value: 2] ],
        [ [{labels: "TOYOTA", value: 4}] ],
        [ [{labels: "AUDI" ,value: 4}, {labels: "BMW", value: 5}] ]
    ]
    renderConfig.dataBuckets = {
        depth: 3,
        matrix: {
            row: {title: "Country"},
        }
        buckets: {
            label: {title: "Car"},
            value: {title: "Seats"}
        }
    }
```

Note how there's an extra level of arrays around each top level array, with one element each.  This is because there is not fields in the `matrix - column` bucket, so each row includes just one column.  If there were a field in `matrix - column`, each of the top most arrays would contain arrays with multiple entries.

Like the `series_break` case, the Country names are no longer in the data set.  Instead, they are now stored in the matrix specific block of properties.  Row labels are in `chart.matrixProperties.rowLabels.labels`, and column labels are in `chart.matrixProperties.colLabels.labels`.

##### `tooltip`

Unlike `series-break` and `matrix`, the built in `tooltip` bucket is not a break bucket, and does not add any additional array dimensions to the data set.  Instead, `tooltip` behaves just like a custom bucket: each inner datum object will contain a property named `tooltip`, with a value of type string for dimensions, number for measures and an array of values for multiple fields in the bucket.

The `tooltip` bucket is useful because, in addition to including tooltip-specific data in the data set, WebFOCUS<sup>®</sup> will also generate meaningful tooltip content for each series.  This tooltip content is the same content used for all of the built in WebFOCUS<sup>®</sup> chart types.  Using the `tooltip` bucket means the extension does not have to figure out what ought to go into each tooltip.

#### Partial & Null Data

It is very common for an extension to receive less data than is ideal or expected. This happens because the end user working with an extension in WF cannot populate all of the extensions buckets immediately.  An extension must correctly handle these partial data cases, and cannot crash if one or more buckets are empty.  It is important to check `renderConfig.dataBuckets` to see which buckets have been populated, and act accordingly.

Similarly, data sets are often incomplete, missing some values for a given combination of dimensions & measures.  These missing values may show up in the data set as `null` entries within an array (instead of datum objects), or they may show up as entirely empty arrays.  It is important to detect and handle these missing data cases, and render a visualization that's appropriate for such missing data.

#### Incomplete Data and `noDataPreRenderCallback`

Most extensions require some bare minimum number of populated buckets before anything can be rendered at all.  Use the `count.min` properties of each `dataBuckets.bucket` entry in `properties.json` to define these minimal requirements.  If the fields in all buckets do not meet the minimum counts, then the extension's `renderCallback` will *not* be called.  Instead, the extension's `noDataPreRenderCallback` is called.  This allows the extension to render in a special 'no data' mode: in this mode, the extension should render in grey scale, using `renderCallback.baseColor` as the main color.  This should be a very simplified, 'sample' rendering of the extension.  See the [simple_bar extension](https://github.com/ibi/wf-extensions-chart/tree/master/com.ibi.simple_bar) for an example of rendering with no data.

#### Data bucket field names and number formats

It is now possible to retrieve the field name and number format associated with a data buck entry. This information is only accessible via the new extension API version 2. To use API 2 and get a bucket entry field name or number format, an extension must declare that it implements extension API version 2 via the 'implements_api_version' entry in properties.json's 'info' block:

```
properties.json:
	"info": {
		"implements_api_version": "2.0"
	}
```

When API 2 is chosen, the content of `renderConfig.dataBuckets` will be considerably different:

```
dataBuckets: {
	getBucket(bucketName),
	depth: 2,
 	buckets: [
		{
			id: 'labels',
			fields: [
				{title: 'COUNTRY', fieldName: 'CAR.ORIGIN.COUNTRY'}
			]
		},
		{
			id: 'value',
			fields: [
				{title: 'SALES', fieldName: 'CAR.SALES', numberFormat: '#,###.00'},
				{title: 'DEALER_COST', fieldName: 'CAR.BODY.DEALER_COST', numberFormat: '#,###'}
			]
		}
	]
}
```

That is, `dataBuckets.buckets` is now an array instead of an object.  Each entry in this array represents the content of one data bucket; the `id` property tells you which bucket this is, and the `fields` array tells you how many entries there are in this bucket and their unique information (title, field names, number format).

`dataBuckets` also includes a useful method `getBucket(bucketName)`; pass it the name of a bucket and it will return that bucket's content for you.  This saves you having to walk the `dataBuckets.bucket` array searching for a bucket.

