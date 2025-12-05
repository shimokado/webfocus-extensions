# WebFOCUSのHTML5拡張グラフ

これは、WebFOCUSで利用できるHTML5拡張グラフです。

## クローンの作成方法

## WebFOCUSへの実装方法

### 1.拡張機能の追加

`com.shimokado.機能名`フォルダを以下の拡張グラフフォルダにコピーします。

Drive:\ibi\WebFOCUS93\config\web_resource\extensions

**WebFOCUS93**: バージョンによりフォルダ名は異なります。

### 2.拡張機能の有効化

以下のファイルを編集して拡張機能を有効化します。

Drive:\ibi\WebFOCUS93\config\web_resource\extensions\html5chart_extensions.json

```json
{
  "com.ibi.既存の機能": {"enabled": true},
  "com.ibi.既存の機能": {"enabled": false},
  "com.ibi.既存の機能": {"enabled": true},
  "com.shimokado.card-simple": { "enabled": true },
  "com.shimokado.table-simple": { "enabled": true }
}
```

この例では**com.shimokado.card-simple**と**com.shimokado.card-simple**を有効にしています。

### 3.Apatch Tomcatの再起動

WebFOCUSを起動しているApatch Tomcatを再起動すると拡張機能を利用できるようになります。

エラーが発生する場合は、ブラウザのキャッシュをクリアします。

## 拡張機能のカスタマイズ

### 機能の複製

1. `npm run create-extension`コマンドを実行します。
1. 必要に応じてアイコン画像と`properties.json`を変更します。


### レンダリングの変更

`/* 処理 */`部分を自由に記述します。

```javascript
function renderCallback(renderConfig) {
	const container = renderConfig.container; // コンテナ
	const data = renderConfig.data; // データ
	const dataBuckets = renderConfig.dataBuckets.buckets; // データバケット
    const div = document.createElement('div');
    /* 処理 */
    container.appendChild(div); // コンテナに追加
    renderConfig.renderComplete(); // レンダリングが完了したらコールする
}
```

必要な場合は、**config.resource**でCSSやJSを読み込みます。

その他、変更する場合はサンプルのコメントをよく読んで必要な修正を行います。

## 開発ガイド

詳細な開発ガイドは `development_guide` フォルダにあります。

- **[00_Overview.md](development_guide/00_Overview.md)**: 開発の全体像
- **[02_API_Reference.md](development_guide/02_API_Reference.md)**: APIリファレンス（Moonbeam APIの詳細含む）
- **[03_Development_Guide.md](development_guide/03_Development_Guide.md)**: 実践的な実装ガイド（データ正規化、Moonbeam活用）
- **[09_IBI_Repository_Findings_Report.md](development_guide/09_IBI_Repository_Findings_Report.md)**: IBI公式リポジトリからの知見レポート

## コントリビューション（貢献）ガイドライン

このプロジェクトへの貢献を歓迎します！バグ報告、機能提案、コードの改善など、あらゆる形での貢献をお待ちしています。

### Issueの作成ルール

バグ報告や機能リクエストを行う際は、以下のガイドラインに従ってください。

#### バグレポート

バグを報告する際は、以下の情報を含めてください：

1. **タイトル**: 問題を簡潔に説明するタイトル
2. **環境情報**:
   - WebFOCUSのバージョン
   - ブラウザの種類とバージョン
   - OSの種類とバージョン
3. **再現手順**: 問題を再現するための具体的な手順
4. **期待される動作**: 本来どうあるべきか
5. **実際の動作**: 実際に何が起きたか
6. **エラーメッセージ**: コンソールに表示されたエラー（あれば）
7. **スクリーンショット**: 問題を視覚的に示す画像（あれば）

#### 機能リクエスト

新機能の提案をする際は、以下を含めてください：

1. **タイトル**: 機能を簡潔に説明するタイトル
2. **動機**: なぜこの機能が必要か
3. **提案内容**: 具体的にどのような機能か
4. **代替案**: 考えられる他のアプローチ（あれば）
5. **参考資料**: 類似の実装例やドキュメント（あれば）

### Pull Requestの作成ルール

コードの変更を提案する際は、以下のガイドラインに従ってください。

#### PRを作成する前に

1. **Issueの確認**: 大きな変更の場合、事前にIssueで議論してください
2. **最新コードへの同期**: `main`ブランチの最新コードを取得してください
3. **ローカルテスト**: 変更が正しく動作することを確認してください

#### PRの内容

1. **タイトル**: 変更内容を簡潔に説明
2. **説明**:
   - 何を変更したか
   - なぜ変更したか
   - 関連するIssue番号（`#123`の形式）
3. **テスト結果**:
   - どのようにテストしたか
   - テスト環境（ブラウザ、WebFOCUSバージョン等）
4. **スクリーンショット**: UI変更の場合は必須

#### コミットメッセージ

わかりやすいコミットメッセージを心がけてください：

```
種類: 簡潔な説明（50文字以内）

詳細な説明（必要に応じて）
- 変更理由
- 影響範囲
- 注意点
```

**種類の例**:
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: コードの意味に影響しない変更（空白、フォーマット等）
- `refactor`: リファクタリング
- `test`: テストの追加・修正
- `chore`: ビルドプロセスやツールの変更

### コーディング規約

コードの一貫性を保つため、以下の規約に従ってください：

#### JavaScript

- **構文**: ES5構文を使用（古いブラウザ対応のため）
- **Strict Mode**: `'use strict';` を使用
- **変数宣言**: `var` を使用（`let`/`const`は使用しない）
- **インデント**: スペース4つ
- **セミコロン**: 文末に必ず付ける
- **命名規則**:
  - 変数・関数: camelCase（例: `myVariable`, `calculateTotal`）
  - 定数: UPPER_SNAKE_CASE（例: `MAX_VALUE`）
  - クラス: PascalCase（例: `ChartRenderer`）
- **コメント**: 複雑なロジックには日本語または英語でコメントを追加

#### ファイル構成

- **拡張グラフフォルダ**: `com.{company}.{extension_id}` 形式を厳守
- **ファイル名**: 拡張グラフIDと同じ名前のJSファイルを作成
- **必須ファイル**: `properties.json`, `test.html` を必ず含める

#### properties.json

- **JSONフォーマット**: 4スペースインデント
- **翻訳**: 日本語（`ja`）と英語（`en`）の両方を提供
- **バージョン**: セマンティックバージョニングを使用

### レビュープロセス

1. **PR作成**: Pull Requestを作成
2. **自動チェック**: CI（設定されている場合）が実行される
3. **コードレビュー**: メンテナーがコードをレビュー
4. **修正**: 必要に応じてフィードバックに対応
5. **マージ**: 承認後、メンテナーがマージ

### コミュニティ行動規範

- 敬意を持ってコミュニケーションする
- 建設的なフィードバックを心がける
- 他者の意見を尊重する
- 包括的で歓迎的な環境を維持する

---

## ライセンス

このプロジェクトは[MITライセンス](LICENSE)の下で公開されています。

## お問い合わせ

質問や提案がある場合は、[Issue](https://github.com/shimokado/webfocus-extensions/issues)を作成してください。

