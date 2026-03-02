# Skill: WebFOCUS Core Development

## 使う場面

- 新規拡張グラフ作成
- 既存拡張の軽微〜中規模改修
- `renderCallback` 中心の描画不具合調査

## 実行手順

1. 対象拡張の `properties.json` と `test.html` を確認
2. `renderCallback` の入力（`renderConfig`）を確認
3. データ正規化を先に実装
4. DOM描画とスタイル適用を分離して実装
5. 成否に関わらず `renderComplete` を呼ぶ

## 重要API

- `tdgchart.extensionManager.register(config)`
- `renderConfig.moonbeamInstance`
- `renderConfig.dataBuckets`
- `renderConfig.modules`
- `renderConfig.renderComplete()`

## 失敗しやすいポイント

- `labels` / `value` が単一時に文字列・数値で渡る点を見落とす
- 外部ライブラリに moonbeam の色・ラベル設定が自動反映されると誤解する
- no-data 時に `renderComplete` を呼ばず描画待ち状態にする