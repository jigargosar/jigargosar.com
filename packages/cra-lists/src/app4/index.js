import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from '../registerServiceWorker'
import {mReaction, mRunInAction, oObject} from './mobx/utils'
import {storage} from './services/storage'
import {createObservableHistory} from './mobx/utils/StateHistory'
import {_} from './utils'
import {Provider} from 'mobx-react'
import {initExtension} from './extension'
import {createState} from './mobx'

const appState = oObject(createState(), {}, {name: 'appState'})

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

mReaction(
  () => [appState.nc.snapshot],
  () => storage.set('ncSnapshot', appState.nc.snapshot),
)

initExtension(appState).catch(console.error)

if (module.hot) {
  window.s = appState
  // createObservableHistory(appState)
  console.debug(`createObservableHistory`, createObservableHistory)

  module.hot['accept'](
    [
      './components/App',
      './mobx/NoteCollection',
      './mobx/NoteListView',
    ],
    _.tryCatch(() => {
      console.clear()
      mRunInAction('Hot Update States', () =>
        Object.assign(appState, ...createState()),
      )
      render()
    }, console.error),
  )
}
