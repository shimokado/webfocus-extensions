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
| `screenshots/` | △ | README.mdに掲載する画像（スクリーンショットなど）を格納するフォルダ。 |

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

### 2.1 プロパティの詳細設定 (propertyAnnotations)

`propertyAnnotations` セクションでは、WebFOCUS Designerのプロパティパネルにおける各プロパティの表示方法を詳細に制御できます。

#### 基本的な型定義

プロパティの型を指定することで、適切な入力コントロールが表示されます。

- `"str"`: テキストボックス
- `"bool"`: チェックボックス
- `"color"`: カラーピッカー
- `"number"`: 数値入力（スピナー）

#### 高度なUIコントロール設定

`typeAnnotation` プロパティを使用することで、より詳細なUI制御が可能です。

**ドロップダウンリスト (文字列)**

```json
"myProperty": {
  "typeAnnotation": "str",
  "stringValues": ["Option A", "Option B", "Option C"]
}
```

**数値範囲とスライダー**

数値プロパティに対して、最小値・最大値・ステップを設定できます。範囲が設定されると、デフォルトでスライダーが表示されます。

```json
"opacity": {
  "typeAnnotation": "number",
  "numericRange": [0, 1],
  "numericStep": 0.1
}
```

スライダーではなくスピナーを強制したい場合は、`"uiType": "spinner"` を指定します。

```json
"padding": {
  "typeAnnotation": "number",
  "numericRange": [0, 100],
  "numericStep": 1,
  "uiType": "spinner"
}
```

#### 表示制御と順序

プロパティパネルでの表示順序や可視性を制御できます。

- **`displayOrder`**: プロパティの表示順序を整数で指定します。数値が小さいほど上に表示されます。
- **`private`**: `true` に設定すると、プロパティパネルから隠されます（ユーザーには見えなくなりますが、機能は保持されます）。

```json
"propertyAnnotations": {
  "importantProp": {
    "typeAnnotation": "str",
    "displayOrder": 1
  },
  "lessImportantProp": {
    "typeAnnotation": "number",
    "displayOrder": 2
  },
  "hiddenProp": {
    "typeAnnotation": "bool",
    "private": true
  }
}
```

#### 配列型プロパティ (Advanced)

`com.ibi.sunburst` などの高度な拡張機能では、色のリストなどを管理するために配列型のプロパティ定義が使用されています。

```json
"node": {
  "colors": {
    "typeAnnotation": "array",
    "arrayTypes": "color"
  }
}
```

- **`typeAnnotation": "array"`**: プロパティが配列であることを示します。
- **`arrayTypes`**: 配列内の各要素の型を指定します（例: `"color"`, `"str"`, `"number"`）。

これにより、WebFOCUS Designerのプロパティパネルで、ユーザーが動的に要素を追加・削除・編集できるリストUIが生成されます。


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

| 状況 | labels の型 | value の型 |
| --- | --- | --- |
| ラベル/値が1つのみ | **文字列** `"COUNTRY"` | **数値** `10` |
| ラベル/値が2つ以上 | **配列** `["COUNTRY", "CAR"]` | **配列** `[100, 200]` |

さらに、`dataBuckets.buckets` のメタデータについても、以下の様に変動します：

```javascript
// 単一ラベルの場合
dataBuckets.buckets.labels.title = "COUNTRY";        // 文字列

// 複数ラベルの場合
dataBuckets.buckets.labels.title = ["COUNTRY", "CAR"]; // 配列
```

### ✅ 推奨される対応方法

この混在した型に対応するため、**データ正規化パターン**を実装することが強く推奨されます。詳細は [03_Development_Guide.md](03_Development_Guide.md) および [04_Tutorials.md](04_Tutorials.md) を参照してください。

実装例（ベストプラクティス）：`com.shimokado.params` を参照。このプラグインはコンソール出力を通じて、データの正規化処理とその結果を示す優れた学習教材となっています。
