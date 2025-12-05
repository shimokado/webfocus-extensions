# D3.js を使用した拡張グラフ

D3.js は強力なSVGベースのデータ可視化ライブラリです。ツリーマップなどの階層構造のチャートに適しています。

## ⚠️ 重要：D3.js使用時の注意点

- **ライブラリロード**: `properties.json` の `resources.script` にD3.jsのURLを指定。CDNを使用する場合：

  ```json
  "resources": {
    "script": ["https://d3js.org/d3.v5.min.js"]
  }
  ```

- **コンテナタイプ**: `config` で `containerType: 'html'` を指定（SVG要素を動的に作成するため）。
- **test.html設定**: `dataBuckets` に `"depth": 1` を必ず含める。depthがnullだとデータ処理でエラーになります。
- **スクリプト順序**: `test.html` でD3.jsをdeferなしで同期ロードする。deferがあるとrenderCallback実行前にD3が利用できません。

## 手順 (D3.js ツリーマップ)

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
			// D3.js固有のツールチップ設定（SVG title要素）
			.append('title')
			.text(d => `${d.data.name}: ${chart.formatNumber(d.value, '#,###')}`);    // ラベル
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

## D3.js実装のポイント

- **データ正規化**: 最初に必ず実行。depthとlabels/valueの可変性を吸収。
- **階層構築**: `buildHierarchy` 関数でlabelsの階層をツリー構造に変換。
- **D3.js API**: `d3.treemap()`, `d3.hierarchy()`, `d3.scaleOrdinal()` を使用。
- **レスポンシブ**: テキストサイズを動的に調整して長方形に収まるように。
- **WebFOCUS統合**: SVG `title`要素でツールチップ、`buildClassName` でデータ選択対応。
