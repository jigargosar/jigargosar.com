import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import App from './components/App'

function render(App) {
  ReactDOM.render(<App />, document.getElementById('root'))
}

render(App)

registerServiceWorker()

if (module.hot) {
  module.hot.accept(['./components/App'], () => {
    render(require('./components/App'))
  })
}
