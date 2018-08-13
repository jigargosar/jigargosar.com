import React, {Component} from 'react'
import {Fr, observer, whenKey, withKeyEvent} from './lib/little-react'

import cn from 'classnames'
import Button from '@material-ui/core/Button/Button'
import Dialog from '@material-ui/core/Dialog/Dialog'
import DialogActions from '@material-ui/core/DialogActions/DialogActions'
import DialogContent from '@material-ui/core/DialogContent/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle'
import TextField from '@material-ui/core/TextField/TextField'
import {
  dispatchDeleteTask,
  dispatchUpdateTask,
  dispatchUpdateTaskSP,
} from './StoreActions'
import CheckBtn from './components/CheckBtn'
import {FlexRow} from './components/UI'

@observer
export class EditTaskModal extends Component {
  handleClose = () => {
    this.props.store.endEditTask()
  }

  render() {
    const {store} = this.props
    const {editingTask: task} = store
    return (
      <Fr>
        {task && (
          <Dialog
            // fullScreen={store.isMobileLayout}
            open={true}
            onClose={this.handleClose}
            aria-labelledby="responsive-dialog-title"
            maxWidth={'xs'}
            fullWidth
          >
            <DialogTitle id="responsive-dialog-title">
              {'Edit Task'}
            </DialogTitle>
            <DialogContent className={cn('pl0')}>
              <TextField
                fullWidth
                autoFocus={true}
                type="text"
                value={task.name}
                onKeyDown={withKeyEvent(
                  whenKey('enter')(this.handleClose),
                )}
                onChange={e =>
                  dispatchUpdateTask({name: e.target.value}, task)(e)
                }
              />
            </DialogContent>
            <DialogActions
              className={cn('flex-row-reverse justify-start')}
            >
              <Button onClick={this.handleClose} color="primary">
                ok
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Fr>
    )
  }
}
