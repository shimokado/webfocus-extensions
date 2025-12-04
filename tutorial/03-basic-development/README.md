# 03. 基礎開発編 - 拡張グラフの実装

## 🎯 この章の目標

- 基本的なコールバック関数を理解・実装する
- DOM操作によるレンダリング方法を学ぶ
- properties.jsonの設定方法を習得する
- 開発からテストまでの流れを理解する

## 🏗️ 拡張グラフの基本構造

### 標準的なファイル構成

```
com.yourcompany.yourextension/
├── com.yourcompany.yourextension.js    # メインロジック
├── properties.json                     # 設定ファイル
├── test.html                          # テスト用HTML
├── css/
│   └── style.css                      # スタイルシート
├── lib/
│   └── external-lib.js                # 外部ライブラリ
└── icons/
    └── medium.png                     # アイコン画像
```

## 📝 基本実装パターン

### 1. メインJavaScriptファイルの構造

```javascript
(function() {
    // コールバック関数の定義
    function initCallback(successCallback, initConfig) {
        // 初期化処理
        successCallback(true);
    }
    
    function preRenderCallback(preRenderConfig) {
        // レンダリング前の処理
        console.log('preRenderCallback:', preRenderConfig);
    }
    
    function renderCallback(renderConfig) {
        // メインの描画処理
        const container = renderConfig.container;
        const data = renderConfig.data;
        
        // DOM操作による描画
        // ...
        
        // 必須：レンダリング完了通知
        renderConfig.renderComplete();
    }
    
    function noDataRenderCallback(renderConfig) {
        // データがない場合の処理
        const container = renderConfig.container;
        container.innerHTML = '<div>データがありません</div>';
        renderConfig.renderComplete();
    }
    
    // 設定オブジェクト
    var config = {
        id: 'com.yourcompany.yourextension',
        containerType: 'html', // または 'svg'
        initCallback: initCallback,
        preRenderCallback: preRenderCallback,
        renderCallback: renderCallback,
        noDataRenderCallback: noDataRenderCallback,
        resources: {
            script: ['lib/external-lib.js'],
            css: ['css/style.css']
        }
    };
    
    // 拡張機能の登録
    tdgchart.extensionManager.register(config);
})();
```

### 2. コールバック関数の詳細

#### initCallback（初期化）

```javascript
function initCallback(successCallback, initConfig) {
    // 外部ライブラリの読み込み確認
    if (typeof d3 === 'undefined') {
        console.error('D3.js not loaded');
        successCallback(false);
        return;
    }
    
    // カスタム初期化処理
    console.log('Extension initialized');
    successCallback(true);
}
```

#### renderCallback（メイン描画）

```javascript
function renderCallback(renderConfig) {
    // 基本オブジェクトの取得
    const chart = renderConfig.moonbeamInstance;
    const props = renderConfig.properties;
    const container = renderConfig.container;
    const data = renderConfig.data;
    const dataBuckets = renderConfig.dataBuckets.buckets;
    const width = renderConfig.width;
    const height = renderConfig.height;
    
    // コンテナのクリーンアップ
    container.innerHTML = '';
    
    // データの正規化
    const normalizedData = normalizeData(data, dataBuckets);
    
    // DOM構築
    const mainDiv = document.createElement('div');
    mainDiv.className = 'extension-container';
    mainDiv.style.width = width + 'px';
    mainDiv.style.height = height + 'px';
    
    // データの描画
    renderData(mainDiv, normalizedData, chart);
    
    // コンテナに追加
    container.appendChild(mainDiv);
    
    // 必須：完了通知
    renderConfig.renderComplete();
}
```

### 3. データ正規化関数

```javascript
function normalizeData(data, dataBuckets) {
    // バケット情報の安全な取得
    const labels = dataBuckets.labels || null;
    const values = dataBuckets.value || null;
    
    // データの配列化
    const normalizedData = data.map(record => {
        return {
            labels: normalizeToArray(record[0]),
            values: normalizeToArray(record[1])
        };
    });
    
    return {
        data: normalizedData,
        labelTitles: labels ? normalizeToArray(labels.title) : [],
        valueTitles: values ? normalizeToArray(values.title) : [],
        valueFormats: values ? normalizeToArray(values.numberFormat) : []
    };
}

function normalizeToArray(value) {
    if (value === undefined || value === null) return [];
    return Array.isArray(value) ? value : [value];
}
```

#### ⚠️ 重要：データ正規化の実装

development_guideの実践編を参考に、renderCallbackの最初で必ずデータ正規化を実装してください。以下のベストプラクティスを採用：

```javascript
function renderCallback(renderConfig) {
    // ===== ステップ1: データの正規化（必須）=====
    // depth=1 でも labels/value が文字列になる場合がある
    var normalizedData = [];
    if (renderConfig.dataBuckets.depth === 1) {
        // depth=1: data はそのままアイテム配列
        normalizedData = renderConfig.data.map(function(item) {
            return {
                labels: Array.isArray(item.labels) ? item.labels : [item.labels],
                value: Array.isArray(item.value) ? item.value : [item.value]
            };
        });
    } else {
        // depth>1: data は配列の配列（シリーズごとにグループ化）
        renderConfig.data.forEach(function(series) {
            if (Array.isArray(series)) {
                series.forEach(function(item) {
                    normalizedData.push({
                        labels: Array.isArray(item.labels) ? item.labels : [item.labels],
                        value: Array.isArray(item.value) ? item.value : [item.value]
                    });
                });
            }
        });
    }
    
    // ===== ステップ2: 正規化後は常に配列として安全にアクセス =====
    normalizedData.forEach(function(item) {
        var firstLabel = item.labels[0];  // 常に文字列
        var firstValue = item.value[0];   // 常に数値
    });
    
    // ... 以降の描画処理
}
```

### 4. DOM描画関数

```javascript
function renderData(container, normalizedData, chart) {
    const { data, labelTitles, valueTitles, valueFormats } = normalizedData;
    
    // テーブル作成例
    const table = document.createElement('table');
    table.className = 'data-table';
    
    // ヘッダー行
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    labelTitles.forEach(title => {
        const th = document.createElement('th');
        th.textContent = title;
        headerRow.appendChild(th);
    });
    
    valueTitles.forEach(title => {
        const th = document.createElement('th');
        th.textContent = title;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // データ行
    const tbody = document.createElement('tbody');
    
    data.forEach(record => {
        const row = document.createElement('tr');
        
        // ラベル列
        record.labels.forEach(label => {
            const td = document.createElement('td');
            td.textContent = label;
            row.appendChild(td);
        });
        
        // 値列
        record.values.forEach((value, index) => {
            const td = document.createElement('td');
            const format = valueFormats[index] || '#';
            td.textContent = chart.formatNumber(value, format);
            td.style.textAlign = 'right';
            row.appendChild(td);
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
}
```

## ⚙️ properties.jsonの設定

### 基本構造

```json
{
    "info": {
        "version": "1.0",
        "implements_api_version": "1.0",
        "author": "Your Company",
        "copyright": "Your Company Inc.",
        "url": "https://yourcompany.com",
        "icons": {
            "medium": "icons/medium.png"
        }
    },
    "properties": {
        "customProperty": "defaultValue"
    },
    "propertyAnnotations": {
        "customProperty": "str"
    },
    "dataBuckets": {
        "tooltip": false,
        "series_break": false,
        "buckets": [
            {
                "id": "value",
                "type": "measure",
                "count": {"min": 1, "max": 5}
            },
            {
                "id": "labels",
                "type": "dimension", 
                "count": {"min": 1, "max": 3}
            }
        ]
    },
    "translations": {
        "en": {
            "name": "Your Extension",
            "description": "Extension description",
            "value_name": "Value",
            "value_tooltip": "Drop a measure here",
            "labels_name": "Labels",
            "labels_tooltip": "Drop a dimension here"
        },
        "ja": {
            "name": "あなたの拡張機能",
            "description": "拡張機能の説明",
            "value_name": "値",
            "value_tooltip": "メジャーをここにドロップ",
            "labels_name": "ラベル", 
            "labels_tooltip": "ディメンションをここにドロップ"
        }
    }
}
```

### 重要な設定項目

#### dataBuckets設定

```json
{
    "id": "bucket_name",
    "type": "measure|dimension|both",
    "count": {
        "min": 0,  // 最小フィールド数
        "max": 10  // 最大フィールド数  
    }
}
```

**type指定**:
- `measure`: 数値データのみ
- `dimension`: 文字列データのみ
- `both`: どちらでも可

## 🧪 テストとデバッグ

### 1. ローカルテスト（test.html）

```html
<!DOCTYPE html>
<html>
<head>
    <title>Extension Test</title>
    <script src="tdgchart-min-for-test.js"></script>
    <script src="com.yourcompany.yourextension.js"></script>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div id="chart-container" style="width:800px;height:600px;"></div>
    
    <script>
        // テスト用データ
        var testData = [
            [
                [['Label1'], [100]],
                [['Label2'], [200]]
            ]
        ];
        
        // 拡張機能のテスト実行
        var mockRenderConfig = {
            container: document.getElementById('chart-container'),
            data: testData,
            width: 800,
            height: 600,
            moonbeamInstance: {
                formatNumber: function(num, format) { return num; }
            },
            dataBuckets: {
                buckets: {
                    labels: { title: 'Test Label' },
                    value: { title: 'Test Value' }
                }
            },
            renderComplete: function() {
                console.log('Render complete');
            }
        };
        
        // 描画テスト
        renderCallback(mockRenderConfig);
    </script>
</body>
</html>
```

### 2. デバッグのコツ

#### ブラウザ開発者ツールの活用

```javascript
function debugRenderConfig(renderConfig) {
    console.group('RenderConfig Debug');
    console.log('Container:', renderConfig.container);
    console.log('Data:', renderConfig.data);
    console.log('DataBuckets:', renderConfig.dataBuckets);
    console.log('Dimensions:', {
        width: renderConfig.width,
        height: renderConfig.height
    });
    console.groupEnd();
}

// renderCallbackの最初で呼び出し
function renderCallback(renderConfig) {
    debugRenderConfig(renderConfig);
    // ... 実際の処理
}
```

## 🚀 WebFOCUSへのデプロイ

### 1. 拡張機能の配置

```bash
# WebFOCUSの拡張機能フォルダにコピー
# 通常: C:\ibi\WebFOCUS93\config\web_resource\extensions\
copy com.yourcompany.yourextension C:\ibi\WebFOCUS93\config\web_resource\extensions\
```

### 2. 有効化設定

`html5chart_extensions.json`に追記：

```json
{
    "com.yourcompany.yourextension": {"enabled": true}
}
```

### 3. 動作確認

1. Apache Tomcat再起動
2. WebFOCUSでチャート作成
3. HTML5拡張 > あなたの拡張機能を選択
4. データを設定して実行

## 📋 開発チェックリスト

### 実装確認

- [ ] `renderConfig.renderComplete()`が確実に呼ばれている
- [ ] データの null/undefined チェックが実装されている
- [ ] エラーハンドリングが適切に行われている
- [ ] ブラウザのコンソールエラーがない

### 設定確認

- [ ] properties.json の文法が正しい
- [ ] dataBuckets設定が適切
- [ ] 多言語対応（translations）が完了
- [ ] アイコンファイルが配置されている

### テスト確認

- [ ] ローカルテストが正常動作
- [ ] 複数のデータパターンでテスト済み
- [ ] WebFOCUSでの動作確認済み

## 🔄 次のステップ

基礎的な実装方法を習得したら、「04-hands-on-exercises」で実際にシンプルな拡張機能を作成してみましょう。

---

**💡 開発のコツ**:

- 常に`console.log()`でデバッグ情報を出力しましょう
- エラーが発生したらブラウザの開発者ツールを確認
- 小さな機能から始めて段階的に機能を追加していきましょう
- 既存の`com.shimokado.*`のコードを参考にしてください
