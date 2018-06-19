/*eslint-disable no-empty-pattern*/

/*eslint-disable*/
import React, {Fragment as F} from 'react'
import PT from 'prop-types'
import cn from 'classnames'
import {injectState, M} from '../StateContext'
import {Link, Redirect, Route, withRouter} from 'react-router-dom'
import ReactJSON from 'react-json-view'
import DashboardNav from './DashboardNav'

const m = require('mobx')
const R = require('ramda')
const RA = require('ramda-adjunct')

/*eslint-enable*/

const Dashboard = R.compose(withRouter, injectState)(
  class Dashboard extends M {
    inputRef = React.createRef()
    r({fire, auth, match, location, history}) {
      console.log('R.merge(match, location)')
      console.table(R.merge(match, location))
      const userDocResult = fire.userDocFromPromise
      return (
        <F>
          <DashboardNav />
          <form
            onSubmit={e => {
              e.preventDefault()
              // this.forceUpdate()
              history.push(
                `${location.pathname}/${this.inputRef.current.value}`,
              )
              this.forceUpdate()
            }}
          >
            <input ref={this.inputRef} />
          </form>
          {userDocResult.case({
            pending: () => 'Loading...',
            fulfilled: docSnap => {
              return (
                <F>
                  <ReactJSON name={'user'} src={docSnap.data()} />
                </F>
              )
            },
            rejected: e => {
              console.error(e)
              return `Error ${e}`
            },
          })}
        </F>
      )
    }
  },
)
Dashboard.propTypes = {
  className: PT.string,
}

export default Dashboard
