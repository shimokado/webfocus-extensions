/* Copyright (C) 2025. Shimokado Masataka. All rights reserved. */

(function() {

	// 全ての拡張機能のコールバック関数は標準の'renderConfig'引数を受け取ります:
	//
	// 常に利用可能なプロパティ(preRenderConfig、renderConfig):
	//   moonbeamInstance: 現在レンダリング中のチャートインスタンス
	//   data: レンダリング中のデータセット
	//   properties: ユーザーによって設定された拡張機能のプロパティブロック
	//   modules: 拡張機能の設定からの'modules'オブジェクトと追加のAPIメソッド
	//
	// レンダリングコールバック時に利用可能なプロパティ(renderConfig):
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
		// 初回のみ実行する処理を記述
		// 例: プロパティを取得
		// const properties = initConfig.properties;
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
		//サンプルデータとバケットを使用してrenderCallbackを呼び出す
		// renderConfig.data= [
		// 	  {
		// 		"labels": 'ENGLAND'
		// 	   ,"value": 37853
		// 	  }
		// 	 ,{
		// 		"labels": 'FRANCE'
		// 	   ,"value": 4631
		// 	 }
		// ];
		// renderConfig.dataBuckets = {
		// 	buckets: {
		// 	labels: {
		// 	  title: 'Country'
		// 	}
		// 	,value: {
		// 	  title: 'Sales'
		// 	}}
		// };
		renderCallback(renderConfig);
		//　または、データが無い場合のメッセージを表示する
		
		const container = renderConfig.container;
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
		const dataContainer = document.createElement('div');

		// デバッグログ
		console.log('props:', props);
		console.log('buckets:', buckets);
		console.log('data:', data);

		container.innerHTML = ''; // コンテナをクリア

		// データコンテナの高さと幅を設定
		dataContainer.style.height = height + 'px';
		dataContainer.style.width = width + 'px';

		// データコンテナをスクロール可能にする
		dataContainer.style.overflow = 'scroll';

		// データコンテナのクラス名を設定
		dataContainer.className = 'data-container';

		// データコンテナのタイトルを設定
		var titleH1 = document.createElement('h1');
		titleH1.textContent = 'com.shimokado.html_sample';
		dataContainer.appendChild(titleH1);

		var titleH2 = document.createElement('h2');
		titleH2.textContent = 'renderConfigオブジェクトをコンソールに表示しています';
		dataContainer.appendChild(titleH2);

		// データを表示		
		// データコンテナにプロパティ、データバケット、データを表示
		var propsH3 = document.createElement('h3');
		propsH3.textContent = 'renderConfig.properties:';
		dataContainer.appendChild(propsH3);

		var propsContainer = document.createElement('div');
		propsContainer.style.display = 'flex';
		propsContainer.style.alignItems = 'flex-start';
		propsContainer.style.marginBottom = '20px';
		
		var propsTextArea = document.createElement('textarea');
		propsTextArea.value = JSON.stringify(props, null, 2);
		propsTextArea.style.width = '80%';
		propsTextArea.style.height = '200px';
		propsTextArea.style.marginRight = '10px';
		propsTextArea.style.fontFamily = 'monospace';
		propsTextArea.style.fontSize = '12px';
		propsTextArea.readOnly = true;
		
		var propsCopyButton = document.createElement('button');
		propsCopyButton.textContent = 'コピー';
		propsCopyButton.style.padding = '5px 10px';
		propsCopyButton.onclick = function() {
			navigator.clipboard.writeText(propsTextArea.value).then(function() {
				propsCopyButton.textContent = 'コピー済み';
				setTimeout(function() {
					propsCopyButton.textContent = 'コピー';
				}, 2000);
			});
		};
		
		propsContainer.appendChild(propsTextArea);
		propsContainer.appendChild(propsCopyButton);
		dataContainer.appendChild(propsContainer);
		
		var dataBucketsH3 = document.createElement('h3');
		dataBucketsH3.textContent = 'renderConfig.dataBuckets.buckets:';
		dataContainer.appendChild(dataBucketsH3);

		var dataBucketsContainer = document.createElement('div');
		dataBucketsContainer.style.display = 'flex';
		dataBucketsContainer.style.alignItems = 'flex-start';
		dataBucketsContainer.style.marginBottom = '20px';
		
		var dataBucketsTextArea = document.createElement('textarea');
		dataBucketsTextArea.value = JSON.stringify(buckets, null, 2);
		dataBucketsTextArea.style.width = '80%';
		dataBucketsTextArea.style.height = '200px';
		dataBucketsTextArea.style.marginRight = '10px';
		dataBucketsTextArea.style.fontFamily = 'monospace';
		dataBucketsTextArea.style.fontSize = '12px';
		dataBucketsTextArea.readOnly = true;
		
		var dataBucketsCopyButton = document.createElement('button');
		dataBucketsCopyButton.textContent = 'コピー';
		dataBucketsCopyButton.style.padding = '5px 10px';
		dataBucketsCopyButton.onclick = function() {
			navigator.clipboard.writeText(dataBucketsTextArea.value).then(function() {
				dataBucketsCopyButton.textContent = 'コピー済み';
				setTimeout(function() {
					dataBucketsCopyButton.textContent = 'コピー';
				}, 2000);
			});
		};
		
		dataBucketsContainer.appendChild(dataBucketsTextArea);
		dataBucketsContainer.appendChild(dataBucketsCopyButton);
		dataContainer.appendChild(dataBucketsContainer);
		
		var dataH3 = document.createElement('h3');
		dataH3.textContent = 'renderConfig.data:';
		dataContainer.appendChild(dataH3);

		var dataContainerDiv = document.createElement('div');
		dataContainerDiv.style.display = 'flex';
		dataContainerDiv.style.alignItems = 'flex-start';
		dataContainerDiv.style.marginBottom = '20px';
		
		var dataTextArea = document.createElement('textarea');
		dataTextArea.value = JSON.stringify(data, null, 2);
		dataTextArea.style.width = '80%';
		dataTextArea.style.height = '200px';
		dataTextArea.style.marginRight = '10px';
		dataTextArea.style.fontFamily = 'monospace';
		dataTextArea.style.fontSize = '12px';
		dataTextArea.readOnly = true;
		
		var dataCopyButton = document.createElement('button');
		dataCopyButton.textContent = 'コピー';
		dataCopyButton.style.padding = '5px 10px';
		dataCopyButton.onclick = function() {
			navigator.clipboard.writeText(dataTextArea.value).then(function() {
				dataCopyButton.textContent = 'コピー済み';
				setTimeout(function() {
					dataCopyButton.textContent = 'コピー';
				}, 2000);
			});
		};
		
		dataContainerDiv.appendChild(dataTextArea);
		dataContainerDiv.appendChild(dataCopyButton);
		dataContainer.appendChild(dataContainerDiv);

		// データを表示
		container.appendChild(dataContainer);

		renderConfig.renderComplete(); // 必須: レンダリングが完了したことをチャートエンジンに通知します
	}

	var config = {
		id: 'com.shimokado.html_sample',	// エクステンションID
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
			script: ['lib/script.js']
			// css: ['css/style.css']

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
