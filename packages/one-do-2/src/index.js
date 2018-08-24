import React from 'react'
import ReactDOM from 'react-dom'
// import 'tachyons/css/tachyons.min.css'
// import './index.css'
import registerServiceWorker from './registerServiceWorker'
import {sugarExtend} from './lib/little-ramda'
import {tryCatch} from './lib/exports-ramda'

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
  module.hot.accept(
    ['./App'],
    tryCatch(data => {
      render()
    })(console.error),
  )

  module.hot.addStatusHandler(
    tryCatch(status => {
      if (status === 'check') {
        console.clear()
        console.groupCollapsed('[HMR] checking')
      }
      if (!['accept', 'idle'].includes(status)) {
        console.log(`status`, status)
      }
      if (['dispose'].includes(status)) {
        console.groupEnd()
        console.groupEnd()
        console.groupCollapsed('[HMR] disposing')
      } else if (['apply'].includes(status)) {
        console.groupEnd()
      } else if (['fail'].includes(status)) {
        console.groupEnd()
        console.warn('HMR failed reloading...')
      }
    })(console.error),
  )
}

render()
registerServiceWorker()
