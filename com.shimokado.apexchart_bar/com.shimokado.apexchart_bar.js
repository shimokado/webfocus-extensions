/* Copyright (C) 2025. Shimokado Masataka. All rights reserved. */

(function() {
	function initCallback(successCallback, initConfig) {
		successCallback(true);
	}

	/**
	 * データを含まない各描画の前に1回呼び出されます（オプション）
	 * @param {Object} preRenderConfig - 標準のコールバック引数オブジェクト（moonbeamInstance, data, properties, など）
	 */
	function noDataPreRenderCallback(preRenderConfig) {
		console.log('noDataPreRenderCallback:', preRenderConfig);
		// 実行前に実行する処理を記述
	}
	
	/**
	 * この拡張機能を描画する必要があるが、まだデータがない場合に呼び出されます（オプション）
	 * @param {Object} renderConfig - 標準のコールバック引数オブジェクト（moonbeamInstance, data, properties, など）
	 */
	function noDataRenderCallback(renderConfig) {
		console.log('noDataRenderCallback:', renderConfig);
		// サンプルデータとバケットを使用してrenderCallbackを呼び出す
		renderConfig.data = [
			{ labels: 'ENGLAND', value: 37853 },
			{ labels: 'FRANCE', value: 4631 }
		];
		renderConfig.dataBuckets = {
			buckets: {
				labels: {
					title: 'Country'
				},
				value: {
					title: 'Sales'
				}
			}
		};
		renderCallback(renderConfig);

	}

	/**
	 * 各チャートエンジンの描画サイクルの最初に1回呼び出されます（オプション）
	 * @param {Object} preRenderConfig - 標準のコールバック引数オブジェクト
	 */
	function preRenderCallback(preRenderConfig) {
		console.log('preRenderCallback:', preRenderConfig);
		// 実行前に実行する処理を記述
	}

	/**
	 * labelプロパティからApexChartsのスケールフォント設定を作成
	 * @param {Object} props - プロパティオブジェクト
	 * @returns {Object} ApexCharts用のスケールフォント設定
	 */
	function createScaleFontConfig(props) {
		const fontConfig = {};
		
		if (props.label && props.label.text) {
			if (props.label.text.size) {
				fontConfig.fontSize = parseInt(props.label.text.size) + 'px';
			}
			if (props.label.text.font) {
				fontConfig.fontFamily = props.label.text.font;
			}
			if (props.label.text.weight) {
				fontConfig.fontWeight = props.label.text.weight;
			}
			if (props.label.text.color) {
				fontConfig.colors = [props.label.text.color];
			}
		}
		
		return Object.keys(fontConfig).length > 0 ? fontConfig : undefined;
	}

	/**
	 * valueLabelプロパティからApexChartsのデータラベルフォント設定を作成
	 * @param {Object} props - プロパティオブジェクト
	 * @returns {Object} ApexCharts用のデータラベルフォント設定
	 */
	function createDataLabelFontConfig(props) {
		const fontConfig = {};
		
		if (props.valueLabel) {
			if (props.valueLabel.fontSize && props.valueLabel.fontSize !== 'auto') {
				fontConfig.fontSize = parseInt(props.valueLabel.fontSize) + 'px';
			}
			if (props.valueLabel.fontFamily) {
				fontConfig.fontFamily = props.valueLabel.fontFamily;
			}
			if (props.valueLabel.fontWeight) {
				fontConfig.fontWeight = props.valueLabel.fontWeight;
			}
			if (props.valueLabel.color) {
				fontConfig.colors = [props.valueLabel.color];
			}
		}
		
		return Object.keys(fontConfig).length > 0 ? fontConfig : undefined;
	}

	/**
	 * 各チャートエンジンの描画サイクル中に呼び出されます（必須）
	 * ここで拡張機能をレンダリングする必要があります
	 * @param {Object} renderConfig - width、heightなどの追加プロパティを含む標準のコールバック引数オブジェクト
	 * @param {object} renderConfig.moonbeamInstance - Moonbeamインスタンス
	 * @param {object} renderConfig.properties - プロパティ
	 * @param {object} renderConfig.container - コンテナ
	 * @param {object} renderConfig.data - データ
	 * @param {object} renderConfig.dataBuckets - データバケット
	 * @param {object} renderConfig.dataBuckets.labels - ラベルデータバケット
	 * @param {object} renderConfig.dataBuckets.value - 値データバケット
	 * @param {function} renderConfig.renderComplete - レンダリング完了時に呼び出すコールバック関数
	 */
	function renderCallback(renderConfig) {
		// データをコンソールに表示
		console.log('renderCallback:', renderConfig);

		const props = renderConfig.properties; // 実行プログラムでセットされているプロパティ
		const container = renderConfig.container; // 出力先のコンテナ
		const data = renderConfig.data; // WebFOCUSが出力したデータ
		const dataBuckets = renderConfig.dataBuckets; // データバケット
		const buckets = dataBuckets.buckets; // バケットの配列

		container.innerHTML = ''; // コンテナをクリア

		// data配列のオブジェクトからlabelsプロパティの値を取り出して配列に格納
		const labels = data.map(function(d) {
			return d.labels;
		});

		// data配列のオブジェクトからvalueプロパティの値を取り出して配列に格納
		const values = data.map(function(d) {
			return d.value;
		});

		// ApexCharts用のフォント設定を作成
		const scaleFontConfig = createScaleFontConfig(props);
		const dataLabelFontConfig = createDataLabelFontConfig(props);

		// ApexChartsのオプションを作成
		const options = {
			series: [
				{
					name: buckets.value.title,
					data: values
				}
			],
			chart: {
				type: "bar",
				height: renderConfig.height
			},
			xaxis: {
				categories: labels,
				labels: scaleFontConfig ? { style: scaleFontConfig } : undefined
			},
			yaxis: {
				labels: scaleFontConfig ? { style: scaleFontConfig } : undefined
			},
			legend: dataLabelFontConfig ? { labels: { colors: dataLabelFontConfig.colors, fontSize: dataLabelFontConfig.fontSize, fontFamily: dataLabelFontConfig.fontFamily, fontWeight: dataLabelFontConfig.fontWeight } } : undefined
		};

		// 空のオプションを削除
		if (options.xaxis.labels && !options.xaxis.labels.style) {
			delete options.xaxis.labels;
		}
		if (options.yaxis.labels && !options.yaxis.labels.style) {
			delete options.yaxis.labels;
		}
		if (options.legend && !options.legend.labels) {
			delete options.legend;
		}

		// ApexChartsインスタンスを作成してレンダリング
		var chart = new ApexCharts(container, options);
		chart.render();

		renderConfig.renderComplete(); // 必須: レンダリングが完了したことをチャートエンジンに通知します
	}

	var config = {
		id: 'com.shimokado.apexchart_bar',	// エクステンションID
		containerType: 'html',	// // 'html'または'svg'（デフォルト）
		initCallback: initCallback,	// 拡張機能の初期化直前に呼び出される関数への参照。必要に応じてMonbeamインスタンスを設定するために使用
		preRenderCallback: preRenderCallback,  // 拡張機能のレンダリング直前に呼び出される関数への参照。preRenderConfigオブジェクトが渡されます
		renderCallback: renderCallback,  // 実際のチャートを描画する関数への参照。renderConfigオブジェクトが渡されます
		noDataPreRenderCallback: noDataPreRenderCallback, // データがない場合のレンダリング直前に呼び出される関数への参照
		noDataRenderCallback: noDataRenderCallback, // データがない場合のチャート描画関数への参照
		resources: {
			/* 配列の中にオブジェクトを入れることで、外部ライブラリの読み込み順序を指定できる
			*/
			// script: [],
			// css: []
			script: ['lib/apexcharts.js'],
			css: ['css/style.css']

			// コールバック関数を使用して動的に読み込む外部ライブラリを定義する例
			// callbackArgは'properties'を含む標準のコールバック引数オブジェクトです
			// これはライブラリ読み込み時に呼び出されるため、チャートインスタンスはまだ利用できません
			// function(callbackArg) {
			// 	return callbackArg.properties.external_library;
			// }
			// ※ このサンプルでは、properties.external_libraryを参照していません。
		},
		modules: {
			dataSelection: {
				supported: true,  // 拡張機能でデータ選択を有効にする場合はtrueに設定
				needSVGEventPanel: false, // HTMLコンテナを使用するか、SVGコンテナを変更する場合は、これをtrueに設定すると、チャートエンジンがユーザー操作を捕捉するために必要なSVG要素を挿入します
				svgNode: function() {}  // HTMLコンテナを使用するか、SVGコンテナを変更する場合は、ルートSVGノードへの参照をここで返します
			},
			eventHandler: {
				supported: true // イベントハンドラを有効にする場合はtrueに設定
			},
			tooltip: {
				supported: true,  // 拡張機能でHTMLツールチップを有効にする場合はtrueに設定
				// デフォルトのツールチップコンテンツがチャートに渡されない場合にこのコールバックが呼び出されます
				// 指定されたターゲット、ID、データに対して'nice'なデフォルトツールチップを定義するために使用します
				// 戻り値は文字列（HTMLを含む）、HTMLノード、またはMoonbeamツールチップAPIオブジェクトのいずれかです
				autoContent: function(target, s, g, d) {
					return d.labels + ': ' + d.value; // 単純な文字列を返す
				}
			}
		}
	};

	// 必須: この呼び出しにより拡張機能がチャートエンジンに登録されます
	tdgchart.extensionManager.register(config);
}());
