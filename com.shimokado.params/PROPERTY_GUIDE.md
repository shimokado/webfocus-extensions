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
