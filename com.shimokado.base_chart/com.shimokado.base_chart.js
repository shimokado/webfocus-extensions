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
		renderConfig.data =
			[
				{
					"labels": "100 LS 2 DOOR AUTO",
					"value": 7800,
					"_s": 0,
					"_g": 0
				},
				{
					"labels": "2000 4 DOOR BERLINA",
					"value": 4800,
					"_s": 0,
					"_g": 1
				},
				{
					"labels": "2000 GT VELOCE",
					"value": 12400,
					"_s": 0,
					"_g": 2
				},
				{
					"labels": "2000 SPIDER VELOCE",
					"value": 13000,
					"_s": 0,
					"_g": 3
				},
				{
					"labels": "2002 2 DOOR",
					"value": 8950,
					"_s": 0,
					"_g": 4
				},
				{
					"labels": "2002 2 DOOR AUTO",
					"value": 8900,
					"_s": 0,
					"_g": 5
				},
				{
					"labels": "3.0 SI 4 DOOR",
					"value": 14000,
					"_s": 0,
					"_g": 6
				},
				{
					"labels": "3.0 SI 4 DOOR AUTO",
					"value": 18940,
					"_s": 0,
					"_g": 7
				},
				{
					"labels": "504 4 DOOR",
					"value": 0,
					"_s": 0,
					"_g": 8
				},
				{
					"labels": "530I 4 DOOR",
					"value": 14000,
					"_s": 0,
					"_g": 9
				},
				{
					"labels": "530I 4 DOOR AUTO",
					"value": 15600,
					"_s": 0,
					"_g": 10
				},
				{
					"labels": "B210 2 DOOR AUTO",
					"value": 43000,
					"_s": 0,
					"_g": 11
				},
				{
					"labels": "COROLLA 4 DOOR DIX AUTO",
					"value": 35030,
					"_s": 0,
					"_g": 12
				},
				{
					"labels": "DORA 2 DOOR",
					"value": 0,
					"_s": 0,
					"_g": 13
				},
				{
					"labels": "INTERCEPTOR III",
					"value": 0,
					"_s": 0,
					"_g": 14
				},
				{
					"labels": "TR7",
					"value": 0,
					"_s": 0,
					"_g": 15
				},
				{
					"labels": "V12XKE AUTO",
					"value": 0,
					"_s": 0,
					"_g": 16
				},
				{
					"labels": "XJ12L AUTO",
					"value": 12000,
					"_s": 0,
					"_g": 17
				}
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

		// コンテナをクリア
		container.innerHTML = '';

		var margin = { top: 20, right: 20, bottom: 200, left: 100 }; // マージンを設定

		var width = w - margin.left - margin.right; // グラフの幅を設定
		var height = h - margin.top - margin.bottom; // グラフの高さを設定

		var x = d3.scale.ordinal() // x軸のスケールを設定
			.rangeRoundBands([0, width], .1); // バンドの範囲を設定(0からwidthまで、バンドの間隔は0.1)

		var y = d3.scale.linear() // y軸のスケールを設定
			.range([height, 0]); // レンジを設定(下から上へ)

		var xAxis = d3.svg.axis() // x軸を設定
			.scale(x) // x軸のスケールを設定
			.orient('bottom'); // x軸の位置を設定(下)

		var yAxis = d3.svg.axis() // y軸を設定
			.scale(y) // y軸のスケールを設定
			.orient('left') // y軸の位置を設定
			.ticks(10, '$'); // y軸の目盛りを設定(10個, $単位)

		var svg = d3.select(container).append('svg') // SVGを追加
			.attr('width', w) // 幅を設定
			.attr('height', h) // 高さを設定
			.append('g') // グループを追加
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')'); // 位置を設定(マージン分だけずらす)

		x.domain(data.map(function (d) { return d.labels; })); // x軸のドメインを設定(dataのlabelsを使う)
		y.domain([0, d3.max(data, function (d) { return d.value; })]); // y軸のドメインを設定(dataのvalueを使う)

		svg.append('g') // x軸を追加
			.attr('class', 'x axis') // クラスを設定
			.attr('transform', 'translate(0,' + height + ')') // 位置を設定(下)
			.call(xAxis) // x軸を呼び出す
			.selectAll("text") // テキストを選択
			.style("text-anchor", "end") // テキストのアンカーを設定(右端)
			.attr("dx", "-.8em") // x座標を調整(左に0.8em) - これをしないと文字と重なる
			.attr("dy", "-.3em") // y座標を調整(上に0.3em) - これをしないと文字と重なる
			.attr("transform", "rotate(-90)"); // テキストを回転(-90度)

		svg.append('g') // y軸を追加
			.attr('class', 'y axis') // クラスを設定
			.call(yAxis) // y軸を呼び出す
			.append('text') // テキストを追加
			.attr('transform', 'rotate(-90)') // テキストを回転(-90度)
			.attr('y', 6) // y座標を設定[6: 6px]
			.attr('dy', '.71em') // y座標を微調整
			.style('text-anchor', 'end') // text-anchorは rotate(-90)があれば不要
			.text('Value ($)'); // テキストを設定

		// 棒グラフを描画
		svg.selectAll('.bar') // 棒グラフを選択
			.data(data) // データをバインド
			.enter().append('rect') // データが足りない場合はrectを追加
			.attr('class', 'bar') // クラスを設定
			.attr('x', function (d) { return x(d.labels); }) // x座標を設定(dataのlabelsを使う)
			.attr('width', x.rangeBand()) // 幅を設定(バンドの幅)
			.attr('y', function (d) { return y(d.value); }) // y座標を設定(dataのvalueを使う)
			.attr('height', function (d) { return height - y(d.value); }); // 高さを設定(グラフの高さからy座標を引いた値)

		renderConfig.renderComplete();
	}

	// 拡張機能の設定
	var config = {
		id: 'com.shimokado.base_chart',     // この拡張機能を一意に識別する文字列
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
