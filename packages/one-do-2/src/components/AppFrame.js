import React from 'react'
import {Component} from '../lib/little-mobx-react'
import {observable} from '../lib/mobx'

const store = observable({
  counter: 0,
})

setInterval(() => {
  store.counter++
}, 0)

class AppFrame extends Component {
  ren() {
    return <div>{store.counter}</div>
  }
}

export default AppFrame
