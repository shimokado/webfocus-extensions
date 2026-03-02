# Serena知見移管ドキュメント

## 目的

Serena MCP 廃止前に、`.serena/memories` の有用情報を `.github/instructions` と `.github/skills` に移管し、開発知見を維持する。

## 移管元と移管先

| 移管元（.serena/memories） | 主な内容 | 移管先 |
|---|---|---|
| `code_patterns_analysis.md` | コールバック実装パターン | `.github/skills/webfocus-core-development/SKILL.md` |
| `api_specifications.md` | `renderConfig` / API要点 | `.github/skills/webfocus-core-development/SKILL.md` |
| `properties_json_patterns.md` | `properties.json` 設計規約 | `.github/skills/webfocus-properties-json/SKILL.md` |
| `task_completion_checklist.md` | 完了条件・確認観点 | `.github/instructions/40-debug-and-done-checklist.instructions.md` |
| `suggested_commands.md` | 開発運用コマンド | `.github/instructions/10-new-extension.instructions.md`（作業フロー） |
| `tutorial_quick_guide.md` | 初学者向け学習導線 | `development_guide/` と `tutorial/` 参照を維持 |

## Serena廃止後の参照順序

1. `.github/README.md`
2. `.github/instructions/*.instructions.md`
3. `.github/skills/*/SKILL.md`
4. `development_guide/*.md`

## 注意

- Serena専用手順（メモリ読み書きなど）は運用対象外とする
- ただし実装ノウハウは上記移管先に保存済みのため、情報欠損は発生しない