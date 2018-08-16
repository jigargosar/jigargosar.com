import React, {Component} from 'react'
import {rootStore, taskViewStore} from '../stores'
import {cn, observer, tapPD} from '../lib/little-react'
import {Btn} from '../lib/Btn'
import {FlexRow} from '../lib/UI'
import TaskList from './TaskList'

@observer
class TaskListScreen extends Component {
  render() {
    return (
      <div className={cn('pv2')}>
        <div className={cn('pv1 ph3', 'f2 b')}>Task List</div>
        <FlexRow className={cn('pv1 ph3')}>
          <div className={cn('mh1')}>
            <button onClick={tapPD(taskViewStore.addNewTask)}>
              Add Task
            </button>
          </div>
          <div className={cn('mh1')}>
            <Btn onClick={rootStore.resetLS}>Reset LS</Btn>
          </div>
        </FlexRow>
        <div>
          <h1>Pending Tasks</h1>
          <TaskList tasks={taskViewStore.pendingTasks} />
        </div>
        <div>
          <h1>Done Tasks</h1>
          <TaskList tasks={taskViewStore.doneTasks} />
        </div>
        <div>
          <h1>Deleted Tasks</h1>
          <TaskList tasks={taskViewStore.deletedTasks} />
        </div>
      </div>
    )
  }
}

TaskListScreen.propTypes = {}

export default TaskListScreen
