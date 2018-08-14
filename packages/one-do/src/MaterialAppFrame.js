import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {
  EventListener,
  FocusTrap,
  Fr,
  observer,
  whenKey,
  whenKeyPD,
  withKeyEvent,
} from './lib/little-react'

import cn from 'classnames'
import {onlyUpdateForKeys, withProps} from './lib/recompose'
import {always, compose, identity, ifElse, isNil} from './lib/ramda'
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
import {afterMountAndUpdate} from './lib/little-recompose'
import {DrawerTaskLists} from './components/DrawerTaskLists'
import {TaskListContent} from './components/TaskListContent'
import {withStore, withStoreDN} from './StoreContext'
import {
  handleDeleteItem,
  handleEditTask,
  handleToggleDrawer,
  handleUpdateItem,
} from './StoreActionsHandlers'
import {EditTaskModal} from './EditTaskModal'
import BottomBar from './BottomBar'
import {getIsLayoutMobile, toggleIsLayoutMobile} from './RootStore'
import {easyView} from './lib/react-easy-store'

const drawerWidth = 240

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

const SelectedListContent = compose(
  withStoreDN('SelectedListContent'),
  withProps(({store}) => ({list: store.selectedList})),
)(TaskListContent)

const contentLookup = {
  SelectedList: SelectedListContent,
  AllLists: SelectedListContent,
}

const GlobalEventListener = withStoreDN('GlobalEventListener')(
  ({store}) => {
    return (
      <EventListener
        target={'document'}
        onKeyDown={withKeyEvent(
          whenKeyPD('d')(
            ifElse(isNil)(always(identity))(handleDeleteItem)(
              store.selectedTask,
            ),
          ),
          whenKeyPD('e')(
            ifElse(isNil)(always(identity))(handleEditTask)(
              store.selectedTask,
            ),
          ),
        )}
      />
    )
  },
)

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
        variant={store.drawerVariant}
        classes={{
          paper: store.isDrawerOpen
            ? classes.drawerPaper
            : classes.drawerPaperClosed,
        }}
        open={store.isDrawerOpen}
        onClose={handleToggleDrawer(false)}
        onClick={
          store.isDrawerTemporary ? handleToggleDrawer(false) : null
        }
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
  afterMountAndUpdate(({store, width}) => {
    const isMobileLayout = !isWidthUp('sm', width)
    store.setLayout(isMobileLayout ? 'mobile' : 'desktop')
    toggleIsLayoutMobile(isMobileLayout)
  }),
  onlyUpdateForKeys(['store']),
  easyView,
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
