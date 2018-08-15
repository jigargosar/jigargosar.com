import React, {Fragment} from 'react'
import {Component} from '../lib/little-mobx-react'
import StoreJSON from './StoreJSON'
import {Btn} from '../lib/Btn'
import {store} from '../stores'

class AppFrame extends Component {
  ren() {
    return (
      <Fragment>
        <Btn onClick={store.tasks.addNewTask}>Add Task</Btn>
        <StoreJSON />
      </Fragment>
    )
  }
}

export default AppFrame
