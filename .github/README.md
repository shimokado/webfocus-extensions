# AI開発運用ドキュメント（.github）

このディレクトリは、WebFOCUS拡張グラフ開発で AI エージェントが参照する**正本**をまとめたものです。

## 目的

- 新規拡張グラフ作成と既存改修の手順を標準化する
- Serena MCP 廃止後も知見を失わないようにナレッジを移管する
- 重複した長文ガイドを分離し、保守しやすくする

## 構成

- `instructions/`
  - エージェントが守る実装ルール
- `skills/`
  - 実務タスク単位で再利用する知識テンプレート
- `agents/`
  - プロジェクト専用の作業エージェント定義

## 現在の推奨エントリ

- Agent: `agents/webfocus-extension-dev-agent.md`
- Instructions:
  - `instructions/00-project-baseline.instructions.md`
  - `instructions/10-new-extension.instructions.md`
  - `instructions/20-existing-extension-refactor.instructions.md`
  - `instructions/30-properties-json.instructions.md`
  - `instructions/40-debug-and-done-checklist.instructions.md`
- Skills:
  - `skills/webfocus-core-development/SKILL.md`
  - `skills/webfocus-data-normalization/SKILL.md`
  - `skills/webfocus-properties-json/SKILL.md`

## 補足

Serena 由来ナレッジの移管内容は `docs/serena-knowledge-transfer.md` を参照してください。