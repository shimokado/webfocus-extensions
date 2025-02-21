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
	}

	/**
	 * データがない場合のレンダリングコールバック
	 * @param {object} renderConfig - レンダリング設定
	 */
	function noDataRenderCallback(renderConfig) {
	}

	/**
	 * プリレンダリングコールバック
	 * @param {object} preRenderConfig - 事前レンダリング設定
	 */
	function preRenderCallback(preRenderConfig) {
	}

	/**
	 * パイチャートの作成
	 * @param {object} data - チャートデータ
	 * @param {string} containerId - コンテナのID
	 * @param {object} chart - Moonbeamインスタンス
	 * @param {object} numberFormat - 数値フォーマット
	 */
	function createPieChart(data, containerId, chart, numberFormat) {
		const width = 200;
		const height = 200;
		const radius = Math.min(width, height) / 2;

		const color = d3.scaleOrdinal(d3.schemeCategory10);

		const container = d3.select('#' + containerId);

		const svg = container
			.append('svg')
			.attr('class', 'pie-chart')
			.attr('width', width)
			.attr('height', height)
			.append('g')
			.attr('transform', `translate(${width / 2},${height / 2})`);

		const pie = d3.pie()
			.value(d => d.value)
			.sort(null);

		const arc = d3.arc()
			.innerRadius(0)
			.outerRadius(radius - 20);

		const tooltip = d3.select('body').append('div')
			.attr('class', 'pie-tooltip')
			.style('opacity', 0);

		const arcs = svg.selectAll('arc')
			.data(pie(data))
			.enter()
			.append('g')
			.attr('class', 'arc');

		arcs.append('path')
			.attr('d', arc)
			.style('fill', (d, i) => color(i))
			.on('mouseover', function(event, d) {
				tooltip.transition()
					.duration(200)
					.style('opacity', .9);
				tooltip.html(d.data.labels + ': ' + chart.formatNumber(d.data.value, numberFormat))
					.style('left', (event.pageX) + 'px')
					.style('top', (event.pageY - 28) + 'px');
			})
			.on('mouseout', function(d) {
				tooltip.transition()
					.duration(500)
					.style('opacity', 0);
			});

		// 凡例の追加
		const legend = container
			.append('div')
			.attr('class', 'pie-legend');

		data.forEach((d, i) => {
			const legendItem = legend
				.append('div')
				.attr('class', 'legend-item');

			legendItem
				.append('div')
				.attr('class', 'legend-color')
				.style('background-color', color(i));

			legendItem
				.append('span')
				.attr('class', 'legend-label')
				.text(d.labels + ': ' + chart.formatNumber(d.value, numberFormat));
		});
	}

	/**
	 * 棒グラフの作成
	 * @param {object} data - チャートデータ
	 * @param {string} containerId - コンテナのID
	 * @param {object} chart - Moonbeamインスタンス
	 * @param {string} numberFormat - 数値フォーマット
	 */
	function createBarChart(data, containerId, chart, numberFormat) {
		const margin = {top: 20, right: 20, bottom: 30, left: 60};
		const width = document.getElementById(containerId).clientWidth - margin.left - margin.right;
		const height = 200 - margin.top - margin.bottom;

		const svg = d3.select('#' + containerId)
			.append('svg')
			.attr('class', 'bar-chart')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		const x = d3.scaleBand()
			.range([0, width])
			.padding(0.1);

		const y = d3.scaleLinear()
			.range([height, 0]);

		x.domain(data.map(d => d.labels));
		y.domain([0, d3.max(data, d => d.value)]);

		svg.append('g')
			.attr('class', 'bar-axis')
			.attr('transform', `translate(0,${height})`)
			.call(d3.axisBottom(x))
			.selectAll('text')
			.style('text-anchor', 'end')
			.attr('transform', 'rotate(-45)');

		svg.append('g')
			.attr('class', 'bar-axis')
			.call(d3.axisLeft(y));

		svg.selectAll('.bar')
			.data(data)
			.enter().append('rect')
			.attr('x', d => x(d.labels))
			.attr('width', x.bandwidth())
			.attr('y', d => y(d.value))
			.attr('height', d => height - y(d.value))
			.on('mouseover', function(event, d) {
				d3.select(this).attr('opacity', 0.8);
			})
			.on('mouseout', function() {
				d3.select(this).attr('opacity', 1);
			});
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

		// データを値の降順でソート
		data.sort(function(a, b) {
			return b.value - a.value;
		});

		// カードコンテナの作成
		var cardContainer = document.createElement('div');
		cardContainer.className = 'card-grid-container';
		container.appendChild(cardContainer);

		// パイチャートカードの作成（最初のカード）
		var pieCard = document.createElement('div');
		pieCard.className = 'data-card pie-card';
		
		var pieLabel = document.createElement('div');
		pieLabel.className = 'card-label';
		pieLabel.textContent = 'Data Distribution';
		
		var pieContainer = document.createElement('div');
		pieContainer.className = 'pie-container';
		pieContainer.id = 'pie-' + Date.now(); // ユニークなID

		pieCard.appendChild(pieLabel);
		pieCard.appendChild(pieContainer);
		cardContainer.appendChild(pieCard);

		// パイチャートの作成
		createPieChart(data, pieContainer.id, chart, dataBuckets.value.numberFormat || '###');

		 // トップ3カードの作成（2枚目のカード）
		var topCard = document.createElement('div');
		topCard.className = 'data-card top-values-card';

		var topLabel = document.createElement('div');
		topLabel.className = 'card-label';
		topLabel.textContent = 'Top 3 Values';
		topCard.appendChild(topLabel);

		var topList = document.createElement('div');
		topList.className = 'top-values-list';

		// トップ3のデータを表示
		data.slice(0, 3).forEach((row, index) => {
			var item = document.createElement('div');
			item.className = 'top-value-item';

			var rank = document.createElement('span');
			rank.className = 'top-value-rank';
			rank.textContent = '#' + (index + 1);

			var label = document.createElement('span');
			label.className = 'top-value-label';
			label.textContent = row.labels;

			var value = document.createElement('span');
			value.className = 'top-value-number';
			value.textContent = chart.formatNumber(row.value, dataBuckets.value.numberFormat || '###');

			item.appendChild(rank);
			item.appendChild(label);
			item.appendChild(value);
			topList.appendChild(item);
		});

		topCard.appendChild(topList);
		cardContainer.appendChild(topCard);

		 // 棒グラフカードの作成（3枚目のカード）
		var barCard = document.createElement('div');
		barCard.className = 'data-card bar-chart-card';
		
		var barLabel = document.createElement('div');
		barLabel.className = 'card-label';
		barLabel.textContent = 'Value Distribution';
		
		var barContainer = document.createElement('div');
		barContainer.className = 'bar-container';
		barContainer.id = 'bar-' + Date.now();

		barCard.appendChild(barLabel);
		barCard.appendChild(barContainer);
		cardContainer.appendChild(barCard);

		// 棒グラフの作成
		createBarChart(data, barContainer.id, chart, dataBuckets.value.numberFormat || '###');

		// 残りのカードの生成
		data.forEach(function(row) {
			var card = document.createElement('div');
			card.className = 'data-card';
			
			var label = document.createElement('div');
			label.className = 'card-label';
			label.textContent = row.labels;
			
			var value = document.createElement('div');
			value.className = 'card-value';
			value.textContent = chart.formatNumber(row.value, dataBuckets.value.numberFormat || '###');
			
			card.appendChild(label);
			card.appendChild(value);
			cardContainer.appendChild(card);
		});

		renderConfig.renderComplete();
	}

	var config = {
		id: 'com.shimokado.card-dashboard',	// エクステンションID
		containerType: 'html',	// コンテナタイプ(html/svg)
		initCallback: initCallback,	// 拡張機能の初期化直前に呼び出される関数への参照。必要に応じてMonbeamインスタンスを設定するために使用
		preRenderCallback: preRenderCallback,  // 拡張機能のレンダリング直前に呼び出される関数への参照。preRenderConfigオブジェクトが渡されます
		renderCallback: renderCallback,  // 実際のチャートを描画する関数への参照。renderConfigオブジェクトが渡されます
		noDataPreRenderCallback: noDataPreRenderCallback, // データがない場合のレンダリング直前に呼び出される関数への参照
		noDataRenderCallback: noDataRenderCallback, // データがない場合のチャート描画関数への参照
		resources: {
			script: ['lib/d3.min.js'], // 読み込むリソースのリスト。.jsまたは.cssファイルを指定可能
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
