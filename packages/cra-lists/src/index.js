import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import {StateProvider} from './StateContext'

function getState() {
  return require('./stores/rootStore').state
}

function render() {
  const App = require('./App').default
  ReactDOM.render(
    <StateProvider value={getState()}>
      <App />
    </StateProvider>,
    document.getElementById('root'),
  )
}

render()

if (module.hot) {
  module.hot.accept(['./App', './stores/rootStore'], () => {
    render()
  })
}

registerServiceWorker()
