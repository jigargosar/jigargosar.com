import React from 'react'
import ReactDOM from 'react-dom'
import 'tachyons/css/tachyons.min.css'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
// import {AppContainer} from 'react-hot-loader'
import Sugar from 'sugar'
import {_, _compose, curryN, defaultTo, tap} from './little-ramda'

Sugar.extend()

export function tapLog2(msg) {
  return tap(args => console.warn(msg, args))
}

export const tapLog = tapLog2('tapLog')

export function wrapLog(fn) {
  const fnName = _compose(defaultTo('wrapTapLog fn'))(fn.name)
  return curryN(_.length(fn), (...args) => {
    console.warn(`${fnName}`, 'in', args)
    const out = fn(...args)
    console.warn(fnName, 'out', out)
    return out
  })
}

Sugar.Function.defineInstance({
  l: wrapLog,
})

function render(App = require('./App').default) {
  ReactDOM.render(
    <App />,
    // <AppContainer>
    //   <App />
    // </AppContainer>,
    document.getElementById('root'),
  )
}

if (module.hot) {
  console.log('Cold Boot')
  module.hot.accept(['./App'], () => {
    // console.clear()
    console.log('Hot Reload')
    render()
  })
}

render()
registerServiceWorker()
