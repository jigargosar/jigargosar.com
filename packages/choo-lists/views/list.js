const R = require('ramda')
const log = require('nanologger')('views:list')
const html = require('choo/html')
const {TITLE} = require('./meta')
const {updateTitle} = require('./events')
const I = require('../models/item')
const EM = require('../models/edit-mode')
module.exports = view

function view(state, emit) {
  updateTitle(TITLE, state, emit)
  const isEditing = EM.editing === state.editMode

  return html`
    <body class="sans-serif lh-copy f4">
      <div class="bg-light-blue f1 tc pa3">${TITLE}</div>
      ${isEditing ? editView(state, emit) : itemsView(state, emit)}
    </body>`
}

function editView(state, emit) {
  const onDiscardClick = () => {
    emit(state.events.list_edit_discard)
  }
  const onSubmit = event => {
    event.preventDefault()
    emit(state.events.list_edit_save)
  }
  const onEditModeTextChange = event => {
    emit(state.events.list_edit_onTextChanged, event.target.value)
  }
  return html`
    <div class="center mw7 mv3 ph3">
      <div class="f3">Editing</div>
      <form onsubmit="${onSubmit}">
        <input class="pa1 ma1 w-100"
               type="text" 
               value="${state.editState.form.text}"
               oninput="${onEditModeTextChange}"
               placeholder="Edit this..."
        />
      </form>
      <div class="flex flex-row-reverse f4">
        <div class="pa1">${Button({onclick: onSubmit}, 'SAVE')}</div>
        <div class="pa1">${Button({onclick: onDiscardClick}, 'DISCARD')}</div>
      </div>
    </div>
    `
}

function itemsView(state, emit) {
  const onAddClick = () => {
    emit(state.events.list_add, I.createNew())
  }
  return html`
    <div class="">
      <div class="flex center mw7 mv3 ph3">
        <div class="pa1">Total: ${state.list.length}</div>
        <div class="pa1">${Button({onclick: onAddClick}, 'ADD')}</div>
      </div>
      ${state.list.map(createListItemView(state, emit))}  
    </div>`
}

function createListItemView(state, emit) {
  return function(item) {
    return html`
      <div id=${I.id(item)} class="flex center mw7 mv3 ph3">
        <div class="pa1">
          ${Button({onclick: () => emit(state.events.list_delete, item)}, 'X')}
        </div>
        <div class="pa1">
          ${Button({onclick: () => emit(state.events.list_edit, item)}, 'E')}
        </div>
        <div class="pa1 flex-grow-1 flex flex-column">
          <div class="">${I.text(item)}</div>
          <div class="f6 code gray lh-solid" >id: ${I.id(item)}</div>
        </div>
      </div>`
  }
}
function noModifiers(event) {
  return !R.any(R.identity, R.props(['shiftKey', 'ctrlKey', 'metaKey'], event))
}

function codeEqWithNoModifiers(code, event) {
  log.debug('codeEqWithNoModifiers', event.type, event.code, 'Expected: ', code)
  return event.code === code && noModifiers(event)
}

function Button(props, content) {
  const performAction = event => {
    event.preventDefault()
    props.onclick(event)
  }

  return html`
    <a href=""
       class="link orange"
       onkeypress="${event => {
         if (codeEqWithNoModifiers('Space', event)) {
           performAction(event)
         }
       }}"
       onkeyup="${event => {
         if (codeEqWithNoModifiers('Escape', event)) {
           event.target.blur()
         }
       }}" 
       onclick="${performAction}"
     >
      ${content}
    </a>`
}
