/*eslint-disable*/

import React from 'react'
import {Dashboard} from './Dashboard'
import {oInjectNamed} from '../little-mobx-react'
import {maybeOrNil} from '../../little-ramda'
import {Box, DarkThemeProvider} from '../little-rebass'
import FocusTrap from 'focus-trap-react'
import {whenKeyPD, withKeyEvent} from '../utils'
import {getSelectionManager} from '../../mst/listy-stores/helpers'

/*eslint-enable, eslint-disable no-empty-pattern*/

/* eslint-disable no-func-assign*/

class K extends React.Component {
  kd = e =>
    withKeyEvent(
      whenKeyPD('up')(() =>
        this.selectionManager.maybeNavigatePrev(),
      ),
      whenKeyPD('down')(() =>
        this.selectionManager.maybeNavigateNext(),
      ),
    )(e)

  get selectionManager() {
    return getSelectionManager(this.props.domain)
  }

  componentDidMount() {
    window.addEventListener('keydown', this.kd)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.kd)
  }

  render() {
    return null
  }
}

function ListyMain({domain}) {
  return (
    <FocusTrap>
      <K domain={domain} />
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
