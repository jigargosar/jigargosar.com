// Foo

/*eslint-disable*/
import React, {Component as C} from 'react'
import cn from 'classnames'
import {Link, Route, Switch} from 'react-router-dom'
import Dashboard from './Dashboard'
import About from './About'

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

function nh(num) {
  return `nr${num} nl${num}`
}

function container() {
  return 'center mw7 mv3 ph3'
}

class App extends C {
  state = {}

  render() {
    const {} = this.props
    return (
      <div className={cn('.sans-serif f5', container())}>
        <nav className={cn(nh(1))}>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
        <div>
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/about" component={About} />
            <Route
              children={({location: {pathname}}) => {
                return `Page Not Found at ${pathname}`
              }}
            />
          </Switch>
        </div>
      </div>
    )
  }
}

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

App.propTypes = {}

export default App
