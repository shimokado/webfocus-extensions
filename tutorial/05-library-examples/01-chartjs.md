# Chart.js を使用した拡張グラフ

Chart.js は人気のあるCanvasベースのチャートライブラリです。

## 手順

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
```
