import React, {Component, Fragment} from 'react'
import PropTypes from 'prop-types'
import {FocusTrap, observer, wrapSP} from './lib/little-react'
import {computed, observable} from './lib/little-mst'
import {disposable} from './lib/hoc'
import {
  AppBar,
  Drawer,
  List,
  Toolbar,
  Typography,
  withStyles,
} from './lib/material-ui'
import EventListener from 'react-event-listener'
import cn from 'classnames'
import {Btn} from './lib/tachyons-components'
import {fWord} from './lib/fake'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import InboxIcon from '@material-ui/icons/MoveToInbox'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeftRounded'
import MenuIcon from '@material-ui/icons/MenuRounded'
import TaskListIcon from '@material-ui/icons/ListRounded'
import AddListIcon from '@material-ui/icons/PlaylistAddRounded'
import AddTaskIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/DeleteRounded'
import ListItemText from '@material-ui/core/ListItemText'
import ListItem from '@material-ui/core/ListItem'
import ListSubheader from '@material-ui/core/ListSubheader'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction/'
import IconButton from '@material-ui/core/IconButton'
import {_compose, F} from './lib/ramda'
import {pluralize} from './lib/little-ramda'
import withWidth, {isWidthUp} from '@material-ui/core/withWidth'
import {storage} from './lib/storage'
import {mapProps} from './lib/little-recompose'
import Button from '@material-ui/core/Button'

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
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    paddingBottom: theme.spacing.unit * 10,
    minWidth: 0, // So the Typography noWrap works
    overflow: 'scroll',
  },
  toolbar: theme.mixins.toolbar,
})

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
  @observable isDrawerOpen = true

  constructor(props, context) {
    super(props, context)
    this.isDrawerOpen = Boolean(storage.get('drawerState'))
  }

  componentDidMount() {
    this.props.autorun(() => {
      storage.set('drawerState', this.isDrawerOpen)
    })
  }

  toggleDrawer = (bool = !this.isDrawerOpen) => () => {
    this.isDrawerOpen = bool
  }

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
            variant={this.props.drawerVariant}
            classes={{
              paper: this.isDrawerOpen
                ? classes.drawerPaper
                : classes.drawerPaperClosed,
            }}
            open={this.isDrawerOpen}
            onClose={this.toggleDrawer(false)}
            onClick={this.toggleDrawer(false)}
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
            <Tasks store={store} />
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
class Tasks extends Component {
  render() {
    const {store} = this.props
    const list = store.selectedList
    return (
      <div className={cn('relative flex-auto overflow-scroll')}>
        <div className={cn('_pa2')}>
          <div className={cn('flex-auto')}>
            <input
              className={cn('w-100 pa1 ttu')}
              type="text"
              value={list.name}
              onChange={e =>
                store.updateList({name: e.target.value}, list)
              }
            />
          </div>
        </div>
        <List>
          {store.tasks.map(task => (
            <Fragment key={task.id}>
              <div className={cn('_pa2', 'flex items-center')}>
                <input
                  className={cn('mh2')}
                  checked={task.isDone}
                  onChange={e =>
                    store.updateTask({isDone: e.target.checked}, task)
                  }
                  type="checkbox"
                />
                {/*<div className={cn('flex-auto')}>{task.name}</div>*/}
                <div className={cn('flex-auto')}>
                  <input
                    className={cn('w-100 pa1')}
                    type="text"
                    value={task.name}
                    onChange={e =>
                      store.updateTask({name: e.target.value}, task)
                    }
                  />
                </div>
                {task.isDirty && <div>*</div>}
                <Btn onClick={wrapSP(() => store.deleteTask(task))}>X</Btn>
              </div>
            </Fragment>
          ))}
        </List>
      </div>
    )
  }
}

@observer
class MyLists extends Component {
  render({store} = this.props) {
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
class ListName extends Component {
  render() {
    const {store, list} = this.props
    const taskCount = list.tasks.length
    return (
      <ListItem
        className={cn('ttu', this.isSelected ? 'bg-black-10' : '')}
        button
        dense={true}
        onClick={() => store.selectList(list)}
        onDoubleClick={wrapSP(
          () => false && store.updateList({name: fWord()}, list),
        )}
      >
        {false && (
          <ListItemIcon>
            <InboxIcon />
          </ListItemIcon>
        )}
        {F() && (
          <ListItemIcon>
            <TaskListIcon />
          </ListItemIcon>
        )}
        <ListItemText
          primary={`${list.name}`}
          secondary={
            <Fragment>
              {`${taskCount} ${pluralize('TASK', taskCount)}`}
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

  @computed
  get isSelected() {
    const {store, list} = this.props
    return store.isSelected(list)
  }
}
