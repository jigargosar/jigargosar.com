/*eslint-disable*/

import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from '../registerServiceWorker'
import {StateProvider} from './components/utils'
import {mAutoRun, mReaction, oObject} from './mobx/utils'
import {NoteListView} from './mobx/NoteListView'
import {Auth0} from './services/auth0'
import {storage} from './services/storage'

const R = require('ramda')
const RA = require('ramda-adjunct')

/*eslint-enable*/

const nc = createNC()
const states = oObject({
  nc,
  view: NoteListView({nc}),
  auth0: new Auth0(),
})

function render() {
  const App = require('./components/App').default
  ReactDOM.render(
    <StateProvider value={states}>
      <App />
    </StateProvider>,
    document.getElementById('root'),
  )
}

render()

registerServiceWorker()

function createNC() {
  const NotesCollection = require('./mobx/NotesCollection')
    .NotesCollection
  const ncSnapshot = storage.get('ncSnapshot') || {}
  return NotesCollection.create(ncSnapshot)
}

if (module.hot) {
  mReaction(
    () => [states.nc.snapshot],
    () => {
      storage.set('ncSnapshot', states.nc.snapshot)
    },
  )

  module.hot.accept(
    [
      './components/App',
      './mobx/NotesCollection',
      './mobx/NoteListView',
    ],
    () => {
      const NoteListView = require('./mobx/NoteListView').NoteListView

      states.nc = createNC()
      states.view = NoteListView({nc: states.nc})

      render()
    },
  )
}
