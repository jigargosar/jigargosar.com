const css = require('sheetify')
const html = require('choo/html')
const {TITLE} = require('./meta')
const {updateTitle} = require('./events')
const I = require('../models/item')

// language=CSS
const banner = css`
  :host {
    /*font-size: 4rem;*/
  }
`

module.exports = view

function view(state, emit) {
  updateTitle(TITLE, state, emit)

  return html`
<body class="mdc-typography f5">
  <div class="bg-light-blue f2 tc pa3 ${banner}">${TITLE}</div>
  <div class="pa3-ns center mw7">${viewItemsList(state, emit)}</div>
  <!--<div class="container-md">\${viewItemsListSelected(state, emit)}</div>-->
</body>
`
}

/*
<div className="container-md">
    <ul className="mdc-list mdc-list--two-line">
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          First-line text
          <span className="mdc-list-item__secondary-text">
            Second-line text
          </span>
        </span>
      </li>
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          First-line text
          <span className="mdc-list-item__secondary-text">
            Second-line text
          </span>
        </span>
      </li>
      <li className="mdc-list-item">
        <span className="mdc-list-item__text">
          First-line text
          <span className="mdc-list-item__secondary-text">
            Second-line text
          </span>
        </span>
      </li>
    </ul>
    <div className="mdc-list-group">
      <h3 className="mdc-list-group__subheader">List 1</h3>
      <ul className="mdc-list">
        <li className="mdc-list-item">line item</li>
        <li className="mdc-list-item">line item</li>
        <li className="mdc-list-item">line item</li>
      </ul>

      <h3 className="mdc-list-group__subheader">List 2</h3>
      <ul className="mdc-list">
        <li className="mdc-list-item">line item</li>
        <li className="mdc-list-item">line item</li>
        <li className="mdc-list-item">line item</li>
      </ul>

      <ul className="mdc-list">
        <li className="mdc-list-item">Item 1 - Division 1</li>
        <li className="mdc-list-item">Item 2 - Division 1</li>
        <li role="separator" className="mdc-list-divider"/>
        <li className="mdc-list-item">Item 1 - Division 2</li>
        <li className="mdc-list-item">Item 2 - Division 2</li>
      </ul>
    </div>
  </div>

*/

function viewItemsList(state, emit) {
  return html`
<ul class="mdc-list">
  ${state.list.map(function(item) {
    return html`<li class="mdc-list-item ">${I.text(item)}</li>`
  })}  
</ul>
`
}
function viewItemsListSelected(state, emit) {
  return html`
<ul class="mdc-list">
  ${state.list.map(function(item) {
    return html`<li class="mdc-list-item mdc-list-item--activated mdc-list-item--selected">${I.text(
      item,
    )}</li>`
  })}  
</ul>
`
}
