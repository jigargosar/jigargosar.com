import React from 'react'
import ReactDOM from 'react-dom'
import 'tachyons/css/tachyons.min.css'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import {sugarExtend} from './little-ramda'

sugarExtend()

function render(App = require('./App').default) {
  ReactDOM.render(<App />, document.getElementById('root'))
}

if (module.hot) {
  console.log('Cold Boot')
  module.hot.accept(['./App'], () => {
    console.clear()
    console.log('Hot Reload')
    render()
  })
}

render()
registerServiceWorker()
