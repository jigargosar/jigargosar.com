// Foo

/*eslint-disable*/
import React, {Component as RC} from 'react'
import cn from 'classnames'
import {container, nh} from './class-names'
import {M} from '../StateContext'
import {Button} from './UI'
import {
  Auth,
  SignInButton,
  SignOutButton,
  UserDisplayName,
} from './Components'
import {Notes} from './Components/Notes'

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

class App extends M {
  r({auth}) {
    return (
      <div className={cn('.sans-serif lh-copy f5', container())}>
        <div className={cn('mb3')}>
          <div className={cn('dib mh1')}>{auth.state}</div>
          <Auth />
        </div>
        <Notes />
      </div>
    )
  }
}

App.propTypes = {}

export default App
