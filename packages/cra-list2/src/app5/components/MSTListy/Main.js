/*eslint-disable*/

import React from 'react'
import {Dashboard} from './Dashboard'
import {oInjectNamed} from '../little-mobx-react'
import {Box, DarkThemeProvider} from '../little-rebass'
import FocusTrap from 'focus-trap-react'
import {maybeOrNil} from '../../little-sanctuary'
import EventListener, {withOptions} from 'react-event-listener'

/*eslint-enable, eslint-disable no-empty-pattern*/

/* eslint-disable no-func-assign*/

class K extends React.Component {
  componentDidMount() {
    window.addEventListener(
      'keydown',
      this.props.root.onGlobalKeyDown,
    )
  }

  componentWillUnmount() {
    window.removeEventListener(
      'keydown',
      this.props.root.onGlobalKeyDown,
    )
  }

  render() {
    return null
  }
}

function ListyMain({root}) {
  return (
    <FocusTrap>
      <EventListener
        target={window}
        onKeyDown={root.onGlobalKeyDown}
      />
      <DarkThemeProvider>
        <Box colors={'root'} minHeight={'100vh'} fontFamily={'mono'}>
          {maybeOrNil(dashboard => (
            <Dashboard dashboard={dashboard} />
          ))(root.currentDashboard)}
          {/*<DomainPatches />*/}
          {/*<DebugStores />*/}
        </Box>
      </DarkThemeProvider>
    </FocusTrap>
  )
}

export default oInjectNamed('root')(ListyMain)
