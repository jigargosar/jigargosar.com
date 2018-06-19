// Foo

/*eslint-disable*/
import React, {Fragment as F, Component as C} from 'react'
import PT from 'prop-types'
import cn from 'classnames'
/*eslint-enable*/

/*eslint-disable no-empty-pattern*/
class About extends C {
  state = {}

  render() {
    const {className} = this.props
    return (
      <F>
        <div className={cn(className)}>About</div>
      </F>
    )
  }
}

About.propTypes = {
  className: PT.string,
}

export default About
