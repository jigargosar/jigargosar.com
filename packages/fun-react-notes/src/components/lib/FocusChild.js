import {observer} from 'mobx-react'
import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import {disposable} from '../hoc'

@disposable
@observer
class FocusChild extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    shouldFocus: PropTypes.bool.isRequired,
  }

  componentDidMount() {
    this.props.autorun(
      () => {
        if (!this.props.shouldFocus) {
          return
        }
        const dom = ReactDOM.findDOMNode(this)
        dom.focus()
        requestAnimationFrame(() => {
          dom.focus()
        })
      },
      {name: 'FocusChild Component'},
    )
  }

  render() {
    return this.props.children
  }
}

export default FocusChild
