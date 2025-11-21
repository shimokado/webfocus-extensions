# WebFOCUS拡張グラフのコードパターン詳細分析

## 1. 基本構造パターン

### 1.1 IIFE（即座実行関数式）の使用
全ての拡張機能は以下のパターンで実装：
```javascript
(function() {
    // コールバック関数の定義
    function initCallback(successCallback, initConfig) { /* ... */ }
    function preRenderCallback(preRenderConfig) { /* ... */ }
    function renderCallback(renderConfig) { /* ... */ }
    function noDataPreRenderCallback(preRenderConfig) { /* ... */ }
    function noDataRenderCallback(renderConfig) { /* ... */ }
    
    // 設定オブジェクト
    var config = {
        id: 'com.shimokado.extension_name',
        containerType: 'html' | 'svg',
        // コールバック関数の登録
        resources: { script: [], css: [] },
        modules: { /* 機能モジュール設定 */ }
    };
    
    // 拡張機能登録
    tdgchart.extensionManager.register(config);
})();
```

## 2. コールバック関数の実装パターン

### 2.1 renderCallback（必須）の標準実装
```javascript
function renderCallback(renderConfig) {
    // 1. 基本オブジェクトの取得
    var chart = renderConfig.moonbeamInstance;
    var props = renderConfig.properties;
    var container = renderConfig.container;
    var data = renderConfig.data;
    var dataBuckets = renderConfig.dataBuckets.buckets;
    var width = renderConfig.width;
    var height = renderConfig.height;
    
    // 2. コンテナのクリーンアップ（オプション）
    container.innerHTML = '';
    
    // 3. データ処理とDOM構築
    // 具体的な実装...
    
    // 4. 必須：レンダリング完了通知
    renderConfig.renderComplete();
}
```

### 2.2 initCallback（オプション）の標準実装
```javascript
function initCallback(successCallback, initConfig) {
    // 初期化処理（ライブラリ読み込み確認など）
    successCallback(true); // 必須：成功通知
}
```

### 2.3 データなし時の処理パターン
```javascript
function noDataRenderCallback(renderConfig) {
    // サンプルデータを設定してrenderCallbackを呼び出すパターン
    renderConfig.data = [/* サンプルデータ */];
    renderCallback(renderConfig);
    
    // または、専用のメッセージ表示
    var container = renderConfig.container;
    container.innerHTML = '<div>データがありません</div>';
    renderConfig.renderComplete();
}
```

## 3. データ処理の共通パターン

### 3.1 バケットデータの安全な取得
```javascript
// 配列化の標準パターン
const labelsTitles = buckets.labels ? 
    (Array.isArray(buckets.labels.title) ? buckets.labels.title : [buckets.labels.title]) : [];

const valueTitles = buckets.value ? 
    (Array.isArray(buckets.value.title) ? buckets.value.title : [buckets.value.title]) : [];

// データ配列の正規化
const datas = data.map(d => ({
    labels: d.labels !== undefined ? 
        (Array.isArray(d.labels) ? d.labels : [d.labels]) : [],
    value: d.value !== undefined ? 
        (Array.isArray(d.value) ? d.value : [d.value]) : []
}));
```

### 3.2 数値フォーマットの適用
```javascript
// moonbeamInstanceの便利メソッドを使用
var formattedValue = chart.formatNumber(value, buckets.value.numberFormat || '###');
```

### 3.3 データソートパターン
```javascript
// 降順ソート（card_simpleの例）
data.sort(function(a, b) {
    return b.value - a.value;
});
```

## 4. DOM操作の共通パターン

### 4.1 HTMLコンテナタイプの場合
```javascript
// コンテナ作成
var mainContainer = document.createElement('div');
mainContainer.className = 'extension-container';
container.appendChild(mainContainer);

// 要素の作成と追加
data.forEach(function(item) {
    var element = document.createElement('div');
    element.className = 'data-element';
    element.textContent = item.labels + ': ' + item.value;
    mainContainer.appendChild(element);
});
```

### 4.2 スタイル適用パターン
```javascript
// プロパティからスタイル情報を取得
var fontSize = props.tableStyle ? props.tableStyle.fontSize : "12px";
var color = props.tableStyle ? props.tableStyle.color : "#000000";

// 動的スタイル適用
element.style.fontSize = fontSize;
element.style.color = color;
```

## 5. 設定オブジェクト（config）の実装パターン

### 5.1 基本設定
```javascript
var config = {
    id: 'com.shimokado.extension_name',  // 必須：一意のID
    containerType: 'html',               // 'html' または 'svg'
    renderCallback: renderCallback,      // 必須：描画関数
    initCallback: initCallback,          // オプション
    preRenderCallback: preRenderCallback, // オプション
    noDataPreRenderCallback: noDataPreRenderCallback, // オプション
    noDataRenderCallback: noDataRenderCallback        // オプション
};
```

### 5.2 リソース読み込みパターン
```javascript
resources: {
    script: ['lib/d3.min.js', 'lib/chart.js'],  // JavaScriptライブラリ
    css: ['css/style.css']                      // CSSファイル
    
    // 動的読み込みの場合（simple_barの例）
    script: [
        function(callbackArg) {
            return callbackArg.properties.external_library;
        }
    ]
}
```

### 5.3 モジュール設定パターン
```javascript
modules: {
    dataSelection: {
        supported: true,                    // データ選択機能
        needSVGEventPanel: false,          // SVGイベントパネルの必要性
        svgNode: function() {}             // SVGノード取得関数
    },
    tooltip: {
        supported: true,                   // ツールチップ機能
        autoContent: function(target, s, g, d) {
            return d.labels + ': ' + d.value;  // 自動ツールチップ内容
        }
    },
    eventHandler: {
        supported: true                    // イベントハンドラー機能
    }
}
```

## 6. 複雑性レベル別の実装パターン

### 6.1 シンプル（card_simple）
- 基本的なDOM操作のみ
- 1つのデータバケット
- CSSによるスタイリング

### 6.2 中級（table_ver1）
- 複数データバケット対応
- 配列正規化処理
- ヘルパー関数の使用

### 6.3 高級（table_ver2）
- 複雑なデータ集計ロジック
- Excel出力機能
- 高度なテーブル操作

## 7. エラーハンドリングパターン
```javascript
try {
    // メインロジック
} catch (error) {
    console.error('Error in renderCallback:', error);
    // フォールバック処理
} finally {
    renderConfig.renderComplete(); // 必須：常に呼び出し
}
```