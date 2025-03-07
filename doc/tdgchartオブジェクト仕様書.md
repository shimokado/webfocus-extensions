# tdgchartオブジェクト仕様

tdgchartオブジェクトはWebFOCUSの拡張グラフ開発のためのメインライブラリです。このオブジェクトは、グラフの描画、データ処理、設定など、拡張グラフ開発に必要な様々な機能を提供します。

## tdgchart.util

### tdgchart.util.get(path, obj, defaultValue)

指定されたパスに従ってオブジェクトからプロパティを取得します。

#### パラメータ
- **path** (`string`): ドット表記またはブラケット表記のプロパティパス
- **obj** (`Object`): 検索対象のオブジェクト
- **defaultValue** (`any`, オプション): プロパティが存在しない場合の既定値

#### 戻り値
(`any`): 取得したプロパティの値、またはデフォルト値

#### 使用例

```javascript
// dataBucketsからvalue.titleを取得（存在しない場合は空文字列）
var title = tdgchart.util.get('dataBuckets.buckets.value.title[0]', renderConfig, '');
```

### tdgchart.util.ajax(url, options)

AJAXリクエストを送信し、リソースを非同期に取得します。

#### パラメータ
- **url** (`string`): リクエスト先のURL
- **options** (`Object`, オプション): リクエストオプション
  - **asJSON** (`boolean`): レスポンスをJSONとして解析するかどうか
  - **method** (`string`, オプション): HTTPメソッド（GET、POSTなど）
  - **headers** (`Object`, オプション): リクエストヘッダー

#### 戻り値
(`Promise`): レスポンスデータを含むPromiseオブジェクト

#### 使用例

```javascript
// JSONファイルを取得する
var info = tdgchart.util.ajax('lib/extra_properties.json', {asJSON: true});
console.log(info.custom_title);
```

### tdgchart.util.color(colorString)

色を表す文字列から色オブジェクトを作成します。

#### パラメータ
- **colorString** (`string`): 色を表す文字列（例: "red", "#FF0000", "rgb(255, 0, 0)"）

#### 戻り値
(`Object`): 色を操作するためのメソッドを持つオブジェクト

#### 使用例

```javascript
// 色オブジェクトを作成して操作する
var color = tdgchart.util.color("blue");
var lighterColor = color.lighter(0.2);
var rgbString = lighterColor.color; // 明るくなったRGB文字列
```

## tdgchart.extensionManager 

拡張グラフの管理を担当するオブジェクトです。

### tdgchart.extensionManager.register(config)

拡張グラフをWebFOCUSチャートエンジンに登録するメソッドです。すべての拡張グラフは、このメソッドを呼び出して登録する必要があります。

#### パラメータ
- **config** (`Object`): 拡張グラフの設定オブジェクト。以下のプロパティを含みます：
  - **id** (`string`): 拡張グラフを一意に識別する文字列。通常は「com.会社名.拡張グラフ名」の形式。
  - **containerType** (`string`): 'html'または'svg'（デフォルト）
  - **initCallback** (`function`, オプション): 初期化コールバック関数
  - **preRenderCallback** (`function`, オプション): 描画前コールバック関数
  - **renderCallback** (`function`): 描画コールバック関数（必須）
  - **noDataPreRenderCallback** (`function`, オプション): データなし時の描画前コールバック関数
  - **noDataRenderCallback** (`function`, オプション): データなし時の描画コールバック関数
  - **resources** (`Object`, オプション): 拡張グラフが必要とする追加の外部リソース（CSSとJavaScript）
  - **modules** (`Object`): 拡張グラフがサポートするモジュール

#### 使用例

```javascript
var config = {
    id: 'com.mycompany.mychart',
    containerType: 'svg',
    initCallback: initCallback,
    preRenderCallback: preRenderCallback,
    renderCallback: renderCallback,
    resources: {
        script: ['lib/d3.min.js'],
        css: ['css/mychart.css']
    },
    modules: {
        dataSelection: {
            supported: true,
            needSVGEventPanel: false,
            svgNode: function() {}
        },
        tooltip: {
            supported: true
        }
    }
};

tdgchart.extensionManager.register(config);
```

## tdgchart.getScriptPath()

現在のスクリプトのパスを取得するメソッドです。

#### 戻り値
(`string`): スクリプトのパス

#### 使用例

```javascript
var path = tdgchart.getScriptPath();
var jqueryPath = path.substr(0, path.indexOf('tdg')) + 'jquery/js/jquery.js';
```

## moonbeamInstanceのメソッドとプロパティ

moonbeamInstanceは、renderConfigオブジェクトを通じて提供される、現在描画中のチャートインスタンスへの参照です。

### formatNumber(number, format)

指定された形式で数値をフォーマットするメソッド。

#### パラメータ
- **number** (`number`): フォーマットする数値
- **format** (`string`): 数値フォーマット

#### 戻り値
(`string`): フォーマットされた数値

#### 使用例

```javascript
var formattedValue = chart.formatNumber(12345.67, "##,###.00");
// 結果: "12,345.67"
```

### getSeries(index)

シリーズオブジェクトを取得するメソッド。

#### パラメータ
- **index** (`number`): シリーズのインデックス

#### 戻り値
(`Object`): シリーズオブジェクト

#### 使用例

```javascript
var series = chart.getSeries(0);
series.color = "blue";
```

### getSeriesAndGroupProperty(seriesID, groupID, property)

シリーズとグループに依存するプロパティを取得するメソッド。

#### パラメータ
- **seriesID** (`number`): シリーズのID
- **groupID** (`number`): グループのID。nullの場合はグループに依存しないプロパティを取得
- **property** (`string`): 取得するプロパティ名。ドット表記も可能（例：'marker.border.width'）

#### 戻り値
(`any`): プロパティの値

#### 使用例

```javascript
var color = chart.getSeriesAndGroupProperty(0, null, 'color');
```

### buildClassName(prefix, series, group, suffix)

データ選択、イベント、ツールチップをサポートするためのクラス名を構築するメソッド。

#### パラメータ
- **prefix** (`string`): クラス名のプレフィックス（通常は'riser'）
- **series** (`number`): シリーズID
- **group** (`number`): グループID
- **suffix** (`string`, オプション): 識別用の追加文字列

#### 戻り値
(`string`): 構築されたクラス名

#### 使用例

```javascript
var className = chart.buildClassName('riser', 0, 1, 'bar');
```

### processRenderComplete()

チャートエンジンに描画が完了したことを通知するメソッド。

#### 使用例

```javascript
chart.processRenderComplete();
```

## renderConfigオブジェクト

拡張グラフのコールバック関数に渡されるコンフィグオブジェクトです。

### 主なプロパティ

#### renderConfig.moonbeamInstance

現在描画中のチャートインスタンスへの参照です。

#### renderConfig.data

描画するデータセットです。配列の配列として構造化されています。

#### renderConfig.properties

ユーザーが設定したプロパティブロックです。

#### renderConfig.width

描画領域の幅（ピクセル単位）です。

#### renderConfig.height

描画領域の高さ（ピクセル単位）です。

#### renderConfig.container

拡張グラフが描画されるDOMノードです。

#### renderConfig.dataBuckets

データバケット情報を含むオブジェクトです。メジャーやディメンションがどのように割り当てられているかを示します。

#### renderConfig.renderComplete()

レンダリングが完了したことをチャートエンジンに通知するためのコールバック関数です。

### 使用例

```javascript
function renderCallback(renderConfig) {
    var chart = renderConfig.moonbeamInstance;
    var data = renderConfig.data;
    var container = d3.select(renderConfig.container);
    var width = renderConfig.width;
    var height = renderConfig.height;
    
    // チャートの描画コード...
    
    renderConfig.renderComplete(); // レンダリング完了を通知
}
```

## モジュール

拡張グラフは様々なモジュールを使用して機能を拡張できます。

### tooltip モジュール

ツールチップ機能を提供するモジュールです。

#### renderConfig.modules.tooltip.addDefaultToolTipContent(target, s, g, d, data)

デフォルトのツールチップ内容をターゲット要素に追加するメソッド。

##### パラメータ
- **target** (`HTMLElement`): ツールチップを追加するDOM要素
- **s** (`number`): シリーズID
- **g** (`number`): グループID
- **d** (`Object`): データオブジェクト
- **data** (`Array`, オプション): シリーズデータの配列

##### 使用例

```javascript
renderConfig.modules.tooltip.addDefaultToolTipContent(this, s, g, d);
```

#### renderConfig.modules.tooltip.updateToolTips()

拡張グラフのツールチップを更新するメソッド。チャートが描画されたら呼び出す必要があります。

##### 使用例

```javascript
renderConfig.modules.tooltip.updateToolTips();
```

### dataSelection モジュール

データ選択機能を提供するモジュールです。

#### renderConfig.modules.dataSelection.activateSelection()

拡張グラフのデータ選択を有効にするメソッド。チャートが描画された後に呼び出す必要があります。

##### 使用例

```javascript
renderConfig.modules.dataSelection.activateSelection();
```

### colorScale モジュール

色スケール機能を提供するモジュールです。

#### renderConfig.modules.colorScale.getColorScale()

色スケール関数を取得するメソッド。

##### 戻り値
(`function`): 色スケール関数

##### 使用例

```javascript
var colorScale = renderConfig.modules.colorScale.getColorScale();
```

## コールバック関数

WebFOCUSの拡張グラフには、以下のコールバック関数を実装することができます。

### initCallback(successCallback, initConfig)

拡張グラフの初期化時に一度だけ呼び出されるオプション関数です。

#### パラメータ
- **successCallback** (`function`): 初期化が成功したかどうかを通知するためのコールバック。`true`または`false`を渡します。
- **initConfig** (`Object`): 標準のコールバック引数オブジェクト（moonbeamInstance, data, properties, など）。

#### 使用例

```javascript
function initCallback(successCallback, initConfig) {
    // 初期化コード
    successCallback(true);
}
```

### preRenderCallback(preRenderConfig)

各チャートエンジンの描画サイクルの最初に呼び出されるオプション関数です。

#### パラメータ
- **preRenderConfig** (`Object`): 標準のコールバック引数オブジェクト（moonbeamInstance, data, properties, など）。

#### 使用例

```javascript
function preRenderCallback(preRenderConfig) {
    var chart = preRenderConfig.moonbeamInstance;
    chart.title.visible = true;
    chart.title.text = "My Chart Title";
}
```

### renderCallback(renderConfig)

各チャートエンジンの描画サイクル中に呼び出される必須関数です。ここで拡張グラフの描画を行います。

#### パラメータ
- **renderConfig** (`Object`): 標準のコールバック引数オブジェクトに加え、width、heightなどの追加プロパティを含むオブジェクト。
  - **moonbeamInstance** (`Object`): 現在描画中のチャートインスタンス。
  - **data** (`Array`): 描画するデータセット。
  - **properties** (`Object`): ユーザーによって設定された拡張グラフのプロパティブロック。
  - **modules** (`Object`): 拡張グラフの設定からのmodulesオブジェクトと追加のAPIメソッド。
  - **width** (`number`): 拡張グラフがレンダリングされるコンテナの幅（px）。
  - **height** (`number`): 拡張グラフがレンダリングされるコンテナの高さ（px）。
  - **containerIDPrefix** (`string`): 拡張グラフがレンダリングされるDOMコンテナのID。
  - **container** (`HTMLElement`): 拡張グラフがレンダリングされるDOMノード。
  - **rootContainer** (`HTMLElement`): レンダリングされる特定のチャートエンジンインスタンスを含むDOMノード。
  - **dataBuckets** (`Object`): データバケット情報。
  - **renderComplete** (`function`): レンダリングが完了したことをチャートエンジンに通知するためのコールバック。

#### 使用例

```javascript
function renderCallback(renderConfig) {
    var chart = renderConfig.moonbeamInstance;
    var data = renderConfig.data;
    var w = renderConfig.width;
    var h = renderConfig.height;
    
    var container = d3.select(renderConfig.container)
        .attr('class', 'my_chart');
        
    // チャートの描画コード
    
    renderConfig.renderComplete();
}
```

### noDataPreRenderCallback(preRenderConfig)

データのない描画の前に呼び出されるオプション関数です。

#### パラメータ
- **preRenderConfig** (`Object`): 標準のコールバック引数オブジェクト。

#### 使用例

```javascript
function noDataPreRenderCallback(preRenderConfig) {
    var chart = preRenderConfig.moonbeamInstance;
    chart.legend.visible = false;
    chart.dataArrayMap = undefined;
    chart.dataSelection.enabled = false;
}
```

### noDataRenderCallback(renderConfig)

データのない状態で拡張グラフを描画する必要がある場合に呼び出されるオプション関数です。

#### パラメータ
- **renderConfig** (`Object`): 標準のコールバック引数オブジェクト。

#### 使用例

```javascript
function noDataRenderCallback(renderConfig) {
    var grey = renderConfig.baseColor;
    // サンプルデータを設定
    renderConfig.data = [{value: 5}, {value: 10}, {value: 15}];
    // グレースケールで描画
    renderCallback(renderConfig);
}
```

## 拡張グラフの開発ヒント

### データの正規化

データ構造が一貫していない場合や、特定のバケットが空の場合に、データを適切に正規化する方法：

```javascript
// シリーズブレークがない場合、データを2次元配列に正規化
if (renderConfig.dataBuckets.depth === 1) {
    data = [data];
}

// 1つの測定値しかない場合、タイトルを配列に正規化
if (renderConfig.dataBuckets.buckets.value && !Array.isArray(renderConfig.dataBuckets.buckets.value.title)) {
    renderConfig.dataBuckets.buckets.value.title = [renderConfig.dataBuckets.buckets.value.title];
}
```

### バケットの存在チェック

必要なデータバケットが存在するかを確認する方法：

```javascript
// 特定のバケットが存在するか確認
if (renderConfig.dataBuckets && 
    renderConfig.dataBuckets.buckets && 
    renderConfig.dataBuckets.buckets.value) {
    // valueバケットが存在する場合の処理
}
```

### 外部リソースの読み込み

拡張グラフで外部ファイルを読み込む方法：

```javascript
// 拡張グラフのフォルダからJSONファイルを読み込む
var info = tdgchart.util.ajax(preRenderConfig.loadPath + 'lib/extra_properties.json', {asJSON: true});
```

### ツールチップの適切な使用

デフォルトのツールチップをライザー（グラフ要素）に追加する方法：

```javascript
// SVG要素にツールチップを追加
svg.selectAll("rect")
   .data(data)
   .enter().append("rect")
   .attr("class", function(d, s, g) {
       return chart.buildClassName('riser', s, g, 'bar');
   })
   .each(function(d, s, g) {
       renderConfig.modules.tooltip.addDefaultToolTipContent(this, s, g, d);
   });
```

### データ選択を有効にする

データ選択機能を有効にする方法：

```javascript
// モジュール設定でデータ選択をサポート
var config = {
    // ... その他の設定 ...
    modules: {
        dataSelection: {
            supported: true,  // データ選択を有効に
            needSVGEventPanel: false
        }
    }
};

// レンダリング後にデータ選択を有効化
renderConfig.modules.dataSelection.activateSelection();
```

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
