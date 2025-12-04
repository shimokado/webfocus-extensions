# WebFOCUS拡張グラフ開発ガイド - renderConfig サンプルデータ

## 概要

このドキュメントは、WebFOCUSから拡張グラフの `renderCallback` に渡される `renderConfig` オブジェクトの実際のデータ構造サンプルを提供します。これらのサンプルは、`com.shimokado.html_sample` 拡張グラフで実際にWebFOCUSから出力されたデータを基にしています。

`renderConfig.data` と `renderConfig.dataBuckets.buckets` の構造は、データバケット（labels/value）の個数によって変化します。この変化を理解することで、堅牢なデータ処理を実装できます。

## サンプルデータの構造

各サンプルは以下の形式で記載します：

- **条件**: labels の個数 × value の個数
- **dataBuckets.buckets**: バケット定義
- **renderConfig.data**: 実際のデータ配列

## value:0, label:1（ラベル1つ、値なし）

### renderConfig.dataBuckets.buckets

```json
{
  "labels": {
    "title": "COUNTRY",
    "fieldName": "CAR.ORIGIN.COUNTRY",
    "count": 1
  }
}
```

### renderConfig.data

```json
[
  {
    "labels": "ENGLAND",
    "_s": 0,
    "_g": 0
  },
  {
    "labels": "FRANCE",
    "_s": 0,
    "_g": 1
  },
  {
    "labels": "ITALY",
    "_s": 0,
    "_g": 2
  }
]
```

**特徴**: labels が文字列、value フィールドなし。

## value:1, label:0（ラベルなし、値1つ）

### renderConfig.dataBuckets.buckets

```json
{
  "value": {
    "title": "SEATS",
    "fieldName": "CAR.BODY.SEATS",
    "numberFormat": "#",
    "count": 1
  }
}
```

### renderConfig.data

```json
[
  {
    "value": 70,
    "_s": 0,
    "_g": 0
  }
]
```

**特徴**: value が数値、labels フィールドなし。

## value:1, label:1（ラベル1つ、値1つ）

### renderConfig.dataBuckets.buckets

```json
{
  "labels": {
    "title": "COUNTRY",
    "fieldName": "CAR.ORIGIN.COUNTRY",
    "count": 1
  },
  "value": {
    "title": "SALES",
    "fieldName": "CAR.BODY.SALES",
    "numberFormat": "#",
    "count": 1
  }
}
```

### renderConfig.data

```json
[
  {
    "labels": "ENGLAND",
    "value": 12000,
    "_s": 0,
    "_g": 0
  },
  {
    "labels": "FRANCE",
    "value": 0,
    "_s": 0,
    "_g": 1
  },
  {
    "labels": "ITALY",
    "value": 30200,
    "_s": 0,
    "_g": 2
  }
]
```

**特徴**: labels が文字列、value が数値。

## value:0, label:2（ラベル2つ、値なし）

### renderConfig.dataBuckets.buckets

```json
{
  "labels": {
    "title": [
      "COUNTRY",
      "CAR"
    ],
    "fieldName": [
      "CAR.ORIGIN.COUNTRY",
      "CAR.COMP.CAR"
    ],
    "count": 2
  }
}
```

### renderConfig.data

```json
[
  {
    "labels": [
      "ENGLAND",
      "JAGUAR"
    ],
    "_s": 0,
    "_g": 0
  },
  {
    "labels": [
      "ENGLAND",
      "JENSEN"
    ],
    "_s": 0,
    "_g": 1
  },
  {
    "labels": [
      "FRANCE",
      "PEUGEOT"
    ],
    "_s": 0,
    "_g": 2
  },
  {
    "labels": [
      "ITALY",
      "ALFA ROMEO"
    ],
    "_s": 0,
    "_g": 3
  }
]
```

**特徴**: labels が配列（2要素）、value フィールドなし。

## value:2, label:0（ラベルなし、値2つ）

### renderConfig.dataBuckets.buckets

```json
{
  "value": {
    "title": [
      "SALES",
      "SEATS"
    ],
    "fieldName": [
      "CAR.BODY.SALES",
      "CAR.BODY.SEATS"
    ],
    "numberFormat": [
      "#",
      "#"
    ],
    "count": 2
  }
}
```

### renderConfig.data

```json
[
  {
    "value": [
      208420,
      70
    ],
    "_s": 0,
    "_g": 0
  }
]
```

**特徴**: value が配列（2要素）、labels フィールドなし。

## value:3, label:3（ラベル3つ、値3つ）

### renderConfig.dataBuckets.buckets

```json
{
  "labels": {
    "title": [
      "COUNTRY",
      "CAR",
      "MODEL"
    ],
    "fieldName": [
      "CAR.ORIGIN.COUNTRY",
      "CAR.COMP.CAR",
      "CAR.CARREC.MODEL"
    ],
    "count": 3
  },
  "value": {
    "title": [
      "SALES",
      "LENGTH",
      "SEATS"
    ],
    "fieldName": [
      "CAR.BODY.SALES",
      "CAR.SPECS.LENGTH",
      "CAR.BODY.SEATS"
    ],
    "numberFormat": [
      "#",
      "#,###",
      "#"
    ],
    "count": 3
  }
}
```

### renderConfig.data

```json
[
  {
    "labels": [
      "ENGLAND",
      "JAGUAR",
      "V12XKE AUTO"
    ],
    "value": [
      0,
      189.6,
      2
    ],
    "_s": 0,
    "_g": 0
  },
  {
    "labels": [
      "ENGLAND",
      "JAGUAR",
      "XJ12L AUTO"
    ],
    "value": [
      12000,
      198.8,
      5
    ],
    "_s": 0,
    "_g": 1
  },
  {
    "labels": [
      "ENGLAND",
      "JENSEN",
      "INTERCEPTOR III"
    ],
    "value": [
      0,
      188,
      4
    ],
    "_s": 0,
    "_g": 2
  },
  {
    "labels": [
      "FRANCE",
      "PEUGEOT",
      "504 4 DOOR"
    ],
    "value": [
      0,
      182.4,
      5
    ],
    "_s": 0,
    "_g": 3
  },
  {
    "labels": [
      "ITALY",
      "ALFA ROMEO",
      "2000 4 DOOR BERLINA"
    ],
    "value": [
      4800,
      176.7,
      4
    ],
    "_s": 0,
    "_g": 4
  },
  {
    "labels": [
      "JAPAN",
      "TOYOTA",
      "COROLLA 4 DOOR DIX AUTO"
    ],
    "value": [
      35030,
      165.2,
      4
    ],
    "_s": 0,
    "_g": 5
  }
]
```

**特徴**: labels と value がともに配列（3要素）。

## 実装上の注意点

- **count の重要性**: `buckets.labels.count` と `buckets.value.count` が 1 の場合は title/fieldName が文字列、2以上の場合は配列になります。
- **データ正規化の必要性**: 上記のパターンを統一して処理するためには、[03_Development_Guide.md](03_Development_Guide.md) で説明されているデータ正規化処理を実装してください。
- **depth の考慮**: これらのサンプルはすべて `depth: 1` の場合です。`depth > 1` の場合はデータ構造がさらに複雑になります（詳細は [02_API_Reference.md](02_API_Reference.md) を参照）。

## 関連ドキュメント

- [02_API_Reference.md](02_API_Reference.md) - renderConfig のデータ構造の詳細説明
- [03_Development_Guide.md](03_Development_Guide.md) - データ正規化の実装パターン
- [06_Troubleshooting_DataDepth.md](06_Troubleshooting_DataDepth.md) - データ構造の問題解決ガイド
