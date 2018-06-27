import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from '../registerServiceWorker'
import {StateProvider} from './components/utils'
import {mReaction, oObject} from './mobx/utils'
import {NoteListView} from './mobx/NoteListView'
import {storage} from './services/storage'

import {createStore} from 'mobx-app'
import {appStores} from './mobx-app-stores'

const nc = createNC()
const store = createStore(appStores, {})

const states = oObject({
  nc,
  view: NoteListView({nc}),
  ...store,
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
  window.s = states
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
      console.clear()
      const NoteListView = require('./mobx/NoteListView').NoteListView

      states.nc = createNC()
      states.view = NoteListView({nc: states.nc})

      render()
    },
  )
}
