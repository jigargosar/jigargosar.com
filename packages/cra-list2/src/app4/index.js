import React from 'react'
import ReactDOM from 'react-dom'
// import './index.css'
import registerServiceWorker from '../registerServiceWorker'
import {mRunInAction, oObject} from './mobx/little-mobx'
import {dotPath, isNotNil, tryCatchLog} from './little-ramda'
import {Provider} from 'mobx-react'

const appState = oObject({}, {}, {name: 'appState'})

function render() {
  mRunInAction('Hot Update States', () => {
    if (isNotNil(dotPath('hot.data')(module))) {
      console.clear()
      console.log('Clearing Console on Hot Reload')
    } else {
      console.log('App Reloaded')
    }

    // Object.assign(appState, require('./mobx').state)
    Object.assign(
      appState,
      require('./mobx/ActiveRecordNotesState').state,
    )
    // const App = require('./components/Main').default
    // const App = require('./components/OutlinerMain').default
    // const App = require('./components/State').default
    const App = require('./components/ActiveRecord/Main').default
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
      './components/Main',
      './components/OutlinerMain',
      './components/ActiveRecord/Main',
      './mobx',
      './components/State',
    ],
    tryCatchLog(render),
  )
}
