# 開発ツールリファレンス

このドキュメントは、`package.json` と `tool/` 配下スクリプトの実態に合わせた運用手順をまとめた正本です。

## NPMスクリプト

`package.json` で利用できるコマンドは次の3つです。

- `npm run create-extension`
  - 実行先: `node tool/create-extension.js`
  - 内容: 新規拡張を対話形式で生成
- `npm run test -- <extension_id>`
  - 実行先: `node tool/test-extension.js`
  - 内容: `com.shimokado.<extension_id>/test.html` を既定ブラウザで開く
- `npm run deploy -- <extension_id>`
  - 実行先: `node tool/deploy-extension.js`
  - 内容: `com.shimokado.<extension_id>` を WebFOCUS の extensions フォルダへコピー

## create-extension.js

入力:

1. 会社名（`[a-z0-9_]+`）
2. 拡張ID（`[a-z0-9_]+`）
3. コンテナ種別（`1:d3`, `2:chart.js`, `3:html`, `4:apexcharts`）

動作:

- テンプレート（`com.shimokado.*_sample`）を複製
- JSファイル名を `com.<company>.<extension>.js` に変更
- JS / `test.html` / `properties.json` 内のテンプレートIDを新IDへ置換

## deploy-extension.js

- 引数: `<extension_id>`（`com.shimokado.` は自動付与）
- 既定デプロイ先: `C:\ibi\WebFOCUS93\config\web_resource\extensions`
- 環境変数 `WEBFOCUS_EXTENSIONS_DIR` でデプロイ先を上書き可能
- Windows のみ、任意で Tomcat サービス再起動（既定: `Tomcat9WF`）
- 環境変数 `WEBFOCUS_TOMCAT_SERVICE` でサービス名を上書き可能

## test-extension.js

- 引数: `<extension_id>`
- 対象: `<repo_root>\com.shimokado.<extension_id>\test.html`
- 起動: OSごとの既定アプリで開く（Windows/macOS/Linux）
- 注意: 対象拡張に `test.html` が無い場合はエラー終了する

## 運用上の注意

- `deploy` / `test` は引数必須
- `deploy` 先パス・Tomcatサービス名は環境差分があるため必要に応じて編集
- 拡張IDはフォルダ名と一致させる