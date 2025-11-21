# WebFOCUS拡張グラフAPI仕様

## 主要APIオブジェクト

### renderConfig オブジェクト
- `moonbeamInstance`: チャートエンジンインスタンス
- `data`: レンダリング対象のデータ配列
- `properties`: 拡張機能のプロパティ設定
- `container`: レンダリング先のDOMノード
- `width`, `height`: レンダリング領域のサイズ（px）
- `dataBuckets`: データバケット情報
- `modules`: 拡張機能の各種モジュール
- `renderComplete()`: レンダリング完了通知（必須呼び出し）

### dataBuckets 構造
```javascript
{
  depth: number,          // データ配列の次元数
  buckets: {
    labels: { title, fieldName },
    value: { title, fieldName, numberFormat },
    detail: { title, fieldName }
  }
}
```

### moonbeamInstance の主要メソッド
- `getSeries(index)`: シリーズ情報取得
- `formatNumber(value, format)`: 数値フォーマット
- `getSeriesAndGroupProperty(seriesID, groupID, property)`: プロパティ取得
- `buildClassName(type, seriesID, groupID, extra)`: CSSクラス名生成

## 設定オブジェクト（config）

### 必須プロパティ
- `id`: 拡張機能の一意識別子
- `renderCallback`: メイン描画関数

### オプションプロパティ
- `containerType`: 'svg' | 'html'
- `initCallback`: 初期化コールバック
- `preRenderCallback`: 前処理コールバック
- `noDataPreRenderCallback`: データなし前処理
- `noDataRenderCallback`: データなし描画
- `resources`: 外部リソース定義

### modules設定
```javascript
modules: {
  dataSelection: {
    supported: true,
    needSVGEventPanel: false,
    svgNode: function() {}
  },
  tooltip: {
    supported: true,
    autoContent: function(target, s, g, d) {}
  },
  eventHandler: {
    supported: true
  }
}
```

## データ処理パターン

### データ正規化
```javascript
// series_break対応
if (renderConfig.dataBuckets.depth === 1) {
  data = [data];
}

// タイトル配列化
if (!Array.isArray(buckets.value.title)) {
  buckets.value.title = [buckets.value.title];
}
```

### バケット配列統一パターン
```javascript
const labelsTitles = buckets.labels ? 
  (Array.isArray(buckets.labels.title) ? buckets.labels.title : [buckets.labels.title]) : [];

const datas = data.map(d => ({
  labels: d.labels !== undefined ? 
    (Array.isArray(d.labels) ? d.labels : [d.labels]) : [],
  value: d.value !== undefined ? 
    (Array.isArray(d.value) ? d.value : [d.value]) : []
}));
```

## コールバック関数仕様

### renderCallback（必須）
```javascript
function renderCallback(renderConfig) {
  // データ処理
  // DOM操作
  // イベント設定
  renderConfig.renderComplete(); // 必須
}
```

### initCallback（オプション）
```javascript
function initCallback(successCallback, initConfig) {
  // 初期化処理
  successCallback(true); // 成功時
}
```

## エラーハンドリング標準
- try-catch でエラー捕捉
- データバリデーション実装
- エラー時も `renderConfig.renderComplete()` 呼び出し
- フォールバック処理の提供

## デバッグ支援
- `console.log()` でのデバッグ出力
- `com.shimokado.params` 拡張機能でパラメータ確認
- `test.html` でのローカルテスト環境