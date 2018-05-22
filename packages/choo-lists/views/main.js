const css = require('sheetify')
const html = require('choo/html')

const {TITLE} = require('./meta')
const {updateTitle} = require('./events')
const I = require('../models/item')

const style = css`
  :host {
    font-size: 4rem;
  }
`
module.exports = view

function view(state, emit) {
  updateTitle(TITLE, state, emit)

  return html`
<body class="f4">
  <h1 class="bg-blue-light text-center ${style}">${TITLE}</h1>
  <div class="f2 container-md p-4">Items</div>
  <div class="container-md">${viewItemsList(state, emit)}</div>
</body>
`
}

function viewItemsList(state, emit) {
  return html`
<div class="">
  ${state.list.map(function(item) {
    return html`<div class="px-4 py-1">${I.text(item)} </div>`
  })}  
</div>
`
}
