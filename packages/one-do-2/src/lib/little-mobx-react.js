import React from 'react'
import {observer} from './little-react'

@observer
class Component extends React.Component {
  render() {
    return this.ren()
  }

  ren(props = this.props) {
    return null
  }
}
