import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from '../registerServiceWorker'
import {mRunInAction, oObject} from './mobx/utils'
import {createObservableHistory} from './mobx/utils/StateHistory'
import {_} from './utils'
import {Provider} from 'mobx-react'
import {initExtension} from './extension'

function getState() {
  return require('./mobx').createState()
}

const appState = oObject(getState(), {}, {name: 'appState'})

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

initExtension(appState).catch(console.error)

if (module.hot) {
  window.s = appState
  // createObservableHistory(appState)
  console.debug(`createObservableHistory`, createObservableHistory)

  module.hot['accept'](
    ['./components/App', './mobx'],
    _.tryCatch(() => {
      // console.clear()
      mRunInAction('Hot Update States', () =>
        Object.assign(appState, ...getState()),
      )
      render()
    }, console.error),
  )
}
