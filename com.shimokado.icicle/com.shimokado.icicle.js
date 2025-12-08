/* Copyright (C) 2025. Shimokado Masataka. All rights reserved. */

(function () {
	// データの正規化を行うヘルパー関数
	function normalizeData(renderConfig) {
		var data = renderConfig.data;
		var depth = renderConfig.dataBuckets.depth;
		var flatData = [];

		// ===== depth に応じたフラット化 =====
		if (depth === 1) {
			// depth=1: data はそのままアイテム配列
			flatData = data.map(function (item) {
				return {
					labels: Array.isArray(item.labels) ? item.labels : [item.labels],
					value: Array.isArray(item.value) ? item.value : [item.value],
					_s: item._s,
					_g: item._g
				};
			});
		} else {
			// depth>1: data は配列の配列
			data.forEach(function (series) {
				if (Array.isArray(series)) {
					series.forEach(function (item) {
						flatData.push({
							labels: Array.isArray(item.labels) ? item.labels : [item.labels],
							value: Array.isArray(item.value) ? item.value : [item.value],
							_s: item._s,
							_g: item._g
						});
					});
				}
			});
		}
		return flatData;
	}

	// 階層データ構築
	function buildHierarchy(data) {
		const root = { name: 'root', children: [] };
		const nodeMap = new Map();

		data.forEach(item => {
			let current = root;
			item.labels.forEach((label, index) => {
				// 同じ階層内で同じ名前のノードを探す
				let existingNode = null;
				if (current.children) {
					existingNode = current.children.find(child => child.name === label);
				}

				if (!existingNode) {
					const node = { name: label, children: [], _s: item._s, _g: item._g };
					current.children.push(node);
					current = node;
				} else {
					current = existingNode;
				}
			});
			// 最後のノードに値を設定（最初のvalueを使用）
			current.value = (current.value || 0) + (item.value[0] || 0);
		});

		// 子供のいないノードのchildrenを削除してleafにする処理はd3.hierarchyが自動でleaf扱いしてくれるが、
		// 明示的にデータをきれいにするなら再帰的にチェックしてもよい。
		// ここではシンプルにd3.hierarchyに任せる。

		return root;
	}

	function initCallback(successCallback, initConfig) {
		successCallback(true);
	}

	function noDataRenderCallback(renderConfig) {
		var chart = renderConfig.moonbeamInstance;
		var props = renderConfig.properties;

		chart.legend.visible = false;

		// ダミーデータ
		var dummyData = [
			{ "labels": ["Category A", "Item 1"], "value": [100] },
			{ "labels": ["Category A", "Item 2"], "value": [150] },
			{ "labels": ["Category B", "Item 3"], "value": [80] },
			{ "labels": ["Category B", "Item 4"], "value": [120] },
			{ "labels": ["Category C", "Item 5"], "value": [200] }
		];

		// ダミーのdataBuckets設定
		renderConfig.dataBuckets = {
			depth: 1,
			buckets: {
				labels: { title: "Labels", count: 2 },
				value: { title: "Value", count: 1 }
			}
		};
		renderConfig.data = dummyData;

		// タイトル等表示（オプション）
		// props.isInteractionDisabled = true;

		renderCallback(renderConfig);
	}

	function preRenderCallback(preRenderConfig) {
	}

	function renderCallback(renderConfig) {
		const chart = renderConfig.moonbeamInstance;
		const container = renderConfig.container;
		const width = renderConfig.width || 800;
		const height = renderConfig.height || 600;

		// コンテナをクリア
		container.innerHTML = '';

		// ツールチップの位置計算用
		if (getComputedStyle(container).position === 'static') {
			container.style.position = 'relative';
		}

		// ===== データ正規化 =====
		const normalizedData = normalizeData(renderConfig);

		// ===== 階層データ構築 =====
		const hierarchicalData = buildHierarchy(normalizedData);

		// ===== SVG作成 =====
		const svg = d3.select(container)
			.append('svg')
			.attr('width', width)
			.attr('height', height);

		// ===== ツールチップ用DIV作成 =====
		// 既存のツールチップがあれば削除（念のため）
		d3.select(container).selectAll('.custom-tooltip').remove();

		const tooltip = d3.select(container)
			.append('div')
			.attr('class', 'custom-tooltip')
			.style('position', 'absolute')
			.style('visibility', 'hidden')
			.style('background-color', 'rgba(0, 0, 0, 0.8)')
			.style('color', '#fff')
			.style('padding', '5px 10px')
			.style('border-radius', '4px')
			.style('font-size', '12px')
			.style('pointer-events', 'none')
			.style('z-index', '1000');

		// ===== パーティションレイアウト (Horizontal Icicle Chart) =====
		// 横向きにするため size([height, width])
		const partition = d3.partition()
			.size([height, width])
			.padding(1);

		const root = d3.hierarchy(hierarchicalData)
			.sum(d => d.value)
			.sort((a, b) => b.value - a.value);

		partition(root);

		// ===== ノード描画 =====
		const nodes = root.descendants();

		const cell = svg.selectAll('g')
			.data(nodes)
			.enter()
			.append('g')
			.attr('transform', d => `translate(${d.y0},${d.x0})`); // yが横(screenX), xが縦(screenY)

		// 長方形
		cell.append('rect')
			.attr('width', d => d.y1 - d.y0)  // 横幅
			.attr('height', d => d.x1 - d.x0) // 高さ
			.attr('fill', d => {
				if (d.depth === 0) return '#f0f0f0'; // Root color
				let ancestor = d;
				while (ancestor.depth > 1) {
					ancestor = ancestor.parent;
				}
				if (ancestor.parent) {
					const index = ancestor.parent.children.indexOf(ancestor);
					return chart.getSeriesAndGroupProperty(index, null, 'color');
				}
				return '#ccc';
			})
			.attr('stroke', '#fff')
			.attr('stroke-width', 1)
			.on('mouseover', function (a, b) {
				// D3 v6+ receives (event, d), v5 receives (d, i)
				let d = b;
				// let evt = a; // event object if needed
				if (!d3.pointer) { // v5 or older detection
					d = a;
					// evt = d3.event;
				}

				if (!d) return;

				// ハイライト
				d3.select(this).attr('opacity', 0.8);

				// コンテンツ生成
				let current = d;
				const path = [];
				while (current.depth > 0) {
					path.unshift(current.data.name);
					current = current.parent;
				}
				const fullLabel = path.join(' > ') || 'Root';
				const value = d.value;

				let formattedValue = value;
				if (chart.formatNumber && typeof chart.formatNumber === 'function') {
					formattedValue = chart.formatNumber(value, '#,###');
				} else {
					formattedValue = value.toLocaleString();
				}

				// DataBucketからタイトルの取得
				let valueTitle = 'Value';
				if (renderConfig.dataBuckets && renderConfig.dataBuckets.buckets && renderConfig.dataBuckets.buckets.value && renderConfig.dataBuckets.buckets.value.title) {
					const title = renderConfig.dataBuckets.buckets.value.title;
					valueTitle = Array.isArray(title) ? title[0] : title;
				}

				tooltip.html(`<strong>${fullLabel}</strong><br>${valueTitle}: ${formattedValue}`)
					.style('visibility', 'visible');
			})
			.on('mousemove', function (a, b) {
				let evt = a;
				if (!d3.pointer) { // v5 check
					evt = d3.event;
				}

				let mouseX, mouseY;
				if (d3.pointer) {
					[mouseX, mouseY] = d3.pointer(evt, container);
				} else {
					[mouseX, mouseY] = d3.mouse(container);
				}

				tooltip
					.style('top', (mouseY + 10) + 'px')
					.style('left', (mouseX + 20) + 'px');
			})
			.on('mouseout', function () {
				d3.select(this).attr('opacity', 1);
				tooltip.style('visibility', 'hidden');
			});

		// ラベル
		cell.append('text')
			.attr('x', 4)
			.attr('y', 13) // 少し調整
			.attr('dy', '.35em')
			.attr('fill', '#000')
			.attr('font-size', '12px')
			.attr('font-family', 'sans-serif')
			.text(d => d.data.name)
			.style('pointer-events', 'none') // テキストがマウスイベントを邪魔しないようにする
			.each(function (d) {
				// 横向きなので width/height の判定も逆に
				const rectWidth = d.y1 - d.y0;
				const rectHeight = d.x1 - d.x0;
				const textWidth = this.getBBox().width;
				const textHeight = this.getBBox().height;

				if (textWidth > rectWidth - 4 || textHeight > rectHeight - 2) {
					d3.select(this).style('display', 'none');
				} else {
					// 垂直方向の中央揃え
					d3.select(this).attr('y', (rectHeight / 2));
				}
			});

		// ===== データ選択対応 =====
		cell.select('rect')
			.attr('class', (d, i) => chart.buildClassName('riser', 0, 0, 'rect'));

		renderConfig.renderComplete();
	}

	var config = {
		id: 'com.shimokado.icicle',
		containerType: 'html',
		initCallback: initCallback,
		preRenderCallback: preRenderCallback,
		renderCallback: renderCallback,
		noDataRenderCallback: noDataRenderCallback,
		resources: {
			script: [
				function (callbackArg) {
					return callbackArg.properties.external_library;
				}
			],
			css: ['css/style.css']
		},
		modules: {
			dataSelection: {
				supported: true,
				needSVGEventPanel: true,
				svgNode: function (arg) { }
			},
			eventHandler: {
				supported: true
			},
			tooltip: {
				supported: true,
				autoContent: function (target, s, g, d) {
					// d3のdatumが渡ってくるはず
					if (!d || !d.data) return "No Data";

					let current = d;
					const path = [];
					while (current.depth > 0) {
						path.unshift(current.data.name);
						current = current.parent;
					}
					return `${path.join(' > ')}: ${d.value}`;
				}
			}
		}
	};

	tdgchart.extensionManager.register(config);
}());

