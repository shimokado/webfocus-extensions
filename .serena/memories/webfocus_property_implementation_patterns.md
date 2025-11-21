# WebFOCUSプロパティ実装技術ガイド

## 開発パターンの確立

WebFOCUS拡張グラフでのプロパティベーススタイリング実装において、以下の統一パターンが確立されました。

## 実装パターン分類

### パターン1: テーブル系拡張機能
**対象**: params, table_ver1, table_ver2
**プロパティ**: tableStyleのみ
**実装方法**:
```javascript
function applyTableStyles(table, props) {
    if (props.tableStyle) {
        if (props.tableStyle.fontSize) {
            table.style.fontSize = props.tableStyle.fontSize;
        }
        if (props.tableStyle.color) {
            table.style.color = props.tableStyle.color;
        }
        if (props.tableStyle.fontFamily) {
            table.style.fontFamily = props.tableStyle.fontFamily;
        }
        if (props.tableStyle.fontWeight) {
            table.style.fontWeight = props.tableStyle.fontWeight;
        }
    }
}

// 使用方法
const table = document.createElement('table');
applyTableStyles(table, props);
```

### パターン2: カード・ビジュアル系拡張機能
**対象**: card_simple
**プロパティ**: label + valueLabel
**実装方法**:
```javascript
function applyLabelStyles(element, props) {
    if (props.label && props.label.text) {
        if (props.label.text.color) {
            element.style.color = props.label.text.color;
        }
        if (props.label.text.font) {
            element.style.fontFamily = props.label.text.font;
        }
        if (props.label.text.size) {
            element.style.fontSize = props.label.text.size;
        }
        if (props.label.text.weight) {
            element.style.fontWeight = props.label.text.weight;
        }
    }
}

function applyValueLabelStyles(element, props) {
    if (props.valueLabel) {
        if (props.valueLabel.color) {
            element.style.color = props.valueLabel.color;
        }
        if (props.valueLabel.fontFamily) {
            element.style.fontFamily = props.valueLabel.fontFamily;
        }
        if (props.valueLabel.fontSize && props.valueLabel.fontSize !== 'auto') {
            element.style.fontSize = props.valueLabel.fontSize;
        }
        if (props.valueLabel.fontWeight) {
            element.style.fontWeight = props.valueLabel.fontWeight;
        }
    }
}

// 使用方法
const labelElement = document.createElement('div');
const valueElement = document.createElement('div');
applyLabelStyles(labelElement, props);
applyValueLabelStyles(valueElement, props);
```

### パターン3: 外部ライブラリ統合系
**対象**: chartjs_sample
**プロパティ**: label + valueLabel → 外部ライブラリ設定に変換
**実装方法**:
```javascript
function createScaleFontConfig(props) {
    const fontConfig = {};
    
    if (props.label && props.label.text) {
        if (props.label.text.size) {
            fontConfig.size = parseInt(props.label.text.size);
        }
        if (props.label.text.font) {
            fontConfig.family = props.label.text.font;
        }
        if (props.label.text.weight) {
            fontConfig.weight = props.label.text.weight;
        }
        if (props.label.text.color) {
            fontConfig.color = props.label.text.color;
        }
    }
    
    return Object.keys(fontConfig).length > 0 ? fontConfig : undefined;
}

function createDataLabelFontConfig(props) {
    const fontConfig = {};
    
    if (props.valueLabel) {
        if (props.valueLabel.fontSize && props.valueLabel.fontSize !== 'auto') {
            fontConfig.size = parseInt(props.valueLabel.fontSize);
        }
        if (props.valueLabel.fontFamily) {
            fontConfig.family = props.valueLabel.fontFamily;
        }
        if (props.valueLabel.fontWeight) {
            fontConfig.weight = props.valueLabel.fontWeight;
        }
        if (props.valueLabel.color) {
            fontConfig.color = props.valueLabel.color;
        }
    }
    
    return Object.keys(fontConfig).length > 0 ? fontConfig : undefined;
}

// Chart.js設定に適用
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

## properties.json設定パターン

### 基本設定構造
```json
{
  "properties": {
    // パターン1: テーブル系
    "tableStyle": {
      "fontSize": "14px",
      "color": "#333333",
      "fontFamily": "Arial, sans-serif",
      "fontWeight": "normal"
    },
    
    // パターン2&3: ビジュアル系
    "label": {
      "text": {
        "color": "#666666",
        "font": "Arial, sans-serif",
        "size": "12px",
        "weight": "normal"
      }
    },
    "valueLabel": {
      "color": "#333333",
      "fontFamily": "Arial, sans-serif",
      "fontSize": "16px", 
      "fontWeight": "bold"
    }
  },
  "propertyAnnotations": {
    "tableStyle": "object",
    "label": "object",
    "valueLabel": "object"
  }
}
```

## 実装時の判断基準

### どのプロパティを使うか？

1. **テーブル表示の場合**: tableStyleのみ
   - 理由: 表全体の統一感が重要
   - 例: データテーブル、レポート表示

2. **要素分離表示の場合**: label + valueLabel
   - 理由: 異なる情報レベルの視覚的分離が必要
   - 例: カード、グラフの軸と数値

3. **外部ライブラリ使用の場合**: label + valueLabel → 変換
   - 理由: ライブラリAPIに合わせた変換が必要
   - 例: Chart.js, D3.js等

### プロパティ構造の選択

- **label**: `text`オブジェクト経由（WebFOCUS標準パターン）
- **valueLabel**: 直接プロパティ（数値表示特化パターン）
- **tableStyle**: 直接プロパティ（テーブル特化パターン）

## 新規拡張機能での適用手順

1. **表示特性の分析**: テーブル系 vs ビジュアル系 vs 外部ライブラリ系
2. **プロパティ選択**: 上記パターンから適切なものを選択
3. **スタイル適用関数実装**: 確立されたパターンを使用
4. **properties.json設定**: 適切なプロパティ定義を追加
5. **テスト**: properties.json + GRAPH_JS両方での動作確認

## コードの再利用性

確立されたパターンにより、新しい拡張機能でも既存のスタイル適用関数を再利用可能。必要に応じて機能拡張やカスタマイズを行う。

これらのパターンを活用することで、一貫性のあるWebFOCUS拡張グラフの開発が可能になります。