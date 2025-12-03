# WebFOCUS公式マニュアル要約 (日本語)

## 1. 拡張グラフの作成 (Creating a WebFOCUS Extension)

WebFOCUS拡張グラフは、独自の可視化ロジックをWebFOCUSに統合するためのAPIです。

- **ディレクトリ構造**: 拡張グラフは特定のディレクトリ構造（`com.company.chart` など）を持つ必要があります。
- **必須ファイル**: メインJSファイルと `properties.json` が必須です。
- **登録**: `tdgchart.extensionManager.register()` を使用して登録します。

## 2. プロパティ設定 (Editing Extension Configuration)

`properties.json` で拡張グラフの振る舞いを制御します。

- **info**: 拡張グラフのメタデータ。
- **properties**: ユーザーが変更可能な設定値（色、フォントサイズなど）。
- **propertyAnnotations**: プロパティの型情報。WebFOCUSのGUIで適切な入力コントロールを表示するために使用されます。
- **translations**: 多言語対応。

## 3. データインターフェース (Editing Extension Data Interface)

WebFOCUSから拡張グラフへのデータの渡し方を定義します。

- **Data Buckets**: データの「受け皿」を定義します。
  - `buckets`: バケットの配列。
  - `id`: バケットのID（プログラムから参照）。
  - `type`: `measure`（数値）または `dimension`（属性）。
  - `count`: 受け入れるフィールドの数（min/max）。

## 4. ライフサイクルメソッド

拡張グラフは以下のコールバックを通じて制御されます。

- **initCallback**: 初期化時（1回のみ）。
- **preRenderCallback**: 描画前。
- **renderCallback**: 描画時（メイン）。
- **noDataRenderCallback**: データがない場合の描画。

## 5. ベストプラクティス

- **名前空間**: グローバルスコープを汚染しないよう、即時関数 `(function(){ ... })();` で囲むこと。
- **レスポンシブ**: `renderConfig.width` と `renderConfig.height` を使用して、コンテナサイズに合わせて描画すること。
- **エラー処理**: 予期せぬデータやエラーに対して適切に処理し、必要に応じてエラーメッセージを表示すること。
