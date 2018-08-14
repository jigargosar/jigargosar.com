import React from 'react'
import {Component} from '../lib/little-mobx-react'
import {observable} from '../lib/mobx'

class AppFrame extends Component {
  @observable counter = 0

  componentDidMount() {
    setInterval(() => {
      this.counter++
    }, 0)
  }

  ren() {
    return <div>{this.counter}</div>
  }
}

export default AppFrame
