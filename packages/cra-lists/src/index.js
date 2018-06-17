import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import {StateProvider} from './StateContext'
import {State} from './mobx-stores/State'

function render() {
  const App = require('./App').App
  ReactDOM.render(
    <StateProvider value={State}>
      <App />
    </StateProvider>,
    document.getElementById('root'),
  )
}

render()

if (module.hot) {
  module.hot.accept(['./App', './state-loader'], () => {
    render()
  })
}

registerServiceWorker()
