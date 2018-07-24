/*eslint-disable*/

import React from 'react'
import {Dashboard} from './Dashboard'
import {oInjectNamed} from '../little-mobx-react'
import {maybeOrNil} from '../../little-ramda'
import {Box, DarkThemeProvider} from '../little-rebass'
import FocusTrap from 'focus-trap-react'

/*eslint-enable, eslint-disable no-empty-pattern*/

/* eslint-disable no-func-assign*/

function ListyMain({domain}) {
  return (
    <FocusTrap>
      <DarkThemeProvider>
        <Box colors={'root'} minHeight={'100vh'} fontFamily={'mono'}>
          {maybeOrNil(dashboard => (
            <Dashboard dashboard={dashboard} />
          ))(domain.currentDashboard)}
          {/*<DomainPatches />*/}
          {/*<DebugStores />*/}
        </Box>
      </DarkThemeProvider>
    </FocusTrap>
  )
}

export default oInjectNamed('store', 'domain')(ListyMain)
