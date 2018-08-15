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
      <Dialog open={debugStore.isDebugViewOpen}>
        <DialogTitle>DEBUG</DialogTitle>
        <DialogContent>
          <DialogContentText>CONTENT TEXT</DialogContentText>
          <StoreJSON />
        </DialogContent>
        <DialogActions>ACTIONS</DialogActions>
      </Dialog>
    )
  }
}

export default DebugDialog
