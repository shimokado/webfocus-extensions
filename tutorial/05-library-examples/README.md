# 第5章：ライブラリ活用例

この章では、一般的なJavaScriptライブラリを使用した拡張グラフの実装例を紹介します。

## コンテンツ

1. **[Chart.js](01-chartjs.md)**: Canvasベースの標準的なチャート
2. **[D3.js (Treemap)](02-d3-treemap.md)**: 高度なSVGデータビジュアライゼーション
3. **[ApexCharts](03-apexcharts.md)**: モダンでインタラクティブなSVGチャート
4. **[HTML Table](04-html-table.md)**: シンプルなDOM操作によるテーブル表示

## 共通のポイント

すべてのライブラリ実装において、以下の点が共通して重要です：

- **データ正規化**: ライブラリにデータを渡す前に、必ずWebFOCUSの可変データを正規化する。
- **コンテナサイズ**: `renderConfig.width` と `renderConfig.height` を使用して、コンテナサイズに合わせる。
- **完了通知**: 描画完了後に必ず `renderConfig.renderComplete()` を呼び出す。
