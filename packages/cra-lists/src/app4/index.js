import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from '../registerServiceWorker'
import {StateProvider} from './components/utils'
import {mAutoRun, mJS, mReaction, oObject} from './mobx/utils'
import {NoteListView} from './mobx/NoteListView'
import {storage} from './services/storage'

import {createStore} from 'mobx-app'
import {createObservableHistory} from './mobx/utils/StateHistory'

const nc = createNC()
const states = oObject(
  {
    nc,
    view: NoteListView({nc}),
    ...createAppStore(),
  },
  {},
  {name: 'states'},
)

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
  createObservableHistory(states)
  mReaction(
    () => [states.nc.snapshot],
    () => storage.set('ncSnapshot', states.nc.snapshot),
  )
  mAutoRun(() => {
    console.log(`states.nc.items`, ...mJS(states.state.nc.items))
  })
  mReaction(
    () => mJS(states.state),
    state => {
      storage.set('app-state', state)
      console.log(state.nc.items)
    },
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
