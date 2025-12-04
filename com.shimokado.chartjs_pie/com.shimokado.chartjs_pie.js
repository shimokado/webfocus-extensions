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
			depth: 1,
			buckets: {
				labels: { title: 'Country', count: 1 },
				value: { title: 'Sales', count: 1 }
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
	 * データを正規化する関数
	 * @param {Object} renderConfig - renderConfigオブジェクト
	 * @returns {Object} 正規化されたデータ
	 */
	function normalizeRenderData(renderConfig) {
		var dataBuckets = renderConfig.dataBuckets;
		var buckets = dataBuckets.buckets;
		var data = renderConfig.data;

		// ===== Step 1: バケットメタデータを常に配列に統一 =====
		// count=1なら文字列、count>1なら配列として扱う
		var labelsTitles = buckets.labels 
			? (buckets.labels.count === 1 ? [buckets.labels.title] : buckets.labels.title) 
			: [];
		var labelsFieldNames = buckets.labels 
			? (buckets.labels.count === 1 ? [buckets.labels.fieldName] : buckets.labels.fieldName) 
			: [];
		var valueTitles = buckets.value 
			? (buckets.value.count === 1 ? [buckets.value.title] : buckets.value.title) 
			: [];
		var valueFieldNames = buckets.value 
			? (buckets.value.count === 1 ? [buckets.value.fieldName] : buckets.value.fieldName) 
			: [];
		var valueNumberFormats = buckets.value 
			? (buckets.value.count === 1 ? [buckets.value.numberFormat] : buckets.value.numberFormat) 
			: [];

		// ===== Step 2: データアイテムを統一形式に正規化 =====
		var flatData = [];

		if (dataBuckets.depth === 1) {
			// depth=1: data はそのままアイテム配列
			flatData = data.map(function(item) {
				return {
					labels: item.labels !== undefined 
						? (Array.isArray(item.labels) ? item.labels : [item.labels]) 
						: [],
					value: item.value !== undefined 
						? (Array.isArray(item.value) ? item.value : [item.value]) 
						: [],
					detail: item.detail !== undefined 
						? (Array.isArray(item.detail) ? item.detail : [item.detail]) 
						: [],
					_s: item._s,
					_g: item._g
				};
			});
		} else if (dataBuckets.depth > 1) {
			// depth>1: data は配列の配列（シリーズごとにグループ化）
			data.forEach(function(series) {
				if (Array.isArray(series)) {
					series.forEach(function(item) {
						flatData.push({
							labels: item.labels !== undefined 
								? (Array.isArray(item.labels) ? item.labels : [item.labels]) 
								: [],
							value: item.value !== undefined 
								? (Array.isArray(item.value) ? item.value : [item.value]) 
								: [],
							detail: item.detail !== undefined 
								? (Array.isArray(item.detail) ? item.detail : [item.detail]) 
								: [],
							_s: item._s,
							_g: item._g
						});
					});
				}
			});
		}

		// ===== Step 3: 正規化されたデータを返す =====
		return {
			labelsTitles: labelsTitles,
			labelsFieldNames: labelsFieldNames,
			valueTitles: valueTitles,
			valueFieldNames: valueFieldNames,
			valueNumberFormats: valueNumberFormats,
			data: flatData  // 統一形式のデータ
		};
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
		const height = renderConfig.height; // 領域の高さ
		const width = renderConfig.width; // 領域の幅

		console.log('width:', width, 'height:', height);

		container.innerHTML = ''; // コンテナをクリア

		// データの正規化
		const normalized = normalizeRenderData(renderConfig);
		console.log('normalized:', normalized);

		// labelsのcountを確認
		const labelCount = normalized.labelsTitles.length;

		if (labelCount === 1) {
			// 単一ラベルの場合：1つのpie chart
			createPieChart(container, normalized.data, normalized.labelsTitles[0], normalized.valueTitles[0], width, height);
		} else {
			// 複数ラベルの場合：各レベルごとにpie chartを作成
			for (let level = 0; level < labelCount; level++) {
				const levelData = aggregateDataByLevel(normalized.data, level);
				const chartTitle = normalized.labelsTitles[level];
				const chartDiv = document.createElement('div');
				chartDiv.style.marginBottom = '20px';
				chartDiv.style.textAlign = 'center';
				container.appendChild(chartDiv);

				const title = document.createElement('h3');
				title.textContent = chartTitle;
				chartDiv.appendChild(title);

				createPieChart(chartDiv, levelData, chartTitle, normalized.valueTitles[0], width, height / labelCount);
			}
		}

		renderConfig.renderComplete();
	}

	/**
	 * 指定されたレベルでデータを集計する関数
	 * @param {Array} data - 正規化されたデータ
	 * @param {Number} level - 集計するラベルレベル
	 * @returns {Array} 集計されたデータ
	 */
	function aggregateDataByLevel(data, level) {
		const aggregated = {};

		data.forEach(item => {
			const key = item.labels[level];
			const value = item.value[0] || 0;

			if (!aggregated[key]) {
				aggregated[key] = 0;
			}
			aggregated[key] += value;
		});

		return Object.keys(aggregated).map(key => ({
			label: key,
			value: aggregated[key]
		}));
	}

	/**
	 * Pie chartを作成する関数
	 * @param {HTMLElement} container - コンテナ要素
	 * @param {Array} data - チャートデータ
	 * @param {String} labelTitle - ラベルタイトル
	 * @param {String} valueTitle - 値タイトル
	 * @param {Number} width - 幅
	 * @param {Number} height - 高さ
	 */
	function createPieChart(container, data, labelTitle, valueTitle, width, height) {
		// Canvas要素を作成
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		container.appendChild(canvas);

		const labels = data.map(d => d.label || d.labels[d.labels.length - 1]);
		const values = data.map(d => d.value || d.value[0]);

		// Chart.js インスタンス作成
		const ctx = canvas.getContext('2d');
		new Chart(ctx, {
			type: 'pie',
			data: {
				labels: labels,
				datasets: [{
					data: values,
					backgroundColor: [
						'#FF6384',
						'#36A2EB',
						'#FFCE56',
						'#4BC0C0',
						'#9966FF',
						'#FF9F40'
					],
					borderWidth: 1
				}]
			},
			options: {
				responsive: false,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'right'
					},
					tooltip: {
						callbacks: {
							label: function(context) {
								const label = context.label || '';
								const value = context.parsed;
								return `${label}: ${value}`;
							}
						}
					}
				}
			}
		});
	}

	var config = {
		id: 'com.shimokado.chartjs_pie',	// エクステンションID
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
			script: ['lib/chart.js'],
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
					if (d) {
						return `${d.labels[d.labels.length - 1]}: ${d.value[0]}`;
					} else {
						return 'No data';
					}
				}
			}
		}
	};

	// 必須: この呼び出しにより拡張機能がチャートエンジンに登録されます
	tdgchart.extensionManager.register(config);
}());
