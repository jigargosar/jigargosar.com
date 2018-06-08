import React, {Fragment as F} from 'react'
import {inject, observer} from 'mobx-react'

const R = require('ramda')

const centeredContentClass = 'center mw7 mv3 ph3'

const injectS = R.compose(inject('s'), observer)

const Counter = injectS(function Counter({s}) {
  return (
    <div className={`flex flex-column ${centeredContentClass}`}>
      <div>Counter : {s.counter}</div>
      <div>
        <button onClick={() => s.inc(1)}>+</button>
        <button onClick={() => s.dec(1)}>-</button>
        <button onClick={() => s.reset()}>reset</button>
      </div>
    </div>
  )
})

function App({s}) {
  return (
    <F>
      <div className="bg-light-blue tc pa3">
        <div className="f1">{s.pageTitle}</div>
        {/*<div>${signInOutView(state, emit)}</div>*/}
      </div>
      <div className={`flex ${centeredContentClass}`}>LIST</div>
      <Counter />
    </F>
  )
}

export default injectS(App)
