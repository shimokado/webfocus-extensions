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
	 * データを正規化する関数
	 * @param {Object} renderConfig - renderConfigオブジェクト
	 * @returns {Object} 正規化されたデータ
	 */
	function normalizeData(renderConfig) {
		const dataBuckets = renderConfig.dataBuckets;
		const buckets = dataBuckets.buckets;
		let data = renderConfig.data;

		// buckets を常に配列に統一
		const labelsCount = buckets.labels ? buckets.labels.count : 0;
		const labelsTitles = buckets.labels 
			? (labelsCount === 1 ? [buckets.labels.title] : buckets.labels.title) 
			: [];
		const valueTitles = buckets.value 
			? (buckets.value.count === 1 ? [buckets.value.title] : buckets.value.title) 
			: [];

		// data を統一形式に変換
		let flatData = [];
		if (dataBuckets.depth === 1) {
			flatData = data.map(function(item) {
				return {
					labels: Array.isArray(item.labels) ? item.labels : [item.labels],
					value: Array.isArray(item.value) ? item.value : [item.value]
				};
			});
		} else {
			data.forEach(function(series) {
				if (Array.isArray(series)) {
					series.forEach(function(item) {
						flatData.push({
							labels: Array.isArray(item.labels) ? item.labels : [item.labels],
							value: Array.isArray(item.value) ? item.value : [item.value]
						});
					});
				}
			});
		}

		return {
			labelsTitles: labelsTitles,
			valueTitles: valueTitles,
			data: flatData
		};
	}

	/**
	 * 階層データを構築する関数
	 * @param {Array} data - 正規化されたデータ
	 * @param {Array} labelsTitles - ラベルタイトル
	 * @returns {Object} 階層データ
	 */
	function buildHierarchy(data, labelsTitles) {
		const root = { name: 'root', children: [] };

		data.forEach(item => {
			let current = root;
			item.labels.forEach((label, index) => {
				let child = current.children.find(c => c.name === label);
				if (!child) {
					child = { name: label, children: [] };
					current.children.push(child);
				}
				current = child;
			});
			current.value = item.value[0] || 0;
			// リーフノードなのでchildrenを削除
			if (current.children.length === 0) {
				delete current.children;
			}
		});

		return root;
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
		const normalizedData = normalizeData(renderConfig);
		console.log('normalizedData:', normalizedData);

		// 階層データを構築
		const hierarchicalData = buildHierarchy(normalizedData.data, normalizedData.labelsTitles);
		console.log('hierarchicalData:', hierarchicalData);

		// SVG要素を作成（凡例用のスペースを確保）
		const svgWidth = width + 140; // チャート幅 + 凡例幅
		const svgHeight = height;
		const svg = d3.select(container)
			.append('svg')
			.attr('width', svgWidth)
			.attr('height', svgHeight);

		const radius = Math.min(width, height) / 2;

		// パーティションレイアウト
		const partition = d3.partition()
			.size([2 * Math.PI, radius]);

		// 階層データを作成
		const root = d3.hierarchy(hierarchicalData)
			.sum(d => d.value)
			.sort((a, b) => b.value - a.value);

		partition(root);

		// 総計を計算
		const totalValue = root.value;

		// レベル1の色スケール（濃い色を使用）
		const level1ColorScale = d3.scaleOrdinal(d3.schemeSet1);

		// レベル1の項目を取得
		const level1Items = root.children.map(d => d.data.name);

		// レベル1の色を割り当て
		const level1Colors = {};
		level1Items.forEach((name, index) => {
			level1Colors[name] = level1ColorScale(index % level1ColorScale.range().length);
		});

		// レベルごとの色生成関数
		function getColor(d) {
			const level1Ancestor = d.ancestors().find(a => a.depth === 1);
			if (!level1Ancestor) return '#ccc'; // フォールバック

			const level1Color = level1Colors[level1Ancestor.data.name];
			const depth = d.depth;

			if (depth === 1) {
				return level1Color;
			} else {
				// レベル2以降はレベル1の色をベースにバリエーションを作成
				const baseColor = d3.rgb(level1Color);
				const variation = (depth - 1) * 0.3; // 深さによって変化量を増やす

				// HSL色空間で調整
				const hsl = d3.hsl(baseColor);
				hsl.s = Math.max(0.1, hsl.s - variation * 0.2); // 彩度を下げる
				hsl.l = Math.min(0.9, Math.max(0.1, hsl.l + variation * 0.1)); // 明度を調整

				// 同じレベル内で少しずつ色をずらす
				const siblings = level1Ancestor.children;
				const siblingIndex = siblings.indexOf(d.parent || d);
				const hueShift = (siblingIndex / siblings.length) * 30; // 最大30度の色相シフト
				hsl.h = (hsl.h + hueShift) % 360;

				return hsl.toString();
			}
		}

		// アークジェネレーター
		const arc = d3.arc()
			.startAngle(d => d.x0)
			.endAngle(d => d.x1)
			.innerRadius(d => d.y0)
			.outerRadius(d => d.y1);

		// パスを描画
		const path = svg.append('g')
			.attr('transform', `translate(${width / 2},${height / 2})`)
			.selectAll('path')
			.data(root.descendants().filter(d => d.depth > 0)) // root以外
			.enter()
			.append('path')
			.attr('d', arc)
			.style('fill', getColor)
			.style('stroke', '#fff')
			.style('stroke-width', 1)
			// WebFOCUSツールチップ（tdgtitle属性）とSVG title要素の両方を使用
			.attr('tdgtitle', d => {
				const path = d.ancestors().map(a => a.data.name).slice(1).reverse().join(' > ');
				const currentItem = d.data.name; // ホバーした現在の項目
				const percentage = ((d.value / totalValue) * 100).toFixed(1);
				return `項目: ${currentItem}\nパス: ${path}\n値: ${d.value}\n割合: ${percentage}%`;
			})
			.append('title')
			.text(d => {
				const path = d.ancestors().map(a => a.data.name).slice(1).reverse().join(' > ');
				const currentItem = d.data.name; // ホバーした現在の項目
				const percentage = ((d.value / totalValue) * 100).toFixed(1);
				return `項目: ${currentItem}\nパス: ${path}\n値: ${d.value}\n割合: ${percentage}%`;
			});

		// 凡例を追加（レベル1の項目のみ）- チャートの右側に配置
		const legendX = width / 2 + radius + 20; // チャートの中心 + 半径 + マージン
		const legend = svg.append('g')
			.attr('transform', `translate(${legendX}, 20)`);

		const legendItems = legend.selectAll('.legend-item')
			.data(level1Items)
			.enter()
			.append('g')
			.attr('class', 'legend-item')
			.attr('transform', (d, i) => `translate(0, ${i * 20})`);

		// 凡例の色付き四角
		legendItems.append('rect')
			.attr('width', 15)
			.attr('height', 15)
			.style('fill', d => level1Colors[d])
			.style('stroke', '#fff')
			.style('stroke-width', 1);

		// 凡例のテキスト
		legendItems.append('text')
			.attr('x', 20)
			.attr('y', 12)
			.style('font-size', '12px')
			.style('font-family', 'sans-serif')
			.style('fill', '#333')
			.text(d => d);
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
			script: ['https://d3js.org/d3.v5.min.js'],
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
					if (d && d.ancestors) {
						// サンバーストチャートの場合
						const path = d.ancestors().map(a => a.data.name).slice(1).reverse().join(' > ');
						const currentItem = d.data.name; // ホバーした現在の項目
						const totalValue = d.ancestors()[0].value; // rootの値
						const percentage = ((d.value / totalValue) * 100).toFixed(1);
						return `項目: ${currentItem}<br>パス: ${path}<br>値: ${d.value}<br>割合: ${percentage}%`;
					} else {
						// フォールバック
						return Array.isArray(d.labels) ? d.labels.join(' > ') : (d.labels || '') + ': ' + (d.value || '');
					}
				}
			}
		}
	};

	// 必須: この呼び出しにより拡張機能がチャートエンジンに登録されます
	tdgchart.extensionManager.register(config);
}());
