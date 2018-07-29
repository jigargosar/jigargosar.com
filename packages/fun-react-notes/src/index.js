import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

function render(App) {
  ReactDOM.render(<App />, document.getElementById('root'))
}

render(App)
registerServiceWorker()

if (module.hot) {
  module.hot.accept(['./App'], () => {
    console.clear()
    render(require('./App').default)
  })
}
