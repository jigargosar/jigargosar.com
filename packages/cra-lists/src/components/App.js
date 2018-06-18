// Foo

/*eslint-disable*/
import React, {Fragment as F, Component as C} from 'react'
import PT from 'prop-types'
import cn from 'classnames'
import {Link, NavLink, Route} from 'react-router-dom'
import Dashboard from './Dashboard'
import About from './About'

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

class App extends C {
  state = {}

  render() {
    const {} = this.props
    return (
      <div className={cn('.sans-serif f5 center mw7 mv3 ph3')}>
        <nav className={'nr1 nl1'}>
          <NL to="/dashboard">Dashboard</NL>
          <NL to="/about">About</NL>
        </nav>
        <div>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/about" component={About} />
        </div>
      </div>
    )
  }
}

const NL = ({children, to}) => (
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

App.propTypes = {}

export default App
