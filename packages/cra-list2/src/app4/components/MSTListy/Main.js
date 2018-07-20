/* eslint-disable no-func-assign*/
import React from 'react'
import {TypographyDefaults} from '../ui'
import {cn} from '../utils'
import {Container} from '../../little-cerebral'
import {controller} from '../../cerebral/CerebralListyState/controller'
import {DashboardHeaderTabs, Header} from './Header'
import {Dashboard} from './Dashboard'
import {observer} from 'mobx-react'

function ListyMain() {
  return (
    <Container controller={controller}>
      <TypographyDefaults className={cn('mb4')}>
        <Header>
          <DashboardHeaderTabs />
        </Header>
        <Dashboard />
      </TypographyDefaults>
    </Container>
  )
}

export default observer(ListyMain)
