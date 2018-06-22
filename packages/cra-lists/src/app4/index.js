/*eslint-disable*/

import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from '../registerServiceWorker'

/*eslint-enable*/

function render() {
  const App = require('./components/App').default
  ReactDOM.render(<App />, document.getElementById('root'))
}

render()

registerServiceWorker()

if (module.hot) {
  module.hot.accept(['./App'], () => {
    render()
  })
}
