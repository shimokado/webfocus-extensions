# ライセンスと帰属について

WebFOCUS拡張グラフの開発において、外部のオープンソースコードやリポジトリ（特に [ibi/wf-extensions-chart](https://github.com/ibi/wf-extensions-chart)）を参考にする、あるいはコードを流用する場合は、ライセンス条項を遵守する必要があります。

## IBI リポジトリのライセンス

`ibi/wf-extensions-chart` リポジトリは **MIT License** の下で提供されています。

### MIT License の要点

MITライセンスは非常に寛容なライセンスですが、以下の条件を守る必要があります：

1.  **著作権表示の保持**: コードのコピーや改変部分には、元の著作権表示とライセンス全文（またはリンク）を含める必要があります。
2.  **無保証**: ソフトウェアは「現状のまま」提供され、作者はいかなる保証も行いません。

### 帰属表示の例

IBIのコードをベースに拡張機能を作成する場合、ソースコードのヘッダーに以下のようなコメントを含めることを推奨します：

```javascript
/*
 * Based on code from https://github.com/ibi/wf-extensions-chart
 * Copyright (C) Cloud Software Group, Inc.
 * Licensed under the MIT License.
 */
```

## その他のライブラリ

D3.js, Chart.js, ApexCharts などの外部ライブラリを使用する場合も、それぞれのライセンス（多くは BSD, MIT, Apache 2.0 など）を確認し、必要に応じて `LICENSE` ファイルを同梱するか、ソースコード内にクレジットを記載してください。
