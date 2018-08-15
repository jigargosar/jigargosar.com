import React, {Fragment} from 'react'
import {Component} from '../lib/little-mobx-react'
import StoreJSON from './StoreJSON'
import {Btn} from '../lib/Btn'
import {taskStore} from '../stores'
import {FlexRow} from '../lib/UI'
import {cn} from '../lib/little-react'
import TaskList from './TaskList'

class AppFrame extends Component {
  ren() {
    return (
      <Fragment>
        <FlexRow className={cn('ma3')}>
          <Btn onClick={taskStore.addNewTask}>Add New Task</Btn>
        </FlexRow>
        <TaskList />
        <StoreJSON />
      </Fragment>
    )
  }
}

export default AppFrame
