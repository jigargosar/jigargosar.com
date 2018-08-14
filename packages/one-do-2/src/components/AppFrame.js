import React from 'react'
import {Component} from '../lib/little-mobx-react'
import {startStoreReactions, stopStoreReactions, store} from '../store'

class AppFrame extends Component {
  componentDidMount() {
    startStoreReactions()

    setInterval(() => {
      stopStoreReactions()
    }, 5000)
  }

  ren() {
    return <div>{store.counter}</div>
  }
}

export default AppFrame
