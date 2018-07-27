/*eslint-disable*/

import React, {Fragment} from 'react'
import {Dashboard} from './Dashboard'
import {oInjectNamed} from '../little-mobx-react'
import {Box, DarkThemeProvider} from '../little-rebass'
import FocusTrap from 'focus-trap-react'
import {maybeOrNil} from '../../little-sanctuary'
import EventListener from 'react-event-listener'

/*eslint-enable*/

function ListyMain({root}) {
  return (
    <Fragment>
      <EventListener
        target={window}
        onKeyDown={root.onGlobalKeyDown}
      />
      <DarkThemeProvider>
        <Box colors={'root'} minHeight={'100vh'} fontFamily={'mono'}>
          {maybeOrNil(dashboard => (
            <FocusTrap
              focusTrapOptions={{
                escapeDeactivates: false,
                clickOutsideDeactivates: false,
              }}
            >
              <Dashboard dashboard={dashboard} />
            </FocusTrap>
          ))(root.currentDashboard)}
          {/*<DomainPatches />*/}
          {/*<DebugStores />*/}
        </Box>
      </DarkThemeProvider>
    </Fragment>
  )
}

export default oInjectNamed('root')(ListyMain)
