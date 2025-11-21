# WebFOCUS拡張グラフプロジェクト構造

## ルートディレクトリ
```
webfocus-extensions/
├── package.json              # NPMスクリプト定義
├── package-lock.json         # 依存関係ロック
├── README.md                 # プロジェクト概要
├── html5chart_extensions.json # 拡張機能有効化設定
├── .github/                  # GitHub設定
├── .vscode/                  # VS Code設定
├── .serena/                  # Serena MCP設定
├── doc/                      # ドキュメント
├── tool/                     # 開発ツール
└── com.shimokado.*/          # 拡張機能モジュール
```

## doc/ ディレクトリ
- `拡張グラフ開発ガイド.md`: メイン開発ガイド
- `拡張機能JavaScript共通仕様.md`: API仕様
- `拡張グラフの一般的なパターン.md`: コードパターン集
- `Editing_*.md`: WebFOCUS公式ドキュメント翻訳
- `*オブジェクト仕様書.md`: API詳細仕様

## tool/ ディレクトリ
- `create_extension_module.bat`: 拡張機能作成スクリプト
- `create-extension.js`: Node.js拡張機能作成ロジック
- `deploy_extension_module.bat`: WebFOCUSデプロイスクリプト
- `test_extension_module.bat`: テストスクリプト

## 拡張機能モジュール構造
各 `com.shimokado.*` フォルダは以下の構造：

```
com.shimokado.extension_name/
├── com.shimokado.extension_name.js  # メインJavaScript
├── properties.json                  # 拡張機能設定
├── test.html                        # ローカルテスト
├── README.md                        # モジュール説明
├── license.txt                      # ライセンス
├── icons/
│   └── medium.png                   # アイコン画像
├── css/
│   └── style.css                    # スタイルシート
└── lib/
    └── *.js                         # 外部ライブラリ
```

## 主要拡張機能一覧

### データ表示系
- `simple_bar`: シンプル棒グラフ
- `table_simple`, `table_ver1`, `table_ver2`: テーブル表示
- `card_simple`, `card_dashboard`: カードUI

### 特殊用途
- `params`: デバッグ用パラメータ表示
- `base_chart`: ベースチャート雛形
- `chartjs_sample`: Chart.jsサンプル

### 高度な可視化
- `zoomable_sunburst`: インタラクティブサンバースト
- `radial_gradiate`: 放射状グラデーション
- `geotest`: 地理情報テスト

## 設定ファイル

### html5chart_extensions.json
拡張機能の有効/無効を制御：
```json
{
  "com.shimokado.extension_name": { "enabled": true }
}
```

### package.json
NPMスクリプト：
- `create-extension`: 新規拡張機能作成
- `deploy`: WebFOCUSへのデプロイ  
- `test`: テスト実行

## 開発フロー
1. 既存モジュールを複製 (`npm run create-extension`)
2. JavaScript実装 (`*.js`)
3. 設定調整 (`properties.json`)
4. ローカルテスト (`test.html`)
5. デプロイ (`npm run deploy`)

## 依存関係
- Node.js（開発ツール用）
- D3.js（一部拡張機能）
- WebFOCUS Extension API
- 各種外部ライブラリ（拡張機能固有）