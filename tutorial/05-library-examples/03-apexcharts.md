# ApexCharts.js を使用した拡張グラフ

ApexCharts はモダンなSVGチャートライブラリです。

## 手順

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
