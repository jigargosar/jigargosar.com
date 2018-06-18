// Foo

/*eslint-disable*/
import React, {Fragment as F, Component as C} from 'react'
import PT from 'prop-types'
import cn from 'classnames'
import {Link, NavLink, Route} from 'react-router-dom'
import Dashboard from './Dashboard'

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

class App extends C {
  state = {}

  render() {
    const {} = this.props
    return (
      <div>
        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </nav>
        <div>
          <Route path="/dashboard" component={Dashboard} />
        </div>
      </div>
    )
  }
}

App.propTypes = {}

export default App
