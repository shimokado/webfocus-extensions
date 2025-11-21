# チュートリアル学習者向けクイックガイド

## 🚀 学習を始める前に

### 前提条件チェック
- [ ] JavaScript基礎知識（ES5レベル）
- [ ] HTML/CSS基本理解
- [ ] ブラウザ開発者ツールの使い方
- [ ] WebFOCUS基本操作経験

### 開発環境準備
- [ ] Node.js インストール（v16+推奨）
- [ ] VS Code または他のテキストエディタ
- [ ] Chrome または他のモダンブラウザ
- [ ] WebFOCUSサーバーアクセス権限（デプロイ確認用）

## 📚 推奨学習パス

### Week 1: 基礎理解（2-3時間）
1. `tutorial/01-fundamentals/README.md` を読む
2. WebFOCUS拡張機能の仕組みを理解
3. プロジェクト構造を把握

### Week 2: 実コード分析（4-5時間）
1. `tutorial/02-code-analysis/README.md` でパターン学習
2. `tutorial/02-data-understanding/data-structure-analysis.md` で重要な構造の違いを理解
3. com.shimokado.paramsを実際に動かして確認

### Week 3: 開発技術習得（3-4時間）
1. `tutorial/03-basic-development/README.md` で技術要素学習
2. properties.jsonの設定練習
3. デバッグ技術の習得

### Week 4: 実践開発（4-6時間）
1. `tutorial/04-hands-on-exercises/README.md` でハンズオン実践
2. カード表示拡張機能を完成させる
3. WebFOCUSへデプロイして動作確認

## 🔍 重要ポイント

### ⚠️ 最重要：データ構造の違い
**必ず理解すべき点**：選択したフィールド数により構造が変わる

```javascript
// 単一フィールド
buckets.labels.title = "COUNTRY"        // 文字列
data[0].labels = "ENGLAND"              // 文字列

// 複数フィールド  
buckets.labels.title = ["COUNTRY", "CAR"] // 配列
data[0].labels = ["ENGLAND", "JAGUAR"]    // 配列
```

### 💡 デバッグの基本
1. **com.shimokado.paramsの活用**: 実際のデータ構造確認
2. **ブラウザコンソール**: エラーメッセージとログ確認
3. **段階的な確認**: 各ステップでconsole.logを使用

### 🛡️ 安全な実装パターン
```javascript
// 常に配列として扱う正規化
const labelsTitles = Array.isArray(buckets.labels.title) ? 
  buckets.labels.title : [buckets.labels.title];
```

## 🎯 学習効果確認

### 第1章終了後
- [ ] WebFOCUS拡張機能の仕組みを説明できる
- [ ] ファイル構造の役割を理解している
- [ ] tdgchartエンジンの基本を把握している

### 第2章終了後
- [ ] 既存コードを読んで理解できる
- [ ] データ正規化の必要性を説明できる
- [ ] 単一/複数フィールドの違いを理解している

### 第3章終了後
- [ ] properties.jsonを独力で設定できる
- [ ] 基本的なデバッグができる
- [ ] テストHTMLを作成できる

### 第4章終了後
- [ ] 拡張機能を一から作成できる
- [ ] WebFOCUSにデプロイできる
- [ ] エラートラブルシューティングができる

## 🆘 よくある問題と解決法

### 問題：「Cannot read property of undefined」
**解決**: データの存在確認を追加
```javascript
if (data && data.length > 0 && data[0].labels) {
  // 処理を実行
}
```

### 問題：「forEach is not a function」
**解決**: 配列チェックを追加
```javascript
const titles = Array.isArray(buckets.labels.title) ? 
  buckets.labels.title : [buckets.labels.title];
```

### 問題：CSSが適用されない
**解決**: 
1. ファイルパスの確認
2. ブラウザキャッシュのクリア
3. resources設定の確認

## 🔗 活用リソース

### プロジェクト内
- `com.shimokado.params`: データ構造確認ツール
- `doc/`: 詳細なAPI仕様書
- 既存の拡張機能: 参考実装

### 外部リソース
- [WebFOCUS公式ドキュメント](https://infocenter.informationbuilders.com/)
- [D3.js公式サイト](https://d3js.org/)
- [MDN Web Docs](https://developer.mozilla.org/)

## 💬 学習のコツ

1. **少しずつ進める**: 一度に多くを覚えようとしない
2. **実際に手を動かす**: コードは必ず実行して確認
3. **エラーを恐れない**: エラーから多くを学べる
4. **メモを取る**: 理解したことを記録する
5. **復習する**: 前の章を適宜振り返る