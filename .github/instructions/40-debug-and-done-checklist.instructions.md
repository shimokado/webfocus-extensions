---
applyTo: '**'
---

# デバッグ・完了チェックリスト

## デバッグ

- `renderConfig` の shape をログ確認する
- `dataBuckets.depth` と `data` の構造を照合する
- `labels` / `value` を常に配列として扱える状態に正規化する
- 外部ライブラリの描画エラーを分離して確認する

## 完了条件

- `renderConfig.renderComplete()` が必ず到達する
- no-data ケースの表示またはフォールバックがある
- `test.html` で最低1ケース以上、実描画を確認
- 変更点が README または関連ドキュメントに反映されている

## リリース前

- `html5chart_extensions.json` で有効化設定を確認
- WebFOCUS環境に配置後、キャッシュクリアと再起動手順を確認