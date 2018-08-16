import React, {Component, Fragment} from 'react'
import {addTaskView} from '../stores'

import {IconButton, TextField} from '@material-ui/core'
import {cn, observer, whenKey, withKeyEvent} from '../lib/little-react'
import {AddIcon} from '../lib/Icons'

class AddTaskBar extends Component {
  render() {
    return (
      <Fragment>
        <div className={cn('flex items-center pa1 bg-light-yellow')}>
          <div className={cn('ph1 flex-auto')}>
            <TextField
              id={'add-task-input'}
              className={cn('br-pill bw0 ba bg-white-90')}
              InputProps={{disableUnderline: true}}
              inputProps={{className: cn('ph3 pv1 f5')}}
              fullWidth
              value={addTaskView.title}
              onChange={addTaskView.onTitleChange}
              onKeyDown={withKeyEvent(
                //
                whenKey('enter')(addTaskView.addTask),
              )}
            />
          </div>
          <div className={cn('ph1_')}>
            <IconButton
              onClick={addTaskView.addTaskAndKeepAdding}
              className={cn('f3 blue')}
              style={{
                width: '1.3em',
                height: '1.3em',
              }}
            >
              <AddIcon fontSize={'inherit'} />
            </IconButton>
          </div>
        </div>
      </Fragment>
    )
  }
}

AddTaskBar.propTypes = {}

export default observer(AddTaskBar)
