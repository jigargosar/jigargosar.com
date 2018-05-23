const html = require('choo/html')
const {TITLE} = require('./meta')
const {updateTitle} = require('./events')
const I = require('../models/item')

module.exports = view

function view(state, emit) {
  updateTitle(TITLE, state, emit)

  return html`
<body class="sans-serif lh-copy f4">
  <div class="bg-light-blue f1 tc pa3">${TITLE}</div>
  ${itemsView(state, emit)}
</body>
`
}

function itemsView(state, emit) {
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
          ${Button(
            {
              onclick: event =>
                emit(state.events.list_delete_clicked, item, event),
            },
            'X',
          )}
        </div>
        <div class="pa1 flex-grow-1 flex flex-column">
          <div class="">${I.text(item)}</div>
          <div class="f6 code gray lh-solid" >id: ${I.id(item)}</div>
        </div>
        
      </div>`
  }
}

function Button(props, content) {
  return html`
    <a href=""
       class="link orange" 
       onclick="${props.onclick}"
     >
      ${content}
    </a>`
}
