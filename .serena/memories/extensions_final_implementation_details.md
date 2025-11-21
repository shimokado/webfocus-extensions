# 拡張グラフごとの最終実装状況

## 実装完了拡張機能詳細

### 1. com.shimokado.params
**目的**: デバッグ・検証ツール
**実装プロパティ**: tableStyleのみ

**特徴**:
- WebFOCUSから送られるデータとプロパティをテーブル形式で表示
- bucketsオブジェクトを配列形式に正規化
- 数値フォーマット適用（moonbeamInstance.formatNumber使用）

**スタイル適用**:
```javascript
function applyTableStyles(table, props) {
    if (props.tableStyle) {
        if (props.tableStyle.fontSize) table.style.fontSize = props.tableStyle.fontSize;
        if (props.tableStyle.color) table.style.color = props.tableStyle.color;
        if (props.tableStyle.fontFamily) table.style.fontFamily = props.tableStyle.fontFamily;
        if (props.tableStyle.fontWeight) table.style.fontWeight = props.tableStyle.fontWeight;
    }
}
```

**ドキュメント**: `doc/com.shimokado.params_property_guide.md`に詳細ガイド作成済み

### 2. com.shimokado.table_ver1
**目的**: 縦結合機能付きテーブル
**実装プロパティ**: tableStyleのみ

**特徴**:
- 同じ値を持つ隣接行セルを縦方向に結合
- rowspan設定による視覚的な階層表示
- データの階層構造を表現

**スタイル適用**: paramsと同様のapplyTableStyles関数

**properties.json追加設定**:
```json
"tableStyle": {
    "fontSize": "20px",
    "color": "#663300",
    "fontFamily": "Arial, sans-serif",
    "fontWeight": "normal"
}
```

### 3. com.shimokado.table_ver2
**目的**: 集計機能付きテーブル
**実装プロパティ**: tableStyle（背景色・境界線追加サポート）

**特徴**:
- データのグループ化と小計・合計表示
- 圧縮表示による効率的な情報表示
- 集計レベルの視覚的区別

**拡張スタイル適用**:
```javascript
function applyTableStyles(table, props) {
    // 基本スタイル + 以下を追加
    if (props.tableStyle.backgroundColor) {
        table.style.backgroundColor = props.tableStyle.backgroundColor;
    }
    if (props.tableStyle.border) {
        table.style.border = props.tableStyle.border;
    }
}
```

**properties.json拡張設定**:
```json
"tableStyle": {
    "fontSize": "20px",
    "color": "#663300", 
    "fontFamily": "Arial, sans-serif",
    "fontWeight": "normal",
    "backgroundColor": "#f9f9f9",
    "border": "1px solid #ddd"
}
```

### 4. com.shimokado.card_simple
**目的**: カード形式データ表示
**実装プロパティ**: label + valueLabel

**特徴**:
- グリッドレイアウトによるカード表示
- 降順ソート済みデータ表示
- ダッシュボード・KPI表示に最適

**適用箇所**:
- **label**: `<div class="card-label">` - カードタイトル部分
- **valueLabel**: `<div class="card-value">` - 数値表示部分

**スタイル適用関数**:
```javascript
function applyLabelStyles(element, props) { /* label.text適用 */ }
function applyValueLabelStyles(element, props) { /* valueLabel適用 */ }
```

**properties.json設定**:
```json
"label": {
    "text": {
        "color": "#555555",
        "font": "Arial, sans-serif",
        "size": "14px", 
        "weight": "normal"
    }
},
"valueLabel": {
    "color": "#2c3e50",
    "fontFamily": "Georgia, serif",
    "fontSize": "18px",
    "fontWeight": "bold"
}
```

### 5. com.shimokado.chartjs_sample
**目的**: Chart.js統合棒グラフ
**実装プロパティ**: label + valueLabel

**特徴**:
- Chart.js外部ライブラリ使用
- モダンなグラフ表示
- WebFOCUSプロパティをChart.js設定に変換

**適用箇所**:
- **label**: Chart.jsのscales.x.ticks・scales.y.ticks（軸目盛りラベル）
- **valueLabel**: Chart.jsのplugins.legend.labels（凡例ラベル）

**変換関数**:
```javascript
function createScaleFontConfig(props) { 
    // label.text → Chart.js font設定に変換
    // フォントサイズは parseInt() で数値化
}
function createDataLabelFontConfig(props) { 
    // valueLabel → Chart.js font設定に変換
}
```

**Chart.js統合**:
```javascript
const chartConfig = {
    options: {
        scales: {
            x: { ticks: { font: createScaleFontConfig(props) } },
            y: { ticks: { font: createScaleFontConfig(props) } }
        },
        plugins: {
            legend: { labels: { font: createDataLabelFontConfig(props) } }
        }
    }
};
```

## 共通技術要素

### プロパティ取得
```javascript
const props = renderConfig.properties;
```

### WebFOCUS設定方法
1. **properties.json**: デフォルト設定
2. **GRAPH_JS**: 動的設定

### 実装品質保証
- 全拡張機能で統一されたスタイル適用パターン
- プロパティ存在チェックによる安全な適用
- Chart.js等外部ライブラリとの適切な統合
- 詳細ドキュメントによる使用方法明確化

これにより、WebFOCUS拡張グラフファミリー全体で一貫性のあるプロパティベーススタイリングシステムが完成しました。