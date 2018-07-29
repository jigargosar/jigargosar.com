import React, {Component} from 'react'
import PropTypes from 'prop-types'

class CFP extends Component {
  render() {
    const {comp, ...other} = this.props
    return React.createElement(comp, other)
  }
}

CFP.propTypes = {
  comp: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
}

CFP.defaultProps = {
  comp: 'div',
}

export default CFP
