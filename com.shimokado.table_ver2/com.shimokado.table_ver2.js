/* Copyright (C) 2025. Shimokado Masataka. All rights reserved. */

(function() {

	// 全ての拡張機能のコールバック関数は標準の'renderConfig'引数を受け取ります
	function initCallback(successCallback, initConfig) {
		successCallback(true);
	}

	function noDataPreRenderCallback(preRenderConfig) {
		console.log('noDataPreRenderCallback:', preRenderConfig);
	}
	
	function noDataRenderCallback(renderConfig) {
		console.log('noDataRenderCallback:', renderConfig);
		const container = renderConfig.container;
		container.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">データがありません</div>';
	}

	function preRenderCallback(preRenderConfig) {
		console.log('preRenderCallback:', preRenderConfig);
	}

	/**
	 * データをグループ化して集計する関数
	 * @param {Array} data - 元のデータ配列
	 * @param {Number} labelLevel - どのラベルレベルまでグループ化するか（0-indexed）
	 * @returns {Object} グループ化されたデータ（キーがラベルの組み合わせ、値が集計値）
	 */
	function groupAndAggregate(data, labelLevel) {
		const groups = {};
		
		// グループキーを作成してデータをグループ化
		data.forEach(item => {
			// labelLevelまでのラベルを結合してグループキーを作成
			const groupKey = item.labels.slice(0, labelLevel + 1).join('|');
			
			if (!groups[groupKey]) {
				groups[groupKey] = {
					labels: item.labels.slice(0, labelLevel + 1),
					value: Array(item.value.length).fill(0),
					count: 0,
					isTotal: true
				};
			}
			
			// 値を集計
			for (let i = 0; i < item.value.length; i++) {
				groups[groupKey].value[i] += (item.value[i] || 0);
			}
			groups[groupKey].count += 1;
		});
		
		return Object.values(groups);
	}

	/**
	 * 各チャートエンジンの描画サイクル中に呼び出されます（必須）
	 */
	function renderCallback(renderConfig) {
		console.log('renderCallback:', renderConfig);

		const props = renderConfig.properties; 
		const container = renderConfig.container; 
		const data = renderConfig.data; 
		const dataBuckets = renderConfig.dataBuckets; 
		const buckets = dataBuckets.buckets; 
		const height = renderConfig.height; 
		const width = renderConfig.width;

		container.innerHTML = '';
		
		// データコンテナを作成
		const dataContainer = document.createElement('div');
		dataContainer.className = 'table-container';
		
		// テーブルのスタイルを適用
		const tableStyle = props.tableStyle || {};
		const fontSize = tableStyle.fontSize || '12px';
		const color = tableStyle.color || '#333';
		
		// ラベルの数を取得（すべてのデータ行で同じと仮定）
		const labelCount = data[0] ? data[0].labels.length : 0;
		
		// テーブル要素を作成
		const table = document.createElement('table');
		table.className = 'data-table';
		table.style.width = '100%';
		table.style.borderCollapse = 'collapse';
		table.style.fontSize = fontSize;
		table.style.color = color;
		
		// ヘッダーを作成
		const thead = document.createElement('thead');
		const headerRow = document.createElement('tr');
		
		// ラベルの列ヘッダーを作成
		const labelTitles = buckets.labels && buckets.labels.title ? 
			(Array.isArray(buckets.labels.title) ? buckets.labels.title : [buckets.labels.title]) : [];
		// ラベルのヘッダーは結合して表示
			const th = document.createElement('th');
			th.textContent = labelTitles[0] || '';
			th.colSpan = labelCount;
			th.style.padding = '8px';
			th.style.borderBottom = '2px solid #ddd';
			th.style.textAlign = 'left';
			headerRow.appendChild(th);
		
		// 値の列ヘッダーを作成
		const valueTitles = buckets.value && buckets.value.title ? 
			(Array.isArray(buckets.value.title) ? buckets.value.title : [buckets.value.title]) : [];
			
		valueTitles.forEach(title => {
			const th = document.createElement('th');
			th.textContent = title;
			th.style.padding = '8px';
			th.style.borderBottom = '2px solid #ddd';
			th.style.textAlign = 'right';
			headerRow.appendChild(th);
		});
		
		thead.appendChild(headerRow);
		table.appendChild(thead);
		
		// tbodyを作成
		const tbody = document.createElement('tbody');
		
		// データ行と集計行を作成する処理
		// 要件1: ラベルが1つの場合は合計行を表示しない
		// 要件2: ラベルが3つ以上の場合、最後のlabels以外は合計行を表示する
		
		// 元のデータをコピー
		const processedData = [...data];
		
		// ラベルが3つ以上ある場合のみ集計行を追加
		if (labelCount >= 3) {
			// 最後のラベル以外の各レベルについて集計行を作成
			for (let level = 0; level < labelCount - 1; level++) {
				// 対象レベルまでのラベルでグループ化して集計
				const aggregatedData = groupAndAggregate(data, level);
				// 集計結果をデータに追加
				processedData.push(...aggregatedData);
			}
		}
		
		// データの表示順をソートするため、ラベルでソート
		processedData.sort((a, b) => {
			for (let i = 0; i < labelCount; i++) {
				const aLabel = a.labels[i] || '';
				const bLabel = b.labels[i] || '';
				
				if (aLabel !== bLabel) {
					return aLabel.localeCompare(bLabel);
				}
			}
			
			// 合計行を通常の行の後に表示
			return (a.isTotal ? 1 : 0) - (b.isTotal ? 1 : 0);
		});
		
		// 前のレベルを追跡して、レベルが変わったときに合計行を挿入
		let prevLabels = [];
		
		// データ行の作成
		processedData.forEach(item => {
			const row = document.createElement('tr');
			
			// 合計行の場合はスタイルを変更
			if (item.isTotal) {
				row.classList.add('total-row');
				row.style.fontWeight = 'bold';
				row.style.backgroundColor = '#f0f0f0';
			}
			
			// ラベルセルを作成
			for (let i = 0; i < labelCount; i++) {
				// 合計行の場合、対象レベルまでラベルを表示
				if (!item.isTotal || i <= item.labels.length - 1) {
					const td = document.createElement('td');
					
					// 合計行の場合、対象レベルのみラベルを表示
					if (item.isTotal && i === item.labels.length -1) {
						td.textContent = item.labels[i] || '';
					} else if (item.isTotal) {
						td.textContent = '';
					} else { // 通常のデータ行の場合、最後のラベルのみラベルを表示
						if(i === labelCount - 1) {
						td.textContent = item.labels[i] || '';
						}
					}
					
					// 合計行の場合、集計対象のレベルには「合計」と表示
					if (item.isTotal && i === item.labels.length - 1) {
						td.textContent += ' (合計)';
						// 集計対象のレベル移行のラベルの数だけcolspanを設定
						td.colSpan = labelCount - i;
					}
					
					td.style.padding = '8px';
					td.style.borderBottom = '1px solid #ddd';
					row.appendChild(td);
				}
			}
			
			// 値のセルを作成
			const valueNumberFormats = buckets.value && buckets.value.numberFormat ? 
				(Array.isArray(buckets.value.numberFormat) ? buckets.value.numberFormat : [buckets.value.numberFormat]) : [];
				
			item.value.forEach((val, idx) => {
				const td = document.createElement('td');
				td.style.padding = '8px';
				td.style.borderBottom = '1px solid #ddd';
				td.style.textAlign = 'right';
				
				// 数値フォーマットが指定されている場合は適用
				if (valueNumberFormats[idx]) {
					td.textContent = renderConfig.moonbeamInstance.formatNumber(val, valueNumberFormats[idx]);
				} else {
					td.textContent = val !== null ? val.toString() : '';
				}
				
				row.appendChild(td);
			});
			
			tbody.appendChild(row);
		});
		
		table.appendChild(tbody);
		dataContainer.appendChild(table);
		container.appendChild(dataContainer);

		renderConfig.renderComplete();
	}

	var config = {
		id: 'com.shimokado.table_ver2',
		containerType: 'html',
		initCallback: initCallback,
		preRenderCallback: preRenderCallback,
		renderCallback: renderCallback,
		noDataPreRenderCallback: noDataPreRenderCallback,
		noDataRenderCallback: noDataRenderCallback,
		resources: {
			script: ['lib/script.js'],
			css: ['css/style.css']
		},
		modules: {
			tooltip: {
				supported: true,
				autoContent: function(target, s, g, d) {
					return d.labels.join(' - ') + ': ' + d.value.join(', ');
				}
			}
		}
	};

	// 必須: この呼び出しにより拡張機能がチャートエンジンに登録されます
	tdgchart.extensionManager.register(config);
}());
