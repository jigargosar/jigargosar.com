import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {cn, observer} from '../lib/little-react'

@observer
class TaskListItem extends Component {
  render() {
    const {task} = this.props
    return <div className={cn('f4')}>{task.title}</div>
  }
}

TaskListItem.propTypes = {
  task: PropTypes.object.isRequired,
}

export default TaskListItem
