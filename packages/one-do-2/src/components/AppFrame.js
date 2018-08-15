import React, {Component, Fragment} from 'react'
import {debugStore, rootStore, taskViewStore} from '../stores'
import {EventListener, FocusTrap, observer} from '../lib/little-react'
import TaskList from './TaskList'
import DebugDialog from './DebugDialog'

@withFocusTrap
@observer
class AppFrame extends Component {
  render() {
    return (
      <Fragment>
        <FocusTrap paused={rootStore.isFocusTrapPaused}>
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
