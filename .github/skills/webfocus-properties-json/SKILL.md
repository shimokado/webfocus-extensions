# Skill: properties.json Design

## 使う場面

- バケット定義の見直し
- 新規拡張の設定作成
- 翻訳キー不足・型不一致の修正

## チェック順序

1. `info`（version, author, icons）
2. `dataBuckets`（id/type/count）
3. `properties` と `propertyAnnotations` の整合
4. `translations`（ja/en の最低限）

## 設計原則

- バケット `id` は実装コードと1対1で対応させる
- min/max は運用上必要な範囲に限定する
- 将来拡張しないキーは増やしすぎない

## よくある不整合

- `properties` に追加したキーを `propertyAnnotations` へ未反映
- `translations` に追加した表示名の欠落
- `dataBuckets` の `count` 制約と実装ロジックの不一致