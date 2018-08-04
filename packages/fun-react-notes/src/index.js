import React from 'react'
import ReactDOM from 'react-dom'
import 'tachyons/css/tachyons.min.css'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import {hmrBoot, sugarExtend} from './little-ramda'

sugarExtend()

function render(type = require('./App').default) {
  ReactDOM.render(
    React.createElement(type),
    document.getElementById('root'),
  )
}

hmrBoot(module, render, ['./App'])

render()
registerServiceWorker()
