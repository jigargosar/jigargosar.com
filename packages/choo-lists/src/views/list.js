const {grainsList} = require('../state')
const {CodeMirrorEditor} = require('../components/CodeMirrorEditor')
const R = require('ramda')
const log = require('nanologger')('views:list')
const html = require('choo/html')
const {TITLE} = require('./meta')
const {updateTitle} = require('./events')
const G = require('../models/grain')
const EM = require('../models/edit-mode')
const domAutofocus = require('dom-autofocus')
const yaml = require('js-yaml')
const {actions: GA} = require('../stores/grains-store')
const {actions: GEA} = require('../stores/edit-grain-store')
const {actions: FA} = require('../stores/firebase-store')

module.exports = view

function signInOutView(state) {
  if (state.firebase.authState === 'loading') {
    return '...Loading'
  }
  return state.firebase.authState === 'signedOut'
    ? Button({onclick: FA.signIn}, 'Sign In')
    : html`<div class="flex justify-center">
              <div class="ph1">${state.firebase.userInfo.displayName}</div>
              <div class="ph1">
                ${Button({onclick: FA.signOut}, 'Sign Out')}
              </div>
            </div>`
}

function view(state, emit) {
  updateTitle(TITLE, state, emit)
  const isEditing = EM.editing === state.editGrain.editMode

  return html`
    <body class="sans-serif lh-copy f4">
      <div class="bg-light-blue tc pa3">
        <div class="f1">${TITLE}</div>
        <div>${signInOutView(state)}</div>
      </div>
      ${isEditing ? grainEditView(state) : grainsListView(state)}
    </body>`
}

const centeredContentClass = 'center mw7 mv3 ph3'

var grainEditor = new CodeMirrorEditor()

function grainEditView(state) {
  const onDiscardClick = () => {
    GEA.discard()
  }
  const onSubmit = event => {
    event.preventDefault()
    GEA.save()
  }
  const onEditModeTextChange = event => {
    GEA.textChange({text: event.target.value})
  }
  const editState = state.editGrain.editState
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
          value="${editState.form.text}"
          oninput="${onEditModeTextChange}"
          placeholder="Edit this..."
        />`)}
        <div class="flex flex-row-reverse f4">
          <div class="pa1">${Button({onclick: onSubmit}, 'SAVE')}</div>
          <div class="pa1">${Button({onclick: onDiscardClick}, 'DISCARD')}</div>
        </div>
      </form>
      <div class="flex flex-column mv3">
        ${grainEditor.render(editState.yaml, yamlString =>
          GEA.yamlChange({yamlString}),
        )}
      </div>
    </div>
    `
}

function grainsListView(state) {
  const list = grainsList(state)
  return html`
    <div class="">
      <div class="flex ${centeredContentClass}">
        <div class="pa1">Total: ${list.length}</div>
        <div class="pa1">${Button({onclick: GA.add}, 'ADD')}</div>
      </div>
      ${list.map(grainItemView)}  
    </div>`
}

function grainItemView(grain) {
  const text = G.getText(grain)
  return html`
    <div id=${G.getId(grain)} class="flex ${centeredContentClass}">
      <div class="pa1">
        ${Button({onclick: () => GA.delete({grain})}, 'X')}
      </div>
      <div class="pa1">
        ${Button({onclick: () => GEA.edit({grain})}, 'E')}
      </div>
      <div class="pa1 flex-grow-1 flex flex-column">
        ${
          R.compose(R.isEmpty, R.trim)(text)
            ? html`<div class="gray">${'<Empty>'}</div>`
            : html`<div class="">${text}</div>`
        }
        <div class="f6 code gray lh-solid" >id: ${G.getId(grain)}</div>
      </div>
    </div>`
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
       class="link light-purple"
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
