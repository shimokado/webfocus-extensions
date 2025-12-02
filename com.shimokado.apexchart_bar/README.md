# WebFOCUS ApexCharts バーグラフ拡張機能

ApexCharts を使用してバーグラフを表示する拡張機能です。

## 主な機能

- **ApexCharts バーグラフ**: ApexCharts ライブラリを使用した高品質なバーグラフ表示
- **カスタマイズ可能なフォント設定**:
  - X軸/Y軸ラベルのフォントファミリー、サイズ、色、太さ
  - データラベルと凡例のフォント設定
- **インタラクティブな要素**:
  - ツールチップ機能搭載
  - データ選択機能
- **レスポンシブデザイン**: 表示領域に応じた自動調整

## データ要件

この拡張機能では以下のデータバケットを使用できます：

- **値** (メジャー): 表示する数値データ
  - 最小: 1
  - 最大: 1
- **ラベル** (ディメンション): X軸のカテゴリー
  - 最小: 1
  - 最大: 1

## スタイル設定

- **ラベルテキスト (X軸/Y軸)**:
  - フォントファミリー: プロパティ `label.text.font` で設定
  - サイズ: プロパティ `label.text.size` で設定 (px)
  - 色: プロパティ `label.text.color` で設定
  - 太さ: プロパティ `label.text.weight` で設定
- **値ラベル (データラベル/凡例)**:
  - フォントファミリー: プロパティ `valueLabel.fontFamily` で設定
  - サイズ: プロパティ `valueLabel.fontSize` で設定 (px, 'auto' で自動)
  - 色: プロパティ `valueLabel.color` で設定
  - 太さ: プロパティ `valueLabel.fontWeight` で設定

## ファイルの説明

### com.shimokado.apexchart_bar.js

グラフモジュールの本体

### properties.json

設定ファイル

### icons/icon.png

グラフ選択で表示されるアイコン

### lib/apexcharts.js

ApexCharts ライブラリ

### css/style.css

スタイルシート

### test.html（テスト用ファイル、デプロイ不要）

ローカルでモジュールをテストするためのHTMLファイル。WebFOCUSにデプロイする必要はない。

### tdgchart-min-for-test.js（テスト用ファイル、デプロイ不要）

ローカルでモジュールをテストするためにtdgchart-min.jsを加工したjsファイル。WebFOCUSにデプロイする必要はない。
