# WebFOCUS拡張グラフ開発ガイド - APIリファレンス

## 1. tdgchart オブジェクト

`tdgchart` はWebFOCUSのチャートエンジンの中核となるオブジェクトです。拡張グラフ開発においては、主に `tdgchart.extensionManager` や `moonbeamInstance`（`tdgchart` のインスタンス）を通じて機能を利用します。

### 1.1 tdgchart.extensionManager

拡張グラフの登録と管理を行うモジュールです。

#### register(config)
拡張グラフをシステムに登録します。

- **引数**: `config` (Object) - 拡張グラフの設定オブジェクト。
- **戻り値**: なし
- **使用例**:
  ```javascript
  var config = {
    id: 'com.mycompany.mychart',
    containerType: 'svg',
    renderCallback: renderCallback,
    // ...
  };
  tdgchart.extensionManager.register(config);
  ```

### 1.2 moonbeamInstance

`renderConfig.moonbeamInstance` として渡される、現在描画中のチャートインスタンスです。

#### formatNumber(number, format)
数値を指定された形式でフォーマットします。

- **引数**:
  - `number`: フォーマットする数値。
  - `format`: フォーマット文字列（例: `#,###.00`）。
- **戻り値**: フォーマットされた文字列。

#### getSeries(index)
指定されたインデックスのシリーズオブジェクトを取得します。色や表示設定などにアクセスできます。

#### buildClassName(prefix, series, group, suffix)
WebFOCUSの標準的なクラス名を生成します。これにより、ツールチップやデータ選択機能が正しく動作するようになります。

- **引数**:
  - `prefix`: 通常は `'riser'`。
  - `series`: シリーズインデックス。
  - `group`: グループインデックス。
  - `suffix`: 任意の識別子（例: `'bar'`）。
- **戻り値**: クラス名文字列（例: `'riser!s0!g0!mbar!'`）。

## 2. pv (Protovis) オブジェクト

WebFOCUSのチャートエンジンは、内部的に Protovis ライブラリ（D3.jsの前身のようなライブラリ）のユーティリティを使用しています。これらは `pv` オブジェクトを通じて利用可能です。

### 2.1 pv.color(colorString)
色を操作するためのオブジェクトを生成します。

- **メソッド**:
  - `.lighter(k)`: 色を明るくします。
  - `.darker(k)`: 色を暗くします。
  - `.color`: 色コード（文字列）を取得します。

### 2.2 pv.blend(arrays)
複数の配列を結合してフラットな配列にします。

### 2.3 pv.range(start, stop, step)
Pythonの `range` のような数値配列を生成します。

## 3. WebFOCUSによる拡張グラフ登録メカニズム

WebFOCUS（`tdgchart.js`）は、以下の手順で拡張グラフを認識・ロードします。このプロセスは**クライアントサイド（ブラウザ）**で実行されます。Tomcatサーバーの起動時ではなく、グラフを含むページがブラウザにロードされるタイミングで発生します。

1.  **拡張リストの取得**:
    *   `tdgchart.js` は初期化時に、サーバー上の `html5chart_extensions.json` ファイルを非同期通信（AJAX）で取得します。
    *   このファイルには、利用可能な拡張グラフのIDと有効化状態（`enabled: true`）が定義されています。

2.  **スクリプトのロード**:
    *   `html5chart_extensions.json` に記載された各拡張グラフについて、対応する `.js` ファイル（例: `com.shimokado.simple_bar/com.shimokado.simple_bar.js`）を動的にロードします。

3.  **登録の実行**:
    *   各拡張グラフの `.js` ファイル内で `tdgchart.extensionManager.register(config)` が呼び出されることで、`tdgchart` オブジェクト内部の拡張リストに登録されます。

このメカニズムにより、開発者は `html5chart_extensions.json` にエントリを追加し、所定のフォルダにファイルを配置するだけで、WebFOCUSにカスタムチャートを追加できます。
