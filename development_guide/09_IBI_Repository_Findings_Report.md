# IBIリポジトリ調査報告書

## 1. 概要

WebFOCUS拡張グラフの公式リポジトリ (`ibi/wf-extensions-chart`) を調査し、その知見を本プロジェクトのドキュメントおよびチュートリアルに統合しました。本レポートでは、新たに得られた主要な知見と、それらがどのように反映されたかを要約します。

## 2. 調査対象

- **リポジトリ**: [https://github.com/ibi/wf-extensions-chart](https://github.com/ibi/wf-extensions-chart)
- **重点調査対象**:
    - `com.ibi.sunburst`: 高度なD3.js実装、プロパティ設定。
    - `com.ibi.tutorial`: 複数の拡張機能を内包するアーキテクチャ。

## 3. 主要な知見と反映内容

### 3.1 ライセンスと帰属
- **知見**: IBIのリポジトリは **MIT License** で提供されています。
- **反映**: `development_guide/08_License_And_Attribution.md` を新規作成し、コード流用時の著作権表示ルールを明文化しました。

### 3.2 高度なプロパティ設定 (Property Annotations)
- **知見**: `com.ibi.sunburst` では、色のリストなどを管理するために配列型のプロパティ (`typeAnnotation: "array"`) が使用されています。
- **反映**: `development_guide/01_Specification.md` に「配列型プロパティ」のセクションを追加し、`arrayTypes` の使用法を解説しました。

### 3.3 ユーザー体験の向上 (noDataRenderCallback)
- **知見**: データが割り当てられていない状態でも、プレビュー用のダミーデータを表示することで、Designer上でのUXを向上させています。
- **反映**: `development_guide/03_Development_Guide.md` に「高度な実装パターン」として `noDataRenderCallback` の実装例を追加しました。また、`tutorial/06-advanced-examples/01-sunburst-analysis.md` でも解説しています。

### 3.4 堅牢なデータ処理 (sanitizeData)
- **知見**: `com.ibi.tutorial` では、サポートされていないバケット設定（Matrixなど）が渡された場合に、データをフラット化してエラーを防ぐ `sanitizeData` パターンが採用されています。
- **反映**: `development_guide/03_Development_Guide.md` に実装パターンとして追加しました。

### 3.5 メタ拡張機能アーキテクチャ
- **知見**: `com.ibi.tutorial` は、単一の拡張機能内に複数のサブ拡張機能を持ち、動的に切り替える構造を持っています。これは `extensionManager.register` をフックすることで実現されています。
- **反映**: `tutorial/06-advanced-examples/02-meta-extension-pattern.md` を作成し、この特殊なアーキテクチャの詳細を解説しました。

### 3.6 Moonbeam API の活用
- **知見**: `moonbeamInstance` には、配色、ラベル省略、エラー表示、ドリルダウンURL生成など、WebFOCUSとの統合に不可欠なAPIが多数用意されています。
- **反映**: `development_guide/02_API_Reference.md` に詳細なAPIリファレンスを追記し、`development_guide/03_Development_Guide.md` に具体的な活用テクニックを追加しました。

## 4. 今後の推奨事項

- **D3.js v5の活用**: `com.ibi.sunburst` のように、D3.jsの最新機能（v5以降）を活用しつつ、WebFOCUS環境との競合を避けるロード方法（`window.d3` チェック）を標準化することを推奨します。
- **プレビュー実装の標準化**: 新規開発する拡張機能には、原則として `noDataRenderCallback` を実装し、ユーザーが設定前から完成イメージを想像できるようにすることを推奨します。
