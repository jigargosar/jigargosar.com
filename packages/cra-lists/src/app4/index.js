import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from '../registerServiceWorker'
import {StateProvider} from './components/utils'
import {mReaction, oObject} from './mobx/utils'
import {NoteListView} from './mobx/NoteListView'
import {storage} from './services/storage'

import {createStore} from 'mobx-app'

const nc = createNC()
const states = oObject({
  nc,
  view: NoteListView({nc}),
  ...createAppStore(),
})

const App = require('./components/App').default
function render() {
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

function createAppStore() {
  const appStores = require('./mobx-app-stores').appStores
  return createStore(appStores, storage.get('app-state'))
}

if (module.hot) {
  window.s = states
  Object.assign(window, require('mobx'))
  mReaction(
    () => [states.nc.snapshot],
    () => storage.set('ncSnapshot', states.nc.snapshot),
  )
  mReaction(
    () => [states.state],
    () => storage.set('app-state', states.state),
  )

  module.hot['accept'](
    // [
    //   './components/App',
    //   './mobx/NotesCollection',
    //   './mobx/NoteListView',
    // ],
    () => {
      console.clear()
      const NoteListView = require('./mobx/NoteListView').NoteListView

      Object.assign(states, {
        nc: createNC(),
        view: NoteListView({nc: states.nc}),
        ...createAppStore(),
      })

      render()
    },
  )
}
