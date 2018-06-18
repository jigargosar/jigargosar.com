/*eslint-disable no-empty-pattern*/
import React, {Fragment as F, Component as C} from 'react'
import PT from 'prop-types' // eslint-disable-line
import cn from 'classnames' // eslint-disable-line

class App extends C {
  state = {}

  render() {
    const {} = this.props
    return (
      <F>
        <div className={''}>App</div>
      </F>
    )
  }
}

App.propTypes = {}

export default App
