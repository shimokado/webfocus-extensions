# 04. 実践演習編 - シンプル拡張グラフの作成

## 🎯 この章の目標

- 簡単な拡張グラフを一から作成する
- 実際にコードを書いて学習を深める
- デバッグ手法を実践で習得する
- WebFOCUSへのデプロイまでを完了する

## 📊 作成する拡張グラフ：「カード表示」

### 機能仕様

- **名前**: Card Display
- **ID**: com.learning.card_display
- **機能**: データをカード形式で表示
- **レイアウト**: グリッド形式で整列
- **ソート**: 値の降順で表示

## 🛠️ ステップバイステップ実装

### ステップ1：プロジェクト作成

#### 1-1. フォルダ作成

```bash
mkdir com.learning.card_display
cd com.learning.card_display
mkdir css icons lib
```

#### 1-2. 基本ファイル作成

必要なファイル：
- `com.learning.card_display.js`
- `properties.json`
- `test.html`
- `css/style.css`
- `icons/medium.png`

### ステップ2：properties.json の作成

```json
{
    "info": {
        "version": "1.0",
        "implements_api_version": "1.0",
        "author": "Learning User",
        "copyright": "Learning User Inc.",
        "url": "https://github.com/learning/webfocus-extensions",
        "icons": {
            "medium": "icons/medium.png"
        }
    },
    "properties": {
        "cardColor": "#ffffff",
        "textColor": "#333333",
        "maxCards": 20
    },
    "propertyAnnotations": {
        "cardColor": "str",
        "textColor": "str", 
        "maxCards": "number"
    },
    "dataBuckets": {
        "tooltip": true,
        "matrix": false,
        "data_page": false,
        "series_break": false,
        "buckets": [
            {
                "id": "value",
                "type": "measure",
                "count": {
                    "min": 1,
                    "max": 1
                }
            },
            {
                "id": "labels",
                "type": "dimension",
                "count": {
                    "min": 1,
                    "max": 2
                }
            }
        ]
    },
    "translations": {
        "en": {
            "name": "Card Display (Learning)",
            "description": "Display data in card format for learning purposes.",
            "icon_tooltip": "Card Display",
            "value_name": "Value",
            "value_tooltip": "Drop a measure here",
            "labels_name": "Labels",
            "labels_tooltip": "Drop dimension(s) here"
        },
        "ja": {
            "name": "カード表示（学習用）",
            "description": "学習目的でデータをカード形式で表示します。",
            "icon_tooltip": "カード表示",
            "value_name": "値",
            "value_tooltip": "メジャーをここにドロップ",
            "labels_name": "ラベル",
            "labels_tooltip": "ディメンションをここにドロップ"
        }
    }
}
```

### ステップ3：CSS作成

```css
/* css/style.css */
.learning-card-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
    padding: 16px;
    height: 100%;
    overflow-y: auto;
    box-sizing: border-box;
}

.learning-card {
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.2s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.learning-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.learning-card-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
    font-weight: 500;
}

.learning-card-value {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    text-align: right;
}

.learning-no-data {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #999;
    font-size: 16px;
}

@media (max-width: 768px) {
    .learning-card-container {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
        padding: 12px;
    }
    
    .learning-card {
        padding: 12px;
    }
}
```

### ステップ4：メインJavaScript実装

```javascript
// com.learning.card_display.js
(function() {

    /**
     * 初期化コールバック
     */
    function initCallback(successCallback, initConfig) {
        console.log('Card Display Extension: Initializing...');
        successCallback(true);
    }

    /**
     * レンダリング前処理
     */
    function preRenderCallback(preRenderConfig) {
        console.log('Card Display Extension: Pre-render');
        // 前回のレンダリング結果をクリーンアップ
        if (preRenderConfig.container) {
            preRenderConfig.container.innerHTML = '';
        }
    }

    /**
     * データなし時のレンダリング
     */
    function noDataRenderCallback(renderConfig) {
        console.log('Card Display Extension: No data render');
        
        const container = renderConfig.container;
        container.innerHTML = '';
        
        const noDataDiv = document.createElement('div');
        noDataDiv.className = 'learning-no-data';
        noDataDiv.textContent = 'データがありません';
        
        container.appendChild(noDataDiv);
        renderConfig.renderComplete();
    }

    /**
     * メインレンダリング関数
     */
    function renderCallback(renderConfig) {
        console.log('Card Display Extension: Main render start');
        console.log('RenderConfig:', renderConfig);
        
        try {
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
            
            // データの検証
            if (!data || data.length === 0) {
                noDataRenderCallback(renderConfig);
                return;
            }
            
            // データの正規化
            const normalizedData = normalizeData(data, dataBuckets);
            
            // メインコンテナの作成
            const cardContainer = document.createElement('div');
            cardContainer.className = 'learning-card-container';
            cardContainer.style.width = width + 'px';
            cardContainer.style.height = height + 'px';
            
            // カードの生成
            createCards(cardContainer, normalizedData, props, chart);
            
            // コンテナに追加
            container.appendChild(cardContainer);
            
            console.log('Card Display Extension: Render completed');
            renderConfig.renderComplete();
            
        } catch (error) {
            console.error('Card Display Extension Error:', error);
            
            // エラー表示
            container.innerHTML = `
                <div class="learning-no-data">
                    エラーが発生しました: ${error.message}
                </div>
            `;
            
            renderConfig.renderComplete();
        }
    }

    /**
     * データ正規化関数
     */
    function normalizeData(data, dataBuckets) {
        console.log('Normalizing data:', data);
        console.log('DataBuckets:', dataBuckets);
        
        // バケット情報の取得
        const labels = dataBuckets.labels;
        const values = dataBuckets.value;
        
        // データの変換
        const processedData = [];
        
        data.forEach(record => {
            const labelArray = Array.isArray(record[0]) ? record[0] : [record[0]];
            const valueArray = Array.isArray(record[1]) ? record[1] : [record[1]];
            
            processedData.push({
                labels: labelArray,
                values: valueArray,
                // 複数ラベルの場合は結合
                displayLabel: labelArray.join(' - '),
                // 最初の値を表示用に使用
                displayValue: valueArray[0] || 0
            });
        });
        
        // 値の降順でソート
        processedData.sort((a, b) => b.displayValue - a.displayValue);
        
        return {
            data: processedData,
            labelTitle: labels ? (labels.title || 'Label') : 'Label',
            valueTitle: values ? (values.title || 'Value') : 'Value',
            valueFormat: values ? (values.numberFormat || '#,###') : '#,###'
        };
    }

    /**
     * カード生成関数
     */
    function createCards(container, normalizedData, props, chart) {
        const { data, valueTitle, valueFormat } = normalizedData;
        const maxCards = props.maxCards || 20;
        
        // 最大カード数まで表示
        const displayData = data.slice(0, maxCards);
        
        displayData.forEach((record, index) => {
            const card = document.createElement('div');
            card.className = 'learning-card';
            
            // プロパティからスタイル適用
            if (props.cardColor) {
                card.style.backgroundColor = props.cardColor;
            }
            
            // ラベル要素
            const labelDiv = document.createElement('div');
            labelDiv.className = 'learning-card-label';
            labelDiv.textContent = record.displayLabel;
            
            if (props.textColor) {
                labelDiv.style.color = props.textColor;
            }
            
            // 値要素
            const valueDiv = document.createElement('div');
            valueDiv.className = 'learning-card-value';
            valueDiv.textContent = chart.formatNumber(record.displayValue, valueFormat);
            
            if (props.textColor) {
                valueDiv.style.color = props.textColor;
            }
            
            // カードに要素を追加
            card.appendChild(labelDiv);
            card.appendChild(valueDiv);
            
            // ツールチップ設定（オプション）
            card.title = `${record.displayLabel}: ${chart.formatNumber(record.displayValue, valueFormat)}`;
            
            // コンテナに追加
            container.appendChild(card);
        });
        
        console.log(`Created ${displayData.length} cards`);
    }

    /**
     * 設定オブジェクト
     */
    var config = {
        id: 'com.learning.card_display',
        containerType: 'html',
        initCallback: initCallback,
        preRenderCallback: preRenderCallback,
        renderCallback: renderCallback,
        noDataRenderCallback: noDataRenderCallback,
        resources: {
            script: [],
            css: ['css/style.css']
        },
        modules: {
            dataSelection: {
                supported: false
            },
            eventHandler: {
                supported: false
            },
            tooltip: {
                supported: true,
                autoContent: function(target, s, g, d) {
                    return d.labels + ': ' + d.value;
                }
            }
        }
    };

    // 拡張機能の登録
    console.log('Registering Card Display Extension');
    tdgchart.extensionManager.register(config);

})();
```

### ステップ5：テスト用HTML作成

```html
<!DOCTYPE html>
<html>
<head>
    <title>Card Display Test</title>
    <meta charset="UTF-8">
    <script src="../com.shimokado.params/tdgchart-min-for-test.js"></script>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <h1>Card Display Extension Test</h1>
    <div id="chart-container" style="width:800px;height:600px;border:1px solid #ccc;"></div>
    
    <script src="com.learning.card_display.js"></script>
    <script>
        // テスト用データ
        var testData = [
            [['製品A'], [15000]],
            [['製品B'], [12500]],
            [['製品C'], [8900]],
            [['製品D'], [21000]],
            [['製品E'], [5600]]
        ];
        
        // モックのrenderConfig
        var mockRenderConfig = {
            container: document.getElementById('chart-container'),
            data: testData,
            width: 800,
            height: 600,
            moonbeamInstance: {
                formatNumber: function(num, format) {
                    return num.toLocaleString();
                }
            },
            dataBuckets: {
                buckets: {
                    labels: { 
                        title: 'Product',
                        fieldName: 'PRODUCT'
                    },
                    value: { 
                        title: 'Sales',
                        fieldName: 'SALES',
                        numberFormat: '#,###'
                    }
                }
            },
            properties: {
                cardColor: '#ffffff',
                textColor: '#333333',
                maxCards: 10
            },
            renderComplete: function() {
                console.log('Test render complete');
            }
        };
        
        // 描画テスト実行
        setTimeout(function() {
            renderCallback(mockRenderConfig);
        }, 100);
    </script>
</body>
</html>
```

## 🧪 テストとデバッグ

### ステップ6：ローカルテスト

1. **ファイルの保存確認**
   - すべてのファイルが正しい場所に保存されているか確認

2. **test.htmlの実行**
   ```bash
   # ブラウザでtest.htmlを開く
   start test.html
   ```

3. **動作確認ポイント**
   - カードが正しく表示されるか
   - ソートが正しく動作するか
   - スタイルが適用されているか
   - コンソールエラーがないか

### ステップ7：デバッグ手法

#### ブラウザ開発者ツールの活用

```javascript
// デバッグ用にコンソール出力を追加
function debugLog(message, data) {
    console.group(`Card Display Debug: ${message}`);
    console.log(data);
    console.groupEnd();
}

// 使用例
debugLog('Received data', renderConfig.data);
debugLog('Normalized data', normalizedData);
```

#### よくあるエラーと対処法

1. **「Cannot read property of undefined」**
   - データ構造の確認
   - null/undefinedチェックの追加

2. **「renderComplete is not a function」**
   - mockRenderConfigにrenderComplete関数が定義されているか確認

3. **CSS が適用されない**
   - ファイルパスの確認
   - ブラウザのキャッシュクリア

## 🚀 WebFOCUSへのデプロイ

### ステップ8：拡張機能の配置

```bash
# 開発中の拡張機能をコピー
xcopy com.learning.card_display C:\ibi\WebFOCUS93\config\web_resource\extensions\ /E /I
```

### ステップ9：有効化設定

`html5chart_extensions.json`に追記：

```json
{
    "com.learning.card_display": {"enabled": true},
    "他の拡張機能": {"enabled": true}
}
```

### ステップ10：動作確認

1. **Apache Tomcat再起動**
2. **WebFOCUSでチャート作成**
   - データソース：任意のデータ
   - チャートタイプ：HTML5拡張 > Card Display (Learning)
3. **フィールド設定**
   - ラベル：任意のディメンション
   - 値：任意のメジャー
4. **実行と確認**

## 📋 学習チェックリスト

### 実装の確認

- [ ] properties.json が正しく設定されている
- [ ] メインJavaScriptファイルが完成している
- [ ] CSSスタイルが適用されている
- [ ] ローカルテストが正常動作している
- [ ] エラーハンドリングが実装されている

### 理解度の確認

- [ ] コールバック関数の役割を理解している
- [ ] データ正規化の必要性を理解している
- [ ] DOM操作の基本を理解している
- [ ] デバッグ手法を習得している
- [ ] WebFOCUSへのデプロイ手順を理解している

## 🎓 応用課題

学習をさらに深めるための応用課題：

### 課題1：機能拡張
- 色分け機能を追加（値の範囲に応じて）
- アニメーション効果の実装
- フィルタリング機能の追加

### 課題2：カスタマイズ
- 異なるカードレイアウトの実装
- レスポンシブ対応の改善
- アクセシビリティ対応

### 課題3：他の拡張機能の分析
- 既存の`com.shimokado.*`を分析
- パターンの理解と応用
- 独自の拡張機能アイデアの実装

---

**🎉 お疲れさまでした！**

このチュートリアルを通じて、WebFOCUS拡張グラフの基本的な開発手法を習得できました。さらに高度な機能や複雑な実装については、プロジェクト内の他の拡張機能を参考にしながら、継続的に学習を進めてください。