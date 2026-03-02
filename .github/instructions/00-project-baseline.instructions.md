---
applyTo: '**'
---

# プロジェクト共通ベースライン

## 言語・スタイル

- 日本語で回答する
- JavaScript は ES5 を優先し、既存コードスタイルに合わせる
- 最小変更で実装し、不要なリネームや構造変更を避ける

## WebFOCUS拡張の必須事項

- `tdgchart.extensionManager.register(config)` による登録を維持する
- `renderCallback(renderConfig)` を中心に処理を実装する
- 例外発生時を含め `renderConfig.renderComplete()` を必ず呼ぶ
- 外部ライブラリ利用時は `moonbeamInstance` の値を必要に応じて手動マッピングする

## 参照優先順位

1. `development_guide/06_Troubleshooting_DataDepth.md`
2. `development_guide/02_API_Reference.md`
3. `development_guide/03_Development_Guide.md`
4. `tutorial/` 配下の実例

## 禁止・注意

- 深いデータ構造差異（depth=1 / depth>1）を無視しない
- 文字列/配列の揺れを前提にしない実装を行わない
- 既存の翻訳キー・データバケットIDを互換性なしで変更しない