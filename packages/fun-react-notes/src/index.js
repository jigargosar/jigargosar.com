import React from 'react'
import ReactDOM from 'react-dom'
import 'tachyons/css/tachyons.min.css'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
// import {AppContainer} from 'react-hot-loader'
import Sugar from 'sugar'

Sugar.extend()

function render(App) {
  ReactDOM.render(
    <App />,
    // <AppContainer>
    //   <App />
    // </AppContainer>,
    document.getElementById('root'),
  )
}

render(App)
registerServiceWorker()

if (module.hot) {
  console.log('Cold Boot')
  module.hot.accept(['./App'], () => {
    console.clear()
    console.log('Hot Reload')
    render(require('./App').default)
  })
}
