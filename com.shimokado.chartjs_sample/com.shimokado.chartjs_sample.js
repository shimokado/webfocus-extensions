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
		// サンプルデータとバケットを使用してrenderCallbackを呼び出す
		renderConfig.data= [
			[
			  [
				'ENGLAND'
			   ,37853
			  ]
			 ,[
				'FRANCE'
			   ,4631
			  ]
			]
		];
		renderConfig.dataBuckets = {
			labels: {
			  title: 'Country'
			}
			,value: {
			  title: 'Sales'
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

		// const props = renderConfig.properties; // 実行プログラムでセットされているプロパティ
		const container = renderConfig.container; // 出力先のコンテナ
		const data = renderConfig.data; // WebFOCUSが出力したデータ
		const dataBuckets = renderConfig.dataBuckets; // データバケット
		const buckets = dataBuckets.buckets; // バケットの配列
		// const height = renderConfig.height; // 領域の高さ
		// const width = renderConfig.width; // 領域の幅

		container.innerHTML = ''; // コンテナをクリア

		// chart.jsの場合はcanvas要素を作成して、それをコンテナに追加する
		const canvas = document.createElement('canvas');

		//canvasに ct クラス
		canvas.classList.add('ct'); // chart.jsのスタイルを適用するためのクラスを追加

		// chart.js用の配列の持ち方に変換

		// data配列のオブジェクトからlabelsプロパティの値を取り出して配列に格納
		const labels = data.map(function(d) {
			return d.labels;
		});

		// data配列のオブジェクトからvalueプロパティの値を取り出して配列に格納
		const values = data.map(function(d) {
			return d.value;
		});

		// chart.jsのバーを描画
		new Chart(canvas, {
		  type: 'bar',
		  data: {
			labels: labels,
			datasets: [{
			  label: buckets.value.title,
			  data: values
			}]
		  }
		});

		container.appendChild(canvas);

		renderConfig.renderComplete(); // 必須: レンダリングが完了したことをチャートエンジンに通知します
	}

	var config = {
		id: 'com.shimokado.chartjs_sample',	// エクステンションID
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
					return d.labels + ': ' + d.value; // 単純な文字列を返す
				}
			}
		}
	};

	// 必須: この呼び出しにより拡張機能がチャートエンジンに登録されます
	tdgchart.extensionManager.register(config);
}());
