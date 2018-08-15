import React, {Component} from 'react'
import {debugStore} from '../stores'
import {observer} from '../lib/little-react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core'
import StoreJSON from './StoreJSON'

@observer
class DebugDialog extends Component {
  render() {
    return (
      <Dialog
        open={debugStore.isDebugViewOpen}
        onClose={debugStore.toggleDebugView}
        scroll={'body'}
      >
        {false && <DialogTitle> </DialogTitle>}
        <StoreJSON />
        {false && (
          <DialogContent>
            {false && <DialogContentText> </DialogContentText>}
          </DialogContent>
        )}
        {false && (
          <DialogActions>
            <div> </div>
          </DialogActions>
        )}
      </Dialog>
    )
  }
}

export default DebugDialog
