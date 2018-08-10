import React, {Component} from 'react'
import PropTypes from 'prop-types'

import {mailFolderListItems, otherMailFolderListItems} from './tileData'
import {FocusTrap, observer} from './lib/little-react'
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
              {'You think water moves fast? You should see ice.'}
            </Typography>
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
