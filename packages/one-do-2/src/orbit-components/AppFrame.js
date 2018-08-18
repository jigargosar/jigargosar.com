import '../stores/init-mobx'
import React, {Component, Fragment} from 'react'
import {observer} from '../lib/little-react'
import {disposable} from '../lib/hoc'

@disposable
@observer
class AppFrame extends Component {
  componentDidMount() {}

  render() {
    return (
      <Fragment>
        <h1>Orbit Tasks</h1>
      </Fragment>
    )
  }
}

export default AppFrame
