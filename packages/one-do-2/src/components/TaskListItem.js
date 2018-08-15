import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {cn, observer} from '../lib/little-react'
import {FlexRow} from '../lib/UI'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import {taskViewStore} from '../stores'

@observer
class TaskListItem extends Component {
  handleOnFocus = task => () => {
    taskViewStore.setSelectedTask(task)
  }

  render() {
    const {task} = this.props
    return (
      <div
        className={cn('pv1 link', {'bg-light-blue': task.isSelected})}
        tabIndex={0}
        onFocus={this.handleOnFocus(task)}
      >
        <FlexRow className={cn('pv2')}>
          <div
            className={cn('pr1 mr1', 'code usn pointer')}
            onClick={task.toggleDone}
          >
            {task.isDone ? `[x]` : `[ ]`}
          </div>
          <div className={cn('ph1 flex-auto', 'f4 ')}>{task.title}</div>
        </FlexRow>
      </div>
    )
  }
}

TaskListItem.propTypes = {
  task: PropTypes.object.isRequired,
}

export default TaskListItem
