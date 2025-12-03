# WebFOCUS拡張グラフ開発ガイド - 実践編

## 1. データの正規化 (Data Normalization)

WebFOCUSから渡されるデータ (`renderConfig.data`) は、バケットの設定やデータの個数によって構造（配列の深さなど）が変わる場合があります。これを吸収し、常に扱いやすい形式に変換する「正規化処理」を実装することが重要です。

この処理は、メインのJavaScriptモジュール内（`renderCallback` 内、または同じクロージャ内のヘルパー関数）に記述します。

### 実装例

以下は、データを常に「オブジェクトの配列」として扱えるようにする正規化関数の例です。

```javascript
(function() {

  // ... initCallback, preRenderCallback ...

  // データの正規化を行うヘルパー関数
  function normalizeData(renderConfig) {
    var data = renderConfig.data;
    
    // dataBuckets.depth が 1 の場合（単純なリスト）、配列の配列にラップして統一する
    if (renderConfig.dataBuckets.depth === 1) {
      data = [data];
    }
    
    return data;
  }

  function renderCallback(renderConfig) {
    // 正規化されたデータを取得
    var data = normalizeData(renderConfig);
    
    // 以降、data は常に配列の配列（または意図した構造）として扱える
    // 例: data[0] は最初のシリーズのデータ配列
    
    var container = d3.select(renderConfig.container);
    // ... 描画処理 ...
  }

  // ... config definition & register ...

})();
```

このように、`renderCallback` の冒頭でデータを正規化することで、後続の描画ロジックがシンプルになります。

## 2. 出力方法

拡張グラフでは、主に以下の3つの方法で描画を行います。

### 2.1 SVG (推奨)

WebFOCUSの標準的な描画方法です。D3.js との相性が良く、スケーラビリティに優れています。

- **設定**: `properties.json` または `config` オブジェクトで `containerType: "svg"` を指定（デフォルト）。
- **実装**: `renderConfig.container` は SVG 要素（またはその親）になります。D3.js で `d3.select(renderConfig.container)` として操作します。

### 2.2 HTML

Canvas や複雑なDOM構造を使用する場合に適しています。

- **設定**: `config` オブジェクトで `containerType: "html"` を指定。
- **実装**: `renderConfig.container` は `div` 要素になります。この中に `canvas` 要素や `table` 要素などを追加します。

### 2.3 Canvas

大量のデータを描画する場合や、Canvasベースのライブラリ（Chart.jsなど）を使用する場合に使用します。

- **設定**: `containerType: "html"` を指定。
- **実装**: `renderConfig.container` 内に `<canvas>` 要素を動的に生成し、そのコンテキストを取得して描画します。

```javascript
function renderCallback(renderConfig) {
  var container = renderConfig.container;
  var width = renderConfig.width;
  var height = renderConfig.height;

  // Canvas要素の作成
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  // Canvas APIによる描画
  ctx.fillStyle = 'red';
  ctx.fillRect(10, 10, 100, 100);
  
  renderConfig.renderComplete();
}
```

## 3. 外部ライブラリの利用

`lib` フォルダに配置した外部ライブラリ（Chart.js, ApexChartsなど）を利用するには、`properties.json` または `config` オブジェクトの `resources` プロパティで指定します。

### properties.json での指定（推奨）

```json
"properties": {
  // ...
},
"resources": {
  "script": ["lib/chart.min.js", "lib/utils.js"],
  "css": ["css/style.css"]
}
```

### config オブジェクトでの指定

```javascript
var config = {
  // ...
  resources: {
    script: ['lib/chart.min.js'],
    css: ['css/style.css']
  }
};
```

指定されたパスは、拡張グラフのルートフォルダからの相対パスとして解決されます。WebFOCUSはこれらのリソースを自動的にロードしてから `renderCallback` を呼び出します。
