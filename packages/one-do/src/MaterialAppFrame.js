import React, {Component, Fragment} from 'react'
import PropTypes from 'prop-types'

import {mailFolderListItems, otherMailFolderListItems} from './tileData'
import {FocusTrap, observer, wrapSP} from './lib/little-react'
import {observable} from './lib/little-mst'
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

const drawerWidth = 240

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: '100vh',
    zIndex: 1,
    overflow: 'hidden',
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
            <List>{mailFolderListItems}</List>
            <Divider />
            <List>{otherMailFolderListItems}</List>
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
      <Fragment>
        <div className={cn('pa2')}>
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
            <div className={cn('pa2', 'flex items-center')}>
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
      </Fragment>
    )
  }
}
