# WebFOCUS シンプルHTMLサンプル拡張機能

拡張グラフ開発でWebFOCUSが生成するrenderConfigのプロパティを確認し、testで利用する値を生成するためのサンプル拡張機能です。

## 主な機能

- **renderConfig可視化**: WebFOCUSが生成するrenderConfigのプロパティを表示
- **テストデータ生成**: test.htmlで利用する値を生成
- **フレキシブルなデータバケット**: 最大5つの値、ラベル、詳細をサポート
- **カスタマイズ可能なスタイル**: 
  - フォントファミリー、サイズ、色、太さを調整可能
  - マーカーによる視覚化
- **インタラクティブな要素**: 
  - ツールチップ機能搭載
  - センターテキスト表示オプション

## データ要件

この拡張機能では以下の3種類のデータバケットを使用できます：
- **値** (メジャー): 表示する数値データ
  - 最小: 0
  - 最大: 5
- **ラベル** (ディメンション): データのカテゴリー
  - 最小: 0
  - 最大: 5
- **詳細** (メジャー/ディメンション): 追加情報
  - 最小: 0
  - 最大: 5

## スタイル設定

- **テーブルスタイル**: 
  - フォントサイズ: 20px
  - テキストカラー: #663300
- **値ラベル**: 
  - フォント: sans-serif
  - サイズ: 自動調整
  - 色: #333333
  - 太さ: bold
- **ラベルテキスト**:
  - フォント: Verdana
  - サイズ: 14px
  - 色: #333333
  - 太さ: bold

## ファイルの説明

### com.shimokado.html_sample.js
グラフモジュールの本体

### properties.json
設定ファイル

### icons/icon.png
グラフ選択で表示されるアイコン

### lib/script.js
`tdgchart.extensionManager.register(config);`の`config.resources.script`で読み込まれるスクリプト

### css/style.css
`tdgchart.extensionManager.register(config);`の`config.resources.css`で読み込まれるCSS

### test.html（テスト用ファイル、デプロイ不要）
ローカルでモジュールをテストするためのHTMLファイル。WebFOCUSにデプロイする必要はない。
