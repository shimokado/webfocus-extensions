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
		var chart = preRenderConfig.moonbeamInstance;
		chart.legend.visible = false;
		chart.dataArrayMap = undefined;
		chart.dataSelection.enabled = false;
	}

	// オプション: 定義されている場合、拡張機能を描画する必要があるがデータがまだない場合に呼び出されます
	// 拡張機能の初期の「グレー状態」の外観を定義するために使用します
	// 引数:
	//  - renderConfig: 標準コールバック引数オブジェクト（moonbeamInstance、data、properties など）
	function noDataRenderCallback(renderConfig) {
		var grey = renderConfig.baseColor;
		renderConfig.data = [
			[{ value: 3 }, { value: 4 }, { value: 5 }, { value: 6 }, { value: 7 }],
			[{ value: 3 }, { value: 4 }, { value: 5 }, { value: 6 }, { value: 7 }]
		];
		renderConfig.dataBuckets.depth = 2;
		renderConfig.moonbeamInstance.getSeries(0).color = grey;
		renderConfig.moonbeamInstance.getSeries(1).color = pv.color(grey).lighter(0.18).color;
		renderCallback(renderConfig);
	}

	// オプション: 定義されている場合、各チャートエンジンの描画サイクルの最初に1回呼び出されます
	// レンダリング前に特定のチャートエンジンインスタンスを設定するために使用します
	// 引数:
	//  - preRenderConfig: 標準コールバック引数オブジェクト
	function preRenderCallback(preRenderConfig) {
		var chart = preRenderConfig.moonbeamInstance;

		// この拡張機能のフォルダパスにあるファイルを手動で読み込んで使用する例
		var info = null;
		try {
			info = tdgchart.util.ajax(preRenderConfig.loadPath + 'lib/extra_properties.json', { asJSON: true });
		} catch (e) {
			// extra_properties.jsonが存在しない場合はエラーを無視
			console.warn('extra_properties.json not found:', e);
		}

		if (!chart.title.visible) {    //開発者がGRAPHリクエストでHEADINGを設定していない場合、preRenderConfig.loadPath + 'lib/extra_properties.json'にあるカスタムタイトルを使用
			// チャートエンジンの組み込みタイトルプロパティの使用例
			chart.title.visible = true;
			chart.title.text = (info && info.custom_title) ? info.custom_title : 'Simple Bar Chart';
		} // if (!chart.title.visible) //開発者がGRAPHリクエストでFOOTINGを設定していない場合、カスタムプログラムによるフッター割り当ての例として'footnote'テキストを使用

		if (!chart.footnote.visible) {
			chart.footnote.visible = true;
			chart.footnote.text = 'footnote';
			chart.footnote.align = 'right';

		} //if (!chart.footnote.visible)

	}

	// 必須: 各チャートエンジンの描画サイクル中に呼び出されます
	// ここで拡張機能をレンダリングします
	// 引数:
	//  - renderConfig: width、heightなどの追加プロパティを含む標準コールバック引数オブジェクト
	function renderCallback(renderConfig) {

		var chart = renderConfig.moonbeamInstance;
		var data = renderConfig.data;
		var w = renderConfig.width;
		var h = renderConfig.height;

		var container = renderConfig.container;

		// series_breakに何もない場合、dataBuckets.depthは1になり、dataは単純な配列オブジェクトになります。
		// series_breakの有無に関わらず、内部データが常に2次元配列になるように正規化します。
		if (renderConfig.dataBuckets.depth === 1) {
			data = [data];
		}

		// 1つの測定値しかない場合、measure titleは配列ではなく文字列なので、これも正規化します
		if (renderConfig.dataBuckets.buckets.value && !Array.isArray(renderConfig.dataBuckets.buckets.value.title)) {
			renderConfig.dataBuckets.buckets.value.title = [renderConfig.dataBuckets.buckets.value.title];
		}

		// データセット全体から一意な軸ラベルのリストを作成
		var axisLabels = pv.blend(data).map(function (el) { return el.labels; }).filter(function () {
			var seen = {};
			return function (el) {
				return el != null && !(el in seen) && (seen[el] = 1);
			};
		}());

		// ラベルバケットが空の場合、'Label X'プレースホルダーを使用
		if (!axisLabels.length) {
			var labelCount = d3.max(data, function (el) { return el.length; });
			axisLabels = d3.range(0, labelCount).map(function (el) { return 'Label ' + el; });
		}

		var splitYCount = tdgchart.util.get('dataBuckets.buckets.value.count', renderConfig, 1);
		var splitYData = [];

		// データは{value: [a, b, c]}エントリの配列の配列として到着します。
		// 'value'の各エントリは独自のsplit-y軸に描画されます
		// その長いリストを分割して、各split-y軸用の値のリストを作成します
		data.forEach(function (array) {
			array.forEach(function (el, i) {
				el.value = Array.isArray(el.value) ? el.value : [el.value];
				if (!el.labels) {
					el.labels = 'Label ' + i;
				}
				el.value.forEach(function (v, idx) {
					splitYData[idx] = splitYData[idx] || [];
					var labelIndex = axisLabels.indexOf(el.labels);
					if (labelIndex >= 0) {
						splitYData[idx][labelIndex] = splitYData[idx][labelIndex] || [];
						splitYData[idx][labelIndex].push({
							value: v, yaxis: idx, labels: el.labels
						});
					}
				});
			});
		});

		// 各スタックの各ライザーの開始位置と終了位置のためのY値を計算
		splitYData.forEach(function (el) {
			el.forEach(function (stack) {
				var acc = 0;
				stack.forEach(function (d) {
					d.y0 = acc;
					d.y1 = acc + d.value;
					acc += d.value;
				});
			});
		});

		// テーブル要素を作成
		var table = document.createElement('table');
		table.style.width = '100%';
		table.style.borderCollapse = 'collapse';
		table.style.fontFamily = 'Arial, sans-serif';

		// ヘッダーを作成
		var thead = document.createElement('thead');
		var headerRow = document.createElement('tr');

		// ラベルヘッダー
		var labelTh = document.createElement('th');
		labelTh.textContent = 'ラベル';
		labelTh.style.padding = '8px';
		labelTh.style.borderBottom = '2px solid #ddd';
		labelTh.style.backgroundColor = '#f0f0f0';
		labelTh.style.textAlign = 'left';
		headerRow.appendChild(labelTh);

		// 値ヘッダー
		var valueTitle = tdgchart.util.get('dataBuckets.buckets.value.title[0]', renderConfig, '値');
		var valueTh = document.createElement('th');
		valueTh.textContent = valueTitle;
		valueTh.style.padding = '8px';
		valueTh.style.borderBottom = '2px solid #ddd';
		valueTh.style.backgroundColor = '#f0f0f0';
		valueTh.style.textAlign = 'right';
		headerRow.appendChild(valueTh);

		thead.appendChild(headerRow);
		table.appendChild(thead);

		// ボディを作成
		var tbody = document.createElement('tbody');

		// データをフラット化してテーブル行を作成
		var flatData = [];
		splitYData.forEach(function(series, seriesIndex) {
			series.forEach(function(stack, stackIndex) {
				stack.forEach(function(d) {
					flatData.push({
						label: d.labels,
						value: d.value,
						series: seriesIndex,
						group: stackIndex
					});
				});
			});
		});

		// 行を作成
		flatData.forEach(function(item) {
			var row = document.createElement('tr');

			// ラベルセル
			var labelCell = document.createElement('td');
			labelCell.textContent = item.label;
			labelCell.style.padding = '8px';
			labelCell.style.borderBottom = '1px solid #ddd';
			row.appendChild(labelCell);

			// 値セル
			var valueCell = document.createElement('td');
			valueCell.textContent = chart.formatNumber(item.value, '#,###');
			valueCell.style.padding = '8px';
			valueCell.style.borderBottom = '1px solid #ddd';
			valueCell.style.textAlign = 'right';
			row.appendChild(valueCell);

			tbody.appendChild(row);
		});

		table.appendChild(tbody);
		container.appendChild(table);

		renderConfig.renderComplete();
	}

	// 拡張機能の設定
	var config = {
		id: 'com.shimokado.simple_bar',     // この拡張機能を一意に識別する文字列
		containerType: 'html',  // 'html'または'svg'（デフォルト）
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
			]
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
