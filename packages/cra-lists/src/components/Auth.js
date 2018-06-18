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

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/
class Auth extends C {
  fire = Fire()
  auth = FireAuth(this.fire)
  state = {}

  componentDidMount() {
    this.authDisposer = this.auth.on('*', () => {
      this.forceUpdate()
    })
  }

  componentWillUnmount() {
    if (this.authDisposer) {
      this.authDisposer()
    }
  }

  render() {
    const {} = this.props

    const renderAuthState = R.cond([
      [
        R.equals('signedIn'),
        () => (
          <div className={cn(nh(1))}>
            <div className={'dib mh1'}>{this.auth.displayName}</div>
            <button
              className={'input-reset f5 link blue mh1 mv0'}
              onClick={this.auth.signOut}
            >
              SignOut
            </button>
          </div>
        ),
      ],
      [
        R.equals('signedOut'),
        () => <button onClick={this.auth.signIn}>SignIn</button>,
      ],
      [R.T, () => <div>Loading...</div>],
    ])
    return (
      <div className={'dib'}>
        {/*<div className={cn(className)}>{this.auth.state}</div>*/}
        {renderAuthState(this.auth.state)}
      </div>
    )
  }
}

Auth.propTypes = {
  className: PT.string,
}

export default Auth
