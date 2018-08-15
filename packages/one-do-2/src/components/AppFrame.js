import React from 'react'
import {Component} from '../lib/little-mobx-react'
import StoreJSON from './StoreJSON'

class AppFrame extends Component {
  ren() {
    return <StoreJSON />
  }
}

export default AppFrame
