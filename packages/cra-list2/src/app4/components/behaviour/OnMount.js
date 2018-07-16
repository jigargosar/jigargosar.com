import PropTypes from 'prop-types'
import {lifecycle} from '../utils'

const OnMount = lifecycle({
  componentDidMount() {
    this.props.onMount()
  },
})(() => null)

OnMount.propTypes = {
  onMount: PropTypes.func.isRequired,
}

export {OnMount}
