import React, {Fragment} from 'react'
import {Component} from '../lib/little-mobx-react'
import StoreJSON from './StoreJSON'
import {Btn} from '../lib/Btn'
import {store} from '../stores'
import {FlexRow} from '../lib/UI'
import {cn} from '../lib/little-react'

class AppFrame extends Component {
  ren() {
    return (
      <Fragment>
        <FlexRow className={cn('ma3')}>
          <Btn onClick={store.tasks.addNewTask}>Add New Task</Btn>
        </FlexRow>
        <StoreJSON />
      </Fragment>
    )
  }
}

export default AppFrame
