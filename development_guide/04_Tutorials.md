# WebFOCUS拡張グラフ開発ガイド - チュートリアル

## 1. Chart.js を使用した拡張グラフ

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

  // コンテナタイプは 'html' である必要があります
  // Canvas要素を作成
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);

  // Chart.js用のデータ変換（簡易例）
  var chartData = {
    labels: data.map(function(d) { return d.labels; }),
    datasets: [{
      label: 'My Dataset',
      data: data.map(function(d) { return d.value; }),
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

## 2. ApexCharts.js を使用した拡張グラフ

ApexCharts はモダンなSVGチャートライブラリです。

### 手順

1. **プロジェクト作成**: `com.mycompany.apexcharts_sample` を作成。
2. **ライブラリ配置**: `lib` フォルダに `apexcharts.min.js` を配置。
3. **設定**: `properties.json` にリソース追加。
4. **実装**:

```javascript
function renderCallback(renderConfig) {
  var container = renderConfig.container;
  
  // ApexCharts用のデータ変換
  var seriesData = renderConfig.data.map(function(d) {
    return { x: d.labels, y: d.value };
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

## 3. HTML Table を使用した拡張グラフ

シンプルなHTMLテーブルを表示する例です。

### 手順

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
