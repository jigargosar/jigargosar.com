import React from 'react'
import ReactDOM from 'react-dom'
// import 'tachyons/css/tachyons.min.css'
// import './index.css'
import registerServiceWorker from './registerServiceWorker'
import {sugarExtend} from './lib/little-ramda'
import {hotDispose} from './lib/hot'

sugarExtend()

function render() {
  const type = require('./App').default
  ReactDOM.render(
    React.createElement(type),
    document.getElementById('root'),
  )
  require('tachyons/css/tachyons.min.css')
  require('./index.css')
}

if (module.hot) {
  console.log('Cold Boot')
  module.hot.accept(['./App'], data => {
    try {
      console.clear()
      // console.log('Hot Reload', data)
      render()
    } catch (e) {
      console.error('[index] hot accept', e)
    }
  })

  hotDispose(() => {
    debugger
  }, module)
}

render()
registerServiceWorker()
