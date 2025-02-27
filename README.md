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
