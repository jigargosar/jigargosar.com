import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {cn, observer} from '../lib/little-react'
import {FlexRow} from '../lib/UI'

@observer
class TaskListItem extends Component {
  render() {
    const {task} = this.props
    return (
      <FlexRow>
        <div className={cn('mr2 code')}>{`[ ]`}</div>
        <div className={cn('mr2 f4 flex-auto')}>{task.title}</div>
      </FlexRow>
    )
  }
}

TaskListItem.propTypes = {
  task: PropTypes.object.isRequired,
}

export default TaskListItem
