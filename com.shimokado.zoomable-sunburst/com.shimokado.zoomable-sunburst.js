/* Copyright (C) 2025. Shimokado Masataka. All rights reserved. */

(function() {
	function initCallback(successCallback, initConfig) {
		successCallback(true);
	}

	function noDataPreRenderCallback(preRenderConfig) {
		// コンテナを初期化
		if (preRenderConfig.container) {
			d3.select(preRenderConfig.container).selectAll("*").remove();
		}
	}

	function noDataRenderCallback(renderConfig) {
		// データがない場合の処理
		var container = renderConfig.container;
		var width = Math.min(renderConfig.width, renderConfig.height);
		var height = width;
		// データが無いメッセージを表示
		d3.select(container).append("div")
			.style("width", width + "px")
			.style("height", height + "px")
			.style("display", "flex")
			.style("align-items", "center")
			.style("justify-content", "center")
			.text("No data available");
	}

	function preRenderCallback(preRenderConfig) {
		 // クリーンアップ - 既存のトランジションをキャンセル
		if (preRenderConfig.container) {
			d3.select(preRenderConfig.container)
				.selectAll("*")
				.interrupt() // 実行中のトランジションを中断
				.remove();
		}
	}

	function renderCallback(renderConfig) {
		// グラフが描画済みの場合は再描画しない
		if (renderConfig.container && d3.select(renderConfig.container).select("svg").size() > 0) {
			renderConfig.renderComplete();
			return;
		}

		// Basic validation
		if (!renderConfig || !renderConfig.moonbeamInstance || !renderConfig.container) {
			console.error('Invalid render configuration');
			if (renderConfig && typeof renderConfig.renderComplete === 'function') {
				renderConfig.renderComplete();
			}
			return;
		 }

		 // クリーンアップ - 既存のトランジションと要素を確実に削除
		const container = d3.select(renderConfig.container);
		container.selectAll("*")
			.interrupt() // 実行中のトランジションを中断
			.remove();

		// Data validation
		const data = renderConfig.data || [];
		if (!Array.isArray(data) || data.length === 0) {
			noDataRenderCallback(renderConfig);
			renderConfig.renderComplete();
			return;
		}

		// Validate data structure
		const isValidData = data.every(d => 
			d && Array.isArray(d.labels) && 
			d.labels.length > 0 && 
			d.labels.every(label => label !== null && label !== undefined) &&
			typeof d.value === 'number' && !isNaN(d.value)
		);

		if (!isValidData) {
			console.error('Invalid data structure');
			noDataRenderCallback(renderConfig);
			renderConfig.renderComplete();
			return;
		}

		try {
			const chart = renderConfig.moonbeamInstance;
			const container = renderConfig.container;
			const width = Math.min(renderConfig.width, renderConfig.height);
			const height = width;
			const radius = width / 6;

			// Transform the flat data into hierarchical format
			const hierarchicalData = {
				name: "root",
				children: {}
			};

			// Normalize and transform data
			data.forEach(d => {
				try {
					let current = hierarchicalData;
					const normalizedLabels = d.labels.map(label => String(label).trim());
					normalizedLabels.forEach((label, i) => {
						if (!current.children[label]) {
							current.children[label] = {
								name: label,
								children: {}
							};
						}
						current = current.children[label];
						
						if (i === normalizedLabels.length - 1) {
							current.value = Math.max(0, Number(d.value) || 0); // Ensure non-negative numbers
							delete current.children;
						}
					});
				} catch (err) {
					console.warn('Error processing data row:', err);
				}
			});

			// Convert object children to arrays
			function convertToArray(node) {
				if (node.children) {
					node.children = Object.values(node.children).map(convertToArray);
				}
				return node;
			}
			const hierarchyData = convertToArray(hierarchicalData);

			// Create color scale
			const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, Object.keys(hierarchicalData.children).length + 1));

			// Create hierarchy and partition layout
			const hierarchy = d3.hierarchy(hierarchyData)
				.sum(d => d.value)
				.sort((a, b) => b.value - a.value);
			const root = d3.partition()
				.size([2 * Math.PI, hierarchy.height + 1])
				(hierarchy);
			root.each(d => d.current = d);

			// Create the arc generator
			const arc = d3.arc()
				.startAngle(d => d.x0)
				.endAngle(d => d.x1)
				.padAngle(d => {
						// より穏やかな間隔の増加
						const baseGap = 0.02;
						return Math.min((d.x1 - d.x0) / 2, baseGap * (1 + d.y0 * 0.3));
					})
				.padRadius(radius * 2)
				.innerRadius(d => {
					// より穏やかな間隔の増加
					const gap = d.y0 === 0 ? 0 : 3 + Math.min(d.y0 * 1.5, 4);
					return d.y0 * radius + gap;
				})
				.outerRadius(d => {
					// より穏やかな間隔の増加
					const gap = 4 + Math.min(d.y0 * 1.5, 4);
					return Math.max(d.y0 * radius, d.y1 * radius - gap);
				});

			// Create SVG container
			const svg = d3.select(container)
				.append("svg")
				.attr("viewBox", [-width / 2, -height / 2, width, width])
				.style("font", "12pt sans-serif");  // フォントサイズを12ptに変更

			// Append the arcs
			const path = svg.append("g")
				.selectAll("path")
				.data(root.descendants().slice(1))
				.join("path")
				.attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
				.attr("fill-opacity", d => arcVisible(d.current) ? 
					(0.95 - (d.depth * 0.1)) : 0)  // 階層が深くなるほど少し透明に
				.attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
				.attr("d", d => arc(d.current));

			// Make them clickable if they have children
			path.filter(d => d.children)
				.style("cursor", "pointer")
				.on("click", clicked);

			const format = d3.format(",d");
			path.append("title")
				.text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

			// Add labels
			const label = svg.append("g")
				.attr("pointer-events", "none")
				.attr("text-anchor", "middle")
				.style("user-select", "none")
				.style("font-size", "12pt")  // ラベルのフォントサイズを明示的に12ptに設定
				.selectAll("text")
				.data(root.descendants().slice(1))
				.join("text")
				.attr("dy", "0.35em")
				.attr("fill-opacity", d => +labelVisible(d.current))
				.attr("transform", d => labelTransform(d.current))
				.text(d => d.data.name);

			// Add the center circle for returning to parent
			const parent = svg.append("circle")
				.datum(root)
				.attr("r", radius)
				.attr("fill", "white")
				.attr("pointer-events", "all")
				.on("click", clicked);

			// Add center text for showing the current path
			const centerText = svg.append("text")
				.attr("text-anchor", "middle") // 中央揃え
				.attr("dy", "0.35em") // 垂直方向の位置調整
				.attr("fill-opacity", 0) // 最初は非表示
				.style("font-size", "12pt") // フォントサイズを12ptに変更
				.attr("pointer-events", "none") // イベントを受け付けない

			// 状態を初期化
			let currentTransition = null;
			let isTransitioning = false;

			function clicked(event, p) {
				// 実行中のトランジションがあればキャンセル
				if (isTransitioning) {
					if (currentTransition) {
						currentTransition.interrupt();
					}
					path.interrupt();
					label.interrupt();
				}

				parent.datum(p.parent || root);

				isTransitioning = true;
				let animationCount = 0;
				const totalAnimations = 2;

				const checkComplete = () => {
					animationCount++;
					if (animationCount >= totalAnimations) {
						isTransitioning = false;
						renderConfig.renderComplete();
					}
				};

				root.each(d => d.target = {
					x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
					x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
					y0: Math.max(0, d.y0 - p.depth),
					y1: Math.max(0, d.y1 - p.depth)
				});

				currentTransition = svg.transition()
					.duration(375)
					.ease(d3.easeCubicInOut)
					.on("end", () => {
						currentTransition = null;
					})
					.on("interrupt", () => {
						currentTransition = null;
						isTransitioning = false;
						checkComplete();
					});

				// Update paths with error handling
				path.each(function(d) {
					try {
						d3.select(this)
							.transition(currentTransition)
							.tween("data", d => {
								const i = d3.interpolate(d.current, d.target);
								return t => d.current = i(t);
							})
							.filter(function(d) {
								return +this.getAttribute("fill-opacity") || arcVisible(d.target);
							})
							.attr("fill-opacity", d => arcVisible(d.target) ? (0.95 - (d.depth * 0.1)) : 0)
							.attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")
							.attrTween("d", d => () => arc(d.current))
							.on("end", checkComplete)
							.on("interrupt", checkComplete);
					} catch (err) {
						console.warn('Path transition error:', err);
						checkComplete();
					}
				});

				// Update labels with error handling
				label.each(function(d) {
					try {
						d3.select(this)
							.transition(currentTransition)
							.filter(function(d) {
								return +this.getAttribute("fill-opacity") || labelVisible(d.target);
							})
							.attr("fill-opacity", d => +labelVisible(d.target))
							.attrTween("transform", d => () => labelTransform(d.current))
							.on("end", checkComplete)
							.on("interrupt", checkComplete);
					} catch (err) {
						console.warn('Label transition error:', err);
						checkComplete();
					}
				});
			}

			function arcVisible(d) {
				return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
			}

			function labelVisible(d) {
				return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
			}

			function labelTransform(d) {
				const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
				const y = (d.y0 + d.y1) / 2 * radius;
				return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180}) scale(1)`; // scale(1)を追加して文字サイズを固定
			}

			// Initial render complete
			renderConfig.renderComplete();

		} catch (err) {
			console.error('Error rendering sunburst:', err);
			noDataRenderCallback(renderConfig);
			renderConfig.renderComplete();
		}
	}

	var config = {
		id: 'com.shimokado.zoomable-sunburst',
		containerType: 'html',
		initCallback: initCallback,
		preRenderCallback: preRenderCallback,
		renderCallback: renderCallback,
		noDataPreRenderCallback: noDataPreRenderCallback,
		noDataRenderCallback: noDataRenderCallback,
		resources: {
			script: [
				// Example of using a function callback to dynamically define an external library to be loaded
				// callbackArg is the standard callback argument object which contains 'properties'.
				// This is called during library load time, so a chart instance is not yet available.
				function(callbackArg) {
					return callbackArg.properties.external_library;
				}
			],
			// script: window.d3? []: ['lib/d3.min.js'],
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
