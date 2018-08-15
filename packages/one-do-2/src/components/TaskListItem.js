import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {cn, observer} from '../lib/little-react'
import {FlexRow} from '../lib/UI'
import {taskViewStore} from '../stores'

@observer
class TaskListItem extends Component {
  handleOnFocus = task => () => {
    taskViewStore.setSelectedTask(task)
  }

  render() {
    const {task} = this.props
    return (
      <FlexRow
        className={cn('ph1', 'link', {'bg-light-blue': task.isSelected})}
        tabIndex={task.isSelected ? 0 : -1}
        onFocus={this.handleOnFocus(task)}
      >
        <div
          className={cn('pa2', 'code usn pointer')}
          onClick={task.toggleDone}
        >
          {task.isDone ? `[x]` : `[ ]`}
        </div>
        <div className={cn('pa2 flex-auto', 'f4 ')}>{task.title}</div>
      </FlexRow>
    )
  }
}

TaskListItem.propTypes = {
  task: PropTypes.object.isRequired,
}

export default TaskListItem
