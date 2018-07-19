/* eslint-disable no-func-assign*/
import React from 'react'
import {TypographyDefaults} from '../ui'
import {cn} from '../utils'
import {Container} from '../../little-cerebral'
import {controller} from '../../CerebralListyState/controller'
import {DashboardHeaderTabs, Header} from './Header'
import {CurrentDashboard} from './Dashboard'

function ListyMain() {
  return (
    <Container controller={controller}>
      <TypographyDefaults className={cn('mb4')}>
        <Header>
          <DashboardHeaderTabs />
        </Header>
        <CurrentDashboard />
      </TypographyDefaults>
    </Container>
  )
}

export default ListyMain
