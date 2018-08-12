import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {
  EventListener,
  FocusTrap,
  Fr,
  observer,
  wrapSP,
} from './lib/little-react'

import cn from 'classnames'
import {fWord} from './lib/fake'
import {onlyUpdateForKeys} from './lib/recompose'
import {compose} from './lib/ramda'

import ChevronLeftIcon from '@material-ui/icons/ChevronLeftRounded'
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

import {bindStoreAction} from './lib/little-mst'
import {afterMountAndUpdate} from './lib/little-recompose'
import {DrawerTaskLists} from './components/DrawerTaskLists'
import {SelectedListContent} from './components/SelectedListContent'

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
  drawerPaper: {
    position: 'relative',
    width: drawerWidth,
  },
  drawerPaperClosed: {
    position: 'relative',
    width: 0,
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    // padding: theme.spacing.unit * 3,
    // paddingBottom: theme.spacing.unit * 10,
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

@compose(
  withWidth(),
  afterMountAndUpdate(({store, width}) => {
    const isMobileLayout = !isWidthUp('sm', width)
    store.setLayout(isMobileLayout ? 'mobile' : 'desktop')
  }),
  onlyUpdateForKeys(['store']),
  observer,
)
class MaterialAppFrame extends Component {
  toggleDrawer = bindStoreAction(this)('toggleDrawer')

  render() {
    const {classes, store} = this.props

    const ContentView = contentLookup[store.contentViewName]

    return (
      <FocusTrap
        active={false}
        focusTrapOptions={{fallbackFocus: document}}
      >
        <EventListener target={'document'} onKeyDown={store.onKeyDown} />
        <div className={classes.root}>
          <AppBar position="absolute" className={classes.appBar}>
            {this.renderToolBar()}
          </AppBar>
          <Drawer
            variant={store.drawerVariant}
            classes={{
              paper: store.isDrawerOpen
                ? classes.drawerPaper
                : classes.drawerPaperClosed,
            }}
            open={store.isDrawerOpen}
            onClose={this.toggleDrawer(false)}
            onClick={
              store.isDrawerTemporary ? this.toggleDrawer(false) : null
            }
            ModalProps={{keepMounted: true}}
          >
            {this.renderToolBar()}
            {false && (
              <div className={classes.toolbar}>
                <IconButton onClick={this.toggleDrawer(false)}>
                  <ChevronLeftIcon />
                </IconButton>
              </div>
            )}
            <DrawerTaskLists store={store} />
          </Drawer>
          <main className={classes.content}>
            <div className={classes.toolbar} />
            <ContentView store={store} />
          </main>
          <Button
            variant="fab"
            color={'secondary'}
            className={cn('absolute right-1 bottom-1')}
            onClick={wrapSP(() => store.addTask({name: fWord()}))}
          >
            <AddTaskIcon />
          </Button>
          <EditTaskModal store={store} />
        </div>
      </FocusTrap>
    )
  }

  renderToolBar() {
    return (
      <Toolbar>
        <IconButton color={'inherit'} onClick={this.toggleDrawer()}>
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
                disabled={task.isDone}
                value={task.name}
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
                  inputProps: {className: cn({strike: task.isDone})},
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
