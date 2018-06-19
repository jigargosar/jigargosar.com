// Foo

/*eslint-disable*/
import React, {Component as RC} from 'react'
import cn from 'classnames'
import {container, nh} from './class-names'
import {M} from '../StateContext'

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

class App extends M {
  r({auth}) {
    return (
      <div className={cn('.sans-serif lh-copy f5', container())}>
        HW {auth.state}
      </div>
    )
  }
}

App.propTypes = {}

export default App
