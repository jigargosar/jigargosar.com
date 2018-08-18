import React, {Component, Fragment} from 'react'
import {observer} from '../lib/little-react'

@observer
class AppFrame extends Component {
  render() {
    return <Fragment>Orbit Tasks</Fragment>
  }
}

export default AppFrame
