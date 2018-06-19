/*eslint-disable no-empty-pattern*/

/*eslint-disable*/
import React, {Fragment as F} from 'react'
import PT from 'prop-types'
import cn from 'classnames'
import {injectState, M} from '../StateContext'
import {Link, Route} from 'react-router-dom'

const m = require('mobx')
const R = require('ramda')
const RA = require('ramda-adjunct')

/*eslint-enable*/

const DashboardNav = injectState(
  class DashboardNav extends M {
    r({}) {
      return (
        <Route
          children={({match}) => {
            // console.log('R.merge(match, location)')
            // console.table(R.merge(match, location))
            const id = match.params.id
            return (
              <F>
                {id && (
                  <Link className={cn('link blue')} to={match.url}>
                    {` ${id} > `}
                  </Link>
                )}
                <Route
                  path={`${match.url}/:id`}
                  component={DashboardNav}
                />
              </F>
            )
          }}
        />
      )
    }
  },
)
DashboardNav.propTypes = {
  className: PT.string,
}

export default DashboardNav
