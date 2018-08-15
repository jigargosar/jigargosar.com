import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {cn, observer} from '../lib/little-react'
import {FlexRow} from '../lib/UI'

@observer
class TaskListItem extends Component {
  render() {
    const {task} = this.props
    return (
      <FlexRow className={cn('mv2')}>
        <div
          className={cn('pr1 mr1', 'code usn pointer')}
          onClick={task.toggleDone}
        >
          {task.isDone ? `[x]` : `[ ]`}
        </div>
        <div className={cn('ph1 flex-auto', 'f4 ', 'bb b--moon-gray')}>
          {task.title}
        </div>
        <div className={cn('ph2', 'pointer')}>...</div>
      </FlexRow>
    )
  }
}

TaskListItem.propTypes = {
  task: PropTypes.object.isRequired,
}

export default TaskListItem
