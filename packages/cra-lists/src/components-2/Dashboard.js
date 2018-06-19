/*eslint-disable no-empty-pattern*/

/*eslint-disable*/
import React, {Fragment as F} from 'react'
import PT from 'prop-types'
import {M} from '../StateContext'
import {withRouter} from 'react-router-dom'
import ReactJSONView from 'react-json-view'
import DashboardNav from './DashboardNav'
import {FirebaseService} from '../mobx-stores/FirebaseService'

const m = require('mobx')
const R = require('ramda')
const RA = require('ramda-adjunct')

/*eslint-enable*/

const fp = m.observable.object(
  {
    _path: '',
    updatePath(path) {
      this._path = path
    },
    get p() {
      // debugger
      return FirebaseService.store.getFromUserPath(
        R.clone(this._path),
      )
    },
  },
  {updatePath: m.action.bound},
  {name: 'fp'},
)
const Dashboard = withRouter(
  class Dashboard extends M {
    componentDidMount() {
      const firestorePath = R.replace(
        /^\/dashboard\/?/,
        '',
        this.props.location.pathname,
      )
      fp.updatePath(firestorePath)
      this.forceUpdate()
    }

    componentDidUpdate() {
      const firestorePath = R.replace(
        /^\/dashboard\/?/,
        '',
        this.props.location.pathname,
      )
      fp.updatePath(firestorePath)
    }

    inputRef = React.createRef()

    r({fire, auth, match, location, history}) {
      // console.log('R.merge(match, location)')
      // console.table(R.merge(match, location))
      const userDocResult = fire.store.userDoc
      console.debug(location)
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
              // this.forceUpdate()
            }}
          >
            <input ref={this.inputRef} />
          </form>
          {userDocResult.case({
            pending: () => 'Loading...',
            fulfilled: docSnap => {
              return (
                <F>
                  <ReactJSONView
                    collapseStringsAfterLength={10}
                    displayDataTypes={false}
                    collapsed={1}
                    indentWidth={2}
                    name={'user'}
                    src={docSnap.data()}
                  />
                </F>
              )
            },
            rejected: e => {
              console.error(e)
              return `Error ${e}`
            },
          })}

          {fp.p.case({
            pending: () => 'Loading...',
            fulfilled: docSnap => {
              return (
                <F>
                  <ReactJSONView
                    name={'d/c'}
                    displayDataTypes={false}
                    collapseStringsAfterLength={10}
                    collapsed={2}
                    indentWidth={2}
                    groupArraysAfterLength={5}
                    onSelect={console.warn}
                    src={
                      docSnap.data
                        ? docSnap.data()
                        : R.map(s => s.data(), docSnap.docs)
                    }
                  />
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
