# tdgchart仕様書

## tdgchart.prototype.formatNumber

### 概要
数値を指定されたフォーマットに従ってフォーマットします。この関数は数値データを表示用に整形する際に使用します。

### 構文
```javascript
tdgchart.prototype.formatNumber(n, format, config, applyLangTable)
```

### パラメータ
- **n** (`number|string|null`): フォーマットする数値。数値または文字列として渡すことができます。
  - nullが渡された場合は、nullRepresentationの値が返されます。
  
- **format** (`string|function|object|null`): 数値のフォーマット方法を指定します。
  - **文字列の場合**: フォーマットパターン（例: "#,###.00", "¥#,###", "0.00%"）
  - **関数の場合**: 数値を引数に取り、フォーマットされた文字列を返すカスタム関数
  - **オブジェクトの場合**: フォーマットオプションを含むオブジェクト
  - **nullの場合**: デフォルトフォーマットが適用されます

- **config** (`object`, オプション): フォーマットに関する追加設定
  - 小数点、千単位区切り、通貨記号などの詳細設定を含むオブジェクト

- **applyLangTable** (`boolean`, オプション): 言語テーブルを適用するかどうかを指定します。
  - trueの場合、現在の言語設定に基づいた数値表現が適用されます（例: 小数点、千単位区切りなど）

### 戻り値
(`string`): フォーマットされた数値の文字列表現。

### 使用例

```javascript
// 基本的な数値フォーマット
var formattedNumber = renderConfig.moonbeamInstance.formatNumber(1234.56, "#,###.00");
// 結果: "1,234.56"

// 通貨フォーマット
var formattedCurrency = renderConfig.moonbeamInstance.formatNumber(1234.56, "¥#,###.00");
// 結果: "¥1,234.56"

// パーセントフォーマット
var formattedPercent = renderConfig.moonbeamInstance.formatNumber(0.1234, "0.00%");
// 結果: "12.34%"

// カスタム関数を使用したフォーマット
var customFormat = function(num) {
  return num.toFixed(2) + " 単位";
};
var formattedCustom = renderConfig.moonbeamInstance.formatNumber(1234.56, customFormat);
// 結果: "1234.56 単位"

// nullの処理
var nullValue = renderConfig.moonbeamInstance.formatNumber(null, "#,###.00");
// 結果: ""（または設定されたnullRepresentation値）
```

### 注意事項
- フォーマットパターンの詳細な構文はWebFOCUSのドキュメントを参照してください。
- 国際化対応が必要な場合は、applyLangTableパラメータをtrueに設定してください。
- WebFOCUSの拡張グラフでは、通常はdataBuckets.buckets.value.numberFormatプロパティからフォーマット情報を取得します。


## tdgchart.prototype.renderComplete

### 概要
チャートのレンダリングが完了したことをシステムに通知します。この関数はrenderCallback関数の最後で呼び出す必要があります。

### 構文
```javascript
tdgchart.prototype.renderComplete()
```

### パラメータ
なし

### 戻り値
なし

### 使用例
```javascript
function renderCallback(renderConfig) {
  // チャート描画コード...
  
  // レンダリング完了を通知
  renderConfig.renderComplete();
}
```

### 注意事項
- 拡張グラフのrenderCallback関数の最後で必ず呼び出す必要があります
- この関数を呼び出さないと、WebFOCUSはチャートのレンダリングが完了したことを認識できません
- 非同期操作を行う場合は、すべての処理が完了した後に呼び出す必要があります

## tdgchart.extensionManager.register

### 概要
WebFOCUS拡張グラフをシステムに登録します。この関数は各拡張グラフのコードの最後で呼び出されます。

### 構文
```javascript
tdgchart.extensionManager.register(config)
```

### パラメータ
- **config** (`object`): 拡張グラフの設定オブジェクト。以下のプロパティが含まれます:
  - **id** (`string`): 拡張グラフを一意に識別するID（例: 'com.company.chart_name'）
  - **containerType** (`string`): コンテナのタイプ（'svg'または'html'）
  - **initCallback** (`function`, オプション): 初期化時に呼び出される関数
  - **preRenderCallback** (`function`, オプション): レンダリング前に呼び出される関数
  - **renderCallback** (`function`): チャート描画を行う関数
  - **resources** (`object`, オプション): 拡張グラフで使用する外部リソース
  - **modules** (`object`, オプション): 拡張グラフで使用するモジュール設定

### 戻り値
なし

### 使用例
```javascript
// 拡張グラフを登録
var config = {
  id: 'com.mycompany.mychart',
  containerType: 'svg',
  renderCallback: renderCallback,
  resources: {
    script: ['lib/d3.min.js'],
    css: ['css/style.css']
  }
};

tdgchart.extensionManager.register(config);
```

### 注意事項
- 各拡張グラフのJavaScriptファイルの最後で呼び出す必要があります
- WebFOCUSはこの登録情報を使用して拡張グラフを認識し、適切なタイミングで各コールバック関数を呼び出します
- idは一意である必要があり、通常は'com.会社名.チャート名'の形式を使用します
