import React, {Fragment as F} from 'react'
import {inject, observer} from 'mobx-react'

const R = require('ramda')

const centeredContentClass = 'center mw7 mv3 ph3'

const injectS = R.compose(inject('s'), observer)

const Counter = injectS(function Counter({s}) {
  return (
    <div className={`${centeredContentClass}`}>
      <div>Counter : {s.counter}</div>
      <div>
        <button onClick={() => s.inc(1)}>+</button>
        <button onClick={() => s.dec(1)}>-</button>
        <button onClick={() => s.reset()}>reset</button>
      </div>
    </div>
  )
})

const Header = injectS(function Header({s}) {
  return (
    <div className="bg-light-blue tc pa3">
      <div className="f1">{s.pageTitle}</div>
      {/*<div>${signInOutView(state, emit)}</div>*/}
    </div>
  )
})

const GrainItem = injectS(function GrainItem({item}) {
  return <div>{item}</div>
})

const GrainsList = injectS(function GrainsList() {
  const list = [1, 2, 3]
  return (
    <div>
      {R.map(item => <GrainItem key={item} item={item} />)(list)}
    </div>
  )
})

const App = injectS(function App() {
  return (
    <F>
      <Header />
      <div className={`${centeredContentClass}`}>
        <div>LIST</div>
        <GrainsList />
      </div>
      <Counter />
    </F>
  )
})

export default App
