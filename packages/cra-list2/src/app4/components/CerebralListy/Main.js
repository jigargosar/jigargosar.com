/* eslint-disable no-func-assign*/
import React from 'react'
import {CenterLayout, TypographyDefaults} from '../ui'
import {cn, F, wrapPD} from '../utils'
import {
  connect,
  Container,
  signal,
  state,
} from '../../little-cerebral'
import {_, idEq} from '../../little-ramda'
import {
  bucketById,
  bucketIdToItemIds,
  controller,
  dashboardIdToBucketIds,
  itemById,
} from '../../CerebralListyState/controller'

function listLinkCN() {
  return cn(
    'db',
    'pv2 pl3',
    'f7 lh-solid',
    'link code black-60',
    'hover-black hover-bg-light-blue',
  )
}

function BucketItem({text, onFocus}) {
  return (
    <div
      className={cn(
        // 'lh-copy f5',
        'f7 lh-solid',
        'pv2',
        'link',
        'outline-0 hover-bg-light-blue',
        'flex items-center',
      )}
      tabIndex={0}
      onFocus={onFocus}
    >
      <div className={cn('ph3', 'flex items-center')}>
        <input type={'checkbox'} tabIndex={-1} />
      </div>
      <div className={cn('code')}>{text}</div>
    </div>
  )
}

BucketItem = connect(
  {
    selectItem: signal`selectItem`,
    item: itemById,
  },
  function({selectItem, item}) {
    return {
      onFocus: () => selectItem({item}),
      text: item.text,
    }
  },
  BucketItem,
)

const Bucket = connect(
  {
    addItem: signal`addItem`,
    bucket: bucketById,
    itemIds: bucketIdToItemIds,
  },
  function Bucket({bucket, itemIds, addItem}) {
    return (
      <div
        className={cn(
          'w-100 w-50-m w-third-l fl',
          'pt3 pb3',
          'bg-white',
          'bb br b--moon-gray',
          // 'debug-grid-16-solid',
          // 'debug',
        )}
      >
        <div className={cn('f5 pl3 pb1')}>{bucket.name}</div>
        {/*<BucketItems bucketId={bucket.id} />*/}
        {_.map(id => <BucketItem key={id} itemId={id} />)(itemIds)}
        <a
          href={`/add-task`}
          className={cn(listLinkCN())}
          onClick={wrapPD(() => addItem({bucketId: bucket.id}))}
        >
          Add Task
        </a>
      </div>
    )
  },
)

const Dashboard = connect(
  {
    bucketIds: dashboardIdToBucketIds,
    addBucket: signal`addBucket`,
  },
  function Dashboard({bucketIds, addBucket}) {
    return (
      <F>
        <div
          className={cn(
            '',
            // 'bl-l bl-m b--moon-gray'
          )}
        >
          <div className={cn('flex flex-wrap ')}>
            {_.map(id => <Bucket key={id} bucketId={id} />)(
              bucketIds,
            )}
            <div onClick={() => addBucket()}>Add List</div>
          </div>
        </div>
      </F>
    )
  },
)

function headerLinkCN({isSelected = false}) {
  return cn(
    'input-reset button-reset',
    'link hover-z-1',
    'bn',
    'pa2',
    'code pointer',
    isSelected
      ? 'black bg-white-80 o-hover-black-70'
      : 'black hover-bg-white-20',
  )
}

const DashboardHeaderTabs = connect(
  {
    dashboards: state`dashboards`,
    currentDashboardId: state`currentDashboardId`,
    switchDashboard: signal`switchDashboard`,
  },
  function DashboardHeaderTabs({
    dashboards,
    currentDashboardId,
    switchDashboard,
  }) {
    return _.map(dashboard => {
      const isSelected = idEq(currentDashboardId, dashboard)
      return (
        <a
          onClick={wrapPD(() => switchDashboard({dashboard}))}
          href={`/dashboard/${dashboard.id}/${dashboard.name}`}
          key={dashboard.id}
          tabIndex={0}
          className={headerLinkCN({isSelected})}
        >
          {dashboard.name}
        </a>
      )
    })(dashboards)
  },
)

function Header({children}) {
  return (
    <div className={cn('black bg-light-blue', 'bb b--moon-gray')}>
      <CenterLayout className={cn('flex items-center', 'pv1 pv2-ns')}>
        <div className={cn('flex-auto', 'flex mh3')}>{children}</div>
        <div className={cn('flex f5 fw3 lh-title mh3')}>
          <a className={cn('link ml2 pointer')}>Help</a>
          <a className={cn('link ml2 pointer')}>Settings</a>
        </div>
      </CenterLayout>
    </div>
  )
}

function CurrentDashboard({currentDashboardId}) {
  return <Dashboard dashboardId={currentDashboardId} />
}

CurrentDashboard = connect(
  {currentDashboardId: state`currentDashboardId`},
  CurrentDashboard,
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
