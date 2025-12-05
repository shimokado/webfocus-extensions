# 高度な実装例：メタ拡張機能パターン (Tutorial Extension)

`com.ibi.tutorial` は、単一の拡張機能の中に複数の「サブ拡張機能」を内包し、プロパティによって動的に切り替えるという、非常にユニークなアーキテクチャを採用しています。これを「メタ拡張機能パターン」と呼びます。

## アーキテクチャの概要

1.  **親拡張機能 (`com.ibi.tutorial`)**: WebFOCUSにはこのIDで登録されます。
2.  **サブ拡張機能**: `com.ibi.tutorial_tooltips` など、個別のフォルダに分かれていますが、親拡張機能の一部としてロードされます。
3.  **動的ロード**: 親の `initCallback` でサブ拡張機能のスクリプトを動的にロードします。

## 実装の詳細

### 1. extensionManager.register のオーバーライド

サブ拡張機能が `register` を呼び出したときに、それをフックして内部リスト（`tutorialExtensions`）に保存するようにしています。

```javascript
var tutorialExtensions = {};
var originalRegister = tdgchart.extensionManager.register;

tdgchart.extensionManager.register = function(ext) {
  // サブ拡張機能のプロパティをロード
  ext.properties = tdg.ajax(renderConfig.loadPath + ext.id + '/properties.json', {asJSON: true});
  // リストに保存
  tutorialExtensions[ext.id] = ext;
  
  // ... 完了判定など ...
};
```

### 2. サブ拡張機能の動的ロード

`tdg.loadScriptFile` を使用して、リストアップされたサブ拡張機能のJSファイルを順次ロードします。

```javascript
tutorialList.forEach(function(extID) {
  extID = 'com.ibi.tutorial_' + extID;
  tdg.loadScriptFile(renderConfig.loadPath + extID + '/' + extID + '.js', ...);
});
```

### 3. 描画時の切り替え

`renderCallback` 内で、ドロップダウンリストを作成し、選択されたサブ拡張機能の `renderCallback` を呼び出します。

```javascript
function renderCallback(renderConfig) {
  // ... ドロップダウン作成 ...

  // 選択された拡張機能を取得
  var ext = tutorialExtensions[selectBox.node().value];
  
  // サブ拡張機能を描画
  drawExtension(ext, extContainer, renderConfig);
}

function drawExtension(ext, container, renderConfig) {
  // コンフィグを複製して環境を整える
  renderConfig = tdg.clone(renderConfig);
  // ... 設定の調整 ...
  
  // サブ拡張機能のrenderCallbackを実行
  ext.renderCallback(renderConfig);
}
```

## このパターンの利点

- **管理の集約**: 多数の小さなサンプルやバリエーションを、1つの拡張機能として配布・管理できます。
- **学習用途**: ユーザーは1つの拡張機能をインストールするだけで、多数のサンプルコードにアクセスできます。
- **動的な比較**: 実行時にチャートタイプを切り替えて比較検証が可能です。

## 注意点

- **複雑性**: `register` のフックや非同期ロードの管理など、実装難易度は高いです。
- **パフォーマンス**: 初回ロード時にすべてのサブ拡張機能を読み込むため、数が多すぎると重くなる可能性があります。

通常の実務開発でここまでの仕組みが必要になることは稀ですが、**「拡張機能の中から別の拡張機能のロジックを呼び出せる」** という事実は、高度なカスタマイズを行う際のヒントになります。
