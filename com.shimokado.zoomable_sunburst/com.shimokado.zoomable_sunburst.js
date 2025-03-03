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
		const width = container.clientWidth;
		const height = container.clientHeight || width;
		const radius = width / 6;

		// Transform the flat data into hierarchical format
		const hierarchicalData = {
			name: "root",
			children: {}
		};

		data.forEach(d => {
			let current = hierarchicalData;
			d.labels.forEach((label, i) => {
				if (!current.children[label]) {
					current.children[label] = {
						name: label,
						children: {}
					};
				}
				current = current.children[label];
				
				// If it's the last label, add the value
				if (i === d.labels.length - 1) {
					current.value = d.value;
					delete current.children;
				}
			});
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
			.attr("text-anchor", "middle")
			.attr("dy", "0.35em")
			.attr("fill-opacity", 0)
			.style("font-size", "12pt")
			.style("fill", "#2a2a2a")  // テキストの色を濃いグレーに
			.style("text-shadow", "none")  // 白い影を削除
			.attr("pointer-events", "none")
			.text("");

		function clicked(event, p) {
			parent.datum(p.parent || root);

			// Update center circle color to match the clicked arc but with much lower opacity
			const clickedColor = p.parent ? d3.select(event.target).attr("fill") : "white";
			const lightenedColor = p.parent ? 
				d3.color(clickedColor)
					.brighter(1.2)  // よりブライトに
					.copy({opacity: 0.6})  // 透明度も追加
				: "white";
			parent.transition()
				.duration(375)
				.ease(d3.easeCubicInOut)
				.attr("fill", lightenedColor);

			// Update center text with clear formatting
			const pathText = p.parent ? 
				p.ancestors()
					.map(d => d.data.name)
					.reverse()
					.join(" ▶ ") : "";
			centerText
				.style("font-weight", "bold")
				.text(pathText)
				.style("font-size", "12pt")  // サイズを再指定して確実に固定
				.transition()
				.duration(375)
				.ease(d3.easeCubicInOut)
				.attr("fill-opacity", p.parent ? 1 : 0);

			// Remove text shadow after zoom
			centerText.style("text-shadow", "none");

			root.each(d => d.target = {
				x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
				x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
				y0: Math.max(0, d.y0 - p.depth),
				y1: Math.max(0, d.y1 - p.depth)
			});

			const t = svg.transition()
				.duration(375)
				.ease(d3.easeCubicInOut);

			path.transition(t)
				.tween("data", d => {
					const i = d3.interpolate(d.current, d.target);
					return t => d.current = i(t);
				})
				.filter(function(d) {
					return +this.getAttribute("fill-opacity") || arcVisible(d.target);
				})
				.attr("fill-opacity", d => arcVisible(d.target) ? 
					(0.95 - (d.depth * 0.1)) : 0)  // アニメーション時も同じ透明度計算を適用
				.attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")
				.attrTween("d", d => () => arc(d.current));

			label.filter(function(d) {
				return +this.getAttribute("fill-opacity") || labelVisible(d.target);
			}).transition(t)
				.attr("fill-opacity", d => +labelVisible(d.target))
				.attrTween("transform", d => () => labelTransform(d.current));
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

		renderConfig.renderComplete();
	}

	var config = {
		id: 'com.shimokado.zoomable_sunburst',
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

