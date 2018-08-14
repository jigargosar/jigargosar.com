import React, {Component} from 'react'
import {Fr, observer, whenKey, withKeyEvent} from '../lib/little-react'
import InputAdornment from '@material-ui/core/InputAdornment/InputAdornment'
import Button from '@material-ui/core/Button/Button'
import Typography from '@material-ui/core/Typography/Typography'
import Dialog from '@material-ui/core/Dialog/Dialog'
import DialogActions from '@material-ui/core/DialogActions/DialogActions'
import DialogContent from '@material-ui/core/DialogContent/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle'
import TextField from '@material-ui/core/TextField/TextField'
import {handleUpdateItem} from '../mst-models/StoreActionsHandlers'

@observer
export class EditListModal extends Component {
  handleClose = () => {
    this.props.store.endEditList()
  }

  render() {
    const {store} = this.props
    const {editingList: list} = store
    return (
      <Fr>
        {list && (
          <Dialog
            // fullScreen={store.isMobileLayout}
            open={true}
            onClose={this.handleClose}
            maxWidth={'xs'}
            fullWidth
          >
            <DialogTitle>{'Edit List'}</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                autoFocus={true}
                type="text"
                value={list.name}
                onKeyDown={withKeyEvent(
                  whenKey('enter')(this.handleClose),
                )}
                onChange={e =>
                  handleUpdateItem({name: e.target.value}, list)(e)
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant={'headline'} color={'error'}>
                        {list.isDirty && `*`}
                      </Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Fr>
    )
  }
}
