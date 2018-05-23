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
<body class="sans-serif lh-copy f4">
  <div class="bg-light-blue f1 tc pa3 ${banner}">${TITLE}</div>
  ${viewItems(state, emit)}
</body>
`
}

function viewItems(state, emit) {
  return html`
    <div class="">
      <div class="flex center mw7 mv3 ph3">
        <a href="" 
           class="link orange" 
           onclick="${e => {
             e.preventDefault()
             emit(state.events.list_add, I.createNew())
           }}">
          ADD
        </a>
      </div>
      ${state.list.map(createListItemView(state, emit))}  
    </div>`
}

function createListItemView(state, emit) {
  return function(item) {
    return html`
      <div class="flex center mw7 mv3 ph3">
        <div class="pa1">
          <a href=""
             class="link orange" 
             onclick="${e => {
               e.preventDefault()
               emit(state.events.list_delete, item)
             }}"
             
          >
            X
          </a>
        </div>
        <div class="pa1">${I.text(item)}</div>
      </div>`
  }
}
