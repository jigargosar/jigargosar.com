import React from 'react'
import {Component} from '../lib/little-mobx-react'
import PropTypes from 'prop-types'

class TaskListItem extends Component {
  render() {
    return <div />
  }
}

TaskListItem.propTypes = {task: PropTypes.object.isRequired}

export default TaskListItem
