# 拡張機能JavaScript共通仕様

## initCallbackについて
`initCallback`は、拡張機能の初期化時に呼び出される関数です。
- 引数：
  - `successCallback`: 初期化の成功/失敗を通知するためのコールバック関数
  - `initConfig`: 初期化時の設定オブジェクト
- 処理：初期化が成功した場合は、`successCallback(true)`を呼び出します

## noDataPreRenderCallbackの用途と記述すべき処理
`noDataPreRenderCallback`は、データがない場合のレンダリング前に呼び出される関数です。
- 引数：`preRenderConfig`オブジェクト
  - `moonbeamInstance`: チャートインスタンス
  - `container`: レンダリング対象のDOM要素
- 処理：
  - 凡例の表示/非表示の設定
  - レンダリング前の初期化処理
  - 特別な表示設定の適用

## noDataRenderCallbackの用途と記述すべき処理
`noDataRenderCallback`は、データがない場合のレンダリング時に呼び出される関数です。
- 引数：`renderConfig`オブジェクト
  - `moonbeamInstance`: チャートインスタンス
  - `properties`: チャートのプロパティ設定
  - `container`: レンダリング対象のDOM要素
- 処理：
  - デフォルトデータの設定
  - "データがありません"などのメッセージの表示
  - 必要に応じてプレースホルダーの表示

## preRenderCallbackの用途と記述すべき処理
`preRenderCallback`は、レンダリング前に呼び出される関数です。
- 引数：`preRenderConfig`オブジェクト
  - `moonbeamInstance`: チャートインスタンス
  - `container`: レンダリング対象のDOM要素
- 処理：
  - 前回のレンダリング結果のクリーンアップ
  - チャート設定の初期化
  - レンダリング前の表示設定の適用

## renderCallbackの用途と記述すべき処理
`renderCallback`は、実際のチャートレンダリング時に呼び出される関数です。
- 引数：`renderConfig`オブジェクト
  - `moonbeamInstance`: チャートインスタンス
  - `data`: 描画するデータ
  - `properties`: チャートのプロパティ設定
  - `container`: レンダリング対象のDOM要素
  - `width`: レンダリング領域の幅
  - `height`: レンダリング領域の高さ
- 処理：
  - データの変換と加工
  - チャート要素の描画
  - イベントハンドラの設定
  - ツールチップの設定
  - レンダリング完了通知

### 重要な注意点：

1. レンダリング完了通知
- `renderConfig.renderComplete()`は必ず呼び出す必要がある
- アニメーションを使用する場合は、すべてのアニメーションが完了した後に呼び出す
- エラー発生時やデータが無い場合も、必ず呼び出す
```javascript
// アニメーション完了時の通知例
let animationCount = 0;
const totalAnimations = expectedAnimations;
const checkComplete = () => {
    animationCount++;
    if (animationCount >= totalAnimations) {
        renderConfig.renderComplete();
    }
};
```

2. データのバリデーションと正規化
- 入力データの存在チェック
- データ構造の妥当性チェック
- 必要なプロパティの存在確認
- データの型変換と正規化
```javascript
// データバリデーション例
if (!Array.isArray(data) || data.length === 0) {
    noDataRenderCallback(renderConfig);
    renderConfig.renderComplete();
    return;
}

// データ構造チェック例
const isValidData = data.every(d => 
    d && typeof d.value === 'number' && !isNaN(d.value)
);
```

3. エラーハンドリング
- 必須パラメータの存在チェック
- try-catchによるエラー捕捉
- エラー発生時の適切なフォールバック処理
- エラーログの出力
```javascript
try {
    // レンダリング処理
} catch (err) {
    console.error('Error rendering chart:', err);
    noDataRenderCallback(renderConfig);
    renderConfig.renderComplete();
}
```

### configオブジェクト
`config`オブジェクトは、拡張機能の設定を定義するオブジェクトです。
- 必須プロパティ：
  - `id`: 拡張機能の一意識別子
  - `containerType`: レンダリングコンテナのタイプ（'svg'または'html'）
  - `initCallback`: 初期化関数
  - `renderCallback`: レンダリング関数
- オプショナルプロパティ：
  - `preRenderCallback`: レンダリング前処理関数
  - `noDataRenderCallback`: データなし時のレンダリング関数
  - `noDataPreRenderCallback`: データなし時のレンダリング前処理関数
  - `resources`: 必要な外部リソース（CSS/JavaScript）
  - `modules`: サポートする機能モジュール（ツールチップ、イベントハンドラなど）

### tdgchart.extensionManager.register(config)
- 用途：拡張機能をMoonbeamシステムに登録する
- 引数：configオブジェクト
- 処理：拡張機能の初期化と登録