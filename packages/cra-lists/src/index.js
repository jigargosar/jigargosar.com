import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import {Provider} from 'mobx-react'
import {rootStore} from './stores/rootStore'
import {autorun} from 'mobx'

function render() {
  const App = require('./App').default
  ReactDOM.render(
    <Provider root={rootStore}>
      <App />
    </Provider>,
    document.getElementById('root'),
  )
}

render()

autorun(() => {
  document.title = rootStore.pageTitle
})

if (module.hot) {
  module.hot.accept('./App', () => {
    render()
  })
}

registerServiceWorker()
