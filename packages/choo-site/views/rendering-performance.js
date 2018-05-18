var html = require("choo/html")
var R = require("ramda")

module.exports = view

function headerCellView(colIdx) {
  return html`<td>Header Cell ${colIdx}</td>`
}

function bodyCellView(rowIdx) {
  return function (colIdx) {
    return html`<td>Body Cell rowIdx:${rowIdx} : colIdx${colIdx}</td>`
  }
}

function rowsView(colCount) {
  return function (rowIdx) {
    return html`<tr>${R.times(bodyCellView(rowIdx), colCount)}</tr>`
  }
}

function view(state, emit) {


  // language=HTML
  return html`
<body class="code lh-copy">
<table>
  <thead>
  <tr>
    ${R.times(headerCellView, state.colCount)}
  </tr>
  </thead>
  <tbody>
    ${R.times(rowsView(state.colCount), state.rowCount)}
  </tbody>
</table>
</body>
`
}


