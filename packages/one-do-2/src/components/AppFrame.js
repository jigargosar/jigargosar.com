import React from 'react'
import {Component} from '../lib/little-mobx-react'
import {startStoreReactions, store} from '../store'

startStoreReactions()

class AppFrame extends Component {
  ren() {
    return <div>{store.counter}</div>
  }
}

export default AppFrame
