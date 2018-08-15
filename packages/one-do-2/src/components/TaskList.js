import React from 'react'
import {Component} from '../lib/little-mobx-react'
import {taskStore} from '../stores'
import {renderKeyedById} from '../lib/little-react'
import TaskListItem from './TaskListItem'

class TaskList extends Component {
  render() {
    return (
      <div>
        <h1>Task List</h1>
        <div>
          {renderKeyedById(TaskListItem, 'task', taskStore.allTasks)}
        </div>
      </div>
    )
  }
}

TaskList.propTypes = {}

export default TaskList
