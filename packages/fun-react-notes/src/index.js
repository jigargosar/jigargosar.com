import React from 'react'
import ReactDOM from 'react-dom'
import 'tachyons/css/tachyons.min.css'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
// import {AppContainer} from 'react-hot-loader'
import Sugar from 'sugar'
import {
  _compose,
  _when,
  always,
  curryN,
  defaultTo,
  isEmpty,
  length,
  nAry,
} from './ramda'

Sugar.extend()

Sugar.Function.defineInstance({
  l: nAry(2, (fn, name = 'wrapTapLog fn') => {
    const fnName = _compose(_when(isEmpty)(always(name)), defaultTo(''))(
      fn.name,
    )
    return curryN(length(fn), (...args) => {
      console.warn(`${fnName}`, 'in', args)
      const out = fn(...args)
      console.warn(fnName, 'out', out)
      return out
    })
  }),
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
