# WebFOCUS拡張グラフ開発ガイド - チュートリアル

## 🚨 **重要なお知らせ**

**新規拡張グラフ開発時は、必ず [06_Troubleshooting_DataDepth.md](06_Troubleshooting_DataDepth.md) を先に読んでください。**

このドキュメントにはデータ正規化の実装例が記載されています。チュートリアルを実装する前に必ず確認してください。

## 1. Chart.js を使用した拡張グラフ

```javascript
// ... initCallback ...

function renderCallback(renderConfig) {
  var container = renderConfig.container;
  var width = renderConfig.width;
  var height = renderConfig.height;
  var data = renderConfig.data;
  var dataBuckets = renderConfig.dataBuckets;

  // ===== ステップ1: データの正規化（重要！）=====
  // depth=1 でも labels/value が文字列になる場合がある
  var normalizedData = [];
  if (dataBuckets.depth === 1) {
    normalizedData = data.map(function(item) {
      return {
        labels: Array.isArray(item.labels) ? item.labels : [item.labels],
        value: Array.isArray(item.value) ? item.value : [item.value]
      };
    });
  } else {
    // depth > 1: 配列の配列
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

  // コンテナタイプは 'html' である必要があります
  // Canvas要素を作成
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);

  // ===== ステップ2: Chart.js用のデータ変換 =====
  // 最後のラベルと最初の値フィールドを使用（簡易例）
  var chartData = {
    labels: normalizedData.map(function(d) { 
      return d.labels[d.labels.length - 1]; 
    }),
    datasets: [{
      label: 'My Dataset',
      data: normalizedData.map(function(d) { return d.value[0]; }),
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    }]
  };

  // Chart.js インスタンス作成
  new Chart(canvas, {
    type: 'bar',
    data: chartData,
    options: {
      responsive: false, // WebFOCUS側でリサイズ制御するため
      maintainAspectRatio: false
    }
  });

  renderConfig.renderComplete();
}

// ... register ...
```

## 2. D3.js を使用した拡張グラフ

D3.js は強力なSVGベースのデータ可視化ライブラリです。ツリーマップなどの階層構造のチャートに適しています。

### ⚠️ 重要：D3.js使用時の注意点

- **ライブラリロード**: `properties.json` の `resources.script` にD3.jsのURLを指定。CDNを使用する場合：

  ```json
  "resources": {
    "script": ["https://d3js.org/d3.v5.min.js"]
  }
  ```

- **コンテナタイプ**: `config` で `containerType: 'html'` を指定（SVG要素を動的に作成するため）。
- **test.html設定**: `dataBuckets` に `"depth": 1` を必ず含める。depthがnullだとデータ処理でエラーになります。
- **スクリプト順序**: `test.html` でD3.jsをdeferなしで同期ロードする。deferがあるとrenderCallback実行前にD3が利用できません。

### 手順 (D3.js ツリーマップ)

1. **プロジェクト作成**: `npm run create-extension` で `com.mycompany.d3_treemap` を作成。
2. **設定**: `properties.json` にD3.jsリソースを追加。
3. **実装**: `com.mycompany.d3_treemap.js` を編集。

```javascript
(function() {
  function initCallback(successCallback, initConfig) {
    successCallback(true);
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

    // ===== ステップ1: データの正規化（必須）=====
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

    // ===== ステップ2: ツリーマップ用の階層データ構築 =====
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

    // ===== ステップ3: SVG作成 =====
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // ===== ステップ4: ツリーマップレイアウト =====
    const treemap = d3.treemap()
      .size([width, height])
      .padding(1);

    const root = d3.hierarchy(hierarchicalData)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    treemap(root);

    // ===== ステップ5: 色スケール =====
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // ===== ステップ6: ノード描画 =====
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

    // ===== ステップ7: データ選択対応 =====
    node.select('rect')
      .attr('class', d => chart.buildClassName('riser', d.parent ? d.parent.children.indexOf(d) : 0, 0));

    renderConfig.renderComplete();
  }

  var config = {
    id: 'com.mycompany.d3_treemap',
    containerType: 'html',  // D3.js使用時は 'html'
    initCallback: initCallback,
    renderCallback: renderCallback,
    resources: {
      script: [
        'https://d3js.org/d3.v5.min.js'  // CDNからD3.jsをロード
      ]
    },
    modules: {
      dataSelection: {
        supported: true,
        needSVGEventPanel: true,
        svgNode: function(arg){}
      },
      tooltip: {
        supported: true
      }
    }
  };

  tdgchart.extensionManager.register(config);
}());
```

### D3.js実装のポイント

- **データ正規化**: 最初に必ず実行。depthとlabels/valueの可変性を吸収。
- **階層構築**: `buildHierarchy` 関数でlabelsの階層をツリー構造に変換。
- **D3.js API**: `d3.treemap()`, `d3.hierarchy()`, `d3.scaleOrdinal()` を使用。
- **レスポンシブ**: テキストサイズを動的に調整して長方形に収まるように。
- **WebFOCUS統合**: `tdgtitle` でツールチップ、`buildClassName` でデータ選択対応。

## 3. ApexCharts.js を使用した拡張グラフ

ApexCharts はモダンなSVGチャートライブラリです。

### 手順 (ApexCharts)

1. **プロジェクト作成**: `com.mycompany.apexcharts_sample` を作成。
2. **ライブラリ配置**: `lib` フォルダに `apexcharts.min.js` を配置。
3. **設定**: `properties.json` にリソース追加。
4. **実装**:

```javascript
function renderCallback(renderConfig) {
  var container = renderConfig.container;
  var data = renderConfig.data;
  var dataBuckets = renderConfig.dataBuckets;
  
  // ===== ステップ1: データの正規化 =====
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
  
  // ===== ステップ2: ApexCharts用のデータ変換 =====
  var seriesData = normalizedData.map(function(d) {
    return { 
      x: d.labels[d.labels.length - 1],  // 最後のラベル
      y: d.value[0]  // 最初の値
    };
  });

  var options = {
    chart: {
      type: 'bar',
      height: renderConfig.height,
      width: renderConfig.width
    },
    series: [{
      name: 'sales',
      data: seriesData
    }],
    xaxis: {
      type: 'category'
    }
  };

  var chart = new ApexCharts(container, options);
  chart.render().then(function() {
    renderConfig.renderComplete();
  });
}
```

## 4. HTML Table を使用した拡張グラフ

シンプルなHTMLテーブルを表示する例です。

### 手順 (HTML Table)

1. **プロジェクト作成**: `com.mycompany.table_sample` を作成。
2. **実装**:

```javascript
function renderCallback(renderConfig) {
  var container = renderConfig.container;
  var data = renderConfig.data;

  // テーブル要素の作成
  var table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';

  // ヘッダー作成（バケット情報から）
  var thead = document.createElement('thead');
  var tr = document.createElement('tr');
  // ... ヘッダー追加ロジック ...
  thead.appendChild(tr);
  table.appendChild(thead);

  // ボディ作成
  var tbody = document.createElement('tbody');
  data.forEach(function(row) {
    var tr = document.createElement('tr');

    var tdLabel = document.createElement('td');
    tdLabel.textContent = row.labels;
    tdLabel.style.border = '1px solid #ddd';
    tr.appendChild(tdLabel);

    var tdValue = document.createElement('td');
    tdValue.textContent = row.value;
    tdValue.style.border = '1px solid #ddd';
    tr.appendChild(tdValue);

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  container.appendChild(table);
  renderConfig.renderComplete();
}
```

Chart.js は人気のあるCanvasベースのチャートライブラリです。

### 手順

1. **プロジェクト作成**: `npm run create-extension` で `com.mycompany.chartjs_sample` を作成します。
2. **ライブラリ配置**: `lib` フォルダに `chart.min.js` を配置します。
3. **設定**: `properties.json` の `resources` にライブラリを追加します。

   ```json
   "resources": {
     "script": ["lib/chart.min.js"]
   }
   ```

4. **実装**: `com.mycompany.chartjs_sample.js` を編集します。

```javascript
// ... initCallback ...

function renderCallback(renderConfig) {
  var container = renderConfig.container;
  var width = renderConfig.width;
  var height = renderConfig.height;
  var data = renderConfig.data;
  var dataBuckets = renderConfig.dataBuckets;

  // ===== ステップ1: データの正規化（重要！）=====
  // depth=1 でも labels/value が文字列になる場合がある
  var normalizedData = [];
  if (dataBuckets.depth === 1) {
    normalizedData = data.map(function(item) {
      return {
        labels: Array.isArray(item.labels) ? item.labels : [item.labels],
        value: Array.isArray(item.value) ? item.value : [item.value]
      };
    });
  } else {
    // depth > 1: 配列の配列
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

  // コンテナタイプは 'html' である必要があります
  // Canvas要素を作成
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);

  // ===== ステップ2: Chart.js用のデータ変換 =====
  // 最後のラベルと最初の値フィールドを使用（簡易例）
  var chartData = {
    labels: normalizedData.map(function(d) { 
      return d.labels[d.labels.length - 1]; 
    }),
    datasets: [{
      label: 'My Dataset',
      data: normalizedData.map(function(d) { return d.value[0]; }),
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    }]
  };

  // Chart.js インスタンス作成
  new Chart(canvas, {
    type: 'bar',
    data: chartData,
    options: {
      responsive: false, // WebFOCUS側でリサイズ制御するため
      maintainAspectRatio: false
    }
  });

  renderConfig.renderComplete();
}

// ... register ...
