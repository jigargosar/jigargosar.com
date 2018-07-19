/* eslint-disable no-func-assign*/
import React from 'react'
import {cn} from '../utils'
import {connect, state} from '../../little-cerebral'
import {_} from '../../little-ramda'
import {Btn} from '../ui/tui'
import {ListPane} from './ListPane'
import {Bucket} from './Bucket'
import {inject, observer} from 'mobx-react'

function Dashboard({bucketIds, addBucket, dashboardId}) {
  return (
    <div className={cn('flex flex-wrap')}>
      {_.map(id => <Bucket key={id} bucketId={id} />)(bucketIds)}
      <ListPane>
        <ListPane.Item
          Component={Btn}
          colors={'black-50 hover-black-80 hover-bg-black-10'}
          onClick={() => addBucket({dashboardId})}
        >
          <ListPane.ItemText>{`Add List`}</ListPane.ItemText>
        </ListPane.Item>
      </ListPane>
    </div>
  )
}
// Dashboard = connect(
//   {
//     bucketIds: dashboardIdToBucketIds,
//     addBucket: signal`addBucket`,
//   },
//   Dashboard,
// )

Dashboard = _.compose(
  inject(store => ({
    bucketIds: ['1'],
    addBucket: _.F,
    dashboardId: null,
  })),
  observer,
)(Dashboard)

export const CurrentDashboard = connect(
  {currentDashboardId: state`currentDashboardId`},
  function CurrentDashboard({currentDashboardId}) {
    return <Dashboard dashboardId={currentDashboardId} />
  },
)
