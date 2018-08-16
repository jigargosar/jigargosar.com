import React, {Component, Fragment} from 'react'
import {rootStore, taskViewStore} from '../stores'
import {EventListener, observer} from '../lib/little-react'
import DebugDialog from './DebugDialog'
import {FocusTrap} from '../lib/focus-trap-react'
import TaskListScreen from './TaskListScreen'

@observer
class AppFrame extends Component {
  componentDidMount() {
    taskViewStore.tryFocusSelectedTask()
  }

  render() {
    return (
      <Fragment>
        <FocusTrap
          paused={rootStore.isFocusTrapPaused}
          focusTrapOptions={{
            returnFocusOnDeactivate: false,
            escapeDeactivates: false,
            fallbackFocus: document,
            // onActivate() {
            //   console.log('onActivate')
            // },
            // onDeactivate() {
            //   console.log('onDeactivate')
            // },
          }}
          // active={!rootStore.isFocusTrapPaused}
          active={true}
        >
          <DebugDialog />
          <EventListener
            target={document}
            onKeyDown={rootStore.onKeyDown}
          />
          <TaskListScreen />
        </FocusTrap>
      </Fragment>
    )
  }
}

export default AppFrame
