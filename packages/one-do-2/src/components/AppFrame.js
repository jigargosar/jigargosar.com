import React from 'react'
import {Component} from '../lib/little-mobx-react'
import {storeAsJSON} from '../store'

class AppFrame extends Component {
  ren() {
    return <div>{storeAsJSON()}</div>
  }
}

export default AppFrame
