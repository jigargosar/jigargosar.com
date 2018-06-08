import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import {StateProvider} from './StateContext'

function render() {
  const App = require('./App').default
  ReactDOM.render(
    <StateProvider value={require('./state-loader').state}>
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
