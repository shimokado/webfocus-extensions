/*global tdgchart: false, pv: false, d3: false */
/* Copyright (C) 1996-2023. Cloud Software Group, Inc. All rights reserved. */

(function() {

	// 全ての拡張機能のコールバック関数は標準の'renderConfig'引数を受け取ります:
	//
	// 常に利用可能なプロパティ:
	//   moonbeamInstance: 現在レンダリング中のチャートインスタンス
	//   data: レンダリング中のデータセット
	//   properties: ユーザーによって設定された拡張機能のプロパティブロック
	//   modules: 拡張機能の設定からの'modules'オブジェクトと追加のAPIメソッド
	//
	// レンダリングコールバック時に利用可能なプロパティ:
	//   width: 拡張機能がレンダリングされるコンテナの幅（px）
	//   height: 拡張機能がレンダリングされるコンテナの高さ（px）
	//   containerIDPrefix: 拡張機能がレンダリングされるDOMコンテナのID。拡張機能が生成する全てのIDの前にこれを付加し、1ページ上で拡張機能の複数のコピーが動作することを保証します。
	//   container: 拡張機能がレンダリングされるDOMノード
	//   rootContainer: レンダリング中の特定のチャートエンジンインスタンスを含むDOMノード

	/**
	 * チャートエンジンの初期化時に1回だけ呼び出されます（オプション）
	 * @param {Function} successCallback - 拡張機能が完全に初期化された時に呼び出す必要のある関数。初期化が成功した場合はtrue、そうでない場合はfalseを渡します。
	 * @param {Object} initConfig - 標準のコールバック引数オブジェクト（moonbeamInstance, data, properties, など）
	 */
	function initCallback(successCallback, initConfig) {
		successCallback(true);
	}

	/**
	 * データを含まない各描画の前に1回呼び出されます（オプション）
	 * @param {Object} preRenderConfig - 標準のコールバック引数オブジェクト（moonbeamInstance, data, properties, など）
	 */
	function noDataPreRenderCallback(preRenderConfig) {
		var chart = preRenderConfig.moonbeamInstance;
		chart.legend.visible = false;
		chart.dataArrayMap = undefined;
		chart.dataSelection.enabled = false;
	}

	/**
	 * この拡張機能を描画する必要があるが、まだデータがない場合に呼び出されます（オプション）
	 * 拡張機能の初期の'グレー状態'の外観を定義するために使用します。
	 * @param {Object} renderConfig - 標準のコールバック引数オブジェクト（moonbeamInstance, data, properties, など）
	 */
	function noDataRenderCallback(renderConfig) {
		var grey = renderConfig.baseColor;
		renderConfig.data = [
			[{value: 3}, {value: 4}, {value: 5}, {value: 6}, {value: 7}],
			[{value: 3}, {value: 4}, {value: 5}, {value: 6}, {value: 7}]
		];
		renderConfig.dataBuckets.depth = 2;
		renderConfig.moonbeamInstance.getSeries(0).color = grey;
		renderConfig.moonbeamInstance.getSeries(1).color = pv.color(grey).lighter(0.18).color;
		renderCallback(renderConfig);
	}

	/**
	 * 各チャートエンジンの描画サイクルの最初に1回呼び出されます（オプション）
	 * レンダリング前に特定のチャートエンジンインスタンスを設定するために使用します。
	 * @param {Object} preRenderConfig - 標準のコールバック引数オブジェクト
	 */
	function preRenderCallback(preRenderConfig) {
		var chart = preRenderConfig.moonbeamInstance;

		// この拡張機能のフォルダパスにあるファイルを手動で読み込んで使用する例
		var info = tdgchart.util.ajax(preRenderConfig.loadPath + 'lib/extra_properties.json', {asJSON: true});

		/* CHART-1935 NFR以前のロジック	
			// チャートエンジンの組み込みタイトルプロパティを使用する例
			chart.title.visible = true;
			chart.title.text = info.custom_title;
			chart.footnote.visible = true;
			chart.footnote.text = 'footnote';
			chart.footnote.align = 'right';
		*/
		
			//CHART-1935 NFR開始
		
			if (!chart.title.visible) {    //開発者がGRAPHリクエストでHEADINGを設定していない場合、次の場所にあるカスタムタイトルを使用: preRenderConfig.loadPath + 'lib/extra_properties.json'
				// チャートエンジンの組み込みタイトルプロパティを使用する例
				chart.title.visible = true;
				chart.title.text = info.custom_title;	
			} // if (!chart.title.visible) //開発者がGRAPHリクエストでFOOTINGを設定していない場合、カスタムの programmatic footingをチャートに割り当てる方法を示すために'footnote'テキストを使用
			
			if (!chart.footnote.visible) {
				chart.footnote.visible = true;
				chart.footnote.text = 'footnote';
				chart.footnote.align = 'right';			
					
			} //if (!chart.footnote.visible)
		
		
		//CHART-1935 NFR終了
		
	}

	/**
	 * 各チャートエンジンの描画サイクル中に呼び出されます（必須）
	 * ここで拡張機能をレンダリングする必要があります
	 * @param {Object} renderConfig - width、heightなどの追加プロパティを含む標準のコールバック引数オブジェクト
	 * 
	 * このシンプルな棒グラフ拡張機能は以下をサポートします:
	 * - 一般的な'value'バケットに複数のメジャーエントリ。各値は独自の分割Y軸に描画されます。
	 * - 一般的な'labels'バケットに1つのディメンションエントリ。このバケットは序数軸上のラベルのセットを定義します。
	 * - 組み込みの'series_break'バケットに1つのディメンションエントリ。これにより各値エントリが複数の類似した色に分割されます。
	 */
	function renderCallback(renderConfig) {

		var chart = renderConfig.moonbeamInstance;
		var data = renderConfig.data;
		var w = renderConfig.width;
		var h = renderConfig.height;

		var container = d3.select(renderConfig.container)
			.attr('class', 'com_ibi_chart');

		// series_breakがない場合、dataBuckets.depthは1となり、dataは単純なdatumオブジェクトの配列となります。
		// series_breakの有無に関係なく、内部データが常に2次元配列となるように正規化します。
		if (renderConfig.dataBuckets.depth === 1) {
			data = [data];
		}

		// メジャーが1つしかない場合、measureタイトルは配列ではなく文字列となります。これも正規化します。
		if (renderConfig.dataBuckets.buckets.value && !Array.isArray(renderConfig.dataBuckets.buckets.value.title)) {
			renderConfig.dataBuckets.buckets.value.title = [renderConfig.dataBuckets.buckets.value.title];
		}

		// データセット全体から一意の軸ラベルのリストを作成します
		var axisLabels = pv.blend(data).map(function(el) {return el.labels;}).filter(function() {
			var seen = {};
			return function(el) {
				return el != null && !(el in seen) && (seen[el] = 1);
			};
		}());

		// ラベルバケットが空の場合、'Label X'のプレースホルダーを使用します
		if (!axisLabels.length) {
			var labelCount = d3.max(data, function(el){return el.length;});
			axisLabels = d3.range(0, labelCount).map(function(el) {return 'Label ' + el;});
		}

		var splitYCount = tdgchart.util.get('dataBuckets.buckets.value.count', renderConfig, 1);
		var splitYData = [];

		// データは{value: [a, b, c]}エントリの配列の配列として到着します。
		// 'value'内の各エントリは一意のsplit-y軸に描画されます。
		// その長いリストを各split-y軸用の値のリストに分割します。
		data.forEach(function(array) {
			array.forEach(function(el, i) {
				el.value = Array.isArray(el.value) ? el.value : [el.value];
				if (!el.labels) {
					el.labels = 'Label ' + i;
				}
				el.value.forEach(function(v, idx) {
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

		// 各スタック内の各ライザーの開始位置と終了位置のy値を計算します
		splitYData.forEach(function(el) {
			el.forEach(function(stack) {
				var acc = 0;
				stack.forEach(function(d) {
					d.y0 = acc;
					d.y1 = acc + d.value;
					acc += d.value;
				});
			});
		});

		var xLabelHeight = 25;
		var yHeight = (h - xLabelHeight) / splitYCount;
		var x = d3.scale.ordinal().domain(axisLabels).rangeRoundBands([xLabelHeight, w - 25], 0.2);
		var yScaleList = splitYData.map(function(el) {
			var ymax = d3.max(el.map(function(a) {return d3.sum(a, function(d) {return d.value;});}));
			return d3.scale.linear().domain([0, ymax]).range([yHeight, 20]);
		});

		var splitYGroups = container.selectAll('g')
			.data(splitYData)
			.enter().append('g')
			.attr('transform', function(d, i) {
				return 'translate(' + xLabelHeight + ', ' + (h - xLabelHeight - (yHeight * (i + 1))) + ')';
			});

		// 軸の区切り線を追加
		splitYGroups.append('path')
			.attr('d', function(d, i) {
				return 'M0,' + yScaleList[i](0) + 'l' + (w - 25) + ',0';
			})
			.attr('stroke', 'grey')
			.attr('stroke-width', 1)
			.attr('shape-rendering', 'crispEdges');

		// 回転したsplit-y軸ラベルを追加
		splitYGroups.append('text')
			.attr('transform', function() {
				return 'translate(-10,' + (yHeight / 2) + ') rotate(-90)';
			})
			.attr('fill', 'black')
			.attr('font-size', '12px')
			.attr('font-family', 'helvetica')
			.attr('text-anchor', 'middle')
			.text(function(d, i) {return tdgchart.util.get('dataBuckets.buckets.value.title[' + i + ']', renderConfig, '');});

		// スタックでグループ化されたライザーを追加
		var riserGroups = splitYGroups.selectAll('g')
			.data(function(d) {
				return d;  // d: ライザーデータの一次元配列
			})
			.enter().append('g');

		// 実際のライザー自体を描画
		riserGroups.selectAll('rect')
			.data(function(d) {
				return d;  // d: 単一の{y0, y1, label}データム（最終的に！）
			})
			.enter().append('rect')
			.attr('shape-rendering', 'crispEdges')
			.attr('x', function(d) {
				return x(d.labels);
			})
			.attr('y', function(d) {
				return yScaleList[d.yaxis](d.y1);
			})
			.attr('width', x.rangeBand())
			.attr('height', function(d) {
				return Math.abs(yScaleList[d.yaxis](d.y1) - yScaleList[d.yaxis](d.y0));
			})
			.attr('class', function(d, s, g) {
				// データ選択、イベント、ツールチップをサポートするために、各ライザーには適切なseriesIDとgroupIDを含むクラス名が必要です
				// chart.buildClassNameを使用して適切なクラス名を作成します。
				// 第1引数は'riser'、第2引数はseriesID、第3引数はgroupID、第4引数は拡張機能でライザーを識別するためのオプションの追加文字列です
				return chart.buildClassName('riser', s, g, 'bar');
			})
			.attr('fill', function(d, s) {
				// getSeriesAndGroupProperty(seriesID, groupID, property)は、
				// シリーズ依存のプロパティを簡単に検索できる便利な関数です。
				// 'property'はドット記法（例：'marker.border.width'）で指定できます
				return chart.getSeriesAndGroupProperty(s, null, 'color');
			})
			.each(function(d, s, g) {
				// addDefaultToolTipContentは、組み込みのチャートタイプと同じツールチップをこのライザーに追加します。
				// このノードが完全修飾されたシリーズ＆グループのクラス文字列を含んでいることを前提とします。
				// addDefaultToolTipContentはオプションの引数も受け付けます：
				// addDefaultToolTipContent(target, s, g, d, data)
				// このノードにクラスがない場合や、デフォルトのシリーズ/グループ/データムの検索ロジックを上書きしたい場合に便利です。
				renderConfig.modules.tooltip.addDefaultToolTipContent(this, s, g, d);
			});

		// 下部の順序付きx軸ラベルを追加
		container.append('g')
			.selectAll('text')
			.data(axisLabels)
			.enter().append('text')
			.attr('transform', function(d) {
				return 'translate(' + (x(d) + xLabelHeight + (x.rangeBand() / 2)) + ',' + (h - 5) + ')';
			})
			.attr('fill', 'black')
			.attr('font-size', '12px')
			.attr('font-family', 'helvetica')
			.attr('text-anchor', 'middle')
			.text(function(d, i) {return axisLabels[i];});

		renderConfig.renderComplete(); // 必須: レンダリングが完了したことをチャートエンジンに通知します
	}

	// 拡張機能の設定
	var config = {
		id: 'com.shimokado.simple-bar',     // この拡張機能を一意に識別する文字列
		containerType: 'svg',  // 'html'または'svg'（デフォルト）
		initCallback: initCallback,	// 拡張機能の初期化直前に呼び出される関数への参照。必要に応じてMonbeamインスタンスを設定するために使用
		preRenderCallback: preRenderCallback,  // 拡張機能のレンダリング直前に呼び出される関数への参照。preRenderConfigオブジェクトが渡されます
		renderCallback: renderCallback,  // 実際のチャートを描画する関数への参照。renderConfigオブジェクトが渡されます
		noDataPreRenderCallback: noDataPreRenderCallback, // データがない場合のレンダリング直前に呼び出される関数への参照
		noDataRenderCallback: noDataRenderCallback, // データがない場合のチャート描画関数への参照
		resources: {  // この拡張機能で必要な追加の外部リソース（CSSとJS）
			script: [
				// コールバック関数を使用して動的に読み込む外部ライブラリを定義する例
				// callbackArgは'properties'を含む標準のコールバック引数オブジェクトです
				// これはライブラリ読み込み時に呼び出されるため、チャートインスタンスはまだ利用できません
				function(callbackArg) {
					return callbackArg.properties.external_library;
				}
			]
			/* 配列の中にオブジェクトを入れることで、外部ライブラリの読み込み順序を指定できる
			*/
			// script: [],
			// css: []
		},
		modules: {
			dataSelection: {
				supported: true,  // 拡張機能でデータ選択を有効にする場合はtrueに設定
				needSVGEventPanel: false, // HTMLコンテナを使用するか、SVGコンテナを変更する場合は、これをtrueに設定すると、チャートエンジンがユーザー操作を捕捉するために必要なSVG要素を挿入します
				svgNode: function() {}  // HTMLコンテナを使用するか、SVGコンテナを変更する場合は、ルートSVGノードへの参照をここで返します
			},
			eventHandler: {
				supported: true
			},
			tooltip: {
				supported: true,  // 拡張機能でHTMLツールチップを有効にする場合はtrueに設定
				// デフォルトのツールチップコンテンツがチャートに渡されない場合にこのコールバックが呼び出されます
				// 指定されたターゲット、ID、データに対して'nice'なデフォルトツールチップを定義するために使用します
				// 戻り値は文字列（HTMLを含む）、HTMLノード、またはMoonbeamツールチップAPIオブジェクトのいずれかです
				autoContent: function(target, s, g, d) {
					if (d.hasOwnProperty('color')) {
						return 'バーのサイズ: ' + d.value + '<br />バーの色: ' + d.color;
					}
					return 'バーのサイズ: ' + d.value;
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
//				colorMode: function(arg){}, // 'data'または'series'を返します。実装された場合、チャートエンジンにこのカラーモードの凡例の使用を強制します
//				sizeMode: function(arg){},  // 'size'または偽値を返します。実装された場合、チャートエンジンにこのサイズ凡例の使用を強制します
//			}
		}
	};

	// 必須: この呼び出しにより拡張機能がチャートエンジンに登録されます
	tdgchart.extensionManager.register(config);

})();
