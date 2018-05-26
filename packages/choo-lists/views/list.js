const {CodeMirrorEditor} = require('../elements/CodeMirrorEditor')

const R = require('ramda')
const log = require('nanologger')('views:list')
const html = require('choo/html')
const {TITLE} = require('./meta')
const {updateTitle} = require('./events')
const G = require('../models/grain')
const EM = require('../models/edit-mode')
const domAutofocus = require('dom-autofocus')
const yaml = require('js-yaml')
const CodeMirror = require('codemirror')
const css = require('sheetify')
css('codemirror/lib/codemirror.css')
css('codemirror/theme/zenburn.css')
const Component = require('choo/component')

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

const centeredContentClass = 'center mw7 mv3 ph3'

const cm = new CodeMirror(null, {
  value: '',
  lineNumbers: true,
})

var cmComp = new CodeMirrorEditor()

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
    <div class="${centeredContentClass}" style="min-width: 100%;">
      <div class="f3">Editing</div>
      <form 
        onsubmit="${onSubmit}" 
        onkeyup="${event => {
          // log.debug(event)
          // if (hasKeyCodeWithoutModifiers('Escape', event)) {
          //   log.debug('event', event)
          //   onDiscardClick(event)
          // }
        }}"
      >
        
        ${domAutofocus(html`<input 
          class="pa1 ma1 w-100" 
          type="text" 
          value="${state.editState.form.text}"
          oninput="${onEditModeTextChange}"
          placeholder="Edit this..."
        />`)}
        <div class="flex flex-row-reverse f4">
          <div class="pa1">${Button({onclick: onSubmit}, 'SAVE')}</div>
          <div class="pa1">${Button({onclick: onDiscardClick}, 'DISCARD')}</div>
        </div>
      </form>
      <div class="flex flex-column mv3">
        ${cmComp.render(yaml.dump(state.editState.form))}
      </div>
    </div>
    `
}

function itemsView(state, emit) {
  const onAddClick = () => {
    emit(state.events.list_add)
  }
  return html`
    <div class="">
      <div class="flex ${centeredContentClass}">
        <div class="pa1">Total: ${state.list.length}</div>
        <div class="pa1">${Button({onclick: onAddClick}, 'ADD')}</div>
      </div>
      ${state.list.map(createGrainListView(state, emit))}  
    </div>`
}

function createGrainListView(state, emit) {
  return function(grain) {
    const text = G.text(grain)
    return html`
      <div id=${G.id(grain)} class="flex ${centeredContentClass}">
        <div class="pa1">
          ${Button({onclick: () => emit(state.events.list_delete, grain)}, 'X')}
        </div>
        <div class="pa1">
          ${Button({onclick: () => emit(state.events.list_edit, grain)}, 'E')}
        </div>
        <div class="pa1 flex-grow-1 flex flex-column">
          ${
            R.compose(R.isEmpty, R.trim)(text)
              ? html`<div class="gray">${'<Empty>'}</div>`
              : html`<div class="">${text}</div>`
          }
          <div class="f6 code gray lh-solid" >id: ${G.id(grain)}</div>
        </div>
      </div>`
  }
}

function noModifiers(event) {
  return !R.any(R.identity, R.props(['shiftKey', 'ctrlKey', 'metaKey'], event))
}

function hasKeyCodeWithoutModifiers(code, event) {
  log.debug(
    'hasKeyCodeWithoutModifiers',
    event.type,
    event.code,
    'Expected: ',
    code,
  )
  return event.code === code && noModifiers(event)
}

function Button(props, content) {
  const performAction = event => {
    event.preventDefault()
    props.onclick(event)
  }

  return html`
    <a href=""
       role="button"
       class="link orange"
       onkeypress="${event => {
         if (hasKeyCodeWithoutModifiers('Space', event)) {
           performAction(event)
         }
       }}"
       onkeyup="${event => {
         if (hasKeyCodeWithoutModifiers('Escape', event)) {
           log.debug('event', event)
           event.target.blur()
         }
       }}" 
       onclick="${performAction}"
     >
      ${content}
    </a>`
}
