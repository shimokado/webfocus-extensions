# WebFOCUS拡張グラフ開発ガイド - 概要

## 1. WebFOCUS拡張グラフとは

WebFOCUS拡張グラフ（Extension Chart）は、WebFOCUSの標準グラフ機能では実現できない独自の可視化表現を追加するための仕組みです。JavaScript、CSS、HTML5の技術を使用して、D3.js、Chart.js、ApexChartsなどのサードパーティ製ライブラリを利用したカスタムチャートを作成し、WebFOCUSのレポートやダッシュボードに統合することができます。

## 2. 開発ガイド構成

本開発ガイドは、WebFOCUS拡張グラフの開発を支援するための体系的なドキュメントセットです。

| ファイル | 内容 |
|---------|------|
| [00_Overview.md](00_Overview.md) | プロジェクト概要、ワークフロー、アーキテクチャ |
| [01_Specification.md](01_Specification.md) | ファイル構成、命名規則、必須要件 |
| [02_API_Reference.md](02_API_Reference.md) | tdgchart API、拡張登録メカニズム |
| [03_Development_Guide.md](03_Development_Guide.md) | 実装パターン、ベストプラクティス |
| [04_Tutorials.md](04_Tutorials.md) | 具体的な実装例、ステップバイステップ |
| [05_Official_Manuals_JP.md](05_Official_Manuals_JP.md) | 公式ドキュメントへのリンク |
| [06_Troubleshooting_DataDepth.md](06_Troubleshooting_DataDepth.md) | **🚨 データ構造の問題解決ガイド（新規開発時は必須読書）** |
| [07_RenderConfig_Samples.md](07_RenderConfig_Samples.md) | WebFOCUS出力の実際のデータ構造サンプル |

## 3. プロジェクト構成

本プロジェクトは、WebFOCUS拡張グラフを開発・管理するための環境です。

```
root/
├── com.shimokado.xxx/       # 各拡張グラフのディレクトリ
│   ├── com.shimokado.xxx.js # メインJavaScriptファイル
│   ├── properties.json      # 設定ファイル
│   ├── css/                 # スタイルシート
│   ├── lib/                 # 外部ライブラリ
│   └── icons/               # アイコン画像
├── doc/                     # 既存ドキュメント
├── tool/                    # 開発用ツール（スクリプト）
├── development_guide/       # 本開発ガイド
└── package.json             # NPM設定
```

## 3. 開発ワークフロー

拡張グラフの開発は以下の手順で行います。

### 3.1 新規拡張グラフの作成

`npm run create-extension` コマンドを使用して、テンプレートから新しい拡張グラフを作成します。

```bash
npm run create-extension
```

このコマンドを実行すると、拡張グラフID（フォルダ名）の入力を求められ、基本的なファイルセットが生成されます。

### 3.2 設定ファイル (properties.json) の編集

`properties.json` を編集して、拡張グラフのメタデータ（名前、説明、バージョンなど）やデータバケット（データ割り当ての定義）を設定します。

### 3.3 メインロジックの実装

`com.shimokado.xxx.js` ファイル内の `renderCallback` 関数を中心に、描画ロジックを実装します。

### 3.4 ローカルでの動作確認

`test.html` （各拡張グラフフォルダ内に生成される場合や、別途用意する場合あり）を使用して、WebFOCUSサーバーにデプロイする前にローカル環境で動作確認を行います。

### 3.5 WebFOCUSへのデプロイ

開発が完了したら、WebFOCUS環境の所定のディレクトリ（`extensions` フォルダ）に拡張グラフフォルダごと配置します。
WebFOCUSの管理コンソールでキャッシュをクリアすることで、新しい拡張グラフが認識されます。

## 4. アーキテクチャの概要

WebFOCUSのチャートエンジン（Moonbeam）は、拡張グラフを以下の仕組みでロード・実行します。

1. **登録**: 拡張グラフのJSファイルが読み込まれ、`tdgchart.extensionManager.register(config)` が呼び出されることで、チャートエンジンに拡張グラフが登録されます。
2. **初期化**: 必要に応じて `initCallback` が呼び出されます。
3. **データ準備**: WebFOCUSがデータを取得し、`renderConfig` オブジェクトを構築します。
4. **描画**: チャートエンジンが `renderCallback(renderConfig)` を呼び出し、拡張グラフが描画処理を実行します。

開発者は主に `renderCallback` 内で、渡されたデータ (`renderConfig.data`) を使用して、指定されたコンテナ (`renderConfig.container`) にDOM要素を追加・操作することでグラフを描画します。
