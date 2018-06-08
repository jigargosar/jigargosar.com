import React, {Fragment as F} from 'react'
import {inject, observer} from 'mobx-react'

const R = require('ramda')

const centeredContentClass = 'center mw7 mv3 ph3'
const App = R.compose(inject('root'), observer)(function App() {
  const root = this.props.root
  const {pageTitle, counter} = this.props.root
  return (
    <F>
      <div className="bg-light-blue tc pa3">
        <div className="f1">{pageTitle}</div>
        {/*<div>${signInOutView(state, emit)}</div>*/}
      </div>
      <div className={`flex ${centeredContentClass}`}>LIST</div>
      <div className={`flex ${centeredContentClass}`}>
        Counter : {counter}
        <button onClick={() => (root.counter += 1)}>+</button>
      </div>
    </F>
  )
})

export default App
