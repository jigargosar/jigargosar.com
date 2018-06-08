import React, {Component, Fragment as F} from 'react'
import {inject, observer} from 'mobx-react'

const R = require('ramda')
const RA = require('ramda-adjunct')

const centeredContentClass = 'center mw7 mv3 ph3'
const App = R.compose(inject('root'), observer)(
  class App extends Component {
    render() {
      const {pageTitle} = this.props.root
      return (
        <F>
          <div className="bg-light-blue tc pa3">
            <div className="f1">{pageTitle}</div>
            {/*<div>${signInOutView(state, emit)}</div>*/}
          </div>
          <div className={`flex ${centeredContentClass}`}>LIST</div>
        </F>
      )
    }
  },
)
export default App
