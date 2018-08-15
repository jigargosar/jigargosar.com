import React, {Component, Fragment} from 'react'
import StoreJSON from './StoreJSON'
import {Btn} from '../lib/Btn'
import {rootStore, taskStore} from '../stores'
import {FlexRow} from '../lib/UI'
import {cn, EventListener, observer} from '../lib/little-react'
import TaskList from './TaskList'

@observer
class AppFrame extends Component {
  render() {
    return (
      <Fragment>
        <EventListener target={document} onKeyDown={rootStore.onKeyDown} />
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
