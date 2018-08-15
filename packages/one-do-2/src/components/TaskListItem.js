import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {observer} from '../lib/little-react'

@observer
class TaskListItem extends Component {
  render() {
    const {task} = this.props
    return <div>{task.title}</div>
  }
}

TaskListItem.propTypes = {
  task: PropTypes.object.isRequired,
}

export default TaskListItem
