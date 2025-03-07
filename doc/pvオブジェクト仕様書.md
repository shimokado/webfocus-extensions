# pvオブジェクト仕様書

pvオブジェクトはWebFOCUSの拡張グラフ開発で使用されるユーティリティライブラリです。このオブジェクトは、グラフの描画やデータ操作を支援する様々なプロパティとメソッドを提供します。

## プロパティ

### pv.version
バージョン情報を格納するオブジェクト。

```javascript
{
    major: 3,
    minor: 2
}
```

### pv.color
色の処理を行うユーティリティ関数。tdgchart.util.colorへの参照。
WebFOCUSグラフの色を操作する際に使用します。

```javascript
// 色を取得し明るくする例
var color = pv.color("blue");
var lighterColor = color.lighter(0.2);
```

### pv.Scene
SVGシーン（描画領域）を操作するためのオブジェクト。pv.SvgSceneへの参照。

### pv.Mark
視覚的な要素（マーク）を描画するためのベースクラス。
グラフ要素（棒、線、点など）の基本クラスとして機能します。

### pv.Transform
座標変換を行うためのユーティリティクラス。

### pv.Scale
データ値をビジュアル属性（位置や色など）にマッピングするためのスケール関数を提供します。

```javascript
// スケール関数を作成して使用する例
var x = pv.Scale.ordinal().domain(pv.range(seriesCount)).rangeRoundBands([0, w], 0.2);
var y = pv.Scale.linear().domain([0, ymax]).range([25, h]);
```

### pv.Behavior
マウスイベントなどのインタラクション動作を定義するためのユーティリティオブジェクト。

## メソッド

### pv.range(start, stop, step)

連続した数値の配列を生成します。

#### パラメータ
- **start** (`number`, オプション): 開始値。省略した場合は0から開始。
- **stop** (`number`): 終了値（この値は結果に含まれない）
- **step** (`number`, オプション): ステップ幅。省略した場合は1。

#### 戻り値
(`Array`): 連続した数値の配列

#### 使用例

```javascript
// 0から9までの配列を生成
var array = pv.range(10);
// 結果: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

// 5から10までの配列を生成
var array = pv.range(5, 10);
// 結果: [5, 6, 7, 8, 9]

// 0から10までの2刻みの配列を生成
var array = pv.range(0, 10, 2);
// 結果: [0, 2, 4, 6, 8]
```

### pv.extend(functionObj)

指定したコンストラクタ関数のプロトタイプを拡張します。
継承の仕組みを実現するためのメソッドです。

#### パラメータ
- **functionObj** (`Function`): 拡張するコンストラクタ関数

#### 戻り値
(`Object`): 拡張されたプロトタイプオブジェクト

#### 使用例

```javascript
// カスタム棒グラフ要素を作成する例
var CustomBar = function() {};
CustomBar.prototype = pv.extend(pv.Bar);
CustomBar.prototype.customMethod = function() {
    // カスタム機能を実装
};
```

### pv.blend(arrays)

複数の配列を1つの配列に結合します。特に多次元配列を1次元配列に平坦化するために使用されます。

#### パラメータ
- **arrays** (`Array[]`): 結合する配列の配列

#### 戻り値
(`Array`): 結合された単一の配列

#### 使用例

```javascript
// 複数のデータ配列を1つに結合する
var array1 = [1, 2, 3];
var array2 = [4, 5, 6];
var array3 = [7, 8, 9];

var blended = pv.blend([array1, array2, array3]);
// 結果: [1, 2, 3, 4, 5, 6, 7, 8, 9]

// WebFOCUS拡張グラフでの使用例（一意なラベルの取得）
var axisLabels = pv.blend(data).map(function(el) {return el.labels;}).filter(function() {
    var seen = {};
    return function(el) {
        return el != null && !(el in seen) && (seen[el] = 1);
    };
}());
```

### pv.search(array, value)

ソート済み配列内で指定した値の位置を二分探索で検索します。

#### パラメータ
- **array** (`Array`): ソート済みの配列
- **value** (`any`): 検索する値

#### 戻り値
(`number`): 見つかった場合はその位置のインデックス、見つからなかった場合は挿入すべき位置を示す負の数

#### 使用例

```javascript
// ソート済み配列から値を検索する
var array = [10, 20, 30, 40, 50];
var index = pv.search(array, 30);
// 結果: 2（値30は配列の3番目の要素）

var index = pv.search(array, 35);
// 結果: -4（値35は配列の要素3と4の間に挿入すべき）
```

### pv.vector(x, y)

2Dベクトルを作成します。

#### パラメータ
- **x** (`number`): X座標
- **y** (`number`): Y座標

#### 戻り値
(`pv.VectorClass`): 新しいベクトルオブジェクト

#### 使用例

```javascript
// ベクトルを作成して操作する
var v1 = pv.vector(3, 4);
var length = v1.length();  // 5

// 別のベクトルとの演算
var v2 = pv.vector(1, 2);
var sum = v1.plus(v2);  // {x: 4, y: 6}
```

### pv.log(x, b)

指定した底による対数を計算します。

#### パラメータ
- **x** (`number`): 対数を計算する値
- **b** (`number`, オプション): 底。省略した場合は10

#### 戻り値
(`number`): 計算された対数値

#### 使用例

```javascript
// 対数スケールの計算
var log10 = pv.log(100);      // 2
var log2 = pv.log(8, 2);      // 3
```

### pv.functor(v)

値または関数を関数として扱えるようにラップします。
値が関数ならそのまま返し、そうでなければ値を返す関数を作成します。

#### パラメータ
- **v** (`any`): 値または関数

#### 戻り値
(`Function`): 引数を無視して値を返す関数、またはそのまま渡された関数

#### 使用例

```javascript
// 定数または関数としてサイズを定義
var staticSize = pv.functor(5);
staticSize();  // 5が返る

var dynamicSize = pv.functor(function(d) { return d.size; });
dynamicSize({size: 10});  // 10が返る
```

### pv.listener(f)

イベントリスナー関数をラップして標準化します。

#### パラメータ
- **f** (`Function`): ラップする関数

#### 戻り値
(`Function`): 標準化されたイベントリスナー関数

#### 使用例

```javascript
// イベントリスナーを作成する
var clickHandler = pv.listener(function(event) {
    console.log("クリックされました:", event);
});

// 作成したリスナーを要素に追加
pv.listen(someElement, "click", clickHandler);
```

## 高度な使用例

### カスタムマーカーの作成と使用

```javascript
// カスタム六角形マーカーを作成
function createHexagonMarker(container, size, color) {
  const dot = container.append("path")
    .attr("d", function() {
      const r = size;
      // 六角形の頂点を計算
      return "M" + r + ",0" + 
             "L" + r * Math.cos(Math.PI/3) + "," + r * Math.sin(Math.PI/3) + 
             "L" + r * Math.cos(2*Math.PI/3) + "," + r * Math.sin(2*Math.PI/3) + 
             "L" + (-r) + ",0" + 
             "L" + r * Math.cos(4*Math.PI/3) + "," + r * Math.sin(4*Math.PI/3) + 
             "L" + r * Math.cos(5*Math.PI/3) + "," + r * Math.sin(5*Math.PI/3) + 
             "Z";
    })
    .attr("fill", color);
    
  return dot;
}

// 使用例
const container = d3.select(renderConfig.container);
const markers = container.selectAll("g")
  .data(data)
  .enter().append("g")
  .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

markers.each(function(d) {
  createHexagonMarker(d3.select(this), d.size, pv.color(d.color).darker(0.2));
});
```

### データの変換と操作

```javascript
// データを転置して処理する
function processData(data) {
  // 2次元配列を転置する
  const transposed = pv.blend(data).map(function(el) {
    return el.labels;
  }).filter(function() {
    // 重複を除去
    const seen = {};
    return function(el) {
      return el != null && !(el in seen) && (seen[el] = 1);
    };
  }());
  
  return transposed;
}
```

### スケールの使用

```javascript
// カスタム座標軸スケールの作成
function createCustomScale(data, width, height) {
  // X軸の順序スケール
  const x = pv.Scale.ordinal()
    .domain(pv.range(data.length))
    .rangeRoundBands([0, width], 0.2);
    
  // Y軸の線形スケール
  const ymax = pv.blend(data).reduce(function(max, d) {
    return Math.max(max, d.value);
  }, 0);
  
  const y = pv.Scale.linear()
    .domain([0, ymax])
    .range([0, height]);
    
  return {x: x, y: y};
}
```

### カラー操作

```javascript
// グレーを取得し、より明るいバージョンを作成する
var grey = renderConfig.baseColor;
renderConfig.moonbeamInstance.getSeries(0).color = grey;
renderConfig.moonbeamInstance.getSeries(1).color = pv.color(grey).lighter(0.18).color;
```

### データの変換と集計

```javascript
// データを収集して処理する
splitYData.forEach(function(el) {
    el.forEach(function(stack) {
        var acc = 0;
        stack.forEach(function(d) {
            d.y0 = acc;
            d.y1 = acc + d.value;
            acc += d.value;
        });
    });
});
```

### 一意な値のフィルタリング

```javascript
// データセットから一意なラベルを抽出する
var axisLabels = pv.blend(data).map(function(el) {return el.labels;}).filter(function() {
    var seen = {};
    return function(el) {
        return el != null && !(el in seen) && (seen[el] = 1);
    };
}());
```

### ビジュアル要素の位置計算

```javascript
// スケールを使用して位置を計算
var xLabelHeight = 25;
var yHeight = (h - xLabelHeight) / splitYCount;
var x = d3.scale.ordinal().domain(axisLabels).rangeRoundBands([xLabelHeight, w - 25], 0.2);
var yScaleList = splitYData.map(function(el) {
    var ymax = d3.max(el.map(function(a) { return d3.sum(a, function(d) {return d.value;}); }));
    return d3.scale.linear().domain([0, ymax]).range([yHeight, 20]);
});
```

これらのメソッドを使用することで、WebFOCUSの拡張グラフを効率的かつ柔軟に開発することができます。