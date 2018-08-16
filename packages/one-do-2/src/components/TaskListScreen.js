import React, {Component} from 'react'
import {rootStore, taskViewStore} from '../stores'
import {cn, observer} from '../lib/little-react'
import {FlexRow} from '../lib/UI'
import TaskList from './TaskList'
import {Button} from '@material-ui/core'

function renderButton(label, onClick) {
  return (
    <Button
      className={cn('blue ph2 sans-serif')}
      color={'inherit'}
      onClick={onClick}
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
      <div className={cn('pv2')}>
        <div className={cn('pv1 ph1 relative')}>
          <span className={cn('f2 b ph2')}>Task List</span>
          <span
            className={cn('black-50 code relative bottom-1')}
          >{`(${pendingCount}/${totalCount})`}</span>
        </div>
        <FlexRow className={cn('ph2')}>
          {renderButton('Add Task', taskViewStore.addNewTask)}
          {renderButton('Reset LS', rootStore.resetLS)}
        </FlexRow>

        <TaskList tasks={pendingTasks} />
        <TaskList tasks={doneTasks} />
      </div>
    )
  }
}

TaskListScreen.propTypes = {}

export default TaskListScreen
