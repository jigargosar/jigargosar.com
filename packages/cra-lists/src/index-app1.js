import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import {StateProvider} from './StateContext'
const m = require('mobx')
let snapshot = {}

function render() {
  const App = require('./App').App
  const state = require('./mobx-stores/State').State(snapshot)
  m.autorun(() => {
    snapshot = state.getSnapshot()
    console.log(snapshot)
  })

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
