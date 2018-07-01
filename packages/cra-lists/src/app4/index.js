import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from '../registerServiceWorker'
import {mReaction, mRunInAction, oObject} from './mobx/utils'
import {storage} from './services/storage'
import {createObservableHistory} from './mobx/utils/StateHistory'
import {_} from './utils'
import {Provider} from 'mobx-react'

function createNotesCollection() {
  const ncSnapshot = storage.get('ncSnapshot') || {}
  return require('./mobx/NoteCollection').NoteCollection.create(
    ncSnapshot,
  )
}

function createNoteListView(nc) {
  return require('./mobx/NoteListView').NoteListView({nc})
}

function createStateItems() {
  const nc = createNotesCollection()
  return {
    nc,
    view: createNoteListView(nc),
  }
}

const appState = oObject({...createStateItems()}, {}, {name: 'appState'})

function render() {
  const App = require('./components/App').default
  ReactDOM.render(
    <Provider appState={appState}>
      <App />
    </Provider>,
    document.getElementById('root'),
  )
}

render()

registerServiceWorker()

if (module.hot) {
  window.s = appState
  // createObservableHistory(appState)
  console.debug(`createObservableHistory`, createObservableHistory)
  mReaction(
    () => [appState.nc.snapshot],
    () => storage.set('ncSnapshot', appState.nc.snapshot),
  )

  module.hot['accept'](
    [
      './components/App',
      './mobx/NoteCollection',
      './mobx/NoteListView',
    ],
    _.tryCatch(() => {
      console.clear()
      mRunInAction('Hot Update States', () =>
        Object.assign(appState, ...createStateItems()),
      )
      render()
    }, console.error),
  )
}
