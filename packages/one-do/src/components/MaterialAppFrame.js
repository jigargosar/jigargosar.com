import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {
  FocusTrap,
  Fr,
  observer,
  whenKey,
  withKeyEvent,
} from '../lib/little-react'

import cn from 'classnames'
import {compose} from '../lib/ramda'
import MenuIcon from '@material-ui/icons/MenuRounded'
import IconButton from '@material-ui/core/IconButton/IconButton'
import InputAdornment from '@material-ui/core/InputAdornment/InputAdornment'
import Button from '@material-ui/core/Button/Button'
import withWidth, {isWidthUp} from '@material-ui/core/withWidth/withWidth'
import withStyles from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography/Typography'
import Toolbar from '@material-ui/core/Toolbar/Toolbar'
import Drawer from '@material-ui/core/Drawer/Drawer'
import AppBar from '@material-ui/core/AppBar/AppBar'
import Dialog from '@material-ui/core/Dialog/Dialog'
import DialogActions from '@material-ui/core/DialogActions/DialogActions'
import DialogContent from '@material-ui/core/DialogContent/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle'
import TextField from '@material-ui/core/TextField/TextField'
import {afterMountAndUpdate} from '../lib/little-recompose'
import {DrawerTaskLists} from './DrawerTaskLists'
import {withStore} from '../StoreContext'
import {
  handleToggleDrawer,
  handleUpdateItem,
} from '../mst-models/StoreActionsHandlers'
import {EditTaskModal} from './EditTaskModal'
import BottomBar from './BottomBar'
import {
  getDrawerVariant,
  getIsDrawerOpen,
  getIsDrawerTemporary,
  getIsLayoutMobile,
  setIsLayoutMobile,
} from '../mst-models/RootStore'
import {drawerWidth} from './constants'
import SelectedListContent from './SelectedListContent'
import GlobalEventListener from './GlobalEventListener'

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: '100vh',
    zIndex: 1,
    // overflow: 'hidden',
    position: 'relative',
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    minWidth: 0, // So the Typography noWrap works
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  toolbar: theme.mixins.toolbar,
})

const contentLookup = {
  SelectedList: SelectedListContent,
  AllLists: SelectedListContent,
}

@observer
class TopToolBar extends Component {
  render() {
    return (
      <Toolbar>
        <IconButton color={'inherit'} onClick={handleToggleDrawer()}>
          <MenuIcon />
        </IconButton>
        <Typography
          className={cn('ml2')}
          variant="title"
          color="inherit"
          noWrap
        >
          ONE DO
        </Typography>
      </Toolbar>
    )
  }
}

@withStyles(theme => ({
  drawerPaper: {
    position: 'relative',
    width: drawerWidth,
  },
  drawerPaperClosed: {
    position: 'relative',
    width: 0,
  },
}))
@withStore
class SideBar extends Component {
  render() {
    const {store, classes} = this.props
    return (
      <Drawer
        variant={getDrawerVariant()}
        classes={{
          paper: getIsDrawerOpen()
            ? classes.drawerPaper
            : classes.drawerPaperClosed,
        }}
        open={getIsDrawerOpen()}
        onClose={handleToggleDrawer(false)}
        onClick={getIsDrawerTemporary() ? handleToggleDrawer(false) : null}
        ModalProps={{keepMounted: true}}
      >
        <TopToolBar />
        <DrawerTaskLists store={store} />
      </Drawer>
    )
  }
}

@compose(
  withStore,
  withWidth(),
  afterMountAndUpdate(({width}) =>
    setIsLayoutMobile(!isWidthUp('sm', width)),
  ),
  observer,
)
class MaterialAppFrame extends Component {
  render() {
    const {classes, store} = this.props

    const ContentView = contentLookup[store.contentViewName]

    return (
      <FocusTrap
        active={false}
        focusTrapOptions={{fallbackFocus: document}}
      >
        <GlobalEventListener />
        <div className={classes.root}>
          <AppBar position="absolute" className={classes.appBar}>
            {<TopToolBar />}
          </AppBar>
          <SideBar />
          <main className={classes.content}>
            <div className={classes.toolbar} />
            <ContentView />
            {`${getIsLayoutMobile()}`}
            <BottomBar />
          </main>
          <EditTaskModal store={store} />
          <EditListModal store={store} />
        </div>
      </FocusTrap>
    )
  }
}

MaterialAppFrame.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(MaterialAppFrame)

@observer
class EditListModal extends Component {
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
