// Foo

/*eslint-disable*/
import React, {Component as RC, Fragment as F} from 'react'
import cn from 'classnames'
import {container, nh} from './class-names'
import {M} from '../StateContext'
import {Button} from './UI'

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

export class SignInButton extends M {
  r({auth}) {
    return (
      auth.isSignedOut && (
        <Button onClick={auth.signIn}>SignIn</Button>
      )
    )
  }
}
export class SignOutButton extends M {
  r({auth}) {
    return (
      auth.isSignedIn && (
        <Button onClick={auth.signOut}>SignOut</Button>
      )
    )
  }
}

export class UserDisplayName extends M {
  r({auth}) {
    return (
      auth.isSignedIn && (
        <div className={'dib mh1'}>{auth.displayName}</div>
      )
    )
  }
}

export class AuthLoading extends M {
  r({auth}) {
    return (
      !auth.isAuthKnown && (
        <div className={'dib mh1'}>'Loading...'</div>
      )
    )
  }
}

export class Auth extends M {
  r({auth}) {
    return (
      <F>
        <AuthLoading />
        <UserDisplayName />
        <SignOutButton />
        <SignInButton />
      </F>
    )
  }
}
