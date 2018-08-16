import React, {Component, Fragment} from 'react'
import {addTaskView} from '../stores'

import {TextField} from '@material-ui/core'
import {cn, observer} from '../lib/little-react'

class AddTaskBar extends Component {
  render() {
    return (
      <Fragment>
        <div className={cn('flex pa1')}>
          <TextField
            className={cn('br-pill ba ph2')}
            InputProps={{disableUnderline: true}}
            fullWidth
            value={addTaskView.title}
            onChange={addTaskView.onTitleChange}
          />
        </div>
      </Fragment>
    )
  }
}

AddTaskBar.propTypes = {}

export default observer(AddTaskBar)
