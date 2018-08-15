import React, {Component} from 'react'
import {taskStore} from '../stores'
import {cn, observer, renderKeyedById} from '../lib/little-react'
import TaskListItem from './TaskListItem'

@observer
class TaskList extends Component {
  render() {
    return (
      <div className={cn('ma3')}>
        <h1>Task List</h1>
        <div>{renderKeyedById(TaskListItem, 'task', taskStore.tasks)}</div>
      </div>
    )
  }
}

TaskList.propTypes = {}

export default TaskList
