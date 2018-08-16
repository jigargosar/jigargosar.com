import React, {Component} from 'react'
import {rootStore, taskViewStore} from '../stores'
import {cn, observer} from '../lib/little-react'
import {FlexRow} from '../lib/UI'
import TaskList from './TaskList'
import {Button} from '@material-ui/core'

function renderButton(label, onClick) {
  return (
    <Button
      className={cn('blue sans-serif')}
      color={'inherit'}
      onClick={onClick}
      variant={'flat'}
    >
      {label}
    </Button>
  )
}

@observer
class TaskListScreen extends Component {
  render() {
    const pendingCount = taskViewStore.pendingCount
    const pendingTasks = taskViewStore.pendingTasks
    const doneTasks = taskViewStore.doneTasks
    const totalCount = taskViewStore.totalCount
    return (
      <div className={cn('flex flex-column vh-100 overflow-hidden')}>
        <div className={cn('pv2')}>
          <div className={cn('pv1 ph1 relative')}>
            <span className={cn('f2 b ph2')}>Task List</span>
            <span
              className={cn('black-50 code relative bottom-1')}
            >{`(${pendingCount}/${totalCount})`}</span>
          </div>
        </div>
        <div className={cn('overflow-scroll')}>
          <TaskList tasks={pendingTasks} />
          <TaskList tasks={doneTasks} />
        </div>
        <div>
          <FlexRow className={cn('ph2')}>
            {renderButton('Add Task', taskViewStore.addNewTask)}
            {renderButton('Reset LS', rootStore.resetLS)}
          </FlexRow>
        </div>
      </div>
    )
  }
}

TaskListScreen.propTypes = {}

export default TaskListScreen
