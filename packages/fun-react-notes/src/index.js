import React from 'react'
import ReactDOM from 'react-dom'
import 'tachyons/css/tachyons.min.css'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import {hmrBoot, sugarExtend} from './little-ramda'

sugarExtend()

function render(App = require('./App').default) {
  ReactDOM.render(<App />, document.getElementById('root'))
}

hmrBoot(module, render, ['./App'])

render()
registerServiceWorker()
