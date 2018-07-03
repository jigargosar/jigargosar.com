import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from '../registerServiceWorker'
import {mRunInAction, oObject} from './mobx/utils'
import {tryCatchLogError} from './utils'
import {Provider} from 'mobx-react'

const appState = oObject({}, {}, {name: 'appState'})

function render() {
  mRunInAction('Hot Update States', () => {
    // console.clear()
    Object.assign(appState, require('./mobx').state)
    appState.foo = 1
    const App = require('./components/Main').default
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
    ['./components/Main', './mobx'],
    tryCatchLogError(render),
  )
}
