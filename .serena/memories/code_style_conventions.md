# WebFOCUS拡張グラフのコードスタイルと規約

## ネーミング規約

### 拡張機能ID
- フォーマット: `com.shimokado.機能名`
- 例: `com.shimokado.simple_bar`, `com.shimokado.card_dashboard`
- すべて小文字、アンダースコアを使用

### ファイル命名
- メインJavaScriptファイル: `com.shimokado.機能名.js`
- プロパティファイル: `properties.json`
- テストファイル: `test.html`
- ライセンスファイル: `license.txt`

### JavaScript変数・関数命名
- キャメルケースを使用: `renderCallback`, `initCallback`
- 省略形を避ける: `config`, `container`（containerの短縮は可）
- 定数は大文字: 使用されていない

## JavaScript規約

### コールバック関数の実装パターン
```javascript
// 必須: 即座に実行される無名関数でラップ
(function() {
    
    // オプション: 初期化コールバック
    function initCallback(successCallback, initConfig) {
        successCallback(true);
    }
    
    // オプション: データなし前処理
    function noDataPreRenderCallback(preRenderConfig) {
        // 凡例の非表示など
    }
    
    // オプション: データなし描画
    function noDataRenderCallback(renderConfig) {
        // デフォルトデータを設定してrenderCallbackを呼び出す
    }
    
    // オプション: 前処理コールバック
    function preRenderCallback(preRenderConfig) {
        // クリーンアップや設定の初期化
    }
    
    // 必須: メイン描画コールバック
    function renderCallback(renderConfig) {
        // 実際の描画処理
        renderConfig.renderComplete(); // 必須
    }
    
    // 設定オブジェクト
    var config = {
        id: 'com.shimokado.extension_name',
        containerType: 'svg' | 'html',
        // コールバック関数の登録
        // リソースとモジュールの設定
    };
    
    // 必須: 拡張機能の登録
    tdgchart.extensionManager.register(config);
})();
```

## データ処理の標準パターン

### データの正規化
```javascript
// series_breakがない場合の2次元配列化
if (renderConfig.dataBuckets.depth === 1) {
    data = [data];
}

// タイトルの配列化
if (!Array.isArray(buckets.value.title)) {
    buckets.value.title = [buckets.value.title];
}
```

### バケット情報の安全な取得
```javascript
const labels = buckets.labels ? buckets.labels : null;
const values = buckets.value ? buckets.value : null;
```

## コメント規約

### ファイルヘッダー
```javascript
/* Copyright (C) 2025. Shimokado Masataka. All rights reserved. */
```

### 関数コメント
- 各コールバック関数の目的を日本語で記述
- パラメータの説明を含める
- 重要な処理ステップをコメント

### JSDoc形式の使用
```javascript
/**
 * チャートエンジンの初期化時に1回だけ呼び出されます（オプション）
 * @param {Function} successCallback - 成功時に呼び出すコールバック
 * @param {Object} initConfig - 初期設定オブジェクト
 */
```

## エラーハンドリング

### 必須パターン
- `renderConfig.renderComplete()` は必ず呼び出す
- データバリデーションを実装
- try-catch でエラーを捕捉
- エラー時のフォールバック処理を提供

## ファイル組織

### 標準ディレクトリ構造
```
com.shimokado.extension_name/
├── com.shimokado.extension_name.js
├── properties.json
├── test.html
├── README.md
├── license.txt
├── icons/
│   └── medium.png
├── css/
│   └── style.css
└── lib/
    └── external_library.js
```