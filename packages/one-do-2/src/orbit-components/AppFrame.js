import '../stores/init-mobx'
import React, {Component, Fragment} from 'react'
import {observer} from '../lib/little-react'
import {disposable} from '../lib/hoc'
import {createStore} from '../orbit-stores/store'
import {isNil} from '../lib/ramda'

@disposable
@observer
class AppFrame extends Component {
  state = {
    store: null,
  }

  componentDidMount() {
    createStore().then(store => {
      this.setState({store})
    })
  }

  get isLoadingStore() {
    return isNil(this.state.store)
  }

  render() {
    return (
      <Fragment>
        <h1>Orbit Tasks</h1>
        <div>{`isLoadingStore=${this.isLoadingStore}`}</div>
      </Fragment>
    )
  }
}

export default AppFrame
