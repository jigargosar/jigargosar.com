// Foo

/*eslint-disable*/
import React, {Component as RC} from 'react'
import cn from 'classnames'
import {container, nh} from '../class-names'

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

class App extends RC {
  render() {
    return (
      <div className={cn('.sans-serif lh-copy f5', container())}>
        <div className={cn('mb3')}>
          <div>Notes</div>
        </div>
        <div>Notes List</div>
      </div>
    )
  }
}

App.propTypes = {}

export default App
