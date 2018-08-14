import React from 'react'
import {observer} from './little-react'

@observer
export class Component extends React.Component {
  render() {
    return this.ren()
  }

  ren(props = this.props) {
    return null
  }

  get setInterval() {
    return this.props.setInterval
  }

  get autorun() {
    return this.props.autorun
  }

  get reaction() {
    return this.props.reaction
  }

  get addDisposer() {
    return this.props.addDisposer
  }
}
