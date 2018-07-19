import React from 'react'
import ReactDOM from 'react-dom'
// import './index.css'
import registerServiceWorker from '../registerServiceWorker'
import {mRunInAction, oObject} from './mobx/little-mobx'
import {tryCatchLog} from './little-ramda'
import {Provider} from 'mobx-react'

const storeBox = oObject({}, {}, {name: 'storeBox'})

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

    // Object.assign(storeBox, require('./mobx').state)
    // Object.assign(
    //   storeBox,
    //   require('./mobx/NotesActiveRecord/ActiveRecordNotesState')
    //     .state,
    // )
    // Object.assign(
    //   storeBox,
    //   require('./ImmutableState/ImmutableNoteTree').state,
    // )
    // const App = require('./components/Main').default
    // const App = require('./components/ActiveRecord/Main').default
    // const App = require('./components/ImmutableNotes/Main').default
    // const App = require('./components/CerebralNotes/Main').default
    Object.assign(
      storeBox,
      require('./mst/listy-stores/domain-store').default,
    )
    const App = require('./components/MSTListy/Main').default
    ReactDOM.render(
      <Provider store={storeBox}>
        <App />
      </Provider>,
      document.getElementById('root'),
    )
  })
}

render()

registerServiceWorker()

if (module.hot) {
  window.s = storeBox

  module.hot['accept'](
    [
      './mst/listy-stores/domain-store',
      './components/MSTListy/Main',

      './components/CerebralListy/Main',
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
