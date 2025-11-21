# WebFOCUS拡張グラフプロパティ統一実装 完了レポート

## 実装概要

WebFOCUS拡張グラフファミリーにおいて、統一的なプロパティベーススタイリングシステムを実装しました。各拡張機能の特性に応じて、適切なプロパティ（tableStyle、label、valueLabel）を適用し、一貫性のあるスタイル制御を実現しました。

## 実装対象拡張機能

### 1. com.shimokado.params（デバッグツール）
- **実装プロパティ**: tableStyleのみ
- **適用箇所**: テーブル全体（ヘッダー・データセル）
- **用途**: WebFOCUSデータ・プロパティのデバッグ表示
- **特徴**: シンプルな統一スタイル適用

### 2. com.shimokado.table_ver1（縦結合テーブル）
- **実装プロパティ**: tableStyleのみ
- **適用箇所**: 縦結合機能付きテーブル全体
- **用途**: 階層データの表示、レポート作成
- **特徴**: 同一値セルの自動縦結合 + 統一スタイル

### 3. com.shimokado.table_ver2（集計テーブル）
- **実装プロパティ**: tableStyleのみ（背景色・境界線追加サポート）
- **適用箇所**: 集計機能付きテーブル全体
- **用途**: 分析用集計レポート、比較表
- **特徴**: データグループ化・小計表示 + 高度なスタイル制御

### 4. com.shimokado.card_simple（カード表示）
- **実装プロパティ**: label + valueLabel
- **適用箇所**: 
  - label → カードタイトル部分
  - valueLabel → 数値表示部分
- **用途**: ダッシュボード、KPI表示
- **特徴**: グリッドレイアウト + 要素別スタイル制御

### 5. com.shimokado.chartjs_sample（Chart.jsグラフ）
- **実装プロパティ**: label + valueLabel
- **適用箇所**:
  - label → X軸・Y軸の目盛りラベル
  - valueLabel → 凡例ラベル
- **用途**: 高度な視覚化、モダンなグラフ表示
- **特徴**: Chart.js API統合 + WebFOCUSプロパティ変換

## プロパティ仕様統一

### tableStyleプロパティ（テーブル系専用）
```json
{
  "tableStyle": {
    "fontSize": "14px",
    "color": "#333333", 
    "fontFamily": "Arial, sans-serif",
    "fontWeight": "normal",
    "backgroundColor": "#f9f9f9",  // table_ver2のみ
    "border": "1px solid #ddd"     // table_ver2のみ
  }
}
```

### labelプロパティ（グラフ系軸ラベル・カードタイトル）
```json
{
  "label": {
    "text": {
      "color": "#666666",
      "font": "Arial, sans-serif",
      "size": "12px",
      "weight": "normal"
    }
  }
}
```

### valueLabelプロパティ（グラフ系数値ラベル・カード数値）
```json
{
  "valueLabel": {
    "color": "#333333",
    "fontFamily": "Arial, sans-serif", 
    "fontSize": "16px",
    "fontWeight": "bold"
  }
}
```

## 技術実装パターン

### 共通スタイル適用関数
各拡張機能に統一パターンのスタイル適用関数を実装：

```javascript
// テーブル系
function applyTableStyles(table, props) { /* tableStyle適用 */ }

// グラフ系・カード系
function applyLabelStyles(element, props) { /* label適用 */ }
function applyValueLabelStyles(element, props) { /* valueLabel適用 */ }
```

### Chart.js特殊対応
Chart.jsでは、WebFOCUSプロパティをChart.js設定に変換：

```javascript
function createScaleFontConfig(props) { 
  // label → Chart.js scales設定に変換
}
function createDataLabelFontConfig(props) { 
  // valueLabel → Chart.js legend設定に変換
}
```

## WebFOCUS統合方法

### properties.json設定
```json
{
  "properties": {
    "tableStyle": { /* スタイル設定 */ },
    "label": { /* ラベルスタイル設定 */ },
    "valueLabel": { /* 値ラベルスタイル設定 */ }
  },
  "propertyAnnotations": {
    "tableStyle": "object",
    "label": "object", 
    "valueLabel": "object"
  }
}
```

### GRAPH_JS動的設定
```focexec
*GRAPH_JS
chartType: "com.shimokado.xxx",
tableStyle: {
  fontSize: "16px",
  color: "#2c3e50"
},
label: {
  text: {
    color: "#7f8c8d",
    size: "14px"
  }
}
*END
```

## 各拡張機能の特性とスタイル適用

### テーブル系拡張機能
- **params**: デバッグ用シンプルテーブル → tableStyleで統一
- **table_ver1**: 縦結合テーブル → tableStyleで統一  
- **table_ver2**: 集計テーブル → tableStyle + 背景色・境界線

### 視覚化系拡張機能
- **card_simple**: カード形式 → label（タイトル）+ valueLabel（数値）
- **chartjs_sample**: Chart.jsグラフ → label（軸）+ valueLabel（凡例）

## 統一システムの利点

1. **一貫性**: 全拡張機能で統一されたプロパティ体系
2. **適用性**: 各拡張機能の特性に応じた最適なプロパティ配置
3. **拡張性**: 将来の拡張機能でも同じパターンを適用可能
4. **保守性**: 統一されたスタイル適用関数で保守性向上
5. **WebFOCUS統合**: properties.json + GRAPH_JS両方での設定をサポート

## 今後の活用

1. **新規拡張機能**: 確立されたパターンを適用
2. **既存拡張機能の改善**: 必要に応じてスタイルプロパティを追加
3. **企業ブランディング**: 統一されたプロパティでコーポレートスタイル適用
4. **教育・学習**: プロパティシステムの理解促進

これにより、WebFOCUS拡張グラフファミリー全体で一貫性のあるスタイリングシステムが確立されました。