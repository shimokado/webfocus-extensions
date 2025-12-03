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

### 3.5 ベストプラクティス：データ正規化パターン（推奨）

WebFOCUSから渡されるデータの構造が可変的であるため、**最初に全てのデータを統一形式に正規化する**ことが最も堅牢な実装パターンです。

#### 正規化の目的

- **labels と value を常に配列として統一**
- **depth に応じた配列構造の差異を吸収**
- **後続処理を簡潔に保つ**

#### ベストプラクティス実装例

```javascript
/**
 * renderConfig のデータを統一形式に正規化する関数
 * @param {Object} renderConfig - 標準のコールバック引数オブジェクト
 * @returns {Object} 正規化されたデータ情報
 */
function normalizeRenderData(renderConfig) {
  const dataBuckets = renderConfig.dataBuckets;
  const buckets = dataBuckets.buckets;
  let data = renderConfig.data;

  // ===== Step 1: バケットメタデータを常に配列に統一 =====
  const labelsTitles = buckets.labels 
    ? (Array.isArray(buckets.labels.title) ? buckets.labels.title : [buckets.labels.title]) 
    : [];
  const labelsFieldNames = buckets.labels 
    ? (Array.isArray(buckets.labels.fieldName) ? buckets.labels.fieldName : [buckets.labels.fieldName]) 
    : [];
  const valueTitles = buckets.value 
    ? (Array.isArray(buckets.value.title) ? buckets.value.title : [buckets.value.title]) 
    : [];
  const valueFieldNames = buckets.value 
    ? (Array.isArray(buckets.value.fieldName) ? buckets.value.fieldName : [buckets.value.fieldName]) 
    : [];
  const valueNumberFormats = buckets.value 
    ? (Array.isArray(buckets.value.numberFormat) ? buckets.value.numberFormat : [buckets.value.numberFormat]) 
    : [];

  // ===== Step 2: データアイテムを統一形式に正規化 =====
  let flatData = [];

  if (dataBuckets.depth === 1) {
    // depth=1: data はそのままアイテム配列
    flatData = data.map(function(item) {
      return {
        labels: item.labels !== undefined 
          ? (Array.isArray(item.labels) ? item.labels : [item.labels]) 
          : [],
        value: item.value !== undefined 
          ? (Array.isArray(item.value) ? item.value : [item.value]) 
          : [],
        detail: item.detail !== undefined 
          ? (Array.isArray(item.detail) ? item.detail : [item.detail]) 
          : [],
        _s: item._s,
        _g: item._g
      };
    });
  } else if (dataBuckets.depth > 1) {
    // depth>1: data は配列の配列（シリーズごとにグループ化）
    data.forEach(function(series) {
      if (Array.isArray(series)) {
        series.forEach(function(item) {
          flatData.push({
            labels: item.labels !== undefined 
              ? (Array.isArray(item.labels) ? item.labels : [item.labels]) 
              : [],
            value: item.value !== undefined 
              ? (Array.isArray(item.value) ? item.value : [item.value]) 
              : [],
            detail: item.detail !== undefined 
              ? (Array.isArray(item.detail) ? item.detail : [item.detail]) 
              : [],
            _s: item._s,
            _g: item._g
          });
        });
      }
    });
  }

  // ===== Step 3: 正規化されたデータを返す =====
  return {
    labelsTitles: labelsTitles,
    labelsFieldNames: labelsFieldNames,
    valueTitles: valueTitles,
    valueFieldNames: valueFieldNames,
    valueNumberFormats: valueNumberFormats,
    data: flatData  // 統一形式のデータ
  };
}

// ===== 使用例 =====
function renderCallback(renderConfig) {
  // 正規化処理を一度だけ実行
  var normalized = normalizeRenderData(renderConfig);
  
  // 以降、normalized.data は常に統一形式で使用可能
  normalized.data.forEach(function(item) {
    // item.labels は常に配列
    // item.value は常に配列
    var firstLabel = item.labels[0];  // 安全にアクセス可能
    var firstValue = item.value[0];   // 安全にアクセス可能
    
    console.log(firstLabel, firstValue);
  });
}
```

#### 参考実装

`com.shimokado.params` はこのパターンを実装した優れた参考例です。このプラグインはコンソール出力を通じて、正規化前後のデータ構造を視覚的に示しています。

### 3.6 実装上の注意点

#### ❌ よくある誤り1: depth=1 で data を無理にラップする

```javascript
// 🔴 間違い
if (dataBuckets.depth === 1) {
    data = [data];  // depth=1 の data はすでにアイテム配列！
}
```

**原因**: depth=1 の `data` はすでに `[item1, item2, ...]` の形式です。

#### ❌ よくある誤り2: 正規化なしで labels/value にアクセス

```javascript
// 🔴 間違い
renderConfig.data.forEach(item => {
  item.labels.forEach(label => {  // ← labels が文字列の場合 Error!
    // ...
  });
});
```

#### ✅ 推奨: 最初に正規化関数を呼び出す

```javascript
// 🟢 正しい
function renderCallback(renderConfig) {
  var normalized = normalizeRenderData(renderConfig);
  
  // 以降は統一形式で安全にアクセス可能
  normalized.data.forEach(function(item) {
    item.labels.forEach(function(label) {
      console.log(label);  // 常に文字列
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
