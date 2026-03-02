---
applyTo: '**'
---

# 新規拡張グラフ作成手順

## 実装フロー

1. `npm run create-extension` で雛形を作成
2. `properties.json` の `info` / `dataBuckets` / `translations` を整備
3. `com.{company}.{extension}.js` の `renderCallback` を実装
4. `test.html` で depth=1 と depth>1 の両方を検証
5. `README.md` に制約・使い方・依存ライブラリを記載

## 必須チェック

- `containerType` が実装内容（svg/html）と一致
- dataBuckets と描画ロジックの整合性がある
- no-data 時の動作が定義されている
- 外部ライブラリ読込（`resources.script/css`）が正しい

## 最低限の品質基準

- 単一・複数フィールド双方でクラッシュしない
- 値フォーマットは `moonbeamInstance.formatNumber` を活用
- エラー時も画面がハングしない（`renderComplete` 到達）