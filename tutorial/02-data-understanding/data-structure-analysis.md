# データ構造詳細解析

## 🔍 データ構造の重要な違い：単一フィールドと複数フィールド

### 🎯 構造の違いの概要

WebFOCUSから提供されるデータ構造は、**選択されたフィールドの数（単一 vs 複数）**によって大きく異なります。これは拡張機能開発において最も注意すべき点の一つです。

#### 単一フィールドの場合
- **bucketsオブジェクト**: プロパティが文字列または数値
- **dataオブジェクト**: 各フィールドが直接的な値

#### 複数フィールドの場合
- **bucketsオブジェクト**: プロパティが配列
- **dataオブジェクト**: 各フィールドが配列

### 📊 実際のJSONサンプル比較

#### ケース1: 単一フィールドの構造

**バケット設定:**
- ラベル: COUNTRY（1つ）
- 値: SALES（1つ）

```json
{
  "buckets": {
    "labels": {
      "title": "COUNTRY",           // ← 文字列（配列ではない）
      "fieldName": "CAR.ORIGIN.COUNTRY",
      "count": 1
    },
    "value": {
      "title": "SALES",              // ← 文字列（配列ではない）
      "fieldName": "CAR.BODY.SALES",
      "numberFormat": "#",
      "count": 1
    }
  }
}
```

**データ構造:**
```json
[
  {
    "labels": "ENGLAND",           // ← 文字列（配列ではない）
    "value": 12000,                // ← 数値（配列ではない）
    "_s": 0,
    "_g": 0
  },
  {
    "labels": "FRANCE",
    "value": 0,
    "_s": 0,
    "_g": 1
  }
]
```

**com.shimokado.paramsでの正規化出力例:**
```javascript
// 正規化されたbuckets情報
labelsTitles: ["COUNTRY"]          // 文字列→配列に変換
labelsFieldNames: ["CAR.ORIGIN.COUNTRY"] 
valueTitles: ["SALES"]             // 文字列→配列に変換
valueFieldNames: ["CAR.BODY.SALES"]
valueNumberFormats: ["#"]          // 文字列→配列に変換

// 正規化されたdata
datas: [
  {
    "labels": ["ENGLAND"],         // 文字列→配列に変換
    "value": [12000],              // 数値→配列に変換
    "detail": []
  }
]
```

#### ケース2: 複数フィールドの構造

**バケット設定:**
- ラベル: COUNTRY, MODEL（2つ）
- 値: SALES, COST（2つ）

```json
{
  "buckets": {
    "labels": {
      "title": ["COUNTRY", "MODEL"],     // ← 配列
      "fieldName": ["CAR.ORIGIN.COUNTRY", "CAR.CARREC.MODEL"],
      "count": 2
    },
    "value": {
      "title": ["SALES", "COST"],        // ← 配列
      "fieldName": ["CAR.BODY.SALES", "CAR.BODY.DEALER_COST"],
      "numberFormat": ["#", "#"],
      "count": 2
    }
  }
}
```

**データ構造:**
```json
[
  {
    "labels": ["ENGLAND", "JAGUAR"],   // ← 配列
    "value": [12000, 9000],           // ← 配列
    "_s": 0,
    "_g": 0
  },
  {
    "labels": ["FRANCE", "PEUGEOT"],
    "value": [15000, 11000],
    "_s": 0,
    "_g": 1
  }
]
```

### ⚠️ 開発上の問題点

この構造の違いにより、以下のようなエラーが頻発します：

```javascript
// 単一フィールドの場合
buckets.labels.title.forEach(...)  // ❌ エラー！文字列にforEachは使えません

// 複数フィールドの場合
data[0].labels.toUpperCase()      // ❌ エラー！配列にtoUpperCaseは使えません
```

### 🛠️ データ正規化の実装詳細

**正規化前（問題のあるコード）:**
```javascript
// 複数フィールドでエラーが発生
const title = buckets.labels.title.toUpperCase(); // ❌

// 単一フィールドでエラーが発生  
buckets.labels.title.forEach(...); // ❌
```

**正規化後（安定したコード）:**
```javascript
// 単一・複数どちらでも動作
const normalizedTitles = Array.isArray(buckets.labels.title) ? 
  buckets.labels.title : [buckets.labels.title];

normalizedTitles.forEach(function(title) {
  console.log(title.toUpperCase()); // ✅ 常に動作
});
```

### 💡 実用的なTips

**tip 1: デバッグ時の確認ポイント**
```javascript
console.log('Field count - labels:', buckets.labels?.count);
console.log('Field count - value:', buckets.value?.count);
console.log('Is labels title array:', Array.isArray(buckets.labels?.title));
console.log('Is data labels array:', Array.isArray(data[0]?.labels));
```

**tip 2: 汎用的なヘルパー関数**
```javascript
function ensureArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

// 使用例
const titles = ensureArray(buckets.labels?.title);
```

## 提供されたWebFOCUS出力の詳細分析

### HTMLドキュメント構造

```html
<!DOCTYPE html>
<html lang='ja-JP'>
<HEAD>
  <meta http-equiv=Content-Type content="text/html; charset=utf-8">
  <meta name='viewport' content='width=device-width, initial-scale=1, maximum-scale=5, user-scalable=1'>
  <TITLE>params</TITLE>
  <script src='/ibi_apps/tdg/jschart/distribution/S6_17308996521F/tdgchart-min.js'></script>
</HEAD>
```

- **文字エンコーディング**: UTF-8
- **レスポンシブ対応**: viewport設定
- **tdgchart-min.js**: WebFOCUSチャートエンジンの読み込み

### チャートエンジンの初期化

```javascript
var chart = new tdgchart({
  backend:'js', 
  allowBackendFallback:true, 
  webappContext: '/ibi_apps', 
  htmlKey: 'S6_17308996521F', 
  extensionKey: 'Cfd442db6a075790da81a3c454255c9c4'
});
```

**重要なパラメータ**:
- `backend`: JavaScriptレンダリング
- `webappContext`: WebFOCUSアプリケーションパス
- `htmlKey`: セッション固有の識別子
- `extensionKey`: 拡張機能の識別キー

### データマッピング構造

```javascript
dataArrayMap: ['labels', 'value']
```

この配列により、データ配列のインデックスとバケットIDが対応付けられます：
- インデックス0 → 'labels'
- インデックス1 → 'value'

### 実際のデータ例の分析

#### サンプルデータレコード1

```javascript
[
  [['ENGLAND', 'INTERCEPTOR III'], [0, 14940]]
]
```

**構造解析**:
- `['ENGLAND', 'INTERCEPTOR III']`: labelsバケットの値（COUNTRY, MODEL）
- `[0, 14940]`: valueバケットの値（SALES, MAX DEALER_COST）

#### データの変換プロセス

WebFOCUS内部 → 拡張機能での利用:

```
元データ（テーブル形式）:
COUNTRY | MODEL          | SALES | MAX DEALER_COST
ENGLAND | INTERCEPTOR III|   0   |    14940

↓

配列形式:
[
  [['ENGLAND', 'INTERCEPTOR III'], [0, 14940]]
]
```

## より複雑なデータパターンの理解

### シリーズブレーク使用時

```javascript
// series_break使用時のデータ構造例
data: [
  [/* イタリア車のデータ */],
  [/* イギリス車のデータ */],
  [/* ドイツ車のデータ */]
]
```

### 複数測定値の場合

```javascript
// 複数valueバケットのデータ
[
  [['COUNTRY'], [sales1, sales2, sales3, cost1, cost2]]
]
```

### 階層ラベルの処理

```javascript
// 複数階層のラベル
[
  [['EUROPE', 'ENGLAND', 'LONDON'], [value]]
]
```

## JavaScript処理での注意点

### データの存在チェック

```javascript
// 安全なデータアクセス
if (data && data.length > 0) {
  data.forEach(series => {
    if (Array.isArray(series)) {
      series.forEach(record => {
        const labels = record[0] || [];
        const values = record[1] || [];
        // 処理続行...
      });
    }
  });
}
```

### 型の統一化処理

```javascript
// 単一値と配列の統一処理
function normalizeToArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

// 使用例
const normalizedLabels = normalizeToArray(record[0]);
const normalizedValues = normalizeToArray(record[1]);
```

## デバッグのベストプラクティス

### 1. コンソール出力の活用

```javascript
console.log('Data structure:', JSON.stringify(data, null, 2));
console.log('DataBuckets:', JSON.stringify(dataBuckets, null, 2));
```

### 2. データ検証関数

```javascript
function validateDataStructure(data, dataBuckets) {
  console.log('=== Data Structure Validation ===');
  console.log('Data length:', data.length);
  console.log('Expected buckets:', dataBuckets.buckets.map(b => b.id));
  
  if (data.length > 0) {
    console.log('First record structure:', {
      labelsCount: data[0][0] ? data[0][0][0].length : 0,
      valuesCount: data[0][0] ? data[0][0][1].length : 0
    });
  }
}
```

### 3. エラー処理

```javascript
function safeDataAccess(data, seriesIndex, recordIndex, bucketIndex) {
  try {
    return data[seriesIndex][recordIndex][bucketIndex];
  } catch (error) {
    console.error('Data access error:', {
      seriesIndex, recordIndex, bucketIndex, error
    });
    return null;
  }
}
```

この詳細分析により、WebFOCUSから提供されるデータ構造を正確に理解し、安全で効率的なコードを書くことができます。