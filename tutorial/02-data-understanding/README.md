# 02. データ理解編 - com.shimokado.paramsを使った分析

## 🎯 この章の目標

- `com.shimokado.params`を使って実際のWebFOCUSデータを分析する
- WebFOCUSから提供されるJSONデータ構造を理解する
- `renderConfig`オブジェクトの詳細を把握する

## 📊 com.shimokado.paramsとは

`com.shimokado.params`は、WebFOCUSから拡張機能に渡されるデータを詳細に表示するデバッグツールです。これにより、開発者は以下を確認できます：

- 渡されたデータの構造
- データバケットの設定
- プロパティの値
- レンダリングに必要な各種パラメータ

**⚠️ 重要：この章ではデータ構造の理解に加え、データ正規化の重要性を学びます。**

## 🔍 実際のデータ分析

### WebFOCUSでの実行手順

1. **WebFOCUSでレポートを作成**
   - データソース：CAR（サンプルデータ）
   - チャートタイプ：HTML5拡張 > プロパティ表示（開発用）

2. **フィールドの設定**
   - ラベル：COUNTRY, MODEL
   - 値：SALES, MAX DEALER_COST

3. **実行結果の確認**
   ブラウザに表示される詳細なJSONデータを確認

## 📋 提供されたサンプル出力の分析

### 1. データ配列（data）の構造

```javascript
data: [
  [
    [
      ['ENGLAND', 'INTERCEPTOR III'],
      [0, 14940]
    ],
    [
      ['ENGLAND', 'TR7'],
      [0, 4292]
    ],
    // ... 他のデータ
  ]
]
```

#### データの階層構造

- **最外層**: シリーズブレーク対応（通常は1つの配列）
- **中間層**: 個々のデータレコード
- **内層**: `[ラベル配列, 値配列]`の組み合わせ

### 2. dataBucketsオブジェクトの詳細

```javascript
dataBuckets: {
  internal_api_version: 2.0,
  buckets: [
    {
      id: 'labels',
      fields: [
        { title: 'COUNTRY', fieldName: 'CAR.ORIGIN.COUNTRY' },
        { title: 'MODEL', fieldName: 'CAR.CARREC.MODEL' }
      ]
    },
    {
      id: 'value', 
      fields: [
        { title: 'SALES', fieldName: 'CAR.BODY.SALES', numberFormat: '#' },
        { title: 'MAX DEALER_COST', fieldName: 'MAX.CAR.BODY.DEALER_COST', numberFormat: '#,###' }
      ]
    }
  ]
}
```

#### バケット情報の要素

- **id**: バケット識別子（labels, value, detail等）
- **fields**: バケット内のフィールド配列
  - **title**: 表示用タイトル
  - **fieldName**: WebFOCUSでの内部フィールド名
  - **numberFormat**: 数値フォーマット定義

### 3. seriesオブジェクトとツールチップ

```javascript
series: [
  {
    series: 0,
    label: ' ',
    tooltip: [
      { type: 'nameValue', name: 'COUNTRY', value: '{{extension_bucket("labels",0)}}' },
      { type: 'nameValue', name: 'MODEL', value: '{{extension_bucket("labels",1)}}' },
      { type: 'nameValue', name: 'SALES', value: '{{extension_bucket("value",0)}}' },
      { type: 'nameValue', name: 'MAX DEALER_COST', value: '{{extension_bucket("value",1)|#("#,###")}}' }
    ]
  }
]
```

#### ツールチップの動的生成

- テンプレート形式でのデータバインディング
- `{{extension_bucket("bucket_id", index)}}`での値参照
- パイプ演算子（`|`）での書式設定

## 🛠️ データ処理の実装パターン

### 正規化処理の重要性

WebFOCUSからのデータは、以下のような不整合が発生する可能性があります：

1. **バケット値の型不整合**：単一値と配列の混在
2. **欠損データ**：null/undefinedの存在
3. **階層構造の違い**：series_breakの有無による構造変化

### 安全なデータアクセスパターン

```javascript
// バケット配列の正規化
// count=1なら文字列、count>1なら配列として扱う
const labelsTitles = buckets.labels ? 
  (buckets.labels.count === 1 ? [buckets.labels.title] : buckets.labels.title) : [];

// データ配列の正規化  
const datas = data.map(d => ({
  labels: d.labels !== undefined ? 
    (Array.isArray(d.labels) ? d.labels : [d.labels]) : [],
  value: d.value !== undefined ? 
    (Array.isArray(d.value) ? d.value : [d.value]) : []
}));
```

### ⚠️ 重要：データ正規化の実装パターン

WebFOCUS拡張グラフ開発で最も重要なのは、**renderCallbackの最初でデータを統一形式に正規化すること**です。development_guideのトラブルシューティングガイドを参考に、以下のベストプラクティスを実装してください：

```javascript
/**
 * renderConfig のデータを統一形式に正規化する関数
 * @param {Object} renderConfig - 標準のコールバック引数オブジェクト
 * @returns {Object} 正規化されたデータ情報
 */
function normalizeRenderData(renderConfig) {
  var dataBuckets = renderConfig.dataBuckets;
  var buckets = dataBuckets.buckets;
  var data = renderConfig.data;
  var depth = dataBuckets.depth;

  // ===== Step 1: バケットメタデータを常に配列に統一 =====
  // count=1なら文字列、count>1なら配列として扱う
  var labelsTitles = buckets.labels 
    ? (buckets.labels.count === 1 ? [buckets.labels.title] : buckets.labels.title) 
    : [];
  var labelsFieldNames = buckets.labels 
    ? (buckets.labels.count === 1 ? [buckets.labels.fieldName] : buckets.labels.fieldName) 
    : [];
  var valueTitles = buckets.value 
    ? (buckets.value.count === 1 ? [buckets.value.title] : buckets.value.title) 
    : [];
  var valueFieldNames = buckets.value 
    ? (buckets.value.count === 1 ? [buckets.value.fieldName] : buckets.value.fieldName) 
    : [];

  // ===== Step 2: データアイテムを統一形式に正規化 =====
  var flatData = [];

  if (depth === 1) {
    // depth=1: data はそのままアイテム配列
    flatData = data.map(function(item) {
      return {
        labels: item.labels !== undefined 
          ? (Array.isArray(item.labels) ? item.labels : [item.labels]) 
          : [],
        value: item.value !== undefined 
          ? (Array.isArray(item.value) ? item.value : [item.value]) 
          : [],
        _s: item._s,
        _g: item._g
      };
    });
  } else if (depth > 1) {
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
    data: flatData  // 統一形式のデータ
  };
}

// ===== 使用例 =====
function renderCallback(renderConfig) {
  try {
    // Step 1: 正規化処理を最初に実行
    var normalized = normalizeRenderData(renderConfig);
    
    // Step 2: 正規化後は常に統一形式で使用可能
    var chart = renderConfig.moonbeamInstance;
    var container = d3.select(renderConfig.container);
    
    // Step 3: 安全にデータにアクセス
    normalized.data.forEach(function(item) {
      var firstLabel = item.labels[0];  // 常に文字列
      var firstValue = item.value[0];   // 常に数値
      console.log(firstLabel, firstValue);
    });
    
    // Step 4: レンダリング処理
    // ... 描画コード ...
    
    renderConfig.renderComplete();
    
  } catch (e) {
    console.error('レンダリングエラー:', e);
    renderConfig.renderComplete();
  }
}
```

**この正規化パターンは、すべての拡張グラフ開発で必須です。** 実装を忘れると、ランタイムエラーが発生します。

## 📈 数値フォーマットの活用

### moonbeamInstanceの便利メソッド

```javascript
// 数値フォーマットの適用
var formattedValue = chart.formatNumber(value, buckets.value.numberFormat || '###');

// 例：
// 入力：14940, フォーマット："#,###" 
// 出力："14,940"
```

### よく使用される数値フォーマット

- `#`: 基本数値
- `#,###`: 桁区切りあり
- `#.##`: 小数点以下2桁
- `0.00%`: パーセント表示

## 🔧 実践演習

### 演習1：データ構造の確認

1. WebFOCUSで`com.shimokado.params`を使用してレポートを作成
2. 異なるフィールド組み合わせでデータ構造の変化を確認
3. コンソール出力でJSONデータを詳細分析

### 演習2：データ処理コードの理解

`com.shimokado.params.js`のコードを読んで、以下を確認：

- データ正規化の処理
- 配列変換ロジック
- HTML生成方法

### 演習3：デバッグ活用

既存の拡張機能でエラーが発生した際に、`params`を使ってデータ構造を確認する方法を習得

### 演習4：プロパティテスト（新機能）

**2025年11月アップデート**: com.shimokado.paramsでプロパティベースのスタイル設定をテスト

```webfocus
*GRAPH_JS
chartType: "com.shimokado.params",
properties: {
  tableStyle: {
    fontSize: "18px",
    color: "#2c3e50"
  },
  valueLabel: {
    fontWeight: "bold",
    color: "#e74c3c"
  },
  label: {
    text: {
      color: "#34495e",
      size: "14px"
    }
  }
}
*END
```

詳細な設定方法は `doc/com.shimokado.params_property_guide.md` を参照してください。

## 📝 重要ポイントまとめ

1. **データ構造は可変**: フィールド数や型によって動的に変化
2. **正規化が必要**: 安全なコードのため配列化処理は必須
3. **moonbeamInstanceの活用**: WebFOCUS提供のユーティリティ関数を使用
4. **デバッグツールとしてparams活用**: 開発時の強力なサポートツール

## 🔄 次のステップ

データ構造の理解ができたら、「03-basic-development」に進んで、実際に拡張機能を開発してみましょう。

---

**💡 学習のコツ**:

- 実際のWebFOCUSでparamsを動かしてデータを確認してみましょう
- 異なるデータソースやフィールド組み合わせで試してください
- コンソール出力をコピーしてJSONフォーマッターで整理すると見やすくなります
