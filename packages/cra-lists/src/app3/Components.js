// Foo

/*eslint-disable*/
import React, {Component as RC} from 'react'
import cn from 'classnames'
import {container, nh} from './class-names'
import {M} from '../StateContext'
import {Button} from './UI'

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

export class SignInButton extends M {
  r({auth}) {
    return <Button onClick={auth.signIn}>SignIn</Button>
  }
}
export class SignOutButton extends M {
  r({auth}) {
    return <Button onClick={auth.signOut}>SignOut</Button>
  }
}

export class UserDisplayName extends M {
  r({auth}) {
    return <div className={'dib mh1'}>{auth.displayName}</div>
  }
}
