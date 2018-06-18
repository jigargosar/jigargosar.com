// Foo

/*eslint-disable*/
import React, {Component as C} from 'react'
import cn from 'classnames'
import {Route, Switch} from 'react-router-dom'
import Dashboard from './Dashboard'
import About from './About'
import NavLink from './NavLink'
import {container, nh} from './class-names'
import {BrowserRouter} from 'react-router-dom'
/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

class App extends C {
  state = {}

  render() {
    const {Router} = this.props
    return (
      <Router>
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
      </Router>
    )
  }
}

App.propTypes = {}

export default App
