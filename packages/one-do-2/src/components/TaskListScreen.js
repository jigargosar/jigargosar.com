import React, {Component} from 'react'
import {rootStore, taskViewStore} from '../stores'
import {cn, observer} from '../lib/little-react'
import {Btn} from '../lib/Btn'
import {FlexRow} from '../lib/UI'
import TaskList from './TaskList'
import {Button} from '@material-ui/core'

@observer
class TaskListScreen extends Component {
  render() {
    const pendingCount = taskViewStore.pendingCount
    const pendingTasks = taskViewStore.pendingTasks
    const doneTasks = taskViewStore.doneTasks
    const totalCount = taskViewStore.totalCount
    return (
      <div className={cn('pv2')}>
        <div className={cn('pv1 ph1')}>
          <span className={cn('f2 b ph2')}>Task List</span>
          <span
            className={cn('black-50')}
          >{`(${pendingCount}/${totalCount})`}</span>
        </div>
        <FlexRow className={cn('pv1 ph3')}>
          <div className={cn('mh1')}>
            <Btn onClick={taskViewStore.addNewTask}>Add Task</Btn>
          </div>
          <Button
            role={'button'}
            color={'primary'}
            onClick={taskViewStore.addNewTask}
          >
            Add Task
          </Button>
          <div className={cn('mh1')}>
            <Btn onClick={rootStore.resetLS}>Reset LS</Btn>
          </div>
        </FlexRow>

        <TaskList tasks={pendingTasks} />
        <TaskList tasks={doneTasks} />
      </div>
    )
  }
}

TaskListScreen.propTypes = {}

export default TaskListScreen
