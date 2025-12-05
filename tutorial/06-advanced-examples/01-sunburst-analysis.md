# 高度な実装例：Sunburst Chart の分析

IBI公式の `com.ibi.sunburst` 拡張機能は、D3.jsを使用した高度なチャート実装の優れた例です。このドキュメントでは、そのコードから学べる重要なテクニックを解説します。

## 1. D3.js v5 の読み込みと互換性

`com.ibi.sunburst` では、D3.js v5 を使用しており、さらに `d3-selection-multi` などのプラグインも読み込んでいます。

```javascript
resources: {
  script: window.d3 
    ? ['lib/sunburst.js', 'lib/d3-selection-multi.min.js', ...] 
    : ['lib/d3.v5.16.min.js', 'lib/sunburst.js', 'lib/d3-selection-multi.min.js', ...],
  css: []
}
```

- **ポイント**: `window.d3` が既に存在するかチェックし、存在する場合は二重読み込みを避ける（またはバージョン競合を管理する）工夫が見られます。

## 2. preRenderCallback での Moonbeam 設定

`preRenderCallback` を使用して、描画前に WebFOCUS のチャートエンジン（Moonbeam）の設定を変更しています。

```javascript
function preRenderCallback(preRenderConfig) {
  // WebFOCUS標準の凡例を非表示にする（D3側で制御するため、または不要なため）
  preRenderConfig.moonbeamInstance.legend.visible = false;
}
```

## 3. プロパティの伝播とモジュール化

`renderCallback` 内で、プロパティオブジェクトに必要なメソッド（`formatNumber`など）をバインドし、それを別のモジュール（`tdg_sunburst`）に渡しています。これにより、描画ロジックをメインファイルから分離しています。

```javascript
function renderCallback(renderConfig) {
  var chart = renderConfig.moonbeamInstance;
  var props = renderConfig.properties;

  // 必要な情報をpropsに集約
  props.width = renderConfig.width;
  props.height = renderConfig.height;
  props.data = chart.data[0]; // データへのアクセス
  props.formatNumber = chart.formatNumber.bind(chart); // フォーマッターの継承

  // 別モジュールで描画
  var tdg_sunburst_chart = tdg_sunburst(props);
  tdg_sunburst_chart(container);
}
```

## 4. ツールチップの更新

描画完了後に `renderConfig.modules.tooltip.updateToolTips()` を呼び出すことで、HTMLベースのツールチップを最新のDOM状態に合わせて更新しています。

```javascript
renderConfig.modules.tooltip.updateToolTips();
```

## 5. noDataRenderCallback の実装

データがない場合でも、プレビュー用のダミーデータを表示する `noDataRenderCallback` が実装されています。これは [開発ガイド 03_Development_Guide.md](../development_guide/03_Development_Guide.md) の「高度な実装パターン」でも紹介しています。

## 学びのポイント

- **モジュール分割**: 描画ロジックを別ファイル/関数に切り出すことで、コードの可読性と保守性が向上します。
- **Moonbeam APIの活用**: `formatNumber` や `legend.visible` など、エンジンの機能を活用することで、WebFOCUSとの親和性が高まります。
- **ユーザー体験**: `noDataRenderCallback` によるプレビュー表示は、エンドユーザーにとって非常に親切です。
