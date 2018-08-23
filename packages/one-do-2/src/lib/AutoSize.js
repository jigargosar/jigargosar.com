import {Component} from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import autosize from 'autosize'

export class AutoSize extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  }

  get inputDOM() {
    return ReactDOM.findDOMNode(this)
  }

  componentDidMount() {
    autosize(this.inputDOM)
    // autosize.update(this.inputDOM)
  }

  componentDidUpdate() {
    autosize.update(this.inputDOM)
  }

  componentWillUnmount() {
    autosize.destroy(this.inputDOM)
  }

  render() {
    return this.props.children
  }
}
