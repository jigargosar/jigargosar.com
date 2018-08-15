import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {cn, observer} from '../lib/little-react'
import {FlexRow} from '../lib/UI'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import {computed, observable} from '../lib/mobx'
import {setter} from '../lib/mobx-decorators'
import {identity} from '../lib/ramda'
import {taskViewStore} from '../stores'

@observer
class TaskListItem extends Component {
  @setter('setMenuBtnRef')
  @observable
  menuBtnRef = null

  handleMenuOpen = e => {
    this.setMenuBtnRef(e.currentTarget)
  }

  @computed
  get isOpen() {
    return Boolean(this.menuBtnRef)
  }

  handleClose = (action = identity) => () => {
    action()
    this.setMenuBtnRef(null)
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
            className={cn('ph2', 'usn pointer')}
            onClick={this.handleMenuOpen}
          >
            ...
          </div>
        </FlexRow>
        <Menu
          disableRestoreFocus
          anchorEl={this.menuBtnRef}
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
