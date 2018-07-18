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
import {_, idEq, S} from '../../little-ramda'
import {
  bucketById,
  bucketIdToItemIds,
  controller,
  dashboardIdToBucketIds,
  itemById,
} from '../../CerebralListyState/controller'
import * as PropTypes from 'prop-types'

function ListItem({
  children,
  className,
  action = S.I,
  colors = 'black hover-black hover-bg-light-blue',
  ...other
}) {
  return (
    <a
      href={'/'}
      onClick={wrapPD(action)}
      className={cn(
        'db',
        'pv2',
        'f7 lh-solid',
        'link code',
        colors,
        'flex items-center',
        className,
      )}
      tabIndex={0}
      {...other}
    >
      {children}
    </a>
  )
}

// function listLinkCN() {
//   return cn(
//     'db',
//     'pv2',
//     'f7 lh-solid',
//     'link code ',
//     'black-60 hover-black hover-bg-light-blue',
//     'flex items-center',
//   )
// }
//
// function itemCN() {
//   return cn(
//     'db',
//     'pv2',
//     'f7 lh-solid',
//     'link code',
//     'hover-black hover-bg-light-blue',
//     'flex items-center',
//   )
// }

const BucketItem = connect(
  {
    selectItem: signal`selectItem`,
    item: itemById,
  },
  function BucketItem({item, selectItem}) {
    return (
      <ListItem
        // className={itemCN()}
        tabIndex={0}
        onFocus={() => selectItem({item})}
      >
        <div className={cn('ph3', 'flex items-center')}>
          <input type={'checkbox'} tabIndex={-1} />
        </div>
        <div className={cn('code')}>{item.text}</div>
      </ListItem>
    )
  },
)

function ListButton(props) {
  return (
    <a
      href={`/add-task`}
      className={cn('black-60 pl3 outline-0')}
      onClick={wrapPD(props.fn)}
      tabIndex={-1}
    >
      {props.children}
    </a>
  )
}

ListButton.propTypes = {
  fn: PropTypes.func,
}

ListButton.defaultProps = {
  fn: S.I,
}

function BucketLayout({children}) {
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
      <BucketLayout>
        <div className={cn('f5 pl3 pb1')}>{bucket.name}</div>
        {_.map(id => <BucketItem key={id} itemId={id} />)(itemIds)}
        <ListItem
          className={cn('pl3')}
          colors="black-70 hover-black hover-bg-light-blue"
          href={`/add-task`}
          action={onAddItem}
        >
          {`Add Task`}
        </ListItem>
      </BucketLayout>
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
        <BucketLayout>
          <ListItem
            className={cn('pl3')}
            colors={'black-70 hover-black hover-bg-light-blue'}
            onClick={addBucket}
          >{`Add List`}</ListItem>
        </BucketLayout>
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
