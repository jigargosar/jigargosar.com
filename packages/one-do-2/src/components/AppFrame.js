import React, {Component, Fragment} from 'react'
import {rootStore, taskViewStore} from '../stores'
import {EventListener, observer} from '../lib/little-react'
import TaskList from './TaskList'
import DebugDialog from './DebugDialog'
import {FocusTrap} from '../lib/focus-trap-react'

@withFocusTrap
@observer
class AppFrame extends Component {
  render() {
    return (
      <Fragment>
        <FocusTrap
          paused={rootStore.isFocusTrapPaused}
          focusTrapOptions={{
            returnFocusOnDeactivate: false,
            fallbackFocus: document,
            initialFocus: `#${taskViewStore.selectedTaskId}`,
          }}
        >
          <DebugDialog />
          <EventListener
            target={document}
            onKeyDown={rootStore.onKeyDown}
          />
          <TaskList />
        </FocusTrap>
      </Fragment>
    )
  }
}

export default AppFrame

function withFocusTrap(BaseComponent) {
  return observer(function withFocusTrap(props) {
    return <BaseComponent {...props} />
  })
}
