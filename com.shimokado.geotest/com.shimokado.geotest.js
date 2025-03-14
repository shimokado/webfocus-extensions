/*global tdgchart: false, pv: false, d3: false */
/* Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved. */

(function () {

	// すべての拡張機能コールバック関数には標準の'renderConfig'引数が渡されます：
	//
	// 常に利用可能なプロパティ：
	//   moonbeamInstance: 現在レンダリング中のチャートインスタンス
	//   data: レンダリング中のデータセット
	//   properties: ユーザーによって設定された拡張機能のプロパティブロック
	//   modules: 拡張機能の設定からの'modules'オブジェクトと追加のAPIメソッド
	//
	// レンダーコールバック時に利用可能なプロパティ：
	//   width: 拡張機能がレンダリングされるコンテナの幅（px）
	//   height: 拡張機能がレンダリングされるコンテナの高さ（px）
	//   containerIDPrefix: 拡張機能がレンダリングされるDOMコンテナのID。1ページ上で拡張機能の複数のコピーが動作するように、生成するすべてのIDの前にこれを付加します。
	//   container: 拡張機能がレンダリングされるDOMノード
	//   rootContainer: レンダリングされる特定のチャートエンジンインスタンスを含むDOMノード


	// オプション: 定義されている場合、チャートエンジンの初期化時に1回だけ呼び出されます
	// 引数:
	//  - successCallback: 拡張機能が完全に初期化されたときに呼び出す必要がある関数
	//     初期化が成功した場合はtrue、失敗した場合はfalseを渡します
	// - initConfig: 標準コールバック引数オブジェクト（moonbeamInstance、data、properties など）
	function initCallback(successCallback, initConfig) {
		successCallback(true);
	}

	// オプション: 定義されている場合、データを含まない描画の前に1回呼び出されます
	// 引数:
	//  - preRenderConfig: 標準コールバック引数オブジェクト（moonbeamInstance、data、properties など）
	function noDataPreRenderCallback(preRenderConfig) {
	}

	// オプション: 定義されている場合、拡張機能を描画する必要があるがデータがまだない場合に呼び出されます
	// 拡張機能の初期の「グレー状態」の外観を定義するために使用します
	// 引数:
	//  - renderConfig: 標準コールバック引数オブジェクト（moonbeamInstance、data、properties など）
	function noDataRenderCallback(renderConfig) {
		var grey = renderConfig.baseColor;
		renderConfig.data = [
			{
				"labels": "27", // 大阪の座標
				"value": 7800,
				"_s": 0,
				"_g": 0
			},
			{
				"labels": "13", // 東京の座標
				"value": 4800,
				"_s": 0,
				"_g": 1
			},
		];
		renderCallback(renderConfig);
	}

	// オプション: 定義されている場合、各チャートエンジンの描画サイクルの最初に1回呼び出されます
	// レンダリング前に特定のチャートエンジンインスタンスを設定するために使用します
	// 引数:
	//  - preRenderConfig: 標準コールバック引数オブジェクト
	function preRenderCallback(preRenderConfig) {
	}

	// 必須: 各チャートエンジンの描画サイクル中に呼び出されます
	// ここで拡張機能をレンダリングします
	// 引数:
	//  - renderConfig: width、heightなどの追加プロパティを含む標準コールバック引数オブジェクト
	// このシンプルな棒グラフ拡張機能は以下をサポートします:
	//  - 汎用的な'value'バケットの複数の測定エントリ。各値は独自のsplit-y軸に描画されます。
	//  - 汎用的な'labels'バケットの1次元エントリ。このバケットは順序軸のラベルセットを定義します。
	//  - 組み込みの'series_break'バケットの1次元エントリ。これにより各値エントリが類似した複数の色に分割されます。
	function renderCallback(renderConfig) {
		// dataだけを使ったシンプルな棒グラフをd3で作成
		var data = renderConfig.data;
		var container = renderConfig.container;
		var w = renderConfig.properties.width || container.clientWidth;
		var h = renderConfig.properties.height || container.clientHeight;

		// ４７都道府県の都道府県コードと座標データの組み合わせを作成
		const prefData = [
			{ labels: "1", coords: [140.4467, 41.8174] }, // 北海道
			{ labels: "2", coords: [140.7400, 40.8244] }, // 青森県
			{ labels: "3", coords: [141.1527, 39.7036] }, // 岩手県
			{ labels: "4", coords: [140.8719, 38.2688] }, // 宮城県
			{ labels: "5", coords: [140.3633, 39.7186] }, // 秋田県
			{ labels: "6", coords: [140.1024, 38.2404] }, // 山形県
			{ labels: "7", coords: [140.4714, 37.7503] }, // 福島県
			{ labels: "8", coords: [140.4467, 36.3418] }, // 茨城県
			{ labels: "9", coords: [139.8836, 36.5658] }, // 栃木県
			{ labels: "10", coords: [139.0608, 36.3912] }, // 群馬県
			{ labels: "11", coords: [139.6489, 35.8569] }, // 埼玉県
			{ labels: "12", coords: [140.1233, 35.6074] }, // 千葉県
			{ labels: "13", coords: [139.6917, 35.6895] }, // 東京都
			{ labels: "14", coords: [139.6425, 35.4478] }, // 神奈川県
			{ labels: "15", coords: [138.2529, 36.6513] }, // 新潟県
			{ labels: "16", coords: [137.2137, 36.6953] }, // 富山県
			{ labels: "17", coords: [136.6256, 36.5947] }, // 石川県
			{ labels: "18", coords: [136.2216, 36.0652] }, // 福井県
			{ labels: "19", coords: [138.5684, 35.6639] }, // 山梨県
			{ labels: "20", coords: [138.1812, 36.6513] }, // 長野県
			{ labels: "21", coords: [136.7223, 35.3912] }, // 岐阜県
			{ labels: "22", coords: [138.3831, 34.9769] }, // 静岡県
			{ labels: "23", coords: [136.9066, 35.1802] }, // 愛知県
			{ labels: "24", coords: [136.5086, 34.7303] }, // 三重県
			{ labels: "25", coords: [135.8686, 35.0045] }, // 滋賀県
			{ labels: "26", coords: [135.7681, 35.0116] }, // 京都府
			{ labels: "27", coords: [135.5023, 34.6937] }, // 大阪府
			{ labels: "28", coords: [135.1955, 34.6901] }, // 兵庫県
			{ labels: "29", coords: [135.8328, 34.6853] }, // 奈良県
			{ labels: "30", coords: [135.1675, 34.2260] }, // 和歌山県
			{ labels: "31", coords: [134.2383, 35.5039] }, // 鳥取県
			{ labels: "32", coords: [133.0505, 35.4723] }, // 島根県
			{ labels: "33", coords: [133.9344, 34.6618] }, // 岡山県
			{ labels: "34", coords: [132.4553, 34.3966] }, // 広島県
			{ labels: "35", coords: [131.4714, 34.1859] }, // 山口県
			{ labels: "36", coords: [134.5593, 34.0657] }, // 徳島県
			{ labels: "37", coords: [134.0434, 34.3401] }, // 香川県
			{ labels: "38", coords: [132.7657, 33.8416] }, // 愛媛県
			{ labels: "39", coords: [133.5311, 33.5597] }, // 高知県
			{ labels: "40", coords: [130.4181, 33.6064] }, // 福岡県
			{ labels: "41", coords: [130.2988, 33.2494] }, // 佐賀県
			{ labels: "42", coords: [129.8737, 32.7448] }, // 長崎県
			{ labels: "43", coords: [130.7417, 32.7898] }, // 熊本県
			{ labels: "44", coords: [131.6126, 33.2382] }, // 大分県
			{ labels: "45", coords: [131.4239, 31.9111] }, // 宮崎県
			{ labels: "46", coords: [130.5571, 31.5966] }, // 鹿児島県
			{ labels: "47", coords: [127.6811, 26.2124] }  // 沖縄県
		];

		function getPrefData(labels) {
			return prefData.find(pref => pref.labels === labels);
		}


		// コンテナをクリア
		container.innerHTML = '';

		var margin = { top: 20, right: 20, bottom: 20, left: 20 }; // マージンを設定

		var width = w - margin.left - margin.right; // グラフの幅を設定
		var height = h - margin.top - margin.bottom; // グラフの高さを設定


		var svg = d3.select(container).append('svg') // SVGを追加
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

		// 日本地図のパスデータを取得
		const geojsonUrl = 'https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson';
		d3.json(geojsonUrl, function (error, japan) {
			if (error) throw error;

			// 地図の投影法を設定
			var projection = d3.geo.mercator()
				.center([137, 38])
				.scale(2000)
				.translate([width / 2, height / 2]);

			// 地図のパスを設定
			var path = d3.geo.path().projection(projection);

			// 日本地図を描画（都道府県）
			svg.append('g')
				.selectAll('path')
				.data(japan.features)
				.enter().append('path')
				.attr('d', path)
				.attr('stroke', '#fff')
				.attr('stroke-width', 1)
				.attr('fill', '#ccc');

			// // 近畿のみを描画
			// var kinki = japan.features.filter(function (d) {
			// 	return d.properties.nam_ja === '大阪府' || d.properties.nam_ja === '京都府' || d.properties.nam_ja === '滋賀県' || d.properties.nam_ja === '奈良県' || d.properties.nam_ja === '和歌山県' || d.properties.nam_ja === '三重県';
			// });
			// svg.selectAll('path')
			// 	.data(kinki)
			// 	.enter()
			// 	.append('path')
			// 	.attr('d', path)
			// 	.attr('stroke', '#fff')
			// 	.attr('stroke-width', 1)
			// 	.attr('fill', '#ccc');

			// データを描画(noDataRenderCallbackで設定したデータを使用)

			// data配列のvalueの最大値を取得
			var maxValue = d3.max(data, function (d) { return d.value; });
			// data配列のvalueの最小値を取得
			var minValue = d3.min(data, function (d) { return d.value; });

			// 円の半径を設定
			var r = d3.scale.linear()
				.domain([minValue, maxValue])
				.range([10, 35]);

			// 円を描画
			// japan.geojsonのidとdataのlabelsが一致するものを探し、その座標を取得して円を描画
			var circles = svg.selectAll('circle')
				.data(data)
				.enter()
				.append('circle')
				.attr('cx', function (d) {
					return projection(getPrefData(d.labels).coords)[0];
				})
				.attr('cy', function (d) {
					return projection(getPrefData(d.labels).coords)[1];
				})
				.attr('r', function (d) {
					return r(d.value);
				})
				.attr('fill', 'rgba(59, 37, 253, 0.8)');

			// ツールチップを追加
			circles.append('title')
				.text(function (d) {
					return '都道府県コード: ' + d.labels + '\n' + '売上: ' + d.value;
				});

			// 左上にデータを表形式で表示
			var table = d3.select(container).append('table')
				.attr('class', 'table')
				.style('position', 'relative')
				.style('top', '-800px')
				.style('left', '10px')
				.style('background-color', 'white')
				.style('border', '1px solid black')
				.style('border-collapse', 'collapse');

			var thead = table.append('thead');
			var tbody = table.append('tbody');

			thead.append('tr')
				.selectAll('th')
				.data(['都道府県コード', '売上'])
				.enter()
				.append('th')
				.text(function (d) { return d; })
				.style('border', '1px solid black')
				.style('padding', '5px');

			var rows = tbody.selectAll('tr')
				.data(data)
				.enter()
				.append('tr');

			var cells = rows.selectAll('td')
				.data(function (row) {
					return ['labels', 'value'].map(function (column) {
						return { column: column, value: row[column] };
					});
				})
				.enter()
				.append('td')
				.text(function (d) { return d.value; })
				.style('border', '1px solid black')
				.style('padding', '5px')
				.style('text-align', 'right');

		});

		renderConfig.renderComplete();
	}

	// 拡張機能の設定
	var config = {
		id: 'com.shimokado.geotest',     // この拡張機能を一意に識別する文字列
		containerType: 'svg',
		initCallback: initCallback,
		preRenderCallback: preRenderCallback,  // 拡張機能のレンダリング直前に呼び出される関数への参照。以下で定義される'preRenderConfig'オブジェクトが渡されます。Monbeamインスタンスの設定に使用
		renderCallback: renderCallback,  // 実際のチャートを描画する関数への参照。'renderConfig'オブジェクトが渡されます
		noDataPreRenderCallback: noDataPreRenderCallback,
		noDataRenderCallback: noDataRenderCallback,
		resources: {  // この拡張機能に必要な追加の外部リソース（CSSとJS）
			script: [
				// 動的に読み込む外部ライブラリを定義するための関数コールバックの使用例
				// callbackArgは'properties'を含む標準のコールバック引数オブジェクトです
				// これはライブラリ読み込み時に呼び出されるため、チャートインスタンスはまだ利用できません
				function (callbackArg) {
					return callbackArg.properties.external_library;
				}
			],
			css: ["style.css"]
		},
		modules: {
			dataSelection: {
				supported: true,  // データ選択を有効にする場合はtrueに設定
				needSVGEventPanel: false, // HTMLコンテナを使用するか、SVGコンテナを変更する場合はtrueに設定。チャートエンジンがユーザー操作を捕捉するために必要なSVG要素を挿入します
				svgNode: function () { }  // HTMLコンテナを使用するか、SVGコンテナを変更する場合は、ルートSVGノードへの参照をここで返します
			},
			eventHandler: {
				supported: true
			},
			tooltip: {
				supported: true,  // HTMLツールチップを有効にする場合はtrueに設定
				// デフォルトのツールチップコンテンツがチャートに渡されない場合に呼び出されるコールバック
				// 指定されたターゲット、ID、データに対する「良い」デフォルトツールチップを定義するために使用
				// 戻り値は文字列（HTMLを含む）、HTMLノード、またはMoonbeamツールチップAPIオブジェクトのいずれか
				autoContent: function (target, s, g, d) {
					if (d.hasOwnProperty('color')) {
						return '棒の大きさ: ' + d.value + '<br />棒の色: ' + d.color;
					}
					return '棒の大きさ: ' + d.value;
				}
			}
			// この拡張機能では使用されていません。ドキュメント目的で記載
			//			colorScale: {
			//				supported: true,
			//				minMax: function(arg){}  // オプション: カラースケールの最小値と最大値に使用する{min, max}オブジェクトを返します
			//			}
			//			sizeScale: {
			//				supported: false,
			//				minMax: function(arg){}  // オプション: サイズスケールの最小値と最大値に使用する{min, max}オブジェクトを返します
			//			},
			//			legend: {
			//				colorMode: function(arg){}, // 'data'または'series'を返します。実装すると、チャートエンジンはこのカラーモードの凡例を使用します
			//				sizeMode: function(arg){},  // 'size'またはfalsey値を返します。実装すると、チャートエンジンはこのサイズ凡例を使用します
			//			}
		}
	};

	// 必須: この呼び出しにより拡張機能がチャートエンジンに登録されます
	tdgchart.extensionManager.register(config);

})();
