/*eslint-disable no-empty-pattern*/

/*eslint-disable*/
import React, {Fragment as F, Component as C} from 'react'
import PT from 'prop-types'
import cn from 'classnames'

/*eslint-enable*/

class Dashboard extends C {
  state = {}

  render() {
    const {className} = this.props
    return (
      <F>
        <div className={cn(className)}>Dashboard</div>
      </F>
    )
  }
}

Dashboard.propTypes = {
  className: PT.string,
}

export default Dashboard
