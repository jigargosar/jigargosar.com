/*eslint-disable*/

import React, {Fragment} from 'react'
import {Dashboard} from './Dashboard'
import {oInjectNamed} from '../little-mobx-react'
import {Box, DarkThemeProvider} from '../little-rebass'
import FocusTrap from 'focus-trap-react'
import {maybeOrNil} from '../../little-sanctuary'

/*eslint-enable*/

function ListyMain({root}) {
  return (
    <DarkThemeProvider>
      <Box
        colors={'root'}
        minHeight={'100vh'}
        fontFamily={'mono'}
        onChange={console.warn}
        onKeyDown={root.onGlobalKeyDown}
      >
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
  )
}

export default oInjectNamed('root')(ListyMain)
