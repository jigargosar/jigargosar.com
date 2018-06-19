/*eslint-disable no-empty-pattern*/

/*eslint-disable*/
import React, {Fragment as F} from 'react'
import PT from 'prop-types'
import {M} from '../StateContext'
import {withRouter} from 'react-router-dom'
import ReactJSON from 'react-json-view'
import DashboardNav from './DashboardNav'
import {FirebaseService} from '../mobx-stores/FirebaseService'

const m = require('mobx')
const R = require('ramda')
const RA = require('ramda-adjunct')

/*eslint-enable*/

function isDocPath(firestorePath) {
  return R.compose(
    RA.isEven,
    R.length,
    R.tap(console.log),
    R.split('/'),
  )(firestorePath)
}

const fp = m.observable.object(
  {
    _path: '',
    updatePath(path) {
      this._path = path
    },
    get p() {
      const firestorePath = this._path
      const fire = FirebaseService
      const fireFunction = isDocPath(firestorePath)
        ? fire.getFirestoreDocWithPath
        : fire.getFirestoreCollectionWithPath
      // debugger
      return fireFunction(R.clone(firestorePath))
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
      const userDocResult = fire.userDocFromPromise
      // const firestorePath = R.replace(
      //   /^\/dashboard\/?/,
      //   '',
      //   location.pathname,
      // )
      // const fireFunction = (isDocPath(firestorePath)
      //   ? fire.getFirestoreDocWithPath
      //   : fire.getFirestoreCollectionWithPath)
      // fp.updatePath(firestorePath, fire)
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
                  <ReactJSON name={'user'} src={docSnap.data()} />
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
              debugger
              return (
                <F>
                  <ReactJSON
                    name={'d/c'}
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
