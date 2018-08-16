import React, {Component} from 'react'
import {rootStore, taskStore} from '../stores'
import {cn, observer, renderKeyedById} from '../lib/little-react'
import TaskListItem from './TaskListItem'
import {Btn} from '../lib/Btn'
import {FlexRow} from '../lib/UI'

@observer
class TaskListScreen extends Component {
  render() {
    return (
      <div className={cn('pv2')}>
        <div className={cn('pv1 ph3', 'f2 b')}>Task List</div>
        <FlexRow className={cn('pv1 ph3')}>
          <div className={cn('mh1')}>
            <Btn onClick={taskStore.addNewTask}>Add Task</Btn>
          </div>
          <div className={cn('mh1')}>
            <Btn onClick={rootStore.resetLS}>Reset LS</Btn>
          </div>
        </FlexRow>
        <div>{renderKeyedById(TaskListItem, 'task', taskStore.tasks)}</div>
      </div>
    )
  }
}

TaskListScreen.propTypes = {}

export default TaskListScreen
