# Skill: WebFOCUS Data Normalization

## 目的

`renderConfig.data` と `dataBuckets.buckets.*` の型揺れ（単一値/複数値）を吸収して、描画コードを安定化する。

## 正規化ルール

- `depth=1` と `depth>1` の双方を同一構造へ変換
- `labels`, `value` は常に配列として扱う
- `buckets.labels.title`, `buckets.value.title` も配列に統一

## 推奨スニペット（ES5）

```javascript
function normalizeRenderData(renderConfig) {
    var dataBuckets = renderConfig.dataBuckets;
    var buckets = dataBuckets.buckets || {};
    var raw = renderConfig.data || [];

    var labelsTitles = buckets.labels
        ? (Array.isArray(buckets.labels.title) ? buckets.labels.title : [buckets.labels.title])
        : [];
    var valueTitles = buckets.value
        ? (Array.isArray(buckets.value.title) ? buckets.value.title : [buckets.value.title])
        : [];

    var rows = [];
    if (dataBuckets.depth === 1) {
        rows = raw.map(function(item) {
            return {
                labels: Array.isArray(item.labels) ? item.labels : [item.labels],
                value: Array.isArray(item.value) ? item.value : [item.value]
            };
        });
    } else {
        raw.forEach(function(series) {
            if (Array.isArray(series)) {
                series.forEach(function(item) {
                    rows.push({
                        labels: Array.isArray(item.labels) ? item.labels : [item.labels],
                        value: Array.isArray(item.value) ? item.value : [item.value]
                    });
                });
            }
        });
    }

    return {
        labelsTitles: labelsTitles,
        valueTitles: valueTitles,
        data: rows
    };
}
```

## 検証項目

- 単一ラベル×単一値でエラーが出ない
- 複数ラベル×複数値で列ずれしない
- no-data でも空配列で処理継続できる