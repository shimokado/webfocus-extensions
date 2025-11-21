# WebFOCUS拡張グラフのproperties.json設定パターン

## 1. 基本構造
全ての拡張機能で共通の以下の構造を持つ：

```json
{
    "info": { /* メタデータ */ },
    "properties": { /* カスタムプロパティ */ },
    "propertyAnnotations": { /* プロパティ型定義 */ },
    "dataBuckets": { /* データバケット設定 */ },
    "translations": { /* 多言語対応 */ }
}
```

## 2. info セクションパターン

### 2.1 標準的なメタデータ
```json
"info": {
    "version": "1.0",
    "implements_api_version": "1.0",
    "author": "Shimokado Masataka",
    "copyright": "Shimokado Masataka Inc.",
    "url": "https://github.com/shimokado/webfocus-extensions",
    "icons": {
        "medium": "icons/medium.png"
    }
}
```

## 3. dataBucketsの実装パターン

### 3.1 シンプルなパターン（card_simple）
```json
"dataBuckets": {
    "tooltip": true,
    "matrix": false,
    "data_page": false,
    "series_break": false,
    "buckets": [
        {
            "id": "value",
            "type": "measure",
            "count": { "min": 1, "max": 1 }
        },
        {
            "id": "labels", 
            "type": "dimension",
            "count": { "min": 1, "max": 1 }
        }
    ]
}
```

### 3.2 複数値対応パターン（params）
```json
"dataBuckets": {
    "tooltip": true,
    "matrix": false,
    "data_page": false,
    "series_break": false,
    "buckets": [
        {
            "id": "value",
            "type": "measure", 
            "count": { "min": 0, "max": 20 }
        },
        {
            "id": "labels",
            "type": "dimension",
            "count": { "min": 0, "max": 20 }
        },
        {
            "id": "detail",
            "type": "both",
            "count": { "min": 0, "max": 20 }
        }
    ]
}
```

### 3.3 series_break対応パターン（simple_bar）
```json
"dataBuckets": {
    "tooltip": false,
    "series_break": true,
    "buckets": [
        {
            "id": "value",
            "type": "measure",
            "count": { "min": 1, "max": 5 }
        },
        {
            "id": "labels",
            "type": "dimension", 
            "count": { "min": 1, "max": 5 }
        }
    ]
}
```

## 4. translations（多言語対応）パターン

### 4.1 基本的な翻訳構造
```json
"translations": {
    "en": {
        "name": "Extension Name",
        "description": "Extension description",
        "icon_tooltip": "Extension tooltip",
        "value_name": "Value",
        "value_tooltip": "Drop a measure here",
        "labels_name": "Labels", 
        "labels_tooltip": "Drop a dimension here"
    },
    "ja": {
        "name": "拡張機能名",
        "description": "拡張機能の説明", 
        "icon_tooltip": "拡張機能のツールチップ",
        "value_name": "値",
        "value_tooltip": "メジャーをここにドロップ",
        "labels_name": "ラベル",
        "labels_tooltip": "ディメンションをここにドロップ"
    }
}
```

### 4.2 複数バケット対応の翻訳
```json
"translations": {
    "en": {
        "name": "Advanced Table",
        "description": "Advanced table with multiple data types",
        "value_name": "Values",
        "labels_name": "Labels", 
        "detail_name": "Details",
        "detail_tooltip": "Drop any field here for additional details"
    }
}
```

## 5. カスタムプロパティパターン

### 5.1 スタイルプロパティ
```json
"properties": {
    "tableStyle": {
        "fontSize": "12px",
        "color": "#000000",
        "backgroundColor": "#ffffff"
    }
}
```

### 5.2 機能制御プロパティ
```json
"properties": {
    "showTotals": true,
    "enableExport": false,
    "maxRows": 100
}
```

## 6. propertyAnnotations型定義パターン

### 6.1 基本型の定義
```json
"propertyAnnotations": {
    "tableStyle": {
        "fontSize": "str",
        "color": "str", 
        "backgroundColor": "str"
    },
    "showTotals": "bool",
    "maxRows": "number"
}
```

## 7. バケット設定の詳細パターン

### 7.1 バケットタイプ
- `"measure"`: 数値データのみ
- `"dimension"`: 文字列データのみ  
- `"both"`: 両方のデータ型

### 7.2 カウント制限パターン
- `{"min": 0, "max": 1}`: オプション（0-1個）
- `{"min": 1, "max": 1}`: 必須（1個のみ）
- `{"min": 1, "max": 5}`: 必須複数（1-5個）
- `{"min": 0, "max": 20}`: 大量対応（0-20個）

### 7.3 特殊機能の有効化
- `"tooltip": true`: 標準ツールチップ
- `"series_break": true`: シリーズ分割機能
- `"matrix": false`: マトリックス表示（通常false）
- `"data_page": false`: データページング（通常false）

## 8. 実装複雑度別の設定例

### 8.1 簡単（1-2バケット、基本機能のみ）
- card_simple, table_simple

### 8.2 中級（3-5バケット、複数データ型対応）
- table_ver1, chartjs_sample

### 8.3 高級（大量バケット、高度機能）
- params（デバッグ用）, table_ver2（Excel出力付き）