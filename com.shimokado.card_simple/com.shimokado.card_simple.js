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
		var chart = renderConfig.moonbeamInstance;
		var props = renderConfig.properties;
		var container = renderConfig.container;
		var data = renderConfig.data;
		var dataBuckets = renderConfig.dataBuckets.buckets;

		 // データを値の降順でソート
		data.sort(function(a, b) {
			return b.value - a.value;
		});

		// カードのスタイル設定
		var fontSize = props.tableStyle ? props.tableStyle.fontSize : "12px";
		var color = props.tableStyle ? props.tableStyle.color : "#000000";

		// カードコンテナの作成
		var cardContainer = document.createElement('div');
		cardContainer.className = 'card-grid-container';
		container.appendChild(cardContainer);

		// データを降順でソート
		data.sort(function(a, b) {
			return b.value - a.value;
		});

		// カードの生成
		data.forEach(function(row) {
			var card = document.createElement('div');
			card.className = 'data-card';
			
			var label = document.createElement('div');
			label.className = 'card-label';
			label.textContent = row.labels;
			
			var value = document.createElement('div');
			value.className = 'card-value';
			value.textContent = chart.formatNumber(row.value, dataBuckets.value.numberFormat || '###');
			
			card.appendChild(label);
			card.appendChild(value);
			cardContainer.appendChild(card);
		});

		renderConfig.renderComplete();
	}

	var config = {
		id: 'com.shimokado.card_simple',	// エクステンションID
		containerType: 'html',	// コンテナタイプ(html/svg)
		initCallback: initCallback,	// 拡張機能の初期化直前に呼び出される関数への参照。必要に応じてMonbeamインスタンスを設定するために使用
		preRenderCallback: preRenderCallback,  // 拡張機能のレンダリング直前に呼び出される関数への参照。preRenderConfigオブジェクトが渡されます
		renderCallback: renderCallback,  // 実際のチャートを描画する関数への参照。renderConfigオブジェクトが渡されます
		noDataPreRenderCallback: noDataPreRenderCallback, // データがない場合のレンダリング直前に呼び出される関数への参照
		noDataRenderCallback: noDataRenderCallback, // データがない場合のチャート描画関数への参照
		resources: {
			script: [], // 読み込むリソースのリスト。.jsまたは.cssファイルを指定可能
			css: ['css/style.css'] // 読み込むリソースのリスト。.jsまたは.cssファイルを指定可能
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
					return d.labels + ': ' + d.value; // 単純な文字列を返す
				}
			}
		}
	};
	// エクステンションをtdgchartエクステンションマネージャに登録
	tdgchart.extensionManager.register(config);
}());
