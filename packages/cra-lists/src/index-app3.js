/*eslint-disable*/

import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import {StateProvider} from './StateContext'

/*eslint-enable*/

function render() {
  const App = require('./app3/App').default
  ReactDOM.render(
    <StateProvider value={require('./app3/State').default}>
      <App />
    </StateProvider>,
    document.getElementById('root'),
  )
}

render()

registerServiceWorker()

if (module.hot) {
  module.hot.accept(['./app3/App', './app3/State'], () => {
    render()
  })
}
