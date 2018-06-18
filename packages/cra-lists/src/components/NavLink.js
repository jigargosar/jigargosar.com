// Foo

/*eslint-disable*/
import React, {Fragment as F, Component as C} from 'react'
import PT from 'prop-types'
import cn from 'classnames'
import {Link, Route} from 'react-router-dom'
/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

const NavLink = ({children, to}) => (
  <Route
    path={to}
    children={({match}) => (
      <Link
        className={cn('mh1 link', match ? 'orange' : 'blue')}
        to={to}
      >
        {children}
      </Link>
    )}
  />
)

NavLink.propTypes = {
  className: PT.string,
}

export default NavLink
