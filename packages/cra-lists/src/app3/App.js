// Foo

/*eslint-disable*/
import React, {Component as C} from 'react'
import cn from 'classnames'
import {container, nh} from './class-names'
import {BrowserRouter} from 'react-router-dom'
/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

class App extends C {
  render() {
    const {} = this.props
    return (
      <div className={cn('.sans-serif lh-copy f5', container())}>
        HW
      </div>
    )
  }
}

App.propTypes = {}

export default App
