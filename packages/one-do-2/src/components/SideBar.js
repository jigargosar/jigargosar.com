import React, {Component} from 'react'
import withStyles from '@material-ui/core/styles/withStyles'
import Drawer from '@material-ui/core/Drawer/Drawer'
import {DrawerTaskLists} from './DrawerTaskLists'
import {withStore} from '../StoreContext'
import {
  handleCloseDrawer,
  handleCloseDrawerIfTemporary,
  xStore,
} from '../mst-models/RootStore'
import {drawerWidth} from './constants'
import {TopToolBar} from './TopToolBar'

@withStore @withStyles(theme => ({
  drawerPaper: {
    position: 'relative',
    width: drawerWidth,
  },
  drawerPaperClosed: {
    position: 'relative',
    width: 0,
  },
}))
export class SideBar extends Component {
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
        <TopToolBar/>
        <DrawerTaskLists store={store}/>
      </Drawer>
    )
  }
}
