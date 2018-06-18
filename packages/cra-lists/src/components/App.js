// Foo

/*eslint-disable*/
import React, {Fragment as F, Component as C} from 'react'
import PT from 'prop-types'
import cn from 'classnames'
import {Link, NavLink, Route} from 'react-router-dom'
import Dashboard from './Dashboard'
import About from './About'
import Radium from 'radium'

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

const styles = {
  base: {
    background: 'blue',
    border: 0,
    borderRadius: 4,
    color: 'white',
    padding: '1.5em',

    ':hover': {
      backgroundColor: 'red',
    },

    ':focus': {
      backgroundColor: 'green',
    },

    ':active': {
      backgroundColor: 'yellow',
    },
  },

  block: {
    display: 'block',

    ':hover': {
      boxShadow: '0 3px 0 rgba(0,0,0,0.2)',
    },
  },

  box: {
    margin: '0 -0.5em',
  },

  boxItem: {
    margin: '0 0.5em',
  },
}

class App extends C {
  state = {}

  render() {
    const {} = this.props
    return (
      <div>
        <nav style={styles.box}>
          <NavLink style={styles.boxItem} to="/dashboard">
            Dashboard
          </NavLink>
          <NavLink style={styles.boxItem} to="/about">
            About
          </NavLink>
        </nav>
        <div>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/about" component={About} />
        </div>
      </div>
    )
  }
}

App.propTypes = {}

export default Radium(App)
