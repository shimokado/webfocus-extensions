# 削除前チェックリスト（Serena・重複ドキュメント）

このチェックリストは、不要ファイル削除を安全に行うための事前確認用です。

## 実施結果（2026-03-02）

- [x] `.vscode/mcp.json` の Serena 設定を削除
- [x] `.serena/` ディレクトリを削除
- [x] 重複していた `.github/agents/development-helper-agent.md` を削除
- [x] `.github/copilot-instructions.md` を正本参照型に簡素化

## 1. Serena廃止準備

- [ ] `.github/README.md` に新運用導線がある
- [ ] `.github/instructions` が作成済み
- [ ] `.github/skills` が作成済み
- [ ] `docs/serena-knowledge-transfer.md` に移管マップがある

## 2. 参照切れ確認

- [ ] `README.md` から新導線を参照できる
- [ ] 既存運用で `.serena/memories` を直接参照していない
- [ ] `.vscode/mcp.json` の Serena 設定停止方針が確定している

## 3. 重複ドキュメント候補

- [ ] `.github/copy` 的な重複長文（同内容の instructions / agent）を整理対象として特定
- [ ] 内容が `development_guide` と重複するものを一覧化
- [ ] 正本（source of truth）を `.github/instructions` と `development_guide` に確定

## 4. 削除実施前の最終確認

- [ ] 削除対象のバックアップまたは git 履歴保全がある
- [ ] 開発者が新導線で作業できることをレビュー済み
- [ ] 削除後に README / docs の参照リンクが有効