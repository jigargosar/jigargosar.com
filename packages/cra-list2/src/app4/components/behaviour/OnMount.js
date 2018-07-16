import {lifecycle} from 'recompose'
import PropTypes from 'prop-types'

const OnMount = lifecycle({
  componentDidMount() {
    this.props.onMount()
  },
})(() => null)

OnMount.propTypes = {
  onMount: PropTypes.func.isRequired,
}

export {OnMount}
