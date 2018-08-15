import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {cn, observer} from '../lib/little-react'
import {FlexRow} from '../lib/UI'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import {observable} from '../lib/mobx'
import {setter} from '../lib/mobx-decorators'

@observer
class TaskListItem extends Component {
  @setter('setAnchorEl')
  @observable
  anchorEl = null

  onMenuOpen = e => {
    this.setAnchorEl(e.currentTarget)
  }

  handleClose = () => {
    this.setAnchorEl(null)
  }
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
        <div className={cn('ph2', 'pointer')} onClick={this.onMenuOpen}>
          ...
        </div>
        <Menu
          id="simple-menu"
          anchorEl={this.anchorEl}
          open={Boolean(this.anchorEl)}
          onClose={this.handleClose}
        >
          <MenuItem onClick={this.handleClose}>Profile</MenuItem>
          <MenuItem onClick={this.handleClose}>My account</MenuItem>
          <MenuItem onClick={this.handleClose}>Logout</MenuItem>
        </Menu>
      </FlexRow>
    )
  }
}

TaskListItem.propTypes = {
  task: PropTypes.object.isRequired,
}

export default TaskListItem
