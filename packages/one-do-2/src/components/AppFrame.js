import React from 'react'
import {Component} from '../lib/little-mobx-react'
import {startStoreReactions, stopStoreReactions, store} from '../store'
import {disposable} from '../lib/hoc'

@disposable
class AppFrame extends Component {
  componentDidMount() {
    console.debug(`this.props`, this.props)
    startStoreReactions()

    this.setInterval(() => {
      stopStoreReactions()
    }, 5001)
  }

  ren() {
    return <div>{store.counter}</div>
  }
}

export default AppFrame
