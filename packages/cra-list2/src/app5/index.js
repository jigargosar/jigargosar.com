import React from 'react'
import ReactDOM from 'react-dom'
// import './index.css'
import registerServiceWorker from '../registerServiceWorker'
import {mRunInAction, oObject} from './mobx/little-mobx'
import {tryCatchLog} from './little-ramda'
import {Provider} from 'mobx-react'

const allStores = oObject({}, {}, {name: 'allStores'})

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

    Object.assign(allStores, {
      store: require('./mst/listy-stores').store,
    })
    const App = require('./components/MSTListy/Main').default
    ReactDOM.render(
      <Provider store={allStores}>
        <App />
      </Provider>,
      document.getElementById('root'),
    )
  })
}

render()

registerServiceWorker()

if (module.hot) {
  window.s = allStores

  module.hot['accept'](
    [
      './mst/listy-stores',
      './components/MSTListy/Main',

      // './components/CerebralListy/Main',
      // './components/CerebralNotes/Main',
      // './components/ImmutableNotes/Main',
      // './ImmutableState/ImmutableNoteTree',
      // './components/Main',
      // './components/ActiveRecord/Main',
      // './mobx',
      // './mobx/NotesActiveRecord/ActiveRecordNotesState',
    ],
    tryCatchLog(render),
  )
}
