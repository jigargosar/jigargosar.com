import '../stores/init-mobx'
import React, {Component, Fragment} from 'react'
import {observer} from '../lib/little-react'
import {disposable} from '../lib/hoc'
import {createStore} from '../orbit-stores/store'
import {isNil} from '../lib/ramda'
import {action, observable} from '../lib/mobx'

@disposable
@observer
class AppFrame extends Component {
  @observable store = null
  state = {
    // store: null,
  }

  @action
  setStore(store) {
    this.store = store
  }

  componentDidMount() {
    createStore().then(store => {
      // this.setState({store})
      this.setStore(store)
    })
  }

  render() {
    return (
      <Fragment>
        <h1>Orbit Tasks</h1>
        <div>{`isNil(this.state.store)=${isNil(this.state.store)}`}</div>
        <div>{`isNil(this.store)=${isNil(this.store)}`}</div>
      </Fragment>
    )
  }
}

export default AppFrame
