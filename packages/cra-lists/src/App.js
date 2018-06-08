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

const GrainsList = injectS(function GrainsList({s}) {
  return (
    <div>
      {R.addIndex(R.map)((item, idx) => (
        <GrainItem key={idx} item={item} />
      ))(s.list)}
    </div>
  )
})

const GrainListHeader = injectS(function GrainListHeader({s}) {
  return (
    <div className={'flex'}>
      <div>LIST</div>
      <div>
        <button onClick={() => s.addNew()}>Add</button>
      </div>
    </div>
  )
})
const App = injectS(function App() {
  return (
    <F>
      <Header />
      <div className={`${centeredContentClass}`}>
        <GrainListHeader />
        <GrainsList />
      </div>
      <Counter />
    </F>
  )
})

export default App
