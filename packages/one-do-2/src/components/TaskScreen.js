import React, {Component} from 'react'
import {rootStore, taskView} from '../stores'
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
class TaskScreen extends Component {
  render() {
    const pendingCount = taskView.pendingCount
    const pendingTasks = taskView.pendingTasks
    const doneTasks = taskView.doneTasks
    const totalCount = taskView.totalCount
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
        <div className={cn('flex-auto overflow-scroll')}>
          <TaskList tasks={pendingTasks} />
          <TaskList tasks={doneTasks} />
        </div>
        <div>
          <FlexRow className={cn('ph2')}>
            {renderButton('Add Task', taskView.addNewTask)}
            {renderButton('Reset LS', rootStore.resetLS)}
          </FlexRow>
        </div>
      </div>
    )
  }
}

TaskScreen.propTypes = {}

export default TaskScreen
