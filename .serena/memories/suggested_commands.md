# WebFOCUS拡張グラフ開発コマンド一覧

## NPMスクリプト（推奨）

### 新しい拡張機能の作成
```bash
npm run create-extension
```
- 既存の拡張グラフを複製して新しい機能を作成
- `tool/create_extension_module.bat` → `tool/create-extension.js` を実行

### 拡張機能のデプロイ
```bash
npm run deploy
```
- WebFOCUSサーバーに拡張機能をデプロイ
- `tool/deploy_extension_module.bat` を実行

### テストの実行
```bash
npm run test
```
- `tool/test_extension_module.bat` を実行

## 直接実行コマンド

### Windows環境での開発ツール
```cmd
tool\create_extension_module.bat
tool\deploy_extension_module.bat [extension_id]
tool\test_extension_module.bat
```

### Node.js開発コマンド
```bash
# 依存関係のインストール
npm install

# Serena MCPツールの利用
# （現在アクティブ）
```

## WebFOCUS関連のパス
- 拡張機能フォルダ: `C:\ibi\WebFOCUS93\config\web_resource\extensions`
- 設定ファイル: `C:\ibi\WebFOCUS93\config\web_resource\extensions\html5chart_extensions.json`

## ファイル操作コマンド（Windows PowerShell）
```powershell
# ディレクトリ移動
cd c:\dev\webfocus-extensions

# ファイル一覧
ls, Get-ChildItem

# ファイル内容表示
cat, Get-Content

# ファイル検索
Select-String -Pattern "pattern" -Path "*.js"

# ディレクトリ作成
mkdir directory_name

# ファイルコピー
Copy-Item -Path source -Destination destination
```

## 開発の流れ
1. `npm run create-extension` で拡張機能を複製
2. `properties.json` と `.js` ファイルを編集
3. `test.html` でローカルテスト
4. `npm run deploy` でWebFOCUSにデプロイ
5. Apache Tomcat再起動でアクティベート