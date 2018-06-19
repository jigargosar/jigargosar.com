/*eslint-disable no-empty-pattern*/

/*eslint-disable*/
import React, {Fragment as F, Component as C} from 'react'
import PT from 'prop-types'
import cn from 'classnames'
import {injectState, M} from '../StateContext'
import * as mu from 'mobx-utils'

const m = require('mobx')
/*eslint-enable*/

const Dashboard = injectState(
  class Dashboard extends M {
    r({fire, auth}) {
      const userResult = fire.userDocFromPromise
      return userResult.case({
        pending: () => 'Loading...',
        fulfilled: docSnap => {
          return JSON.stringify(docSnap.data())
        },
        rejected: e => {
          console.error(e)
          return `Error ${e}`
        },
      })
    }
  },
)
Dashboard.propTypes = {
  className: PT.string,
}

export default Dashboard
