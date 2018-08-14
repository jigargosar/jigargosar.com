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
}
