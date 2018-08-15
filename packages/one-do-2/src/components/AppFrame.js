import React, {Component} from 'react'
import {Btn} from '../lib/Btn'
import {rootStore, taskStore} from '../stores'
import {FlexRow} from '../lib/UI'
import {cn, EventListener, FocusTrap, observer} from '../lib/little-react'
import TaskList from './TaskList'
import DebugDialog from './DebugDialog'

@observer
class AppFrame extends Component {
  render() {
    return (
      <FocusTrap paused={true} active={false}>
        <DebugDialog />
        <EventListener target={document} onKeyDown={rootStore.onKeyDown} />
        <FlexRow className={cn('ma3')}>
          <Btn onClick={taskStore.addNewTask}>Add New Task</Btn>
        </FlexRow>
        <TaskList />
      </FocusTrap>
    )
  }
}

export default AppFrame
