import React, {Component, Fragment as F} from 'react'

const centeredContentClass = 'center mw7 mv3 ph3'
class App extends Component {
  render() {
    const TITLE = 'CRA List Prototype'
    return (
      <F>
        <div className="bg-light-blue tc pa3">
          <div className="f1">{TITLE}</div>
          {/*<div>${signInOutView(state, emit)}</div>*/}
        </div>
        <div className={`flex ${centeredContentClass}`}>LIST</div>
      </F>
    )
  }
}

export default App
