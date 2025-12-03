# WebFOCUS拡張グラフ開発ガイド - 実践編

## 1. データの正規化 (Data Normalization)

WebFOCUSから渡されるデータ (`renderConfig.data`) は、バケットの設定やデータの個数によって構造（配列の深さなど）が変わる場合があります。これを吸収し、常に扱いやすい形式に変換する「正規化処理」を実装することが重要です。

この処理は、メインのJavaScriptモジュール内（`renderCallback` 内、または同じクロージャ内のヘルパー関数）に記述します。

### depth = 1 の実データ構造

**depth = 1 の場合、labels と value は配列か単一値のいずれかになります。**

#### パターン1: 複数ラベル＆複数値（実例：2ラベル × 2値）

```javascript
renderConfig.dataBuckets = {
  "depth": 1,
  "buckets": {
    "labels": {
      "title": ["CAR", "MODEL"],
      "count": 2
    },
    "value": {
      "title": ["SEATS", "RETAIL_COST"],
      "count": 2
    }
  }
};

renderConfig.data = [
  { labels: ["ALFA ROMEO", "2000 4 DOOR BERLINA"], value: [4, 5925], ... },
  { labels: ["ALFA ROMEO", "2000 GT VELOCE"], value: [2, 6820], ... },
  { labels: ["BMW", "2002 2 DOOR"], value: [5, 5940], ... },
  // ... 計18件
];
// data は既にアイテム配列！[data] にラップしてはいけない
```

#### パターン2: 単一ラベル＆単一値（実例：1ラベル × 1値）

```javascript
renderConfig.dataBuckets = {
  "depth": 1,
  "buckets": {
    "labels": {
      "title": "CAR",
      "count": 1
    },
    "value": {
      "title": "SEATS",
      "count": 1
    }
  }
};

renderConfig.data = [
  { labels: "ALFA ROMEO", value: 8, ... },
  { labels: "AUDI", value: 5, ... },
  { labels: "BMW", value: 29, ... },
  // ... 計10件
];
// これもアイテム配列！labels/value が単一値なだけ
```

### 実装例：正しい正規化処理

```javascript
(function() {

  // ... initCallback, preRenderCallback ...

  // データの正規化を行うヘルパー関数
  function normalizeData(renderConfig) {
    var data = renderConfig.data;
    var depth = renderConfig.dataBuckets.depth;
    var buckets = renderConfig.dataBuckets.buckets;
    var flatData = [];

    // ===== depth に応じたフラット化 =====
    if (depth === 1) {
      // depth=1: data はそのままアイテム配列
      flatData = data.map(function(item) {
        return {
          labels: Array.isArray(item.labels) ? item.labels : [item.labels],
          value: Array.isArray(item.value) ? item.value : [item.value],
          _s: item._s,
          _g: item._g
        };
      });
    } else {
      // depth>1: data は配列の配列
      data.forEach(function(series) {
        if (Array.isArray(series)) {
          series.forEach(function(item) {
            flatData.push({
              labels: Array.isArray(item.labels) ? item.labels : [item.labels],
              value: Array.isArray(item.value) ? item.value : [item.value],
              _s: item._s,
              _g: item._g
            });
          });
        }
      });
    }

    // ===== buckets も常に配列に正規化 =====
    var labelTitles = Array.isArray(buckets.labels.title) 
      ? buckets.labels.title 
      : [buckets.labels.title];
    var valueTitles = Array.isArray(buckets.value.title) 
      ? buckets.value.title 
      : [buckets.value.title];
    var valueNumberFormats = Array.isArray(buckets.value.numberFormat) 
      ? buckets.value.numberFormat 
      : [buckets.value.numberFormat];

    return {
      flatData: flatData,
      labelTitles: labelTitles,
      valueTitles: valueTitles,
      valueNumberFormats: valueNumberFormats,
      labelCount: buckets.labels.count,
      valueCount: buckets.value.count
    };
  }

  function renderCallback(renderConfig) {
    // 正規化されたデータを取得
    var normalized = normalizeData(renderConfig);
    var flatData = normalized.flatData;
    var labelTitles = normalized.labelTitles;
    var valueTitles = normalized.valueTitles;
    
    // 以降、flatData は常に以下の形式：
    // [
    //   { labels: [label1, label2, ...], value: [val1, val2, ...], ... },
    //   { labels: [label1, label2, ...], value: [val1, val2, ...], ... },
    //   ...
    // ]
    
    var container = d3.select(renderConfig.container);
    // ... 描画処理 ...
  }

  // ... config definition & register ...

})();
```

### ポイント

- **❌ 誤り**: `depth === 1` だからといって `data = [data]` にラップしてはいけない
  - depth=1 の `data` は既に「アイテムの配列」です
  - ラップするとアイテムが1個だけになってしまいます

- **✅ 正しい処理**:
  1. depth=1 なら data をそのまま処理
  2. depth>1 なら data の各要素（シリーズ）をループ
  3. labels/value を常に配列に統一
  4. buckets の title/numberFormat も常に配列に統一

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

## 4. 集計・グループ化パターンの実装

テーブルやダッシュボードなど、データを階層的に集計・グループ化して表示する場合があります。本セクションでは、その実装パターンを解説します。

### 4.1 グループ化と集計の基本

グループ化とは、複数のラベルを持つデータを特定のレベルまでまとめて、そのレベルでの合計や平均を計算することです。

例えば、以下のようなデータがあるとします：

```javascript
// 元データ（3階層ラベル × 2値フィールド）
var data = [
  { labels: ["JAPAN", "TOYOTA", "SEDAN"], value: [100, 15000] },
  { labels: ["JAPAN", "TOYOTA", "SUV"], value: [200, 20000] },
  { labels: ["JAPAN", "HONDA", "SEDAN"], value: [150, 18000] },
  { labels: ["USA", "FORD", "TRUCK"], value: [120, 25000] },
  // ...
];
```

### 4.2 ラベルレベルによるグループ化関数

以下の関数は、指定したラベルレベルまでグループ化し、値を集計します：

```javascript
/**
 * データをグループ化して集計する関数
 * @param {Array} data - フラットなアイテム配列
 * @param {Number} labelLevel - グループ化するラベルレベル（0-indexed）
 * @returns {Array} グループ化された集計データ
 */
function groupAndAggregate(data, labelLevel) {
  const groups = {};
  
  // グループキーを作成してデータをグループ化
  data.forEach(item => {
    if (!item || !item.labels || !Array.isArray(item.labels)) return;
    
    // valueを配列に統一
    const valueArray = Array.isArray(item.value) ? item.value : [item.value];
    
    // グループキーを生成（指定レベルまで）
    const groupKey = item.labels.slice(0, labelLevel + 1).join('|');
    
    if (!groups[groupKey]) {
      groups[groupKey] = {
        labels: item.labels.slice(0, labelLevel + 1),
        value: Array(valueArray.length).fill(0),
        count: 0,
        isTotal: true
      };
    }
    
    // 値を集計
    for (let i = 0; i < valueArray.length; i++) {
      groups[groupKey].value[i] += (valueArray[i] || 0);
    }
    groups[groupKey].count += 1;
  });
  
  return Object.values(groups);
}

// 使用例：会社名（第0レベル）でグループ化
var companySummary = groupAndAggregate(normalizedData, 0);

// 使用例：会社 + カテゴリ（第1レベル）でグループ化
var categoryTotal = groupAndAggregate(normalizedData, 1);
```

### 4.3 テーブルへの適用例

実装例として、`com.shimokado.table_ver2` では以下のように集計行を挿入しています：

```javascript
// ラベルが3つ以上の場合、各レベルの変化で集計行を挿入
if (labelCount >= 3) {
  const resultData = [];
  
  flatData.forEach((item, index) => {
    resultData.push(item);
    
    const nextItem = flatData[index + 1];
    
    // 各レベルでグループが変わるかチェック
    for (let level = labelCount - 2; level >= 0; level--) {
      const currentGroupKey = item.labels.slice(0, level + 1).join('|');
      const nextGroupKey = nextItem ? nextItem.labels.slice(0, level + 1).join('|') : '';
      
      if (currentGroupKey !== nextGroupKey) {
        // グループが変わった → 集計行を挿入
        let aggregatedItem = {
          labels: item.labels.slice(0, level + 1),
          value: Array(item.value.length).fill(0),
          count: 0,
          isTotal: true
        };
        
        // このグループのすべてのアイテムを集計
        flatData.forEach(dataItem => {
          if (!dataItem.isTotal) {
            const dataGroupKey = dataItem.labels.slice(0, level + 1).join('|');
            if (dataGroupKey === currentGroupKey) {
              const vals = Array.isArray(dataItem.value) ? dataItem.value : [dataItem.value];
              for (let i = 0; i < vals.length; i++) {
                aggregatedItem.value[i] += (vals[i] || 0);
              }
              aggregatedItem.count += 1;
            }
          }
        });
        
        resultData.push(aggregatedItem);
      }
    }
  });
  
  flatData = resultData;
}
```

### 4.4 実装のポイント

- **グループキー生成**: ラベルを結合して一意のキーを作成（例：`"JAPAN|TOYOTA|SEDAN"`）
- **値の集計**: グループに属するすべてのアイテムの値を合算
- **複数フィールド対応**: `value` が配列の場合、各フィールドを個別に集計
- **階層的な集計**: 複数レベルでの集計が必要な場合、ネストされたループでグループの変化を検出
- **マーク処理**: 集計行に `isTotal` フラグを付与して、後の処理で識別可能にする
