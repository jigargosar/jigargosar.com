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
import Auth from './Auth'
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

function renderNav() {
  return (
    <nav className={cn(nh(1), 'flex')}>
      {routes.map(({path, label}, index) => {
        if (!path || !label) return null
        return (
          <NavLink key={index} to={path}>
            {label}
          </NavLink>
        )
      })}
      <div className={'flex-auto'} />
      <Auth />
    </nav>
  )
}

function renderRoutes() {
  return (
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
  )
}

class App extends C {
  state = {}

  render() {
    const {} = this.props
    return (
      <div className={cn('.sans-serif f5', container())}>
        {renderNav()}
        {renderRoutes()}
      </div>
    )
  }
}

App.propTypes = {}

export default App
