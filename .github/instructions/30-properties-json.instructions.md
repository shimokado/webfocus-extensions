---
applyTo: '**/properties.json'
---

# properties.json 実装ルール

## 基本構造

- `info`
- `properties`
- `propertyAnnotations`
- `dataBuckets`
- `translations`

## データバケット設計

- `id` は描画コードと一致させる（例: `labels`, `value`, `detail`）
- `count.min/max` は UI 仕様に合わせて最小限で定義
- `type` は `measure` / `dimension` / `both` を適切に使い分ける

## 翻訳

- 少なくとも `ja` と `en` を提供する
- `name`, `description`, `icon_tooltip` と各バケット表示名を定義する

## 変更時の互換性

- 既存キー名は互換性なしで変更しない
- 値型（文字列/真偽/数値）の変更は `propertyAnnotations` とセットで行う