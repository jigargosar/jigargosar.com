import React, {Component, Fragment} from 'react'
import {rootStore, taskViewStore} from '../stores'
import {EventListener, observer} from '../lib/little-react'
import DebugDialog from './DebugDialog'
import {FocusTrap} from '../lib/focus-trap-react'
import TaskListScreen from './TaskListScreen'
import {disposable} from '../lib/hoc'

@disposable
@observer
class AppFrame extends Component {
  componentDidMount() {
    this.props.disposers.autorun(taskViewStore.getFocusManagerAutoRunner())
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
            // initialFocus: document,
            // onActivate() {
            //   console.log('onActivate')
            // },
            // onDeactivate() {
            //   console.log('onDeactivate')
            // },
          }}
          // active={!rootStore.isFocusTrapPaused}
          active={true}
          // onFocus={logPersistEvent}
          // onBlur={logPersistEvent}
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

