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
  bucketById,
  bucketIdToItemIds,
  controller,
  dashboardIdToBucketIds,
  itemById,
} from '../../CerebralListyState/controller'
import {Add, Delete, PlaylistAdd, Settings} from '@material-ui/icons'
import {Btn, Row} from '../ui/tui'
import {ListPane} from './ListPane'

const BucketItem = connect(
  {
    selectItem: signal`selectItem`,
    item: itemById,
  },
  function BucketItem({item, selectItem}) {
    return (
      <ListPane.Item onFocus={() => selectItem({item})}>
        <Row p={2}>
          <input type={'checkbox'} tabIndex={-1} />
        </Row>
        <ListPane.ItemText className={cn('code')}>
          {item.text}
        </ListPane.ItemText>
        <ListPane.ItemAction Icon={Delete} />
      </ListPane.Item>
    )
  },
)

function renderBucketHeader(bucket, onAddItem) {
  return (
    <ListPane.Item className={cn('f4 lh-copy')}>
      <ListPane.ItemText className={cn('f5', 'flex-auto')}>
        {bucket.name}
      </ListPane.ItemText>
      <ListPane.ItemAction onClick={onAddItem} Icon={PlaylistAdd} />
      <ListPane.ItemAction Icon={Settings} />
    </ListPane.Item>
  )
}

function renderBucketAddItem(onAddItem) {
  return (
    <ListPane.Item
      colors="black-50 hover-black-80 hover-bg-black-10"
      onClick={onAddItem}
    >
      <ListPane.ItemText>{`Add Task`}</ListPane.ItemText>
    </ListPane.Item>
  )
}

const Bucket = connect(
  {
    addItem: signal`addItem`,
    bucket: bucketById,
    itemIds: bucketIdToItemIds,
  },
  ({bucket, addItem, itemIds}) => ({
    onAddItem: () => addItem({bucketId: bucket.id}),
    bucket,
    itemIds,
  }),
  function Bucket({bucket, itemIds, onAddItem}) {
    return (
      <ListPane>
        {renderBucketHeader(bucket, onAddItem)}
        {_.map(id => <BucketItem key={id} itemId={id} />)(itemIds)}
        {renderBucketAddItem(onAddItem)}
      </ListPane>
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
      <div className={cn('flex flex-wrap')}>
        {_.map(id => <Bucket key={id} bucketId={id} />)(bucketIds)}
        <ListPane>
          <ListPane.Item
            colors={'black-50 hover-black-80 hover-bg-black-10'}
            onClick={addBucket}
          >
            <ListPane.ItemText>{`Add List`}</ListPane.ItemText>
          </ListPane.Item>
        </ListPane>
      </div>
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
        <div className={cn('', 'flex ml3')}>{children}</div>
        <div className={cn('flex items-center mh3')}>
          <Add />
        </div>
        <div className={cn('flex-auto', 'flex mh3')} />
        <div className={cn('flex f5 fw3 lh-title mh3')}>
          <a className={cn('link ml2 pointer')}>Help</a>
          <a className={cn('link ml2 pointer')}>Settings</a>
        </div>
      </CenterLayout>
    </div>
  )
}

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
