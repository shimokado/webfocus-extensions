/* Copyright (C) 2025. Shimokado Masataka. All rights reserved. */

(function() {
	function initCallback(successCallback, initConfig) {
		successCallback(true);
	}

	function noDataPreRenderCallback(preRenderConfig) {
	}

	function noDataRenderCallback(renderConfig) {
	}

	function preRenderCallback(preRenderConfig) {
	}

	function renderCallback(renderConfig) {
		const chart = renderConfig.moonbeamInstance;
		const container = renderConfig.container;
		const data = renderConfig.data;
		const dataBuckets = renderConfig.dataBuckets;
		const width = renderConfig.width || 800;
		const height = renderConfig.height || 600;

		// コンテナをクリア
		container.innerHTML = '';

		// ===== データ正規化 =====
		// labels と value を常に配列に統一
		var normalizedData = [];
		if (dataBuckets.depth === 1) {
			normalizedData = data.map(function(item) {
				return {
					labels: Array.isArray(item.labels) ? item.labels : [item.labels],
					value: Array.isArray(item.value) ? item.value : [item.value]
				};
			});
		} else {
			data.forEach(function(series) {
				if (Array.isArray(series)) {
					series.forEach(function(item) {
						normalizedData.push({
							labels: Array.isArray(item.labels) ? item.labels : [item.labels],
							value: Array.isArray(item.value) ? item.value : [item.value]
						});
					});
				}
			});
		}

		// ===== ツリーマップ用の階層データ構築 =====
		// labels の個数に応じて階層を構築
		function buildHierarchy(data) {
			const root = { name: 'root', children: [] };
			const nodeMap = new Map();

			data.forEach(item => {
				let current = root;
				item.labels.forEach((label, index) => {
					if (!nodeMap.has(label)) {
						const node = { name: label, children: [] };
						nodeMap.set(label, node);
						current.children.push(node);
					}
					current = nodeMap.get(label);
				});
				// 最後のノードに値を設定（最初のvalueを使用）
				current.value = item.value[0] || 0;
				// 子を持たないノードはchildrenを削除
				if (current.children.length === 0) {
					delete current.children;
				}
			});

			return root;
		}

		const hierarchicalData = buildHierarchy(normalizedData);

		// ===== SVG作成 =====
		const svg = d3.select(container)
			.append('svg')
			.attr('width', width)
			.attr('height', height);

		// ===== ツリーマップレイアウト =====
		const treemap = d3.treemap()
			.size([width, height])
			.padding(1);

		const root = d3.hierarchy(hierarchicalData)
			.sum(d => d.value)
			.sort((a, b) => b.value - a.value);

		treemap(root);

		// ===== 色スケール =====
		const color = d3.scaleOrdinal(d3.schemeCategory10);

		// ===== ノード描画 =====
		const node = svg.selectAll('g')
			.data(root.leaves())
			.enter()
			.append('g')
			.attr('transform', d => `translate(${d.x0},${d.y0})`);

		// 長方形
		node.append('rect')
			.attr('width', d => d.x1 - d.x0)
			.attr('height', d => d.y1 - d.y0)
			.attr('fill', d => color(d.parent.data.name))
			.attr('stroke', '#fff')
			.attr('stroke-width', 1)
			// ツールチップ設定
			.attr('tdgtitle', d => `${d.data.name}: ${chart.formatNumber(d.value, '#,###')}`);

		// ラベル
		node.append('text')
			.attr('x', 4)
			.attr('y', 14)
			.attr('fill', '#000')
			.attr('font-size', '12px')
			.attr('font-family', 'sans-serif')
			.text(d => d.data.name)
			// テキストが長方形に収まるように調整
			.each(function(d) {
				const text = d3.select(this);
				const rectWidth = d.x1 - d.x0;
				const rectHeight = d.y1 - d.y0;
				let fontSize = 12;

				// フォントサイズを調整
				while (text.node().getBBox().width > rectWidth - 8 || text.node().getBBox().height > rectHeight - 4) {
					fontSize -= 1;
					if (fontSize < 8) break;
					text.attr('font-size', fontSize + 'px');
				}

				// 中央に配置
				const bbox = text.node().getBBox();
				text.attr('x', (rectWidth - bbox.width) / 2)
					.attr('y', (rectHeight + bbox.height) / 2);
			});

		// ===== データ選択対応 =====
		node.select('rect')
			.attr('class', d => chart.buildClassName('riser', d.parent ? d.parent.children.indexOf(d) : 0, 0));

		renderConfig.renderComplete();
	}

	var config = {
		id: 'com.shimokado.d3_sample',
		containerType: 'html',
		initCallback: initCallback,
		preRenderCallback: preRenderCallback,
		renderCallback: renderCallback,
		noDataPreRenderCallback: noDataPreRenderCallback,
		noDataRenderCallback: noDataRenderCallback,
		resources: {
			script: [
				// コールバック関数を使用して動的に読み込む外部ライブラリを定義する例
				// callbackArgは'properties'を含む標準のコールバック引数オブジェクトです
				// これはライブラリ読み込み時に呼び出されるため、チャートインスタンスはまだ利用できません
				function(callbackArg) {
					return callbackArg.properties.external_library;
				}
			],
			css: ['css/style.css']
		},
		modules: {
			dataSelection: {
				supported: true,
				needSVGEventPanel: true,
				svgNode: function(arg){}
			},
			eventHandler: {
				supported: true
			},
			tooltip: {
				supported: true,
				autoContent: function(target, s, g, d) {
					return d.labels + ': ' + d.value;
				}
			}
		}
	};

	tdgchart.extensionManager.register(config);
}());

