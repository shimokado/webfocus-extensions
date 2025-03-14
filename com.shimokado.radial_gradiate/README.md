# WebFOCUS パラメータ表示拡張機能

複数の指標やパラメータを柔軟に表示できるダッシュボード型の拡張機能です。

## 主な機能

- **フレキシブルな指標表示**: 最大5つの値を同時表示可能
- **カスタマイズ可能なテキスト表示**: フォントファミリー、サイズ、色、太さを調整可能
- **マーカーによる視覚化**: サークル型マーカーでデータを強調
- **インタラクティブな要素**: 
  - ツールチップ機能搭載
  - センターテキスト表示オプション
- **レスポンシブデザイン**: 表示領域に応じた自動調整

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

### com.shimokado.chartjs_sample.js
グラフモジュールの本体

### properties.json
設定ファイル

### icons/icon.png
グラフ選択で表示されるアイコン

### lib/chart.js
chart.jsライブラリ

### css/style.css
`external_library`で読み込まれるCSS

### test.html（テスト用ファイル、デプロイ不要）
ローカルでモジュールをテストするためのHTMLファイル。WebFOCUSにデプロイする必要はない。

### tdgchart-min-for-test.js（テスト用ファイル、デプロイ不要）
ローカルでモジュールをテストするためにtdgchart-min.jsを加工したjsファイル。WebFOCUSにデプロイする必要はない。
