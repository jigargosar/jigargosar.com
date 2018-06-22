/*eslint-disable*/

import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from '../registerServiceWorker'
import {StateProvider} from '../StateContext'

/*eslint-enable*/

function render() {
  const App = require('./App').default
  ReactDOM.render(
    <StateProvider value={require('./State').default}>
      <App />
    </StateProvider>,
    document.getElementById('root'),
  )
}

render()

registerServiceWorker()

if (module.hot) {
  module.hot.accept(['./App', './State'], () => {
    render()
  })
}
