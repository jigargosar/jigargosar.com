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

  handleOnBlur = task => () => {
    taskViewStore.unSelectTask(task)
  }

  render() {
    const {task} = this.props
    const isDone = task.isDone
    const isSelected = task.isSelected
    return (
      <FlexRow
        id={task.id}
        tabIndex={isSelected ? 0 : -1}
        className={cn(
          'ph1',
          'link',
          {'bg-light-blue': isSelected},
          {'black-50': isDone},
        )}
        onFocus={this.handleOnFocus(task)}
        onBlur={this.handleOnBlur(task)}
      >
        <div
          className={cn('pa2', 'code usn pointer')}
          onClick={task.toggleDone}
        >
          {isDone ? `[x]` : `[ ]`}
        </div>
        <div className={cn('pa2 flex-auto', 'f4', {strike: isDone})}>
          {task.title}
        </div>
      </FlexRow>
    )
  }
}

TaskListItem.propTypes = {
  task: PropTypes.object.isRequired,
}

export default TaskListItem
