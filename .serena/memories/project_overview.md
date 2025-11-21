# WebFOCUS拡張グラフプロジェクト概要

## プロジェクトの目的
WebFOCUSで利用できるHTML5拡張グラフ（カスタムチャート）の開発プラットフォーム。各種チャートタイプの拡張機能を作成、テスト、デプロイできる。

## テックスタック
- **JavaScript**: 拡張グラフのメイン開発言語
- **HTML5/CSS**: UIとスタイリング
- **Node.js**: 開発ツール（拡張機能の作成・デプロイ）
- **D3.js**: 一部の拡張グラフで使用される可視化ライブラリ
- **WebFOCUS Extension API**: チャートエンジン連携

## プロジェクト構造
- `com.shimokado.*`: 個別の拡張グラフモジュール（15+個）
- `doc/`: 開発ガイドやAPI仕様書
- `tool/`: 開発支援スクリプト（create、deploy、test）
- `html5chart_extensions.json`: 拡張機能の有効化設定
- `package.json`: NPMスクリプト定義

## 主要なコンポーネント
1. **JavaScript実装ファイル** (`com.shimokado.*.js`)
2. **プロパティ設定** (`properties.json`)
3. **テストHTML** (`test.html`)
4. **アイコン・CSS・ライブラリ** (`icons/`, `css/`, `lib/`)

## 拡張グラフの種類
- simple_bar: シンプルな棒グラフ
- table_*: テーブル表示（複数バージョン）
- card_*: カード形式のダッシュボード
- zoomable_sunburst: インタラクティブなサンバーストチャート
- params: デバッグ用パラメータ表示
- その他多数のチャートタイプ