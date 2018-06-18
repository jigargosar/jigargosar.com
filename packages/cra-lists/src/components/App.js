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

const routes = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    component: Dashboard,
  },
  {
    label: 'About',
    path: '/about',
    component: About,
  },
  {
    children: ({location: {pathname}}) => {
      return `Page Not Found at ${pathname}`
    },
  },
]

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
            {routes.map(({path, component, children}, index) => {
              return (
                <Route
                  key={index}
                  path={path}
                  component={component}
                  children={children}
                />
              )
            })}
            />
          </Switch>
        </div>
      </div>
    )
  }
}

App.propTypes = {}

export default App
