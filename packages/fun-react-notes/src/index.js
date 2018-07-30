import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import {AppContainer} from 'react-hot-loader'

function render(App) {
  ReactDOM.render(
    <AppContainer>
      <App />
    </AppContainer>,
    document.getElementById('root'),
  )
}

render(App)
registerServiceWorker()

if (module.hot) {
  console.log('CMR')
  module.hot.accept(['./App'], () => {
    console.clear()
    console.log('HMR')
    render(require('./App').default)
  })
}
