# com.shimokado.params プロパティガイド

## 概要

`com.shimokado.params` は WebFOCUS 拡張グラフのデバッグ・検証ツールとして、WebFOCUS から送られてくるデータとプロパティを表形式で表示します。このツールでは、**tableStyle** プロパティのみを使用して表全体のスタイルを制御できます。

## サポートされるプロパティ

### 表示制御プロパティ

#### tableStyle

表全体（ヘッダーとデータセル両方）のスタイルを制御します。

**対応CSS プロパティ:**

- `fontSize`: フォントサイズ (例: "14px", "1.2em")
- `color`: 文字色 (例: "#333", "blue", "rgb(255,0,0)")
- `fontFamily`: フォントファミリー (例: "Arial", "sans-serif")
- `fontWeight`: フォントの太さ (例: "bold", "normal", "600")

## グラフ系プロパティ（参考情報）

以下のプロパティは `com.shimokado.params` では使用されませんが、一般的なWebFOCUS拡張グラフ（特に棒グラフ）での用途を説明します。

### label プロパティ

**用途:** 棒グラフなどのグラフ種別で、**軸ラベル（X軸・Y軸のタイトル）** のスタイルを制御

**例:** 棒グラフでX軸に「売上月」、Y軸に「売上高」などのタイトルが表示される部分

**主要設定項目:**
- `text.color`: ラベル文字色
- `text.font`: フォントファミリー  
- `text.size`: フォントサイズ
- `text.weight`: フォントの太さ

### valueLabel プロパティ

**用途:** 棒グラフなどのグラフ種別で、**データ値ラベル（棒の上に表示される実際の数値）** のスタイルを制御

**例:** 棒グラフで各棒の上に「1,234,567円」などの数値が表示される部分

**主要設定項目:**
- `color`: 値ラベル文字色
- `fontFamily`: フォントファミリー
- `fontSize`: フォントサイズ（"auto"も指定可能）
- `fontWeight`: フォントの太さ

## 実装例

### 例1: 基本的なテーブルスタイル

```javascript
// properties.json の "properties" セクション
{
  "tableStyle": {
    "fontSize": "14px",
    "color": "#333333",
    "fontFamily": "Arial, sans-serif"
  }
}
```

**結果:** 表全体が14pxのArialフォント、濃いグレー色で表示されます。

### 例2: 強調表示スタイル

```javascript
{
  "tableStyle": {
    "fontSize": "16px",
    "color": "#2c3e50",
    "fontFamily": "Helvetica, sans-serif", 
    "fontWeight": "bold"
  }
}
```

**結果:** 表全体が16pxの太字Helveticaフォント、ダークブルー色で強調表示されます。

### 例3: コンパクト表示スタイル

```javascript
{
  "tableStyle": {
    "fontSize": "12px",
    "color": "#666666",
    "fontFamily": "Verdana, sans-serif"
  }
}
```

**結果:** 表全体が12pxの小さなVerdanaフォント、ミディアムグレー色でコンパクトに表示されます。

## WebFOCUS での設定方法

### 方法1: properties.json ファイルでの設定

拡張グラフフォルダ内の `properties.json` の "properties" セクションに設定:

```json
{
  "info": { ... },
  "properties": {
    "tableStyle": {
      "fontSize": "14px",
      "color": "#2c3e50",
      "fontFamily": "Arial, sans-serif",
      "fontWeight": "normal"
    }
  },
  "propertyAnnotations": {
    "tableStyle": "object"
  }
}
```

### 方法2: GRAPH_JS ブロックでの設定

WebFOCUS プロシージャ内で動的に設定:

```focexec
*GRAPH_JS
chartType: "com.shimokado.params",
tableStyle: {
  fontSize: "16px",
  color: "#e74c3c",
  fontFamily: "Georgia, serif",
  fontWeight: "bold"
}
*END
```

## 使用上の注意

1. **有効性確認**: すべての CSS 値は有効な形式で指定してください
2. **クロスブラウザ対応**: 一般的な CSS プロパティ値を使用することを推奨
3. **フォールバック**: フォントファミリーには必ずフォールバック値を含めてください
4. **パフォーマンス**: 大量データを扱う場合はシンプルなスタイル設定を心がけてください

## よくある質問

**Q: 表のヘッダーとデータ部分で異なるスタイルを適用できますか？**
A: `com.shimokado.params` ではtableStyleで表全体に統一スタイルが適用されます。個別制御が必要な場合は他の拡張グラフをご利用ください。

**Q: label や valueLabel プロパティは使用できますか？**
A: これらのプロパティは `com.shimokado.params` では使用されません。棒グラフなど、グラフ系の拡張でのみ有効です。

**Q: 動的にスタイルを変更するには？**
A: GRAPH_JS ブロックでプロパティを設定することで、実行時にスタイルを変更可能です。
    "fontWeight": "bold",        // フォントウェイト
    "format": "auto"             // 数値フォーマット（現在未使用）
  }
}
```

**適用対象**: 値（measure）フィールドの列ヘッダー

### 3. label - 一般的なラベルのスタイル

```json
{
  "label": {
    "text": {
      "color": "#333333",    // 文字色
      "font": "Verdana",     // フォントファミリー
      "weight": "bold",      // フォントウェイト
      "size": "14px"         // フォントサイズ
    },
    "marker": {
      "type": "circle"       // マーカータイプ（現在未使用）
    }
  }
}
```

**適用対象**: ラベル（dimension）フィールドの列ヘッダー、および詳細フィールドのヘッダー

## 🎨 スタイル適用の優先順位

### ヘッダーのスタイル適用順序

1. **値フィールドのヘッダー**: 
   - `valueLabel` 設定が存在する場合 → `valueLabel` を適用
   - `valueLabel` 設定がない場合 → `label` 設定を適用

2. **ラベルフィールドのヘッダー**: 
   - `label` 設定を適用

3. **詳細フィールドのヘッダー**: 
   - `label` 設定を適用

### データセルのスタイル適用

- すべてのデータセル（td要素）: `tableStyle` 設定を適用

## 💡 実践例

### 例1: 基本的なスタイル設定

```json
{
  "tableStyle": {
    "fontSize": "18px",
    "color": "#2c3e50"
  },
  "valueLabel": {
    "color": "#e74c3c",
    "fontWeight": "bold"
  },
  "label": {
    "text": {
      "color": "#34495e",
      "font": "Arial",
      "weight": "normal",
      "size": "14px"
    }
  }
}
```

**結果**: 
- テーブル全体: 18pxサイズ、ダークブルー文字
- 値のヘッダー: 赤色、太字
- ラベルのヘッダー: グレー、Arial、通常ウェイト、14px

### 例2: 大きな表示での視認性重視

```json
{
  "tableStyle": {
    "fontSize": "24px",
    "color": "#1a1a1a",
    "fontFamily": "Georgia"
  },
  "valueLabel": {
    "fontSize": "28px",
    "color": "#d35400",
    "fontWeight": "bold",
    "fontFamily": "Impact"
  },
  "label": {
    "text": {
      "color": "#7f8c8d",
      "font": "Georgia",
      "weight": "bold",
      "size": "20px"
    }
  }
}
```

**結果**: 
- テーブル全体: 大きなフォント、ダーク、Georgia
- 値のヘッダー: さらに大きく、オレンジ、Impact
- ラベルのヘッダー: グレー、太字、20px

### 例3: 最小限のスタイル設定

```json
{
  "tableStyle": {
    "color": "#555"
  },
  "valueLabel": {
    "fontWeight": "bold"
  }
}
```

**結果**: 
- テーブル全体: 中程度の灰色
- 値のヘッダー: 太字のみ
- ラベルのヘッダー: スタイル設定なし（ブラウザデフォルト）

## 🔧 WebFOCUSでのテスト方法

### 1. プロパティファイルでの設定

`properties.json`内の`properties`セクションでデフォルト値を設定：

```json
{
  "properties": {
    "tableStyle": {
      "fontSize": "16px",
      "color": "#333"
    },
    "valueLabel": {
      "fontWeight": "bold",
      "color": "#d35400"
    }
  }
}
```

### 2. WebFOCUSプロシージャでの動的設定

```webfocus
ON GRAPH SET LOOKGRAPH EXTENSION
*GRAPH_JS
chartType: "com.shimokado.params",
properties: {
  tableStyle: {
    fontSize: "22px",
    color: "#2c3e50"
  },
  valueLabel: {
    fontSize: "24px",
    color: "#e74c3c",
    fontWeight: "bold"
  },
  label: {
    text: {
      color: "#34495e",
      font: "Arial",
      size: "18px"
    }
  }
}
*END
```

### 3. テストHTMLでの確認

`test.html`ファイルのmockRenderConfigでプロパティを設定：

```javascript
var mockRenderConfig = {
  // ... 他の設定
  properties: {
    tableStyle: {
      fontSize: "20px",
      color: "#663300"
    },
    valueLabel: {
      fontFamily: "sans-serif",
      fontSize: "auto",
      color: "#333333",
      fontWeight: "bold"
    },
    label: {
      text: {
        color: "#333333",
        font: "Verdana",
        weight: "bold",
        size: "14px"
      }
    }
  }
};
```

## 📝 注意事項

### スタイル適用の制約

1. **CSSプロパティ名**: JavaScriptのcamelCase形式で指定（例: `fontSize`、`fontFamily`）
2. **色指定**: 16進数（`#ff0000`）、RGB（`rgb(255,0,0)`）、色名（`red`）に対応
3. **フォントサイズ**: px、em、rem、%など有効な CSS 単位を使用
4. **auto値**: `fontSize: "auto"`の場合はスタイル適用をスキップ

### ブラウザ互換性

- モダンブラウザ（Chrome、Firefox、Safari、Edge）でテスト済み
- Internet Explorer 11以下では一部スタイルが適用されない場合があります

### パフォーマンス考慮事項

- 大量のデータ表示時はフォントサイズや色の計算負荷を考慮
- 複雑なフォント指定は表示速度に影響する場合があります

## 🔍 デバッグのヒント

### スタイルが適用されない場合

1. **コンソール確認**: ブラウザの開発者ツールでエラーをチェック
2. **プロパティ構造**: JSONの階層構造が正しいか確認
3. **タイポチェック**: プロパティ名のスペルミスがないか確認

### 確認用コード

```javascript
// プロパティ内容をコンソールに出力
console.log('Applied properties:', JSON.stringify(props, null, 2));

// 各スタイル関数の動作確認
console.log('TableStyle:', props.tableStyle);
console.log('ValueLabel:', props.valueLabel);
console.log('Label:', props.label);
```

## 🎯 開発での活用

### 拡張機能開発時の利用

1. **デザイン確認**: 新しいスタイル設定をリアルタイムで確認
2. **プロパティ設計**: 他の拡張機能での採用前のプロトタイプとして活用
3. **レスポンシブ対応**: 異なる画面サイズでのスタイル確認

### 本番環境での応用

- com.shimokado.paramsで確立したスタイル適用パターンを他の拡張機能に流用
- 統一されたデザインガイドラインの策定
- ユーザー向けカスタマイズオプションの実装

このガイドを参考に、WebFOCUS拡張グラフでの効果的なスタイル適用を実現してください。