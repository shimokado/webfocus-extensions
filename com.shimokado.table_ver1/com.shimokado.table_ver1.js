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
		renderConfig.data= [
			  {
				"labels": 'ENGLAND'
			   ,"value": 37853
			  }
			 ,{
				"labels": 'FRANCE'
			   ,"value": 4631
			 }
		];
		renderConfig.dataBuckets = {
			buckets: {
			labels: {
			  title: 'Country'
			}
			,value: {
			  title: 'Sales'
			}}
		};
		renderCallback(renderConfig);
		//　または、データが無い場合のメッセージを表示する
		
		//const container = renderConfig.container;
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
	 * テーブル全体にプロパティベースのスタイルを適用
	 * @param {HTMLElement} table - テーブル要素
	 * @param {Object} props - プロパティオブジェクト
	 */
	function applyTableStyles(table, props) {
		if (props.tableStyle) {
			if (props.tableStyle.fontSize) {
				table.style.fontSize = props.tableStyle.fontSize;
			}
			if (props.tableStyle.color) {
				table.style.color = props.tableStyle.color;
			}
			if (props.tableStyle.fontFamily) {
				table.style.fontFamily = props.tableStyle.fontFamily;
			}
			if (props.tableStyle.fontWeight) {
				table.style.fontWeight = props.tableStyle.fontWeight;
			}
		}
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

		container.innerHTML = ''; // コンテナをクリア

		// データコンテナの高さと幅を設定
		dataContainer.style.height = height + 'px';
		dataContainer.style.width = width + 'px';

		// データコンテナをスクロール可能にする
		dataContainer.style.overflow = 'scroll';

		// データコンテナのクラス名を設定
		dataContainer.className = 'data-container';

		// データコンテナのタイトルを設定
		dataContainer.innerHTML = '<h1>夢の縦結合</h1>';


		// バケットが存在しない場合は空の配列を返し、存在する場合は常に配列を返す
		const labelsTitles = buckets.labels ? (buckets.labels.count === 1 ? [buckets.labels.title] : buckets.labels.title) : [];
		const labelsFieldNames = buckets.labels ? (buckets.labels.count === 1 ? [buckets.labels.fieldName] : buckets.labels.fieldName) : [];
		const valueTitles = buckets.value ? (buckets.value.count === 1 ? [buckets.value.title] : buckets.value.title) : [];
		const valueFieldNames = buckets.value ? (buckets.value.count === 1 ? [buckets.value.fieldName] : buckets.value.fieldName) : [];
		const valueNumberFormats = buckets.value ? (buckets.value.count === 1 ? [buckets.value.numberFormat] : buckets.value.numberFormat) : [];
		const detailTitles = buckets.detail ? (buckets.detail.count === 1 ? [buckets.detail.title] : buckets.detail.title) : [];

		// dataの配列内でもlabels, value, detailが存在しない場合と配列でない場合があるため、それを配列に変換する
		const datas = data.map(function(d) {
			return {
				labels: d.labels !== undefined ? (Array.isArray(d.labels) ? d.labels : [d.labels]) : [],
				value: d.value !== undefined ? (Array.isArray(d.value) ? d.value : [d.value]) : [],
				detail: d.detail !== undefined ? (Array.isArray(d.detail) ? d.detail : [d.detail]) : []
			};
		});


		// table要素を作成
		const table = document.createElement('table');
		table.className = 'data-table';
		
		// テーブル全体にプロパティベースのスタイルを適用
		applyTableStyles(table, props);
		// thead要素を作成
		const thead = document.createElement('thead');
		// tr要素を作成
		const tr = document.createElement('tr');
		// th要素を作成(labesTitles, valueTitles, detailTitlesの数だけ作成)
		labelsTitles.forEach(function(title) {
			const th = document.createElement('th');
			th.textContent = title;
			tr.appendChild(th);
		});
		valueTitles.forEach(function(title) {
			const th = document.createElement('th');
			th.textContent = title;
			tr.appendChild(th);
		});
		detailTitles.forEach(function(title) {
			const th = document.createElement('th');
			th.textContent = title;
			tr.appendChild(th);
		});
		thead.appendChild(tr);
		table.appendChild(thead);

		// tbody要素を作成
		const tbody = document.createElement('tbody');
		
		// rowspan処理のためにデータを事前解析
		// rowspanの計算情報を保持する配列
		const rowspanInfo = [];
		
		// ラベルの列数を取得
		const labelColumnCount = labelsTitles.length;
		
		// 各ラベル列のrowspan情報を計算
		for (let colIndex = 0; colIndex < labelColumnCount; colIndex++) {
			rowspanInfo[colIndex] = [];
			
			// 各行のラベルを調査
			let currentValue = null;
			let currentStartIndex = 0;
			let rowspanCount = 0;
			
			for (let rowIndex = 0; rowIndex < datas.length; rowIndex++) {
				const currentRowValue = datas[rowIndex].labels[colIndex];
				
				// 上位のラベルがすべて同じ場合のみ結合対象とする（2列目以降の処理）
				let canMerge = true;
				if (colIndex > 0) {
					// 上位のすべての列で値が同じかチェック
					for (let prevCol = 0; prevCol < colIndex; prevCol++) {
						if (rowIndex > 0 && datas[rowIndex].labels[prevCol] !== datas[rowIndex - 1].labels[prevCol]) {
							canMerge = false;
							break;
						}
					}
				}
				
				// 結合条件の評価
				if (!canMerge || currentValue !== currentRowValue || rowIndex === datas.length - 1) {
					// 値が変わった、または最終行に達した場合
					if (rowspanCount > 1) {
						// 同じ値が複数行続いた場合、rowspanを設定
						rowspanInfo[colIndex][currentStartIndex] = rowspanCount;
					}
					
					// 最終行の処理（最終行も同じ値が続いていた場合）
					if (rowIndex === datas.length - 1 && currentValue === currentRowValue && canMerge) {
						// 最終行も含めて計算
						rowspanCount++;
						if (rowspanCount > 1) {
							rowspanInfo[colIndex][currentStartIndex] = rowspanCount;
						}
					} else {
						// 新しい値でカウント開始
						currentValue = currentRowValue;
						currentStartIndex = rowIndex;
						rowspanCount = 1;
					}
				} else {
					// 値が同じ場合はカウントを増やす
					rowspanCount++;
				}
			}
		}
		
		// データを元にtr要素を作成
		for (let rowIndex = 0; rowIndex < datas.length; rowIndex++) {
			const d = datas[rowIndex];
			const tr = document.createElement('tr');
			
			// labelsを元にtd要素を作成（必要に応じてrowspanを設定）
			for (let colIndex = 0; colIndex < d.labels.length; colIndex++) {
				// 前の行で結合されたセルがある場合はスキップ
				let skipCell = false;
				
				// 上位のラベルがすべて同じ場合のみ結合対象とする（2列目以降の処理）
				let canMerge = true;
				if (colIndex > 0 && rowIndex > 0) {
					// 上位のすべての列で値が同じかチェック
					for (let prevCol = 0; prevCol < colIndex; prevCol++) {
						if (d.labels[prevCol] !== datas[rowIndex - 1].labels[prevCol]) {
							canMerge = false;
							break;
						}
					}
				}
				
				if (canMerge && rowIndex > 0 && colIndex < rowspanInfo.length) {
					// 前の行との比較
					for (let prevRowIndex = rowIndex - 1; prevRowIndex >= 0; prevRowIndex--) {
						// rowspanが設定されている場合
						if (rowspanInfo[colIndex][prevRowIndex] && 
							rowIndex < prevRowIndex + rowspanInfo[colIndex][prevRowIndex] &&
							d.labels[colIndex] === datas[prevRowIndex].labels[colIndex]) {
							skipCell = true;
							break;
						}
					}
				}
				
				if (!skipCell) {
					const td = document.createElement('td');
					
					// rowspanの設定（必要な場合のみ）
					if (rowspanInfo[colIndex][rowIndex]) {
						td.rowSpan = rowspanInfo[colIndex][rowIndex];
					}
					
					// 常にすべてのセル内容をdivで囲む（rowspanの有無にかかわらず）
					const div = document.createElement('div');
					div.textContent = d.labels[colIndex];
					td.appendChild(div);
					
					tr.appendChild(td);
				}
			}
			
			// valueを元にtd要素を作成
			d.value.forEach(function(value, i) {
				const td = document.createElement('td');
				td.textContent = value ?? ' ';
				if (valueNumberFormats[i]) {
					td.style.textAlign = 'right';
					td.style.paddingRight = '10px';
					// 数値フォーマットを適用(moonbeamInstanceには、このように便利な関数が用意されている)
					td.textContent = renderConfig.moonbeamInstance.formatNumber(value, valueNumberFormats[i]);
				}
				tr.appendChild(td);
			});
			
			// detailを元にtd要素を作成
			d.detail.forEach(function(detail) {
				const td = document.createElement('td');
				td.textContent = detail;
				tr.appendChild(td);
			});
			
			tbody.appendChild(tr);
		}
		table.appendChild(tbody);
		dataContainer.appendChild(table);

		// データを表示
		container.appendChild(dataContainer);

		renderConfig.renderComplete(); // 必須: レンダリングが完了したことをチャートエンジンに通知します
	}

	var config = {
		id: 'com.shimokado.table_ver1',	// エクステンションID
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
