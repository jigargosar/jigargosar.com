import React, {Fragment as F, Component as C} from 'react'
import PT from 'prop-types'
import cn from 'classnames'

class App extends C {
  state = {}

  render() {
    const {className} = this.props
    return (
      <F>
        <div className={cn(className)}>App</div>
      </F>
    )
  }
}

App.propTypes = {
  className: PT.string,
}

export default App
