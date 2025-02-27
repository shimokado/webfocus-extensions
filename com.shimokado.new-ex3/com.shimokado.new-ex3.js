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
		// var chart = preRenderConfig.moonbeamInstance;
		// chart.legend.visible = false;
		// chart.dataArrayMap = undefined;
		// chart.dataSelection.enabled = false;
	}

	/**
	 * データがない場合のレンダリングコールバック
	 * @param {object} renderConfig - レンダリング設定
	 */
	function noDataRenderCallback(renderConfig) {
		// renderConfig.data= [
		// 	[
		// 	  [
		// 		'ENGLAND'
		// 	   ,37853
		// 	  ]
		// 	 ,[
		// 		'FRANCE'
		// 	   ,4631
		// 	  ]
		// 	 ,[
		// 		'ITALY'
		// 	   ,41235
		// 	  ]
		// 	 ,[
		// 		'JAPAN'
		// 	   ,5512
		// 	  ]
		// 	 ,[
		// 		'W GERMANY'
		// 	   ,54563
		// 	  ]
		// 	]
		//   ];
		// renderCallback(renderConfig);
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
		var dataContainer = document.createElement('div');

		// データをコンソールに表示
		console.log('renderConfig:', renderConfig);		

		// データをコンソールに表示していることを示すメッセージを表示
		dataContainer.innerHTML = '<h2>ConsoleにrenderConfigオブジェクトを表示しています</h2>';

		// データを表示		
		// 安全に表示できるデータのみを表示
		dataContainer.innerHTML += '<h3>renderConfig.properties:</h3>';
		var propsTextArea = document.createElement('pre');
		propsTextArea.textContent = JSON.stringify(props, null, 2);
		dataContainer.appendChild(propsTextArea);
		
		dataContainer.innerHTML += '<h3>renderConfig.data:</h3>';
		var dataTextArea = document.createElement('pre');
		dataTextArea.textContent = JSON.stringify(data, null, 2);
		dataContainer.appendChild(dataTextArea);
				
		dataContainer.innerHTML += '<h3>renderConfig.dataBuckets:</h3>';
		var dataBucketsTextArea = document.createElement('pre');
		dataBucketsTextArea.textContent = JSON.stringify(dataBuckets, null, 2);
		dataContainer.appendChild(dataBucketsTextArea);


		container.appendChild(dataContainer);

		renderConfig.renderComplete();
	}

	var config = {
		id: 'com.shimokado.new-ex3',	// エクステンションID
		containerType: 'html',	// コンテナタイプ(html/svg)
		initCallback: initCallback,	// 拡張機能の初期化直前に呼び出される関数への参照。必要に応じてMonbeamインスタンスを設定するために使用
		preRenderCallback: preRenderCallback,  // 拡張機能のレンダリング直前に呼び出される関数への参照。preRenderConfigオブジェクトが渡されます
		renderCallback: renderCallback,  // 実際のチャートを描画する関数への参照。renderConfigオブジェクトが渡されます
		noDataPreRenderCallback: noDataPreRenderCallback, // データがない場合のレンダリング直前に呼び出される関数への参照
		noDataRenderCallback: noDataRenderCallback, // データがない場合のチャート描画関数への参照
		resources: {
			script: ['lib/script.js'], // 読み込むリソースのリスト。.jsまたは.cssファイルを指定可能
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
