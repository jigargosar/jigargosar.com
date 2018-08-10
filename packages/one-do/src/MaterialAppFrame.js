import React, {Component, Fragment} from 'react'
import PropTypes from 'prop-types'

import {mailFolderListItems, otherMailFolderListItems} from './tileData'
import {FocusTrap, observer, wrapSP} from './lib/little-react'
import {computed, observable} from './lib/little-mst'
import {disposable} from './lib/hoc'
import {bindToggle, syncLS} from './lib/little-mobx-react'
import {
  withStyles,
  AppBar,
  Divider,
  List,
  Drawer,
  Typography,
  Toolbar,
} from './lib/material-ui'
import EventListener from 'react-event-listener'
import cn from 'classnames'
import {Btn} from './lib/tachyons-components'
import {fWord} from './lib/fake'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import InboxIcon from '@material-ui/icons/MoveToInbox'
import ListItemText from '@material-ui/core/ListItemText'
import ListItem from '@material-ui/core/ListItem'
import ListSubheader from '@material-ui/core/ListSubheader'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction/'

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
    minWidth: 0, // So the Typography noWrap works
    overflow: 'scroll',
  },
  toolbar: theme.mixins.toolbar,
})

@disposable
@observer
class MaterialAppFrame extends Component {
  @observable isDrawerOpen = true

  componentDidMount() {
    syncLS('drawerState')(['isDrawerOpen'])(this)
  }

  render() {
    const {classes, store} = this.props
    const isDrawerOpen = this.isDrawerOpen
    return (
      <FocusTrap focusTrapOptions={{fallbackFocus: document}}>
        <EventListener target={'document'} onKeyDown={store.onKeyDown} />
        <div className={classes.root}>
          <AppBar
            position="absolute"
            className={classes.appBar}
            onClick={bindToggle('isDrawerOpen')(this)}
          >
            <Toolbar>
              <Typography variant="title" color="inherit" noWrap>
                ONE DO
              </Typography>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="persistent"
            classes={{
              paper: isDrawerOpen
                ? classes.drawerPaper
                : classes.drawerPaperClosed,
            }}
            open={isDrawerOpen}
          >
            <div className={classes.toolbar} />
            <MyLists store={store} />
            <div className={cn('dn')}>
              <List>{mailFolderListItems}</List>
              <Divider />
              <List>{otherMailFolderListItems}</List>
            </div>
          </Drawer>
          <main className={classes.content}>
            <div className={classes.toolbar} />
            <Typography noWrap>
              {/*{'You think water moves fast? You should see ice.'}*/}
            </Typography>
            <Tasks store={store} />
          </main>
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
class Tasks extends Component {
  render({store} = this.props) {
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
          <Btn onClick={wrapSP(() => store.addTask({name: fWord()}))}>
            ADD
          </Btn>
        </div>
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
            <Btn onClick={wrapSP(() => store.addList({name: fWord()}))}>
              ADD
            </Btn>
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
    return (
      <ListItem
        className={cn('ttu', this.isSelected ? 'bg-black-10' : '')}
        button
        dense={false}
        onClick={wrapSP(() => store.selectList(list))}
        onDoubleClick={wrapSP(() =>
          store.updateList({name: fWord()}, list),
        )}
      >
        {false && (
          <ListItemIcon>
            <InboxIcon />
          </ListItemIcon>
        )}
        <ListItemText
          primary={
            <div className={cn('flex-auto', 'flex items-center')}>
              <div>{`${list.name}`}</div>
              <div className={cn('flex-auto ph1 gray self-start', 'f6')}>
                {`${list.tasks.length}`}
              </div>
              {list.isDirty && <div>*</div>}
            </div>
          }
        />
        <ListItemSecondaryAction>
          <Btn
            onClick={wrapSP(() => store.deleteList(list))}
            disabled={!store.canDeleteList}
          >
            X
          </Btn>
        </ListItemSecondaryAction>
      </ListItem>
    )
    return (
      <div
        className={cn(
          'pa2',
          'flex items-center ttu',
          store.isSelected(list) ? 'bg-black-10' : '',
        )}
        onClick={wrapSP(() => store.selectList(list))}
        onDoubleClick={wrapSP(() =>
          store.updateList({name: fWord()}, list),
        )}
      >
        <div className={cn('flex-auto', 'flex items-center')}>
          <div>{`${list.name}`}</div>
          <div className={cn('ph1 gray self-start', 'f6')}>
            {`${list.tasks.length}`}
          </div>
        </div>
        {list.isDirty && <div>*</div>}
        <Btn
          onClick={wrapSP(() => store.deleteList(list))}
          disabled={!store.canDeleteList}
        >
          X
        </Btn>
      </div>
    )
  }

  @computed
  get isSelected() {
    const {store, list} = this.props
    return store.isSelected(list)
  }
}
