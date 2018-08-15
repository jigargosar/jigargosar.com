import React from 'react'
import {Component} from '../lib/little-mobx-react'
import PropTypes from 'prop-types'

class TaskListItem extends Component {
  ren({task}) {
    return <div>{task.title}</div>
  }
}

TaskListItem.propTypes = {
  task: PropTypes.object.isRequired,
}

export default TaskListItem
