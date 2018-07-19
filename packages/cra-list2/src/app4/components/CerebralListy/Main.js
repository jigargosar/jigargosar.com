/* eslint-disable no-func-assign*/
import React from 'react'
import {CenterLayout, TypographyDefaults} from '../ui'
import {cn, PropTypes, wrapPD} from '../utils'
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
import {
  Error,
  Add,
  Edit,
  ModeEdit,
  AddCircleOutline,
} from '@material-ui/icons'

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

const BucketItem = connect(
  {
    selectItem: signal`selectItem`,
    item: itemById,
  },
  function BucketItem({item, selectItem}) {
    return (
      <ListItem tabIndex={0} onFocus={() => selectItem({item})}>
        <div className={cn('ph3', 'flex items-center')}>
          <input type={'checkbox'} tabIndex={-1} />
        </div>
        <div className={cn('code')}>{item.text}</div>
      </ListItem>
    )
  },
)

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

function Box({
  p,
  pt,
  pr,
  pb,
  pl,
  m,
  mt,
  mr,
  mb,
  ml,
  children,
  className,
  ...other
}) {
  return (
    <div
      className={cn(
        {
          [`pt${p} pr${p} pb${p} pl${p}`]: p,
          [`mt${m} mr${m} mb${m} ml${m}`]: m,
          [`pt${pt}`]: pt,
          [`pr${pr}`]: pr,
          [`pb${pb}`]: pb,
          [`pl${pl}`]: pl,
          [`mt${mt}`]: mt,
          [`mr${mr}`]: mr,
          [`mb${mb}`]: mb,
          [`ml${ml}`]: ml,
        },
        className,
      )}
      {...other}
    >
      {children}
    </div>
  )
}

function Row(className, children, ...other) {
  return (
    <div className={cn(className)} {...other}>
      {children}
    </div>
  )
}

const oneTo6 = ['1', '2', '3', '4', '5', '6', 1, 2, 3, 4, 5, 6]
Box.propTypes = {
  p: PropTypes.oneOf(oneTo6),
  m: PropTypes.oneOf(oneTo6),
  pt: PropTypes.oneOf(oneTo6),
  pr: PropTypes.oneOf(oneTo6),
  pb: PropTypes.oneOf(oneTo6),
  pl: PropTypes.oneOf(oneTo6),
  mt: PropTypes.oneOf(oneTo6),
  mr: PropTypes.oneOf(oneTo6),
  mb: PropTypes.oneOf(oneTo6),
  ml: PropTypes.oneOf(oneTo6),
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
        <div
          className={cn('pl3 mr3 f4', 'flex items-center lh-copy')}
        >
          <div className={cn('f5', 'flex-auto')}>{bucket.name}</div>
          <a
            href={'/add'}
            onClick={wrapPD(S.I)}
            className={cn(
              'mr1',
              'black-60 hover-black link grow',
              'flex items-center ',
            )}
          >
            <AddCircleOutline fontSize={'inherit'} />
          </a>
          <a
            href={'/add'}
            onClick={wrapPD(S.I)}
            className={cn(
              'black-60 hover-black link grow',
              'flex items-center',
            )}
          >
            <Edit fontSize={'inherit'} />
          </a>
        </div>
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
            action={addBucket}
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
