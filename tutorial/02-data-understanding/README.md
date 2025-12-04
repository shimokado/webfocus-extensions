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