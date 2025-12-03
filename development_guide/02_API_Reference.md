# WebFOCUS拡張グラフ開発ガイド - APIリファレンス

## 1. tdgchart オブジェクト

`tdgchart` はWebFOCUSのチャートエンジンの中核となるオブジェクトです。拡張グラフ開発においては、主に `tdgchart.extensionManager` や `moonbeamInstance`（`tdgchart` のインスタンス）を通じて機能を利用します。

### 1.1 tdgchart.extensionManager

拡張グラフの登録と管理を行うモジュールです。

#### register(config)
拡張グラフをシステムに登録します。

- **引数**: `config` (Object) - 拡張グラフの設定オブジェクト。
- **戻り値**: なし
- **使用例**:
  ```javascript
  var config = {
    id: 'com.mycompany.mychart',
    containerType: 'svg',
    renderCallback: renderCallback,
    // ...
  };
  tdgchart.extensionManager.register(config);
  ```

### 1.2 moonbeamInstance

`renderConfig.moonbeamInstance` として渡される、現在描画中のチャートインスタンスです。

#### formatNumber(number, format)
数値を指定された形式でフォーマットします。

- **引数**:
  - `number`: フォーマットする数値。
  - `format`: フォーマット文字列（例: `#,###.00`）。
- **戻り値**: フォーマットされた文字列。

#### getSeries(index)
指定されたインデックスのシリーズオブジェクトを取得します。色や表示設定などにアクセスできます。

#### buildClassName(prefix, series, group, suffix)
WebFOCUSの標準的なクラス名を生成します。これにより、ツールチップやデータ選択機能が正しく動作するようになります。

- **引数**:
  - `prefix`: 通常は `'riser'`。
  - `series`: シリーズインデックス。
  - `group`: グループインデックス。
  - `suffix`: 任意の識別子（例: `'bar'`）。
- **戻り値**: クラス名文字列（例: `'riser!s0!g0!mbar!'`）。

## 2. pv (Protovis) オブジェクト

WebFOCUSのチャートエンジンは、内部的に Protovis ライブラリ（D3.jsの前身のようなライブラリ）のユーティリティを使用しています。これらは `pv` オブジェクトを通じて利用可能です。

### 2.1 pv.color(colorString)
色を操作するためのオブジェクトを生成します。

- **メソッド**:
  - `.lighter(k)`: 色を明るくします。
  - `.darker(k)`: 色を暗くします。
  - `.color`: 色コード（文字列）を取得します。

### 2.2 pv.blend(arrays)
複数の配列を結合してフラットな配列にします。

### 2.3 pv.range(start, stop, step)
Pythonの `range` のような数値配列を生成します。

## 3. renderConfig のデータ構造

### 3.1 概要

`renderCallback(renderConfig)` に渡される `renderConfig` オブジェクトのデータ構造は、`dataBuckets.depth` の値によって異なります。**depth が異なると、data の形式が根本的に変わる**ため、慎重に処理が必要です。

### 3.2 重要なポイント：depth の意味

| depth値 | 意味 | data の形式 |
|---------|------|-----------|
| **1** | 単一シリーズまたは単純なグループ化 | 配列の配列では**ない** |
| **>1** | 複数シリーズ（複数の値の選択） | 配列の配列 |

### 3.3 depth = 1 のデータ構造

**depth = 1 の場合、labels と value の形式が柔軟に変わります。**

#### パターン1: 複数ラベル＆複数値

```javascript
renderConfig.data = [
  {
    "labels": ["ENGLAND", "JAGUAR"],      // ← 配列（複数レベル）
    "value": [12000, 13491, 11194],       // ← 配列（複数の値）
    "_s": 0,
    "_g": 0
  },
  {
    "labels": ["ENGLAND", "JENSEN"],
    "value": [0, 17850, 14940],
    "_s": 0,
    "_g": 1
  }
  // ... 複数のアイテム
];

renderConfig.dataBuckets = {
  "depth": 1,
  "buckets": {
    "labels": {
      "title": ["COUNTRY", "CAR"],  // ← 複数の場合は配列
      "count": 2
    },
    "value": {
      "title": ["SEATS", "RETAIL_COST"],  // ← 複数の場合は配列
      "count": 2
    }
  }
};
```

### ⚠️ 重要：title が「文字列」か「配列」かを判定する

`dataBuckets.buckets.labels.title` と `dataBuckets.buckets.value.title` は、以下のように変動します：

| 条件 | title の型 | 例 |
| --- | --- | --- |
| ラベル/値が1つのみ | **文字列** | `"COUNTRY"` |
| ラベル/値が2つ以上 | **配列** | `["COUNTRY", "CAR"]` |

**実装上のポイント**：

```javascript
// titleが文字列か配列かをチェック
var labelTitles = Array.isArray(dataBuckets.buckets.labels.title) 
  ? dataBuckets.buckets.labels.title 
  : [dataBuckets.buckets.labels.title];

var valueTitles = Array.isArray(dataBuckets.buckets.value.title) 
  ? dataBuckets.buckets.value.title 
  : [dataBuckets.buckets.value.title];

// 以降は常に配列として扱える
labelTitles.forEach(function(title) { 
  // タイトルを処理 
});
```

#### パターン2: 単一ラベル＆単一値

```javascript
renderConfig.data = [
  {
    "labels": "ENGLAND",                   // ← 文字列（配列ではない！）
    "value": 12000,                        // ← 数値（配列ではない！）
    "_s": 0,
    "_g": 0
  },
  {
    "labels": "FRANCE",
    "value": 9500,
    "_s": 0,
    "_g": 1
  }
  // ... 複数のアイテム
];

renderConfig.dataBuckets = {
  "depth": 1,
  "buckets": {
    "labels": {
      "title": "COUNTRY",                  // ← 文字列
      "count": 1
    },
    "value": {
      "title": "SALES",                    // ← 文字列
      "count": 1
    }
  }
};
```

#### パターン3: 複数ラベル＆単一値

```javascript
renderConfig.data = [
  {
    "labels": ["ENGLAND", "JAGUAR", "TYPE_A"],  // ← 配列（複数レベル）
    "value": 12000,                              // ← 数値（単一値）
    "_s": 0,
    "_g": 0
  },
  // ...
];

renderConfig.dataBuckets = {
  "depth": 1,
  "buckets": {
    "labels": {
      "title": ["COUNTRY", "CAR", "TYPE"],
      "count": 3
    },
    "value": {
      "title": "SALES",                    // ← 文字列
      "count": 1
    }
  }
};
```

### 3.4 depth > 1 のデータ構造（複数シリーズ）

```javascript
renderConfig.data = [
  // シリーズ1
  [
    {
      "labels": ["ENGLAND", "JAGUAR"],
      "value": [12000, 13491],
      "_s": 0,
      "_g": 0
    },
    {
      "labels": ["ENGLAND", "JENSEN"],
      "value": [0, 17850],
      "_s": 0,
      "_g": 1
    }
  ],
  // シリーズ2
  [
    {
      "labels": ["FRANCE", "PEUGEOT"],
      "value": [8000, 9500],
      "_s": 1,
      "_g": 0
    },
    {
      "labels": ["FRANCE", "RENAULT"],
      "value": [7500, 8800],
      "_s": 1,
      "_g": 1
    }
  ]
  // ... 複数のシリーズ
];

renderConfig.dataBuckets = {
  "depth": 2,  // ← 2以上
  "buckets": { /* ... */ }
};
```

### 3.5 よくある誤り＆正しい処理方法

#### ❌ 誤り1: depth=1 なら data を配列にラップする

```javascript
// 🔴 間違い
if (dataBuckets.depth === 1) {
    data = [data];  // depth=1 の data はすでにアイテム配列！
}
```

**原因**: depth=1 の `data` はすでに `[item1, item2, ...]` の形式。これを `[[item1, item2, ...]]` にラップすると、最初の1個のアイテムだけが処理される。

#### ✅ 正しい処理1: depth に応じてフラット化

```javascript
// 🟢 正しい
let flatData = [];

if (dataBuckets.depth === 1) {
  // depth=1: data はそのままアイテム配列
  flatData = data.map(item => ({
    ...item,
    // ← value の正規化（配列 or 単一値の両方に対応）
    value: Array.isArray(item.value) ? item.value : [item.value]
  }));
} else if (dataBuckets.depth > 1) {
  // depth>1: data は配列の配列
  data.forEach(series => {
    if (Array.isArray(series)) {
      series.forEach(item => {
        flatData.push({
          ...item,
          value: Array.isArray(item.value) ? item.value : [item.value]
        });
      });
    }
  });
}
```

#### ❌ 誤り2: labels/value が常に配列だと仮定

```javascript
// 🔴 間違い
data.forEach(item => {
  item.labels.forEach(label => {  // ← labels が文字列なら Error!
    // ...
  });
  item.value[0] = item.value[0] + 100;  // ← value が数値なら Error!
});
```

#### ✅ 正しい処理2: 配列か単一値かチェック

```javascript
// 🟢 正しい
data.forEach(item => {
  const labels = Array.isArray(item.labels) ? item.labels : [item.labels];
  const values = Array.isArray(item.value) ? item.value : [item.value];
  
  labels.forEach(label => {
    console.log(label);
  });
  
  values.forEach((val, idx) => {
    values[idx] = val + 100;
  });
});
```

#### ❌ 誤り3: depth を確認せずにデータアクセス

```javascript
// 🔴 間違い
renderConfig.data.forEach(item => {  // depth>1 だと data[0] は配列
  console.log(item.labels);  // Error: item.labels is undefined
});
```

#### ✅ 正しい処理3: depth を確認してからアクセス

```javascript
// 🟢 正しい
if (renderConfig.dataBuckets.depth === 1) {
  renderConfig.data.forEach(item => {
    console.log(item.labels);
  });
} else {
  renderConfig.data.forEach(series => {
    series.forEach(item => {
      console.log(item.labels);
    });
  });
}
```

### 3.6 renderConfig の完全な構造

```javascript
renderConfig = {
  // 必須
  "container": HTMLElement,                    // 描画先のDOM要素
  "moonbeamInstance": tdgchartInstance,        // チャートエンジンのインスタンス
  "data": [...],                               // 深さに応じた配列またはそれ以上
  "dataBuckets": {                             // データバケット定義
    "depth": 1,                                // 1: 単一シリーズ, >1: 複数シリーズ
    "buckets": {
      "labels": {
        "title": String | Array,               // ラベルのタイトル
        "fieldName": String | Array,           // フィールド名
        "count": Number                        // ラベルの個数
      },
      "value": {
        "title": String | Array,               // 値のタイトル
        "fieldName": String | Array,           // フィールド名
        "numberFormat": String | Array,        // 数値フォーマット
        "count": Number                        // 値の個数
      }
    }
  },
  
  // オプション
  "width": Number,                             // コンテナの幅
  "height": Number,                            // コンテナの高さ
  "properties": Object,                        // カスタムプロパティ
  "modules": {                                 // 利用可能なモジュール
    "tooltip": TooltipModule,
    "dataLabels": DataLabelsModule,
    "dataSelection": DataSelectionModule
  },
  
  // コールバック
  "renderComplete": Function                   // 描画完了時のコールバック
};
```

## 4. WebFOCUSによる拡張グラフ登録メカニズム

WebFOCUS（`tdgchart.js`）は、以下の手順で拡張グラフを認識・ロードします。このプロセスは**クライアントサイド（ブラウザ）**で実行されます。Tomcatサーバーの起動時ではなく、グラフを含むページがブラウザにロードされるタイミングで発生します。

1. **拡張リストの取得**:
   - `tdgchart.js` は初期化時に、サーバー上の `html5chart_extensions.json` ファイルを非同期通信（AJAX）で取得します。
   - このファイルには、利用可能な拡張グラフのIDと有効化状態（`enabled: true`）が定義されています。

2. **スクリプトのロード**:
   - `html5chart_extensions.json` に記載された各拡張グラフについて、対応する `.js` ファイル（例: `com.shimokado.simple_bar/com.shimokado.simple_bar.js`）を動的にロードします。

3. **登録の実行**:
   - 各拡張グラフの `.js` ファイル内で `tdgchart.extensionManager.register(config)` が呼び出されることで、`tdgchart` オブジェクト内部の拡張リストに登録されます。

このメカニズムにより、開発者は `html5chart_extensions.json` にエントリを追加し、所定のフォルダにファイルを配置するだけで、WebFOCUSにカスタムチャートを追加できます.
