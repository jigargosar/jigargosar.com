import React from 'react'
import ReactDOM from 'react-dom'
// import './index.css'
import registerServiceWorker from '../registerServiceWorker'
import {mRunInAction, oObject} from './mobx/little-mobx'
import {tryCatchLog} from './little-ramda'
import {Provider} from 'mobx-react'

const appState = oObject({}, {}, {name: 'appState'})

let firstTime = true

function render() {
  mRunInAction('Hot Update States', () => {
    if (firstTime) {
      console.log('App Reloaded')
      firstTime = false
    } else {
      console.clear()
      console.log('Clearing Console on Hot Reload')
    }

    // Object.assign(appState, require('./mobx').state)
    // Object.assign(
    //   appState,
    //   require('./mobx/NotesActiveRecord/ActiveRecordNotesState')
    //     .state,
    // )
    // Object.assign(
    //   appState,
    //   require('./ImmutableState/ImmutableNoteTree').state,
    // )
    // const App = require('./components/Main').default
    // const App = require('./components/ActiveRecord/Main').default
    // const App = require('./components/ImmutableNotes/Main').default
    const App = require('./components/CerebralNotes/Main').default
    ReactDOM.render(
      <Provider appState={appState}>
        <App />
      </Provider>,
      document.getElementById('root'),
    )
  })
}

render()

registerServiceWorker()

if (module.hot) {
  window.s = appState

  module.hot['accept'](
    [
      './components/CerebralNotes/Main',
      './components/ImmutableNotes/Main',
      './ImmutableState/ImmutableNoteTree',
      './components/Main',
      './components/ActiveRecord/Main',
      './mobx',
      './mobx/NotesActiveRecord/ActiveRecordNotesState',
    ],
    tryCatchLog(render),
  )
}
