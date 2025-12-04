/* Copyright (C) 2025. Shimokado Masataka. All rights reserved. */

(function() {
	/**
	 * チャートの初期化処理
	 * @param {function} successCallback - 初期化成功時に呼び出すコールバック関数
	 * @param {object} initConfig - 初期化設定
	 */
	function initCallback(successCallback, initConfig) {
		successCallback(true);
	}

	/**
	 * データがない場合の事前レンダリングコールバック
	 * @param {object} preRenderConfig - 事前レンダリング設定
	 */
	function noDataPreRenderCallback(preRenderConfig) {
	}

	/**
	 * データがない場合のレンダリングコールバック
	 * @param {object} renderConfig - レンダリング設定
	 */
	function noDataRenderCallback(renderConfig) {
	}

	/**
	 * プリレンダリングコールバック
	 * @param {object} preRenderConfig - 事前レンダリング設定
	 */
	function preRenderCallback(preRenderConfig) {
	}
	
	/**
	 * レンダリングコールバック
	 * @param {object} renderConfig - レンダリング設定
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
		var chart = renderConfig.moonbeamInstance; // Moonbeamインスタンス
		var props = renderConfig.properties; // プロパティ
		var container = renderConfig.container; // コンテナ
		var data = renderConfig.data; // データ
		var dataBuckets = renderConfig.dataBuckets; // データバケット全体
		var buckets = dataBuckets.buckets; // データバケット

		// テーブルのスタイル設定
		var fontSize = props.tableStyle ? props.tableStyle.fontSize : "12px";
		var color = props.tableStyle ? props.tableStyle.color : "#000000";

		// ===== ステップ1: データの正規化 =====
		// depth に基づいて、フラットなデータ構造に統一
		let flatData = [];
		
		if (dataBuckets.depth === 1) {
			// depth=1: data はオブジェクトの配列 [{labels, value}, ...]
			flatData = data.map(item => ({
				labels: Array.isArray(item.labels) ? item.labels : [item.labels],
				value: Array.isArray(item.value) ? item.value : [item.value]
			}));
		} else {
			// depth>1: data は配列の配列 [ [{labels, value}, ...], [...] ]
			data.forEach(series => {
				if (Array.isArray(series)) {
					series.forEach(item => {
						flatData.push({
							labels: Array.isArray(item.labels) ? item.labels : [item.labels],
							value: Array.isArray(item.value) ? item.value : [item.value]
						});
					});
				}
			});
		}
		
		// 以降の処理では flatData を使用
		data = flatData;

		// ラベル数と値数の取得
		const labelCount = buckets.labels && buckets.labels.count ? buckets.labels.count : 0;
		const valueCount = buckets.value && buckets.value.count ? buckets.value.count : 0;

		// ===== ステップ2: バケットメタデータの正規化 =====
		// count=1なら文字列、count>1なら配列として扱う
		const labelTitles = buckets.labels 
			? (labelCount === 1 ? [buckets.labels.title] : buckets.labels.title) 
			: [];
		const valueTitles = buckets.value 
			? (valueCount === 1 ? [buckets.value.title] : buckets.value.title) 
			: [];
		const valueNumberFormats = buckets.value 
			? (valueCount === 1 ? [buckets.value.numberFormat] : buckets.value.numberFormat) 
			: [];

		// テーブルコンテナの作成
		var tableContainer = document.createElement('div');
		tableContainer.className = 'simple-table-container';
		container.appendChild(tableContainer);

		// テーブル要素の作成
		var table = document.createElement('table');
		table.style.fontSize = fontSize;
		table.style.color = color;
		table.style.width = '100%';
		table.style.borderCollapse = 'collapse';

		// ヘッダーの作成
		var thead = document.createElement('thead');
		var headerRow = document.createElement('tr');
		
		// ラベルの列ヘッダーを作成（各ラベル項目ごとにth）
		labelTitles.forEach(title => {
			var th = document.createElement('th');
			th.textContent = title;
			th.style.padding = '8px';
			th.style.borderBottom = '2px solid #ddd';
			th.style.backgroundColor = '#f0f0f0';
			th.style.textAlign = 'left';
			headerRow.appendChild(th);
		});
		
		// 値の列ヘッダーを作成（各値項目ごとにth）
		valueTitles.forEach(title => {
			var th = document.createElement('th');
			th.textContent = title;
			th.style.padding = '8px';
			th.style.borderBottom = '2px solid #ddd';
			th.style.backgroundColor = '#f0f0f0';
			th.style.textAlign = 'right';
			headerRow.appendChild(th);
		});
		
		thead.appendChild(headerRow);
		table.appendChild(thead);

		// データ行の作成
		var tbody = document.createElement('tbody');
		
		data.forEach(function(item) {
			var row = document.createElement('tr');
			
			// ラベルセルを作成（各ラベル項目ごとにtd）
			item.labels.forEach(label => {
				var td = document.createElement('td');
				td.textContent = label;
				td.style.padding = '8px';
				td.style.borderBottom = '1px solid #ddd';
				row.appendChild(td);
			});
			
			// 値のセルを作成（各値項目ごとにtd）
			item.value.forEach((val, idx) => {
				var td = document.createElement('td');
				td.style.padding = '8px';
				td.style.borderBottom = '1px solid #ddd';
				td.style.textAlign = 'right';
				
				// 数値フォーマットが指定されている場合は適用
				if (valueNumberFormats[idx]) {
					td.textContent = chart.formatNumber(val, valueNumberFormats[idx]);
				} else {
					td.textContent = val !== null ? val.toString() : '';
				}
				
				row.appendChild(td);
			});
			
			tbody.appendChild(row);
		});
		
		table.appendChild(tbody);
		tableContainer.appendChild(table);

		renderConfig.renderComplete();
	}

	var config = {
		id: 'com.shimokado.table_simple',	// エクステンションID
		containerType: 'html',	// コンテナタイプ(html/svg)
		initCallback: initCallback,	// 拡張機能の初期化直前に呼び出される関数への参照。必要に応じてMonbeamインスタンスを設定するために使用
		preRenderCallback: preRenderCallback,  // 拡張機能のレンダリング直前に呼び出される関数への参照。preRenderConfigオブジェクトが渡されます
		renderCallback: renderCallback,  // 実際のチャートを描画する関数への参照。renderConfigオブジェクトが渡されます
		noDataPreRenderCallback: noDataPreRenderCallback, // データがない場合のレンダリング直前に呼び出される関数への参照
		noDataRenderCallback: noDataRenderCallback, // データがない場合のチャート描画関数への参照
		resources: {
			script: [], // 読み込むリソースのリスト。.jsまたは.cssファイルを指定可能
			css: [] // 読み込むリソースのリスト。.jsまたは.cssファイルを指定可能
		},
		modules: {
			dataSelection: {
				supported: true,  // データ選択を有効にする場合はtrueに設定
				needSVGEventPanel: true, // HTMLコンテナを使用するか、SVGコンテナを変更する場合はtrueに設定
				svgNode: function(arg){}  // HTMLコンテナを使用するか、SVGコンテナを変更する場合、ルートSVGノードへの参照を返す
			},
			eventHandler: {
				supported: true // イベントハンドラを有効にする場合はtrueに設定
			},
			tooltip: {
				supported: true,  // HTMLツールチップを有効にする場合はtrueに設定
				// デフォルトのツールチップコンテンツが渡されない場合に呼び出されるコールバック
				// 指定されたターゲット、ID、データに対して適切なデフォルトツールチップを定義
				// 戻り値は文字列（HTMLを含む）、HTMLノード、またはMoonbeamツールチップAPIオブジェクト
				autoContent: function(target, s, g, d) {
					return (Array.isArray(d.labels) ? d.labels.join(' - ') : d.labels) + ': ' + (Array.isArray(d.value) ? d.value.join(', ') : d.value); // 配列の場合は結合して表示
				}
			}
		}
	};
	// エクステンションをtdgchartエクステンションマネージャに登録
	tdgchart.extensionManager.register(config);
}());
