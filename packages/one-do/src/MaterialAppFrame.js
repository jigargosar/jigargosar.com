import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {
  EventListener,
  FocusTrap,
  Fr,
  observer,
  whenKey,
  withKeyEvent,
  wrapSP,
} from './lib/little-react'

import cn from 'classnames'
import {fWord} from './lib/fake'
import {onlyUpdateForKeys} from './lib/recompose'
import {compose} from './lib/ramda'
import MenuIcon from '@material-ui/icons/MenuRounded'
import AddTaskIcon from '@material-ui/icons/Add'
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
import {AllListsContent} from './components/AllListsContent'
import {withStore, withStoreDN} from './StoreContext'
import {dispatchAddTask, dispatchToggleDrawer} from './StoreActions'

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

const contentLookup = {
  SelectedList: TaskListContent,
  AllLists: AllListsContent,
}

const GlobalEventListener = withStoreDN('GlobalEventListener')(store => (
  <EventListener target={'document'} onKeyDown={store.onKeyDown} />
))

@observer
class TopToolBar extends Component {
  render() {
    return (
      <Toolbar>
        <IconButton color={'inherit'} onClick={dispatchToggleDrawer()}>
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
        onClose={dispatchToggleDrawer(false)}
        onClick={
          store.isDrawerTemporary ? dispatchToggleDrawer(false) : null
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
  }),
  onlyUpdateForKeys(['store']),
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
            <ContentView store={store} />
          </main>
          <Button
            variant="fab"
            color={'secondary'}
            className={cn('absolute right-1 bottom-1')}
            onClick={dispatchAddTask({name: fWord()})}
          >
            <AddTaskIcon />
          </Button>
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
class EditTaskModal extends Component {
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
            <DialogContent>
              <TextField
                fullWidth
                autoFocus={true}
                type="text"
                value={task.name}
                onKeyDown={withKeyEvent(
                  whenKey('enter')(this.handleClose),
                )}
                onChange={e =>
                  store.updateTask({name: e.target.value}, task)
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant={'headline'} color={'error'}>
                        {task.isDirty && `*`}
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
                  store.updateList({name: e.target.value}, list)
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
