# WebFOCUS拡張グラフ開発ガイド - トラブルシューティング

## 配列の深さ問題（Data Depth Handling）

### 概要

本ドキュメントは、WebFOCUS拡張グラフの開発で **最も多くエラーが発生する** 「配列の深さ問題」に特化したトラブルシューティングガイドです。

`renderConfig.data` の構造は `renderConfig.dataBuckets.depth` の値によって根本的に異なります。この違いを理解し、正しく処理することが堅牢な拡張グラフ開発の鍵です。

実際のWebFOCUS出力例については、[07_RenderConfig_Samples.md](07_RenderConfig_Samples.md) を参照してください。

---

## 1. 問題の原因

### 1.1 depth パラメータの意味

WebFOCUSから渡される `renderConfig` オブジェクトには `dataBuckets.depth` というパラメータがあります。

| depth値 | 意味 | data の構造 |
|--------|------|-----------|
| **1** | 単一シリーズまたは単純なグループ化 | **配列ではない** — `[item1, item2, ...]` |
| **> 1** | 複数シリーズ（複数の値フィールド） | **配列の配列** — `[[series1_items...], [series2_items...]]` |

### 1.2 深さ以外のデータ構造の可変性

さらに複雑なのは、`depth === 1` のとき、各アイテムの `labels` と `value` フィールドも可変です：

```javascript
// ケース A: 複数ラベル × 複数値
{ labels: ["JAPAN", "TOYOTA"], value: [100, 15000], ... }

// ケース B: 単一ラベル × 単一値
{ labels: "JAPAN", value: 100, ... }

// ケース C: 複数ラベル × 単一値
{ labels: ["JAPAN", "TOYOTA"], value: 100, ... }

// ケース D: 単一ラベル × 複数値
{ labels: "JAPAN", value: [100, 200], ... }
```

**つまり、depth=1 では、labels/value が「文字列/数値」か「配列」かは、実行時のデータに依存します。**

---

## 2. よくあるエラーパターンと解決法

### 2.1 エラー: TypeError - Cannot read property 'map' of undefined

**症状**：

```
Cannot read property 'map' of undefined
```

**原因**：

```javascript
// ❌ 誤り: depth === 1 だからといって data を配列にラップ
if (renderConfig.dataBuckets.depth === 1) {
  data = [data];  // これが誤り！
}

// depth=1 のとき、data は既に [item1, item2, ...] の形式
// ラップするとデータが壊れる
data.map(function(item) {  // item が配列になってしまう
  console.log(item.labels);  // Error: item は [item1, item2, ...] の形式
});
```

**解決法**：

```javascript
// ✅ 正しい: depth に応じて処理を分ける
var normalizedData = [];

if (renderConfig.dataBuckets.depth === 1) {
  // depth=1: data はそのままアイテム配列 [item1, item2, ...]
  normalizedData = renderConfig.data.map(function(item) {
    return {
      labels: Array.isArray(item.labels) ? item.labels : [item.labels],
      value: Array.isArray(item.value) ? item.value : [item.value]
    };
  });
} else {
  // depth>1: data は配列の配列 [[series1...], [series2...]]
  renderConfig.data.forEach(function(series) {
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
```

### 2.2 エラー: TypeError - Cannot read property 'forEach' of undefined

**症状**：

```
Cannot read property 'forEach' of undefined
```

**原因**：

```javascript
// ❌ 誤り: depth > 1 かどうかをチェックせず、直接ネストをすすむ
renderConfig.data.forEach(function(series) {
  series.forEach(function(item) {  // series が配列でない場合 Error
    // ...
  });
});
```

**解決法**：

```javascript
// ✅ 正しい: 型チェックを必ず入れる
renderConfig.data.forEach(function(series) {
  if (Array.isArray(series)) {  // ← 必須チェック
    series.forEach(function(item) {
      // 安全に処理
    });
  }
});
```

### 2.3 エラー: labels/value が文字列なのに配列として扱う

**症状**：

```javascript
renderConfig.data.forEach(function(item) {
  item.labels.forEach(function(label) {  // labels が文字列なら Error
    console.log(label);
  });
});
```

**原因**：

```javascript
// depth=1 では labels が文字列の場合がある
{ labels: "JAPAN", value: 100 }

// このデータに対して上記のコードを実行すると
// "JAPAN".forEach(...) → TypeError
```

**解決法**：

```javascript
// ✅ 正しい: 常に配列に統一してからアクセス
renderConfig.data.forEach(function(item) {
  var labelArray = Array.isArray(item.labels) ? item.labels : [item.labels];
  var valueArray = Array.isArray(item.value) ? item.value : [item.value];
  
  labelArray.forEach(function(label) {
    console.log(label);  // 常に文字列
  });
  
  valueArray.forEach(function(value) {
    console.log(value);  // 常に数値
  });
});
```

### 2.4 エラー: buckets.labels.title や buckets.value.title が配列か文字列か不明

**症状**：

```javascript
var titles = renderConfig.dataBuckets.buckets.labels.title;
// titles が文字列か配列か不明で、後続処理が不安定
```

**原因**：

```javascript
// buckets のメタデータも可変性がある
// 単一ラベルの場合
{ title: "COUNTRY", count: 1 }

// 複数ラベルの場合
{ title: ["COUNTRY", "MODEL"], count: 2 }
```

**解決法**：

```javascript
// ✅ 正しい: 常に配列に統一
var labelTitles = Array.isArray(renderConfig.dataBuckets.buckets.labels.title)
  ? renderConfig.dataBuckets.buckets.labels.title
  : [renderConfig.dataBuckets.buckets.labels.title];

var valueTitles = Array.isArray(renderConfig.dataBuckets.buckets.value.title)
  ? renderConfig.dataBuckets.buckets.value.title
  : [renderConfig.dataBuckets.buckets.value.title];

// 以降は常に配列として扱える
labelTitles.forEach(function(title) {
  console.log(title);  // 常に文字列
});
```

---

## 3. ベストプラクティス：データ正規化パターン

### 3.1 推奨される実装パターン

`renderCallback` の最初に、すべてのデータを統一形式に正規化する関数を呼び出します。これにより、後続のすべての処理で安定した形式を保証できます。

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
        detail: item.detail !== undefined 
          ? (Array.isArray(item.detail) ? item.detail : [item.detail]) 
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

### 3.2 検証チェックリスト

renderCallback を実装する際に、以下のチェックリストを確認してください：

- [ ] `renderConfig.dataBuckets.depth` の値を確認した
- [ ] `depth === 1` のときは `data` をラップしていない
- [ ] `depth > 1` のときは `Array.isArray(series)` でチェックしている
- [ ] `item.labels` が文字列か配列かを判定している
- [ ] `item.value` が文字列か配列かを判定している
- [ ] `buckets.labels.title` が文字列か配列かを判定している
- [ ] `buckets.value.title` が文字列か配列かを判定している
- [ ] すべての正規化後のデータを配列として扱っている
- [ ] null/undefined チェックを入れている
- [ ] try-catch でエラーハンドリングを行っている

---

## 4. デバッグ方法

### 4.1 renderConfig の内容を確認する

最も効果的なデバッグ方法は、`renderCallback` の最初で `renderConfig` 全体をコンソール出力することです。

```javascript
function renderCallback(renderConfig) {
  // デバッグ: renderConfig 全体を出力
  console.log('=== renderConfig ===');
  console.log('depth:', renderConfig.dataBuckets.depth);
  console.log('data:', renderConfig.data);
  console.log('buckets:', renderConfig.dataBuckets.buckets);
  console.log('==================');
  
  // 以降の処理...
}
```

### 4.2 test.html でのテスト

各拡張グラフフォルダの `test.html` を編集して、異なるデータパターンでテストします。

#### ⚠️ 重要：dataBuckets.depth の設定

`test.html` の `renderConfig.dataBuckets` には必ず `"depth": 1` を含めてください。depthがnull/undefinedだと、renderCallbackでデータ処理エラーが発生します。

```html
<!-- test.html の dataBuckets 設定例 -->
<textarea id="dataBuckets">
{
  "internal_api_version": 1,
  "depth": 1,  <!-- ← これを必ず追加 -->
  "buckets": {
    "labels": {
      "title": ["COUNTRY", "CAR"],
      "count": 2
    },
    "value": {
      "title": "SEATS",
      "count": 1
    }
  }
}
</textarea>
```

```html
<!-- test.html -->
<script>
  // テストケース 1: depth=1, 単一ラベル × 単一値
  var testData1 = {
    data: [
      { labels: "JAPAN", value: 100, _s: 0, _g: 0 },
      { labels: "USA", value: 200, _s: 0, _g: 1 }
    ],
    dataBuckets: {
      depth: 1,  <!-- ← 必須 -->
      buckets: {
        labels: { title: "COUNTRY", count: 1 },
        value: { title: "SALES", count: 1 }
      }
    }
  };

  // テストケース 2: depth=1, 複数ラベル × 複数値
  var testData2 = {
    data: [
      { labels: ["JAPAN", "TOYOTA"], value: [100, 15000], _s: 0, _g: 0 },
      { labels: ["USA", "FORD"], value: [200, 25000], _s: 0, _g: 1 }
    ],
    dataBuckets: {
      depth: 1,  <!-- ← 必須 -->
      buckets: {
        labels: { title: ["COUNTRY", "MODEL"], count: 2 },
        value: { title: ["SALES", "PRICE"], count: 2 }
      }
    }
  };

  // テストケース 3: depth>1, 複数シリーズ
  var testData3 = {
    data: [
      [ // シリーズ1
        { labels: ["JAPAN", "TOYOTA"], value: [100, 15000], _s: 0, _g: 0 },
        { labels: ["JAPAN", "HONDA"], value: [150, 18000], _s: 0, _g: 1 }
      ],
      [ // シリーズ2
        { labels: ["USA", "FORD"], value: [200, 25000], _s: 1, _g: 0 },
        { labels: ["USA", "GM"], value: [180, 20000], _s: 1, _g: 1 }
      ]
    ],
    dataBuckets: {
      depth: 2,  // ← 複数シリーズの場合
      buckets: {
        labels: { title: ["COUNTRY", "MODEL"], count: 2 },
        value: { title: ["SALES", "PRICE"], count: 2 }
      }
    }
  };
</script>
```

### 4.3 参考実装の確認

実装の参考として、以下の拡張グラフを確認してください：

- **`com.shimokado.params`**：コンソール出力で正規化前後のデータ構造を視覚的に表示
  - 各ケースのデータ構造を確認可能
  - デバッグ用に最適な参考実装

- **`com.shimokado.table_ver2`**：実装パターンの参考
  - Lines 221-237: `normalizeRenderData()` の実装例
  - Lines 32-36: `groupAndAggregate()` での型検証例

---

## 5. 実装チェックリスト

新しい拡張グラフを実装する際の確認事項：

### 5.1 properties.json の dataBuckets 定義

```json
{
  "dataBuckets": {
    "labels": {
      "title": "カテゴリ",
      "count": 1
    },
    "value": {
      "title": "値",
      "count": 1
    }
  }
}
```

- [ ] `labels.count` と `value.count` を正確に設定した
- [ ] `title` を正確に記述した
- [ ] 複数ラベル/値の場合は配列で指定した

### 5.2 renderCallback の実装

- [ ] 最初に `normalizeRenderData()` を呼び出す
- [ ] または、手動で depth チェックと配列統一を実装する
- [ ] すべてのデータアクセスで配列化を確認する
- [ ] null/undefined チェックを入れる

### 5.3 テスト方法

- [ ] test.html で複数のデータパターンをテストした
- [ ] 単一ラベル/値のケースをテストした
- [ ] 複数ラベル/値のケースをテストした
- [ ] depth > 1 のケースをテストした
- [ ] ブラウザの開発者ツールでエラーがないか確認した

---

## 6. よくある質問（FAQ）

### Q1: なぜ depth によってデータ構造が異なるのか？

**A**: WebFOCUSはレポート/ダッシュボード上のデータ割り当て（Data Buckets）の構成に応じて、バックエンドで最適なデータ形式を生成します。複数シリーズ（depth > 1）の場合は、シリーズごとにグループ化することで、メモリ効率と処理性能を最適化しています。

### Q2: depth = 0 は存在するのか？

**A**: 実運用では depth = 1 以上です。depth = 0 の場合は、データバケットの定義が不正です。properties.json を確認してください。

### Q3: labels/value が混在した形式（一方が配列、一方が単一値）はあるのか？

**A**: はい、あります。これが最も複雑なケースです。

```javascript
// depth=1 のみの話ですが
{ labels: ["JAPAN", "TOKYO"], value: 100 }  // 複数ラベル × 単一値
{ labels: "JAPAN", value: [100, 200] }      // 単一ラベル × 複数値
```

正規化関数でこれら両方に対応しています。

### Q4: 正規化後のデータは常に「labels は配列」「value は配列」になるのか？

**A**: はい。正規化関数の出力では、すべての `labels` と `value` は配列です。

```javascript
var normalized = normalizeRenderData(renderConfig);
normalized.data.forEach(function(item) {
  item.labels;  // 常に配列 [label1, label2, ...]
  item.value;   // 常に配列 [val1, val2, ...]
});
```

### Q5: buckets 自体が null/undefined の場合はあるのか？

**A**: 稀ですが、properties.json の定義に問題がある場合があります。正規化関数では `buckets.labels` や `buckets.value` のチェックを入れています。本番環境では、test.html でそのような状況をテストしてください。

---

## 7. トラブルシューティング：よくあるシナリオ

### シナリオ1: 「白紙のグラフが表示される」

**確認事項**：

1. ブラウザの開発者ツール（F12）でコンソールエラーを確認
2. `renderConfig` の内容を確認：

```javascript
console.log('data:', renderConfig.data);
console.log('depth:', renderConfig.dataBuckets.depth);
```

3. 正規化後のデータが正しいか確認：

```javascript
var normalized = normalizeRenderData(renderConfig);
console.log('normalized:', normalized);
```

### シナリオ2: 「データが一部しか表示されない」

**確認事項**：

1. depth が正しく判定されているか確認
2. ラップの有無を確認：

```javascript
// ❌ 誤り
if (depth === 1) { data = [data]; }

// ✅ 正しい
if (depth === 1) { /* data をそのまま使用 */ }
```

3. `forEach` や `map` が正しく実行されているか確認

### シナリオ3: 「TypeError: Cannot read property 'XXX'」

**確認事項**：

1. `Array.isArray()` チェックが十分か確認
2. null/undefined チェックが十分か確認
3. try-catch で詳細なエラーメッセージを取得：

```javascript
try {
  // 処理
} catch (e) {
  console.error('詳細エラー:', e);
  console.error('スタックトレース:', e.stack);
}
```

---

## 8. まとめ

**配列の深さ問題を正しく処理するための3つのポイント**：

1. **depth パラメータを必ず確認する**
   - depth === 1：data はアイテム配列 `[item1, item2, ...]`
   - depth > 1：data は配列の配列 `[[series1...], [series2...]]`

2. **labels/value は常に配列に統一する**
   - `Array.isArray()` で判定して、必要に応じてラップ
   - 正規化関数を使用して、後続処理を簡潔に保つ

3. **buckets のメタデータも配列化する**
   - `title`, `fieldName`, `numberFormat` も可変
   - 全て配列に統一することで、ループ処理を安全に実行

これらを意識して実装することで、ほぼすべての「配列の深さ問題」は解決します。

---

## 参考資料

- [02_API_Reference.md](02_API_Reference.md) - Section 3: renderConfig データ構造の詳細
- [03_Development_Guide.md](03_Development_Guide.md) - Section 1: データの正規化パターン
- [04_Tutorials.md](04_Tutorials.md) - Chart.js と ApexCharts の実装例
- [com.shimokado.params](../com.shimokado.params/) - ベストプラクティス実装例（コンソール出力参照）
- [com.shimokado.table_ver2](../com.shimokado.table_ver2/) - 集計・グループ化の実装例
