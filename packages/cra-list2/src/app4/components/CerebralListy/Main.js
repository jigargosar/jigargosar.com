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
import {Add, AddCircleOutline, Delete, Edit} from '@material-ui/icons'
import {Btn, Row} from '../ui/tui'
import {rc} from '../recompose-utils'

const LI = _.compose(
  rc.defaultProps({
    tabIndex: 0,
    colors: 'black-80 hover-black hover-bg-black-10',
  }),
  rc.withProps(({className, colors}) => ({
    className: cn('w-100 link', colors, className),
  })),
)(Row)

const BucketItem = connect(
  {
    selectItem: signal`selectItem`,
    item: itemById,
  },
  function BucketItem({item, selectItem}) {
    return (
      <LI onFocus={() => selectItem({item})}>
        <div className={cn('ph3', 'flex items-center')}>
          <input type={'checkbox'} tabIndex={-1} />
        </div>
        <div className={cn('pv2 flex-auto code')}>{item.text}</div>
        <Btn className={cn('f4 black-60 hover-black link grow')}>
          <Delete fontSize={'inherit'} />
        </Btn>
      </LI>
    )
  },
)

function BucketWrapper({children}) {
  return (
    <div
      className={cn(
        'w-100 w-50-m w-third-l fl',
        'pt3 pb3',
        'bg-white',
        'bb br b--moon-gray',
      )}
    >
      {children}
    </div>
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
      <BucketWrapper>
        <Row pl={3} mr={3} className={cn('f4 lh-copy')}>
          <div className={cn('f5', 'flex-auto')}>{bucket.name}</div>
          <Btn
            onClick={onAddItem}
            className={cn('mr1', 'black-60 hover-black grow')}
          >
            <AddCircleOutline fontSize={'inherit'} />
          </Btn>
          <Btn className={cn('black-60 hover-black grow')}>
            <Edit fontSize={'inherit'} />
          </Btn>
        </Row>
        {_.map(id => <BucketItem key={id} itemId={id} />)(itemIds)}
        <LI
          colors="black-50 hover-black-80 hover-bg-black-10"
          onClick={onAddItem}
        >
          <Row
            className={cn('f5 flex-auto pv2 ph3')}
          >{`Add Task`}</Row>
        </LI>
      </BucketWrapper>
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
        <BucketWrapper>
          <LI
            className={cn('pl3')}
            colors={'black-70 hover-black hover-bg-light-blue'}
            action={addBucket}
          >{`Add List`}</LI>
        </BucketWrapper>
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
