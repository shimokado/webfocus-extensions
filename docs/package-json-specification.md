# package.json 仕様書

## 概要

`package.json`は、このWebFOCUS拡張グラフプロジェクトのメタデータと設定を定義するNode.jsプロジェクトの標準設定ファイルです。npm scriptsによる開発タスクの自動化と、プロジェクト情報の管理を行います。

## ファイルの役割

1. **プロジェクトメタデータの定義**: プロジェクト名、バージョン、作者などの基本情報
2. **npm scriptsの定義**: 開発タスク（テスト、デプロイ、拡張グラフ作成）の実行コマンド
3. **依存関係の管理**: 必要なNode.jsパッケージの定義（現在は使用していない）
4. **プロジェクト構造の宣言**: ドキュメントフォルダなどのディレクトリ構成

## 現在の構成

```json
{
  "name": "webfocus-extensions",
  "version": "1.0.0",
  "description": "WebFOCUS HTML5 Extension Graph",
  "main": "index.js",
  "directories": {
    "doc": "doc"
  },
  "scripts": {
    "test": "tool\\test_extension_module.bat",
    "deploy": "tool\\deploy_extension_module.bat",
    "create-extension": "tool\\create_extension_module.bat"
  },
  "repository": {
    "type": "git",
    "url": "https://gitea.corp.example.com/shimokado/webfocus-extensions.git"
  },
  "keywords": [
    "webfocus",
    "html5",
    "chart",
    "extension",
    "visualization",
    "d3",
    "chartjs",
    "apexcharts"
  ],
  "author": "Shimokado Masataka",
  "license": "ISC",
  "homepage": "https://gitea.corp.example.com/shimokado/webfocus-extensions",
  "bugs": {
    "url": "https://gitea.corp.example.com/shimokado/webfocus-extensions/issues"
  }
}
```

---

## フィールド詳細

### 基本情報

#### `name`
```json
"name": "webfocus-extensions"
```

- **型**: string
- **必須**: ✅
- **説明**: プロジェクトの名前（npm package名）
- **命名規則**: 小文字、ハイフンまたはアンダースコア
- **用途**: npm registryでの識別、`node_modules`でのフォルダ名

#### `version`
```json
"version": "1.0.0"
```

- **型**: string (semver形式)
- **必須**: ✅
- **説明**: プロジェクトのバージョン番号
- **形式**: `MAJOR.MINOR.PATCH` (セマンティックバージョニング)
  - **MAJOR**: 互換性のない変更
  - **MINOR**: 後方互換性のある機能追加
  - **PATCH**: 後方互換性のあるバグ修正

#### `description`
```json
"description": "WebFOCUS HTML5 Extension Graph"
```

- **型**: string
- **必須**: 推奨
- **説明**: プロジェクトの簡潔な説明
- **用途**: npm search、プロジェクト概要の表示

#### `main`
```json
"main": "index.js"
```

- **型**: string
- **説明**: エントリーポイントファイル
- **注**: このプロジェクトは拡張グラフ集であり、`index.js`は実際には使用されません

#### `author`
```json
"author": "Shimokado Masataka"
```

- **型**: string または object
- **説明**: プロジェクトの作者
- **拡張形式**:
  ```json
  {
    "name": "Shimokado Masataka",
    "email": "shimokado@example.com",
    "url": "https://example.com"
  }
  ```

#### `license`
```json
"license": "ISC"
```

- **型**: string
- **説明**: ライセンス識別子
- **一般的な値**: `MIT`, `ISC`, `Apache-2.0`, `GPL-3.0`
- **用途**: 使用許諾の明示

---

### リポジトリ情報

#### `repository`
```json
"repository": {
  "type": "git",
  "url": "https://gitea.corp.example.com/shimokado/webfocus-extensions.git"
}
```

- **型**: object
- **説明**: ソースコードリポジトリの情報
- **フィールド**:
  - `type`: バージョン管理システムの種類（`git`, `svn`など）
  - `url`: リポジトリのURL

#### `homepage`
```json
"homepage": "https://gitea.corp.example.com/shimokado/webfocus-extensions"
```

- **型**: string (URL)
- **説明**: プロジェクトのホームページURL
- **用途**: ドキュメントサイトやリポジトリページへのリンク

#### `bugs`
```json
"bugs": {
  "url": "https://gitea.corp.example.com/shimokado/webfocus-extensions/issues"
}
```

- **型**: object または string (URL)
- **説明**: バグ報告先の情報
- **フィールド**:
  - `url`: Issue TrackerのURL
  - `email`: バグ報告用メールアドレス（任意）

---

### プロジェクト構成

#### `directories`
```json
"directories": {
  "doc": "doc"
}
```

- **型**: object
- **説明**: プロジェクト内の主要ディレクトリの場所
- **標準的なフィールド**:
  - `doc`: ドキュメントフォルダ
  - `test`: テストコードフォルダ
  - `lib`: ライブラリフォルダ
  - `bin`: 実行可能ファイルフォルダ

**注**: このプロジェクトでは実際のドキュメントフォルダは`docs`ですが、歴史的経緯で`doc`と記載されています。

---

### スクリプト

#### `scripts`
```json
"scripts": {
  "test": "tool\\test_extension_module.bat",
  "deploy": "tool\\deploy_extension_module.bat",
  "create-extension": "tool\\create_extension_module.bat"
}
```

- **型**: object (キー: スクリプト名, 値: 実行コマンド)
- **説明**: `npm run <script名>`で実行可能なタスク定義

#### スクリプト詳細

##### `create-extension`
```bash
npm run create-extension
```

- **目的**: 新規拡張グラフの雛形を作成
- **実行内容**: `tool\create_extension_module.bat` を実行
- **対話形式**: 会社名、拡張グラフID、コンテナタイプを入力
- **詳細**: [tool-specification.md](./tool-specification.md#1-create-extensionjs) を参照

##### `test`
```bash
npm run test <extension_id>
```

- **目的**: 指定した拡張グラフをローカルブラウザでテスト
- **実行内容**: `tool\test_extension_module.bat <extension_id>` を実行
- **引数**: 拡張グラフID（`com.shimokado.`プレフィックスを除く）
- **例**: `npm run test card_simple`
- **詳細**: [tool-specification.md](./tool-specification.md#4-test_extension_modulebat) を参照

##### `deploy`
```bash
npm run deploy <extension_id>
```

- **目的**: 指定した拡張グラフをWebFOCUSサーバーにデプロイ
- **実行内容**: `tool\deploy_extension_module.bat <extension_id>` を実行
- **引数**: 拡張グラフID（`com.shimokado.`プレフィックスを除く）
- **例**: `npm run deploy card_simple`
- **注意**: WebFOCUSサーバーへの書き込み権限とTomcat再起動権限が必要
- **詳細**: [tool-specification.md](./tool-specification.md#3-deploy_extension_modulebat) を参照

---

### キーワード

#### `keywords`
```json
"keywords": [
  "webfocus",
  "html5",
  "chart",
  "extension",
  "visualization",
  "d3",
  "chartjs",
  "apexcharts"
]
```

- **型**: array of strings
- **説明**: プロジェクトの特徴を表すキーワード
- **用途**: npm searchでの検索性向上、プロジェクト分類
- **このプロジェクトのキーワード説明**:
  - `webfocus`: IBMのBIツール
  - `html5`: HTML5技術を使用
  - `chart`: チャートライブラリ
  - `extension`: 拡張機能
  - `visualization`: データビジュアライゼーション
  - `d3`: D3.jsライブラリサポート
  - `chartjs`: Chart.jsライブラリサポート
  - `apexcharts`: ApexChartsライブラリサポート

---

## WebFOCUS拡張プロジェクト特有の設定

### 依存関係の不使用

```json
"dependencies": {},
"devDependencies": {}
```

このプロジェクトは**Node.js依存パッケージを使用していません**。理由は以下の通りです：

1. **ブラウザ実行環境**: 拡張グラフはブラウザ上で動作し、Node.jsランタイムを使用しない
2. **CDN利用**: 外部ライブラリ（D3.js、Chart.js等）はCDNまたはローカルコピーで読み込む
3. **シンプルさ**: ビルドプロセスを必要とせず、直接デプロイ可能

### ビルド不要のアーキテクチャ

このプロジェクトはトランスパイルやバンドルを行わず、以下のような直接的なデプロイを行います：

```
開発環境のフォルダ
    ↓ (XCOPY)
WebFOCUSサーバーのextensionsフォルダ
    ↓ (Tomcat再起動)
WebFOCUSで利用可能
```

---

## 将来的な拡張の可能性

### 開発用依存パッケージ候補

プロジェクトが大規模化した場合、以下のような開発用パッケージの導入を検討できます：

```json
"devDependencies": {
  "eslint": "^8.0.0",           // JavaScriptコードの静的解析
  "prettier": "^2.8.0",          // コードフォーマッター
  "http-server": "^14.0.0",      // ローカルHTTPサーバー
  "live-server": "^1.2.2"        // ライブリロード付きサーバー
}
```

### エンジン要件の明示

Node.jsのバージョン要件を指定することもできます：

```json
"engines": {
  "node": ">=14.0.0",
  "npm": ">=6.0.0"
}
```

---

## npm scriptsの実行方法

### 基本的な実行

```bash
# スクリプト一覧を表示
npm run

# 特定のスクリプトを実行
npm run <script-name>

# 引数付きで実行（--を付ける）
npm run <script-name> -- <arguments>
```

### このプロジェクトでの実行例

```bash
# 新規拡張グラフ作成
npm run create-extension

# テスト（引数なし: エラー）
npm run test

# テスト（引数あり）
npm run test card_simple

# デプロイ
npm run deploy card_simple
```

### ショートハンド

npmには特定のスクリプト名でショートハンドが用意されています：

| フルコマンド | ショートハンド |
|------------|--------------|
| `npm run start` | `npm start` |
| `npm run test` | `npm test` |

**注**: このプロジェクトでは`test`は拡張グラフのローカルテストを意味し、ユニットテストではありません。

---

## package.jsonの管理

### 手動編集

`package.json`は通常のJSONファイルなので、テキストエディタで直接編集できます。

**注意点**:
- JSONの構文エラーに注意（末尾のカンマ、引用符のエスケープ等）
- 編集後は`npm install`を実行して整合性を確認

### npm コマンドでの編集

```bash
# バージョンの更新（パッチバージョン +1）
npm version patch
# 1.0.0 → 1.0.1

# バージョンの更新（マイナーバージョン +1）
npm version minor
# 1.0.1 → 1.1.0

# バージョンの更新（メジャーバージョン +1）
npm version major
# 1.1.0 → 2.0.0
```

---

## トラブルシューティング

### よくあるエラー

#### 1. JSON構文エラー

**症状**:
```
npm ERR! JSON.parse Failed to parse json
```

**原因**: 末尾のカンマ、引用符の不一致、不正なエスケープ

**対処法**:
- JSONバリデーターでチェック: https://jsonlint.com/
- VSCodeのJSON検証機能を使用

#### 2. npm run が動作しない

**症状**:
```
npm ERR! missing script: <script-name>
```

**原因**: `scripts`に存在しないスクリプト名を指定

**対処法**:
- `npm run`でスクリプト一覧を確認
- `package.json`の`scripts`セクションを確認

#### 3. バッチファイルが実行できない

**症状**:
```
'tool\create_extension_module.bat' は、内部コマンドまたは外部コマンド、
操作可能なプログラムまたはバッチ ファイルとして認識されていません。
```

**原因**: カレントディレクトリがプロジェクトルートではない

**対処法**:
- プロジェクトルートで`npm run`を実行
- `package.json`が存在するディレクトリで実行

---

## ベストプラクティス

### 1. セマンティックバージョニングの遵守

バージョン番号は以下のルールで更新：
- **MAJOR (1.0.0 → 2.0.0)**: 後方互換性のない変更（APIの破壊的変更）
- **MINOR (1.0.0 → 1.1.0)**: 後方互換性のある機能追加
- **PATCH (1.0.0 → 1.0.1)**: 後方互換性のあるバグ修正

### 2. scriptsの命名規則

わかりやすく一貫した命名を心がける：
- `test`: テスト実行
- `deploy`: デプロイ
- `create-*`: 何かを作成
- `build`: ビルド処理
- `start`: アプリケーション起動

### 3. メタデータの充実

以下の情報は可能な限り記載：
- `description`: 明確なプロジェクト説明
- `repository`: ソースコードの場所
- `bugs`: 問題報告先
- `homepage`: ドキュメントやプロジェクトページ
- `keywords`: 検索性向上

### 4. リポジトリURLの更新

実際のリポジトリURLに合わせて更新：
```json
{
  "repository": {
    "type": "git",
    "url": "https://your-gitea-server.com/username/webfocus-extensions.git"
  },
  "homepage": "https://your-gitea-server.com/username/webfocus-extensions",
  "bugs": {
    "url": "https://your-gitea-server.com/username/webfocus-extensions/issues"
  }
}
```

---

## まとめ

`package.json`は、このWebFOCUS拡張グラフプロジェクトの中核設定ファイルです：

| 役割 | 内容 |
|-----|------|
| **プロジェクト識別** | name, version, description |
| **タスク自動化** | npm scriptsによる開発フロー効率化 |
| **メタデータ管理** | author, license, repository情報 |
| **検索性向上** | keywords, homepage, bugs |

依存パッケージは使用していませんが、npm scriptsを活用することで、開発・テスト・デプロイのワークフローを統一的に管理しています。
