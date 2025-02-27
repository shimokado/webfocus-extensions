/* Copyright (C) 2025. Shimokado Masataka. All rights reserved. */

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
	}
	
	/**
	 * この拡張機能を描画する必要があるが、まだデータがない場合に呼び出されます（オプション）
	 * @param {Object} renderConfig - 標準のコールバック引数オブジェクト（moonbeamInstance, data, properties, など）
	 */
	function noDataRenderCallback(renderConfig) {
		// サンプルデータとバケットを使用してrenderCallbackを呼び出す
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
		// 	]
		// ];
		// renderConfig.dataBuckets = {
		// 	labels: {
		// 	  title: 'Country'
		// 	}
		// 	,value: {
		// 	  title: 'Sales'
		// 	}
		// };
		// renderCallback(renderConfig);
		//　または、データが無い場合のメッセージを表示する
		var container = d3.select(renderConfig.container);
		container.append('div')
			.attr('class', 'no-data-container')
			.text('No data available.');
		renderConfig.renderComplete();
	}

	/**
	 * 各チャートエンジンの描画サイクルの最初に1回呼び出されます（オプション）
	 * @param {Object} preRenderConfig - 標準のコールバック引数オブジェクト
	 */
	function preRenderCallback(preRenderConfig) {
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

		var props = renderConfig.properties;
		var container = renderConfig.container;
		var data = renderConfig.data;
		var dataBuckets = renderConfig.dataBuckets.buckets;
		var height = renderConfig.height;
		var width = renderConfig.width;
		var dataContainer = document.createElement('div');

		// データコンテナの高さと幅を設定
		dataContainer.style.height = height + 'px';
		dataContainer.style.width = width + 'px';

		// データコンテナをスクロール可能にする
		dataContainer.style.overflow = 'auto';

		// データコンテナのクラス名を設定
		dataContainer.className = 'data-container';

		// データコンテナのタイトルを設定
		dataContainer.innerHTML = '<h1>com.shimokado.params</h1>';
		dataContainer.innerHTML += '<h2>renderConfigオブジェクトをコンソールに表示しています</h2>';


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
				
		dataContainer.innerHTML += '<h3>renderConfig.dataBuckets.buckets:</h3>';
		var dataBucketsTextArea = document.createElement('pre');
		dataBucketsTextArea.textContent = JSON.stringify(dataBuckets, null, 2);
		dataContainer.appendChild(dataBucketsTextArea);

		// データを<table>要素に表示、thにdataBuckets.labels.titleとdataBuckets.values.titleを表示
		dataContainer.innerHTML += '<h3>renderConfig.data:</h3>';
		var table = document.createElement('table');
		var thead = document.createElement('thead');
		var tbody = document.createElement('tbody');
		var tr = document.createElement('tr');

		// create table header

		// dataBuckets.labelsが存在する場合
		if(dataBuckets.labels) {
			// dataBuckets.labels.titleが配列の場合
			if(Array.isArray(dataBuckets.labels.title)) {
				dataBuckets.labels.title.forEach(function(title) {
					var th = document.createElement('th');
					th.textContent = title;
					tr.appendChild(th);
				});
			} else {
				var th = document.createElement('th');
				th.textContent = dataBuckets.labels.title;
				tr.appendChild(th);
			}
		}
		// dataBuckets.valueが存在する場合
		if(dataBuckets.value) {
			// dataBuckets.value.titleが配列の場合
			if(Array.isArray(dataBuckets.value.title)) {
				dataBuckets.value.title.forEach(function(title) {
					var th = document.createElement('th');
					th.textContent = title;
					tr.appendChild(th);
				});
			} else {
				var th = document.createElement('th');
				th.textContent = dataBuckets.value.title;
				tr.appendChild(th);
			}
		}
		// dataBuckets.detailが存在する場合
		if(dataBuckets.detail) {
			// dataBuckets.detail.titleが配列の場合
			if(Array.isArray(dataBuckets.detail.title)) {
				dataBuckets.detail.title.forEach(function(title) {
					var th = document.createElement('th');
					th.textContent = title;
					tr.appendChild(th);
				});
			} else {
				var th = document.createElement('th');
				th.textContent = dataBuckets.detail.title;
				tr.appendChild(th);
			}
		}

		thead.appendChild(tr);
		table.appendChild(thead);
	
		// create table body
		data.forEach(function(d) {
			var tr = document.createElement('tr');
			// labelsが存在する場合
			if(d.labels) {
				// labelsが配列の場合
				if(Array.isArray(d.labels)) {
					d.labels.forEach(function(label) {
						var td = document.createElement('td');
						td.textContent = label;
						tr.appendChild(td);
					});
				} else {
					var td = document.createElement('td');
					td.textContent = d.labels;
					tr.appendChild(td);
				}
			}
			// valueが存在する場合
			if(d.value) {
				// valueが配列の場合
				if(Array.isArray(d.value)) {
					d.value.forEach(function(value) {
						var td = document.createElement('td');
						td.textContent = value;
						tr.appendChild(td);
					});
				} else {
					var td = document.createElement('td');
					td.textContent = d.value;
					tr.appendChild(td);
				}
			}
			// detailが存在する場合
			if(d.detail) {
				// detailが配列の場合
				if(Array.isArray(d.detail)) {
					d.detail.forEach(function(detail) {
						var td = document.createElement('td');
						td.textContent = detail;
						tr.appendChild(td);
					});
				} else {
					var td = document.createElement('td');
					td.textContent = d.detail;
					tr.appendChild(td);
				}
			}

			tbody.appendChild(tr);
		});

		table.appendChild(tbody);
		dataContainer.appendChild(table);
		container.appendChild(dataContainer);

		renderConfig.renderComplete(); // 必須: レンダリングが完了したことをチャートエンジンに通知します
	}

	var config = {
		id: 'com.shimokado.params',	// エクステンションID
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
			script: ['lib/script.js'],
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
