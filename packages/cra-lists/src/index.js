import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import {Provider} from 'mobx-react'
import App from './App'

function render() {
  ReactDOM.render(
    <Provider s={require('./stores/rootStore').state}>
      <App />
    </Provider>,
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
