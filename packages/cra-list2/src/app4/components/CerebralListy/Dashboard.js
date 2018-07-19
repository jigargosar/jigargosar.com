/* eslint-disable no-func-assign*/
import React from 'react'
import {cn} from '../utils'
import {connect, signal, state} from '../../little-cerebral'
import {_} from '../../little-ramda'
import {dashboardIdToBucketIds} from '../../CerebralListyState/controller'
import {Btn} from '../ui/tui'
import {ListPane} from './ListPane'
import {Bucket} from './Bucket'

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

export const CurrentDashboard = connect(
  {currentDashboardId: state`currentDashboardId`},
  function CurrentDashboard({currentDashboardId}) {
    return <Dashboard dashboardId={currentDashboardId} />
  },
)
