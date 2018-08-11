import React, {Component, Fragment} from 'react'
import PropTypes from 'prop-types'
import {
  EventListener,
  FocusTrap,
  observer,
  wrapSP,
} from './lib/little-react'
import {disposable} from './lib/hoc'

import cn from 'classnames'
import {fWord} from './lib/fake'

import {pluralize} from './lib/little-ramda'
import {mapProps, withProps} from './lib/recompose'
import {_compose} from './lib/ramda'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeftRounded'
import MenuIcon from '@material-ui/icons/MenuRounded'
import AddListIcon from '@material-ui/icons/PlaylistAddRounded'
import AddTaskIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/DeleteRounded'
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

const bindAction = comp => actionName => (...args) =>
  comp.props.store[actionName](...args)

@_compose(
  withWidth(),
  mapProps(({width, ...other}) => {
    const drawerVariant = isWidthUp('sm', width)
      ? 'persistent'
      : 'temporary'
    return {
      drawerVariant: drawerVariant,
      isDrawerTemporary: drawerVariant === 'temporary',
      ...other,
    }
  }),
)
@disposable
@observer
class MaterialAppFrame extends Component {
  toggleDrawer = () => bindAction(this)('toggleDrawer')

  render() {
    const {classes, store, isDrawerTemporary} = this.props

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
            variant={this.props.drawerVariant}
            classes={{
              paper: store.isDrawerOpen
                ? classes.drawerPaper
                : classes.drawerPaperClosed,
            }}
            open={store.isDrawerOpen}
            onClose={this.toggleDrawer(false)}
            onClick={isDrawerTemporary ? this.toggleDrawer(false) : null}
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
            <div className={cn('overflow-hidden flex flex-column')}>
              <SelectedListContentHeader store={store} />
              <Tasks store={store} />
            </div>
          </main>
          <Button
            variant="fab"
            color={'secondary'}
            className={cn('absolute right-1 bottom-1')}
            onClick={wrapSP(() => store.addTask({name: fWord()}))}
          >
            <AddTaskIcon />
          </Button>
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
        <ListItem
          dense
          disableGutters
          // divider
          // dense={false}
        >
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
          {task.isDone && (
            <ListItemSecondaryAction>
              <IconButton onClick={wrapSP(() => store.deleteTask(task))}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          )}
        </ListItem>
      </Fragment>
    )
  }
}

@observer
class SelectedListContentHeader extends Component {
  render() {
    const {store} = this.props
    const list = store.selectedList
    return (
      <List disablePadding>
        <ListItem disableGutters className={cn('_pa0')}>
          <Input
            inputProps={{className: cn('pa2 ttu')}}
            fullWidth
            type="text"
            value={list.name}
            onChange={e => store.updateList({name: e.target.value}, list)}
          />
        </ListItem>
      </List>
    )
  }
}

@observer
class Tasks extends Component {
  render() {
    const {store} = this.props
    return (
      <List disablePadding className={cn('overflow-scroll pb5')}>
        {store.tasks.map(task => (
          <TaskItem key={task.id} task={task} store={store} />
        ))}
      </List>
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
          <Fragment key={list.id}>
            <ListName store={store} list={list} />
          </Fragment>
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
