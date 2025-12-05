# HTML Table を使用した拡張グラフ

シンプルなHTMLテーブルを表示する例です。

## 手順

1. **プロジェクト作成**: `com.mycompany.table_sample` を作成。
2. **実装**:

```javascript
function renderCallback(renderConfig) {
  var container = renderConfig.container;
  var data = renderConfig.data;

  // テーブル要素の作成
  var table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';

  // ヘッダー作成（バケット情報から）
  var thead = document.createElement('thead');
  var tr = document.createElement('tr');
  // ... ヘッダー追加ロジック ...
  thead.appendChild(tr);
  table.appendChild(thead);

  // ボディ作成
  var tbody = document.createElement('tbody');
  data.forEach(function(row) {
    var tr = document.createElement('tr');

    var tdLabel = document.createElement('td');
    tdLabel.textContent = row.labels;
    tdLabel.style.border = '1px solid #ddd';
    tr.appendChild(tdLabel);

    var tdValue = document.createElement('td');
    tdValue.textContent = row.value;
    tdValue.style.border = '1px solid #ddd';
    tr.appendChild(tdValue);

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  container.appendChild(table);
  renderConfig.renderComplete();
}
```
