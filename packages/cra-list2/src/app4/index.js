import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from '../registerServiceWorker'
import {mRunInAction, oObject} from './mobx/utils'
import {_} from './utils'
import {Provider} from 'mobx-react'
import {initExtension} from './extension'

const appState = oObject(getState(), {}, {name: 'appState'})

function getState() {
  return require('./mobx/index.js').createState()
}

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

  module.hot['accept'](
    ['./components/App', './mobx/index.js'],
    _.tryCatch(() => {
      // console.clear()
      appState.disposer()
      mRunInAction('Hot Update States', () =>
        Object.assign(
          appState,
          ...require('./mobx/index.js').createState(),
        ),
      )
      render()
    }, console.error),
  )
}
