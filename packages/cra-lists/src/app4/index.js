import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from '../registerServiceWorker'
import {StateProvider} from './components/utils'
import {mJS, mReaction, mRunInAction, oObject} from './mobx/utils'
import {NoteListView} from './mobx/NoteListView'
import {storage} from './services/storage'
import {createObservableHistory} from './mobx/utils/StateHistory'
import {_} from './utils'

const nc = createNC()
const states = oObject(
  {
    nc,
    view: NoteListView({nc}),
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

if (module.hot) {
  window.s = states
  // createObservableHistory(states)
  console.debug(`createObservableHistory`, createObservableHistory)
  mReaction(
    () => [states.nc.snapshot],
    () => storage.set('ncSnapshot', states.nc.snapshot),
  )

  module.hot['accept'](
    [
      './components/App',
      './mobx/NotesCollection',
      './mobx/NoteListView',
    ],
    _.tryCatch(() => {
      console.clear()
      const NoteListView = require('./mobx/NoteListView').NoteListView
      mRunInAction('Hot Update States', () =>
        Object.assign(states, {
          nc: createNC(),
          view: NoteListView({nc: states.nc}),
        }),
      )
      render()
    }, console.error),
  )
}
