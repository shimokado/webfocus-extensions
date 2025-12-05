# WebFOCUS拡張グラフ開発ガイド - APIリファレンス

## 🚨 **重要なお知らせ**

**新規拡張グラフ開発時は、必ず [06_Troubleshooting_DataDepth.md](06_Troubleshooting_DataDepth.md) を先に読んでください。**

このドキュメントには `renderConfig.data` のデータ構造が `depth` パラメータによってどのように変化するかが詳述されています。データ正規化の実装を忘れると、ランタイムエラーが発生します。

## 1. tdgchart オブジェクト

`tdgchart` はWebFOCUSのチャートエンジンの中核となるオブジェクトです。拡張グラフ開発においては、主に `tdgchart.extensionManager` や `moonbeamInstance`（`tdgchart` のインスタンス）を通じて機能を利用します。

### 1.1 tdgchart.util

`tdgchart.util` は、便利なユーティリティメソッドを提供します。

#### get(path, obj, defaultValue)

指定されたパスに従ってオブジェクトからプロパティを取得します。深い階層のプロパティに安全にアクセスするために使用します。

- **引数**:
  - `path` (String): ドット表記またはブラケット表記のプロパティパス
  - `obj` (Object): 検索対象のオブジェクト
  - `defaultValue` (Any): プロパティが存在しない場合の既定値
- **使用例**:

```javascript
// dataBucketsからvalue.titleを取得（存在しない場合は空文字列）
var title = tdgchart.util.get('dataBuckets.buckets.value.title[0]', renderConfig, '');
```

#### ajax(url, options)

AJAXリクエストを送信し、リソースを非同期に取得します。

- **引数**:
  - `url` (String): リクエスト先のURL
  - `options` (Object): オプション（`asJSON: true` など）
- **戻り値**: Promiseオブジェクト
- **使用例**:

```javascript
var info = tdgchart.util.ajax('lib/extra_properties.json', {asJSON: true});
```

#### color(colorString)

色を表す文字列から色オブジェクトを作成します。

- **引数**: `colorString` (String) - 色を表す文字列（例: "red", "#FF0000"）
- **戻り値**: 色操作オブジェクト（`.lighter(k)`, `.darker(k)` メソッドなどを持つ）

### 1.2 tdgchart.extensionManager

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

### 1.3 moonbeamInstance

`renderConfig.moonbeamInstance`（以下 `chart`）は、WebFOCUSのチャートエンジン（Moonbeam）のインスタンスそのものです。これを通じて、エンジンの内部機能にアクセスできます。

#### 主要プロパティ

| プロパティ | 説明 | 使用例 |
| --- | --- | --- |
| `chart.legend.visible` | 凡例の表示/非表示を制御します。 | `chart.legend.visible = false;` |
| `chart.dataSelection.enabled` | データ選択機能の有効/無効を制御します。 | `chart.dataSelection.enabled = false;` |
| `chart.errorMessage` | チャート領域に表示するエラーメッセージを設定します。 | `chart.errorMessage = "No Data";` |
| `chart.dataLabels.visible` | データラベルの表示/非表示を制御します。 | `chart.dataLabels.visible = true;` |

#### 主要メソッド

**`chart.formatNumber(number, format)`**

数値を指定された形式でフォーマットします。

- **引数**:
  - `number`: フォーマットする数値。
  - `format`: フォーマット文字列（例: `#,###.00`）。
- **戻り値**: フォーマットされた文字列。

**`chart.getSeries(index)`**

指定されたインデックスのシリーズオブジェクトを取得します。色やツールチップの設定にアクセスできます。

```javascript
// シリーズ0の色を取得・変更
var series0 = chart.getSeries(0);
series0.color = "red";
```

**`chart.getSeriesAndGroupProperty(seriesID, groupID, property)`**

特定のシリーズおよびグループに対応するプロパティ（色など）を取得します。WebFOCUSの配色設定を尊重した描画を行う場合に非常に重要です。

```javascript
// シリーズsの塗りつぶし色を取得
var color = chart.getSeriesAndGroupProperty(s, null, 'color');
```

**`chart.buildClassName(prefix, series, group, suffix)`**

WebFOCUSの標準的なクラス名を生成します。これにより、ツールチップやデータ選択機能が正しく動作するようになります。

- **引数**:
  - `prefix`: 通常は `'riser'`。
  - `series`: シリーズインデックス。
  - `group`: グループインデックス。
  - `suffix`: 任意の識別子（例: `'bar'`）。

**`chart.truncateLabel(text, font, maxWidth)`**

指定された幅に収まるようにテキストを切り詰め（省略記号付与）、返します。

```javascript
var label = chart.truncateLabel("Very Long Label Text", "12px Arial", 100);
// 結果: "Very Long..."
```

**`chart.parseTemplate(url, dataPoint, data, ids)`**

ドリルダウンURLなどのテンプレート文字列を解析し、実際のデータ値を埋め込んだURLを生成します。

```javascript
var url = chart.parseTemplate(dispatcher.url, dataPoint, renderConfig.data, ids);
```

**`chart.redraw()`**

チャートを再描画します。`errorMessage` を設定した後などに呼び出します。

```javascript
chart.errorMessage = "Error loading data";
chart.redraw();
```

**`chart.addHTMLToolTips(container)`**

指定されたコンテナ内の要素に対して、WebFOCUS標準のHTMLツールチップ機能を有効化します。

```javascript
chart.addHTMLToolTips(d3.select("#myContainer"));
```
- **戻り値**: クラス名文字列（例: `'riser!s0!g0!mbar!'`）。

### 1.4 プロパティの有効範囲と外部ライブラリ利用時の注意

`moonbeamInstance` のプロパティやメソッドが「自動的に効く」かどうかは、その機能が **「Moonbeamが描画するもの」** か **「拡張機能が描画するもの」** かによって異なります。

#### A. Moonbeamが制御するもの（自動的に効く）

以下の要素は、拡張機能の描画領域（コンテナ）の **外側** または **上位レイヤー** でMoonbeamエンジンによって描画・管理されます。したがって、Chart.jsやApexChartsを使用していても、`moonbeamInstance` のプロパティ設定は有効です。

- **凡例 (Legend)**: `chart.legend.visible`
- **タイトル/フッター**: `chart.title.visible`, `chart.footnote.text`
- **エラーメッセージ**: `chart.errorMessage`
- **ツールチップ（HTMLベース）**: `chart.addHTMLToolTips` を使用した場合

#### B. 拡張機能が制御するもの（手動で適用が必要）

以下の要素は、拡張機能の描画ロジック（D3.js, Chart.jsなど）によって描画されます。したがって、`moonbeamInstance` のプロパティを変更しただけでは **反映されません**。拡張機能のコード内で値を読み取り、ライブラリの設定に反映させる必要があります。

- **シリーズの色**: `chart.getSeries(0).color`
    - ❌ `chart.getSeries(0).color = 'red'` としても、Chart.jsのバーは赤くなりません。
    - ⭕ `config.data.datasets[0].backgroundColor = chart.getSeries(0).color` のように代入する必要があります。
- **データラベル**: `chart.dataLabels.visible`
    - 拡張機能側でこのフラグをチェックし、ライブラリのデータラベル表示設定を切り替えるロジックが必要です。
- **マーカーサイズ/形状**: `chart.getSeries(0).marker`

#### まとめ

外部ライブラリを使用する場合、`moonbeamInstance` は **「設定情報の取得元」** として扱い、その情報をライブラリの `config` オブジェクトに **「マッピング（転記）」** する実装が必要です。


## 2. pv (Protovis) オブジェクト

WebFOCUSのチャートエンジンは、内部的に Protovis ライブラリ（D3.jsの前身のようなライブラリ）のユーティリティを使用しています。これらは `pv` オブジェクトを通じて利用可能です。

### 2.1 pv.color(colorString)

色を操作するためのオブジェクトを生成します。`tdgchart.util.color` と同等です。

- **メソッド**:
  - `.lighter(k)`: 色を明るくします。
  - `.darker(k)`: 色を暗くします。
  - `.color`: 色コード（文字列）を取得します。

### 2.2 pv.blend(arrays)

複数の配列を結合してフラットな配列にします。多次元配列を1次元配列に平坦化するのによく使用されます。

- **引数**: `arrays` (Array[]) - 結合する配列の配列
- **戻り値**: 結合された単一の配列

### 2.3 pv.range(start, stop, step)

Pythonの `range` のような数値配列を生成します。

- **引数**:
  - `start` (Number, オプション): 開始値（デフォルト0）
  - `stop` (Number): 終了値
  - `step` (Number, オプション): ステップ幅（デフォルト1）
- **使用例**:
  ```javascript
  pv.range(5); // [0, 1, 2, 3, 4]
  ```

### 2.4 その他のユーティリティ

- **pv.search(array, value)**: ソート済み配列内で指定した値の位置を二分探索で検索します。
- **pv.vector(x, y)**: 2Dベクトルを作成します。
- **pv.log(x, b)**: 指定した底による対数を計算します。


## 3. renderConfig のデータ構造

### 3.1 概要

`renderCallback(renderConfig)` に渡される `renderConfig` オブジェクトのデータ構造は、`dataBuckets.depth` の値によって異なります。**depth が異なると、data の形式が根本的に変わる**ため、慎重に処理が必要です。

実際のWebFOCUS出力例については、[07_RenderConfig_Samples.md](07_RenderConfig_Samples.md) を参照してください。

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
- **buckets のメタデータを count ベースで正確に判定**
- **後続処理を簡潔に保つ**

#### 重要：countベースの判定

buckets.labels.title/fieldName と buckets.value.title/fieldName/numberFormat の型は、**count の値によって決まります**：

- `count === 1` の場合：**文字列**
- `count > 1` の場合：**配列**

depth ではなく count を使用して判定することで、より信頼性の高い正規化が可能になります。

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

  // ===== Step 1: バケットメタデータを count ベースで判定して常に配列に統一 =====
  const labelsCount = buckets.labels ? buckets.labels.count : 0;
  const valueCount = buckets.value ? buckets.value.count : 0;
  
  // count=1なら文字列、count>1なら配列として扱う
  const labelsTitles = buckets.labels 
    ? (labelsCount === 1 ? [buckets.labels.title] : buckets.labels.title) 
    : [];
  const labelsFieldNames = buckets.labels 
    ? (labelsCount === 1 ? [buckets.labels.fieldName] : buckets.labels.fieldName) 
    : [];
  const valueTitles = buckets.value 
    ? (valueCount === 1 ? [buckets.value.title] : buckets.value.title) 
    : [];
  const valueFieldNames = buckets.value 
    ? (valueCount === 1 ? [buckets.value.fieldName] : buckets.value.fieldName) 
    : [];
  const valueNumberFormats = buckets.value 
    ? (valueCount === 1 ? [buckets.value.numberFormat] : buckets.value.numberFormat) 
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
