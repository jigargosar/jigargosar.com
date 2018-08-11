import React, {Component, Fragment} from 'react'
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

import {pluralize} from './lib/little-ramda'
import {lifecycle, withProps} from './lib/recompose'
import {_compose} from './lib/ramda'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeftRounded'
import MenuIcon from '@material-ui/icons/MenuRounded'
import AddListIcon from '@material-ui/icons/PlaylistAddRounded'
import AddTaskIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/DeleteRounded'
import EditIcon from '@material-ui/icons/EditRounded'
import CheckBoxBlankIcon from '@material-ui/icons/CheckCircleOutlineRounded'
import CheckBoxCheckedIcon from '@material-ui/icons/CheckCircleRounded'
import IconButton from '@material-ui/core/IconButton/IconButton'

import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText/ListItemText'
import ListItem from '@material-ui/core/ListItem/ListItem'
import ListSubheader from '@material-ui/core/ListSubheader/ListSubheader'
import Input from '@material-ui/core/Input/Input'
import InputAdornment from '@material-ui/core/InputAdornment/InputAdornment'
import Checkbox from '@material-ui/core/Checkbox/Checkbox'
import Button from '@material-ui/core/Button/Button'
import withWidth, {isWidthUp} from '@material-ui/core/withWidth/withWidth'
import withStyles from '@material-ui/core/styles/withStyles'
import List from '@material-ui/core/List/List'
import Typography from '@material-ui/core/Typography/Typography'
import Toolbar from '@material-ui/core/Toolbar/Toolbar'
import Drawer from '@material-ui/core/Drawer/Drawer'
import AppBar from '@material-ui/core/AppBar/AppBar'
import {computed} from './lib/little-mst'
import Dialog from '@material-ui/core/Dialog/Dialog'
import DialogActions from '@material-ui/core/DialogActions/DialogActions'
import DialogContentText from '@material-ui/core/DialogContentText/DialogContentText'
import DialogContent from '@material-ui/core/DialogContent/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle'

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

const bindAction = comp => actionName => (...args) => () =>
  comp.props.store[actionName](...args)

const updateLayout = ({store, width}) => {
  const isMobileLayout = !isWidthUp('sm', width)
  store.setLayout(isMobileLayout ? 'mobile' : 'desktop')
}

@_compose(
  withWidth(),
  lifecycle({
    componentDidMount() {
      updateLayout(this.props)
    },
    componentDidUpdate() {
      updateLayout(this.props)
    },
  }),
  observer,
)
class MaterialAppFrame extends Component {
  toggleDrawer = bindAction(this)('toggleDrawer')

  render() {
    const {classes, store} = this.props

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
            <MyLists store={store} />
          </Drawer>
          <main className={classes.content}>
            <div className={classes.toolbar} />
            <List disablePadding className={cn('overflow-scroll pb5')}>
              <SelectedListContentHeader store={store} />
              <Tasks store={store} />
            </List>
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
class TaskItem extends Component {
  render() {
    const {task, store} = this.props

    return (
      <Fragment>
        <ListItem dense disableGutters>
          <Checkbox
            onChange={e =>
              store.updateTask({isDone: e.target.checked}, task)
            }
            checked={task.isDone}
            color={'default'}
            icon={<CheckBoxBlankIcon />}
            checkedIcon={<CheckBoxCheckedIcon />}
          />
          <ListItemText className={cn('pl0')}>
            <Input
              fullWidth
              type="text"
              disabled={task.isDone}
              disableUnderline
              value={task.name}
              onChange={e =>
                store.updateTask({name: e.target.value}, task)
              }
              endAdornment={
                task.isDirty && (
                  <InputAdornment position="end">*</InputAdornment>
                )
              }
              inputProps={{className: cn({strike: task.isDone})}}
            />
          </ListItemText>
          {this.renderSecondaryAction(task, store)}
        </ListItem>
      </Fragment>
    )
  }

  renderSecondaryAction(task, store) {
    return (
      <ListItemSecondaryAction>
        {task.isDone && (
          <IconButton onClick={wrapSP(() => store.deleteTask(task))}>
            <DeleteIcon />
          </IconButton>
        )}
        {!task.isDone && (
          <IconButton onClick={wrapSP(() => store.editTask(task))}>
            <EditIcon />
          </IconButton>
        )}
      </ListItemSecondaryAction>
    )
  }
}

@observer
class SelectedListContentHeader extends Component {
  render() {
    const {store} = this.props
    const list = store.selectedList
    return (
      <ListSubheader className={'pa0 bg-white-80'}>
        <Input
          inputProps={{className: cn('pa2 ttu')}}
          fullWidth
          type="text"
          value={list.name}
          onChange={e => store.updateList({name: e.target.value}, list)}
        />
      </ListSubheader>
    )
  }
}

@observer
class Tasks extends Component {
  render() {
    const {store} = this.props
    return store.tasks.map(task => (
      <TaskItem key={task.id} task={task} store={store} />
    ))
  }
}

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
            fullScreen={store.isMobileLayout}
            open={true}
            onClose={this.handleClose}
            aria-labelledby="responsive-dialog-title"
          >
            <DialogTitle id="responsive-dialog-title">
              {'Edit Task'}
            </DialogTitle>
            <DialogContent style={{minWidth: '30em'}}>
              <DialogContentText>
                <Input
                  fullWidth
                  autoFocus
                  type="text"
                  disabled={task.isDone}
                  value={task.name}
                  onChange={e =>
                    store.updateTask({name: e.target.value}, task)
                  }
                  endAdornment={
                    task.isDirty && (
                      <InputAdornment position="end">*</InputAdornment>
                    )
                  }
                  inputProps={{className: cn({strike: task.isDone})}}
                />
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              {/*<Button onClick={this.handleClose} color="primary">*/}
              {/*Disagree*/}
              {/*</Button>*/}
              <Button onClick={this.handleClose} color="primary" autoFocus>
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
class MyLists extends Component {
  render() {
    const {store} = this.props
    return (
      <List
        subheader={
          <ListSubheader
            color="primary"
            className={cn('', 'flex items-center')}
          >
            <div className={cn('flex-auto')}>My Lists</div>
            <IconButton
              onClick={wrapSP(() => store.addList({name: fWord()}))}
            >
              <AddListIcon />
            </IconButton>
          </ListSubheader>
        }
      >
        {store.lists.map(list => (
          <ListName key={list.id} store={store} list={list} />
        ))}
      </List>
    )
  }
}

@observer
@withProps(({store, list}) => ({
  isSelected: computed(() => store.isSelected(list)).get(),
}))
@observer
class ListName extends Component {
  render() {
    const {store, list, isSelected} = this.props
    const pendingCount = list.pendingTasks.length
    return (
      <ListItem
        className={cn('ttu', {'bg-black-20': isSelected})}
        button
        onClick={() => store.selectList(list)}
      >
        <ListItemText
          primary={`${list.name}`}
          secondary={
            <Fragment>
              {`${pendingCount} ${pluralize('TASK', pendingCount)}`}
              <Fragment>{list.isDirty && '*'}</Fragment>
            </Fragment>
          }
        />
        <ListItemSecondaryAction>
          <IconButton
            onClick={wrapSP(() => store.deleteList(list))}
            disabled={!store.canDeleteList}
          >
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    )
  }
}
