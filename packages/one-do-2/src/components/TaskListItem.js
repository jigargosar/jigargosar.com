import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {cn, observer} from '../lib/little-react'
import {FlexRow} from '../lib/UI'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import {computed, observable} from '../lib/mobx'
import {setter} from '../lib/mobx-decorators'
import {identity, isNil} from '../lib/ramda'
import {taskViewStore} from '../stores'

@observer
class TaskListItem extends Component {
  menuBtnRef = React.createRef()

  @setter('setAnchorEl')
  @observable
  anchorEl = null

  onMenuOpen = e => {
    this.setAnchorEl(e.currentTarget)
    taskViewStore.openTaskMenu()
  }

  @computed
  get isOpen() {
    return (
      taskViewStore.isTaskMenuOpenFor(this.props.task) &&
      !isNil(this.menuBtnRef.current)
    )
  }

  handleClose = (action = identity) => () => {
    action()
    this.setAnchorEl(null)
    taskViewStore.closeTaskMenu()
  }

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
          <div
            ref={this.menuBtnRef}
            className={cn('ph2', 'usn pointer')}
            onClick={this.onMenuOpen}
          >
            ...
          </div>
        </FlexRow>
        <Menu
          anchorEl={this.menuBtnRef.current}
          open={this.isOpen}
          onClose={this.handleClose()}
        >
          <MenuItem onClick={this.handleClose(task.toggleDelete)}>
            Delete
          </MenuItem>
          <MenuItem onClick={this.handleClose(task.toggleDone)}>
            Done
          </MenuItem>
          <MenuItem onClick={this.handleClose()}>Select</MenuItem>
        </Menu>
      </div>
    )
  }
}

TaskListItem.propTypes = {
  task: PropTypes.object.isRequired,
}

export default TaskListItem
