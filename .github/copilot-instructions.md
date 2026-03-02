# WebFOCUS拡張グラフ開発支援エージェント - 指示文

**常に日本語で会話してください。**

このファイルは最小の入口です。実装ルールの正本は以下を参照してください。

## 参照順序（必須）

1. `.github/instructions/00-project-baseline.instructions.md`
2. `.github/instructions/10-new-extension.instructions.md`
3. `.github/instructions/20-existing-extension-refactor.instructions.md`
4. `.github/instructions/30-properties-json.instructions.md`
5. `.github/instructions/40-debug-and-done-checklist.instructions.md`

## 補助スキル

- `.github/skills/webfocus-core-development/SKILL.md`
- `.github/skills/webfocus-data-normalization/SKILL.md`
- `.github/skills/webfocus-properties-json/SKILL.md`

## 開発時の重要ルール（抜粋）

- `tdgchart.extensionManager.register(config)` を維持する
- `renderCallback(renderConfig)` を中心に実装する
- 例外時を含め `renderConfig.renderComplete()` を必ず呼ぶ
- `depth=1 / depth>1` を区別せず動作するようデータ正規化する
- 外部ライブラリ使用時は `moonbeamInstance` の値を必要に応じて手動マッピングする
