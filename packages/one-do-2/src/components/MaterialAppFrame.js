import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {FocusTrap, observer} from '../lib/little-react'

import cn from 'classnames'
import {compose} from '../lib/ramda'
import MenuIcon from '@material-ui/icons/MenuRounded'
import IconButton from '@material-ui/core/IconButton/IconButton'
import withWidth, {isWidthUp} from '@material-ui/core/withWidth/withWidth'
import withStyles from '@material-ui/core/styles/withStyles'
import Typography from '@material-ui/core/Typography/Typography'
import Toolbar from '@material-ui/core/Toolbar/Toolbar'
import Drawer from '@material-ui/core/Drawer/Drawer'
import AppBar from '@material-ui/core/AppBar/AppBar'
import {afterMountAndUpdate} from '../lib/little-recompose'
import {DrawerTaskLists} from './DrawerTaskLists'
import {withStore} from '../StoreContext'
import {EditTaskModal} from './EditTaskModal'
import BottomBar from './BottomBar'
import {
  handleCloseDrawer,
  handleCloseDrawerIfTemporary,
  handleToggleDrawer,
  xStore,
} from '../mst-models/RootStore'
import {drawerWidth} from './constants'
import SelectedListContent from './SelectedListContent'
import GlobalEventListener from './GlobalEventListener'
import {EditListModal} from './EditListModal'

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
        <IconButton color={'inherit'} onClick={handleToggleDrawer}>
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
    const isDrawerOpen = xStore.isDrawerOpen
    return (
      <Drawer
        variant={xStore.drawerVariant}
        classes={{
          paper: isDrawerOpen
            ? classes.drawerPaper
            : classes.drawerPaperClosed,
        }}
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        onClick={handleCloseDrawerIfTemporary}
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
    xStore.setIsLayoutMobile(!isWidthUp('sm', width)),
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

