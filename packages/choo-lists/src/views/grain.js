const {updateTitle} = require('./events')
const {CodeMirrorEditor} = require('../components/CodeMirrorEditor')
const R = require('ramda')
const log = require('nanologger')('views:list')
const html = require('choo/html')
const {TITLE} = require('./meta')
const EM = require('../models/edit-mode')
const domAutofocus = require('dom-autofocus')
const yaml = require('js-yaml')
const {actions: GEA} = require('../stores/edit-grain-store')

module.exports = view

const centeredContentClass = 'center mw7 mv3 ph3'

function view(state, emit) {
  updateTitle(TITLE, state, emit)
  return html`<body class="sans-serif lh-copy f4">
      <div class="bg-light-blue tc pa3">
        <div class="f1">${TITLE}</div>
      </div>
      <div 
        class="${centeredContentClass}" 
        style="min-width: 100%;">View Grain</div>
    </body>`
}
