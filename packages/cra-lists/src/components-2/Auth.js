// Foo

/*eslint-disable*/
import React, {Fragment as F, Component as C} from 'react'
import PT from 'prop-types'
import cn from 'classnames'
import {FireAuth} from '../lib/Fire'
import Fire from '../lib/Fire'
import * as R from 'ramda'
import RA from 'ramda-adjunct'
import {nh} from './class-names'
import {M} from '../StateContext'

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/
class Auth extends M {
  r({auth}) {
    const renderAuthState = R.cond([
      [
        R.equals('signedIn'),
        () => (
          <div className={cn(nh(1))}>
            <div className={'dib mh1'}>{auth.displayName}</div>
            <button
              className={'input-reset f5 link blue mh1 mv0'}
              onClick={auth.signOut}
            >
              SignOut
            </button>
          </div>
        ),
      ],
      [
        R.equals('signedOut'),
        () => <button onClick={auth.signIn}>SignIn</button>,
      ],
      [R.T, () => <div>Loading...</div>],
    ])
    return <div className={'dib'}>{renderAuthState(auth.state)}</div>
  }
}

Auth.propTypes = {
  className: PT.string,
}

export default Auth
