# WebFOCUS拡張グラフ開発ガイド - 詳細仕様

## 1. ファイル構成仕様

拡張グラフフォルダ内には以下のファイルが必要です。

| ファイル/フォルダ | 必須 | 説明 |
| --- | --- | --- |
| `com.company.chartname.js` | 〇 | メインのJavaScriptファイル。ファイル名はフォルダ名と一致させる必要があります。 |
| `properties.json` | 〇 | 拡張グラフの設定ファイル。 |
| `css/` | △ | スタイルシートを格納するフォルダ。 |
| `lib/` | △ | 外部ライブラリ（.js）を格納するフォルダ。 |
| `icons/` | △ | WebFOCUSのデザイナー画面で表示されるアイコン画像を格納するフォルダ。 |

## 2. properties.json の仕様

`properties.json` は拡張グラフの振る舞いを定義する重要なファイルです。

```json
{
  "info": {
    "version": "1.0",
    "implements_api_version": "1.0",
    "author": "Author Name",
    "copyright": "Copyright",
    "url": "URL",
    "icons": {
      "medium": "icons/medium.png"
    }
  },
  "properties": {
    "myProperty": "defaultValue"
  },
  "propertyAnnotations": {
    "myProperty": "str"
  },
  "dataBuckets": {
    "tooltip": true,
    "buckets": [
      {
        "id": "value",
        "type": "measure",
        "count": {"min": 1, "max": 1}
      },
      {
        "id": "labels",
        "type": "dimension",
        "count": {"min": 1, "max": 1}
      }
    ]
  },
  "translations": {
    "en": {
      "name": "Chart Name",
      "description": "Description",
      "value_name": "Value Bucket",
      "value_tooltip": "Tooltip for Value Bucket"
    },
    "ja": {
      "name": "チャート名",
      "description": "説明",
      "value_name": "値バケット",
      "value_tooltip": "値バケットのツールチップ"
    }
  }
}
```

### 主なセクション

- **info**: バージョン、作者、アイコンなどのメタデータ。
- **properties**: 拡張グラフ独自のプロパティとそのデフォルト値。
- **propertyAnnotations**: プロパティの型定義（WebFOCUSのプロパティパネル用）。
- **dataBuckets**: データの受け渡し口（バケット）の定義。`measure`（数値）や `dimension`（項目）を指定します。
- **translations**: 各種表示名の多言語対応。

## 3. renderConfig オブジェクトの仕様

`renderCallback` 関数に渡される `renderConfig` オブジェクトには、描画に必要な全ての情報が含まれています。

| プロパティ名 | 型 | 説明 |
| --- | --- | --- |
| `moonbeamInstance` | Object | チャートエンジンのインスタンス。ユーティリティメソッドなどを提供。 |
| `data` | Array | 描画データの配列。構造はバケットの定義やデータの数によって変化します（後述）。 |
| `properties` | Object | `properties.json` で定義されたプロパティの現在の値。 |
| `width` | Number | 描画領域の幅（px）。 |
| `height` | Number | 描画領域の高さ（px）。 |
| `container` | HTMLElement | グラフを描画する親となるDOM要素（divなど）。 |
| `containerIDPrefix` | String | コンテナIDのプレフィックス。一意なID生成に使用。 |
| `dataBuckets` | Object | バケットのメタデータ（タイトル、フォーマットなど）。 |
| `modules` | Object | ツールチップやデータ選択などのモジュール機能へのアクセス。 |
| `renderComplete` | Function | 描画完了時に呼び出す必要がある関数。 |

## 4. データの構造 (`renderConfig.data`)

`renderConfig.data` の構造は、`dataBuckets` の定義と実際のデータによって変化するため注意が必要です。

### 基本構造：depth=1 の場合

depth=1 では、データは**オブジェクトの配列**として渡されます：

```javascript
[
  { "labels": "COUNTRY1", "value": 10 },
  { "labels": "COUNTRY2", "value": 20 }
]
```

### 複雑な構造：depth>1 の場合

depth>1 では、データは**配列の配列**として渡されます（シリーズごとにグループ化）：

```javascript
[
  // Series 1
  [
    { "labels": ["CAR1", "MODEL_A"], "value": 100 },
    { "labels": ["CAR1", "MODEL_B"], "value": 150 }
  ],
  // Series 2
  [
    { "labels": ["CAR2", "MODEL_A"], "value": 200 },
    { "labels": ["CAR2", "MODEL_B"], "value": 250 }
  ]
]
```

### ⚠️ labels と value の型

以下の点に注意してください：

| 状況 | labels | value |
| --- | --- | --- |
| ラベル/値が1つのみ | **文字列** `"COUNTRY"` | **数値** `10` |
| ラベル/値が2つ以上 | **配列** `["COUNTRY", "CAR"]` | **配列** `[100, 200]` |

**正規化の重要性**：この混在した型に対応するため、development guide（実践編）で説明される正規化処理を実装することが強く推奨されます。正規化により、常に `labels` と `value` を配列として扱えるようになります。
