import {observer} from 'mobx-react'
import React from 'react'
import PropTypes from 'prop-types'
import {_} from '../../utils'
import {mAutoRun} from '../../mobx/little-mobx'
import ReactDOM from 'react-dom'

class FocusChild extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    shouldFocus: PropTypes.bool.isRequired,
  }

  disposer = _.F

  componentDidMount() {
    this.disposer = mAutoRun(
      () => {
        if (!this.props.shouldFocus) {
          return
        }
        const dom = ReactDOM.findDOMNode(this)
        requestAnimationFrame(() => {
          dom.focus()
        })
      },
      {name: 'FocusChild Component'},
    )
  }

  componentWillUnmount() {
    this.disposer()
  }

  render() {
    return this.props.children
  }
}

export default observer(FocusChild)
