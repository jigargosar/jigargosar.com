import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {FocusTrap, observer} from '../lib/little-react'
import {compose} from '../lib/ramda'
import withWidth, {isWidthUp} from '@material-ui/core/withWidth/withWidth'
import withStyles from '@material-ui/core/styles/withStyles'
import AppBar from '@material-ui/core/AppBar/AppBar'
import {afterMountAndUpdate} from '../lib/little-recompose'
import {withStore} from '../StoreContext'
import {EditTaskModal} from './EditTaskModal'
import BottomBar from './BottomBar'
import {xStore} from '../mst-models/RootStore'
import SelectedListContent from './SelectedListContent'
import GlobalEventListener from './GlobalEventListener'
import {EditListModal} from './EditListModal'
import {SideBar} from './SideBar'
import {TopToolBar} from './TopToolBar'

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

