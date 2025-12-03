```Javascript
		/* Example data format(Multiple value and labels):
		renderConfig.data =
		[
			{
				"labels": [
				"ENGLAND",
				"JAGUAR"
				],
				"value": [
				12000,
				13491,
				11194
				],
				"_s": 0,
				"_g": 0
			},
			{
				"labels": [
				"ENGLAND",
				"JENSEN"
				],
				"value": [
				0,
				17850,
				14940
				],
				"_s": 0,
				"_g": 1
			},
			{
				"labels": [
				"ENGLAND",
				"TRIUMPH"
				],
				"value": [
				0,
				5100,
				4292
				],
				"_s": 0,
				"_g": 2
			},
			{
				"labels": [
				"FRANCE",
				"PEUGEOT"
				],
				"value": [
				0,
				5610,
				4631
				],
				"_s": 0,
				"_g": 3
			},
			{
				"labels": [
				"ITALY",
				"ALFA ROMEO"
				],
				"value": [
				30200,
				6820,
				5660
				],
				"_s": 0,
				"_g": 4
			},
			{
				"labels": [
				"ITALY",
				"MASERATI"
				],
				"value": [
				0,
				31500,
				25000
				],
				"_s": 0,
				"_g": 5
			}
		];
		renderConfig.dataBuckets.buckets =
		{
		"internal_api_version": 1,
		"buckets": {
			"labels": {
			"title": [
				"COUNTRY",
				"CAR"
			],
			"fieldName": [
				"CAR.ORIGIN.COUNTRY",
				"CAR.COMP.CAR"
			],
			"count": 2
			},
			"value": {
			"title": [
				"SALES",
				"DEALER_COST",
				"DEALER_COST"
			],
			"fieldName": [
				"CAR.BODY.SALES",
				"CAR.BODY.DEALER_COST",
				"CAR.BODY.DEALER_COST"
			],
			"numberFormat": [
				"#",
				"#,###",
				"#,###"
			],
			"count": 3
			}
		},
		"depth": 1
		};
		renderConfig.properties =
		{
		"chartHeadroom": 50,
		"external_library": "lib/script.js",
		"tableStyle": {
			"fontSize": "20px",
			"color": "#663300"
		},
		"valueLabel": {
			"fontFamily": "sans-serif",
			"fontSize": "auto",
			"color": "#333333",
			"fontWeight": "bold",
			"format": "auto"
		},
		"label": {
			"text": {
			"color": "#333333",
			"font": "Verdana",
			"weight": "bold",
			"size": "14px"
			},
			"marker": {
			"type": "circle"
			}
		},
		"tooltip": {
			"enabled": true
		},
		"showCenteredText": {
			"enabled": true
		}
		};
		*/

		/* Example data format(Single value and labels):
		renderConfig.data =
		[
			{
				"labels": "ENGLAND",
				"value": 12000,
				"_s": 0,
				"_g": 0
			},
			{
				"labels": "FRANCE",
				"value": 0,
				"_s": 0,
				"_g": 1
			},
			{
				"labels": "ITALY",
				"value": 30200,
				"_s": 0,
				"_g": 2
			},
			{
				"labels": "JAPAN",
				"value": 78030,
				"_s": 0,
				"_g": 3
			},
			{
				"labels": "W GERMANY",
				"value": 88190,
				"_s": 0,
				"_g": 4
			}
		];
		renderConfig.dataBuckets.buckets =
		{
		"internal_api_version": 1,
		"buckets": {
			"labels": {
			"title": "COUNTRY",
			"fieldName": "CAR.ORIGIN.COUNTRY",
			"count": 1
			},
			"value": {
			"title": "SALES",
			"fieldName": "CAR.BODY.SALES",
			"numberFormat": "#",
			"count": 1
			}
		},
		"depth": 1
		};
		renderConfig.properties =
		{
		"chartHeadroom": 50,
		"external_library": "lib/script.js",
		"tableStyle": {
			"fontSize": "20px",
			"color": "#663300"
		},
		"valueLabel": {
			"fontFamily": "sans-serif",
			"fontSize": "auto",
			"color": "#333333",
			"fontWeight": "bold",
			"format": "auto"
		},
		"label": {
			"text": {
			"color": "#333333",
			"font": "Verdana",
			"weight": "bold",
			"size": "14px"
			},
			"marker": {
			"type": "circle"
			}
		},
		"tooltip": {
			"enabled": true
		},
		"showCenteredText": {
			"enabled": true
		}
		};
		*/
```