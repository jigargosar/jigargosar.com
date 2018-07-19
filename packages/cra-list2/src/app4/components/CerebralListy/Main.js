/* eslint-disable no-func-assign*/
import React from 'react'
import {CenterLayout, TypographyDefaults} from '../ui'
import {cn, wrapPD} from '../utils'
import {
  connect,
  Container,
  signal,
  state,
} from '../../little-cerebral'
import {_, idEq} from '../../little-ramda'
import {
  controller,
  dashboardIdToBucketIds,
} from '../../CerebralListyState/controller'
import {Add} from '@material-ui/icons'
import {Btn} from '../ui/tui'
import {ListPane} from './ListPane'
import {Bucket} from './Bucket'
import {DashboardHeaderTabs, Header} from './Header'

const Dashboard = connect(
  {
    bucketIds: dashboardIdToBucketIds,
    addBucket: signal`addBucket`,
  },
  function Dashboard({bucketIds, addBucket}) {
    return (
      <div className={cn('flex flex-wrap')}>
        {_.map(id => <Bucket key={id} bucketId={id} />)(bucketIds)}
        <ListPane>
          <ListPane.Item
            Component={Btn}
            colors={'black-50 hover-black-80 hover-bg-black-10'}
            onClick={() => addBucket()}
          >
            <ListPane.ItemText>{`Add List`}</ListPane.ItemText>
          </ListPane.Item>
        </ListPane>
      </div>
    )
  },
)

const CurrentDashboard = connect(
  {currentDashboardId: state`currentDashboardId`},
  function CurrentDashboard({currentDashboardId}) {
    return <Dashboard dashboardId={currentDashboardId} />
  },
)

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
