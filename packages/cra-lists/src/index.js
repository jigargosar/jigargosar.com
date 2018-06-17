import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import {StateProvider} from './StateContext'

function render() {
  const App = require('./App').App
  const state = require('./mobx-stores/State').State()
  ReactDOM.render(
    <React.Fragment>
      <StateProvider value={state}>
        <App />
      </StateProvider>
      {/*<DevTools />*/}
    </React.Fragment>,
    document.getElementById('root'),
  )
}

render()

if (module.hot) {
  module.hot.accept(['./mobx-stores/State', './App'], () => {
    render()
  })
}

registerServiceWorker()
