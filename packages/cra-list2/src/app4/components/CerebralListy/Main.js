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
  dashboardIdToBucketIds,
  itemById,
  controller,
} from '../../CerebralListyState/controller'

// const NoteTextInput = connect(
//   {
//     setText: signal`setText`,
//     prependNewChild: signal`prependNewChild`,
//     appendSibling: signal`appendSibling`,
//     value: fakeState`noteLookup.${props`id`}.text`,
//   },
//   function({setText, value, prependNewChild, appendSibling}, {id}) {
//     validate('FS', [setText, value])
//
//     return {
//       id,
//       onChange: e =>
//         setText({
//           text: e.target.value,
//           id,
//         }),
//       value,
//       onKeyDown: withKeyEvent(
//         whenKey('enter')(() => appendSibling({id})),
//         whenKey('alt+enter')(() => prependNewChild({id})),
//         // whenKey('backspace')(onBackspaceKeyDown),
//         // whenKey('tab')(wrapPD(indentNote)),
//         // whenKey('shift+tab')(wrapPD(unIndentNote)),
//         // whenKey('down')(wrapPD(navigateToNextNote)),
//         // whenKey('up')(wrapPD(navigateToPreviousNote)),
//         // whenKey('shift+up')(wrapPD(() => collapseNote(note))),
//         // whenKey('shift+down')(wrapPD(() => expandNote(note))),
//         // whenKey('mod+.')(wrapPD(() => setCurrentRootNote(note))),
//         // whenKey('mod+,')(wrapPD(setCurrentRootNoteOneLevelUp)),
//       ),
//     }
//   },
//   function NoteTextInput({id, value, onChange, onKeyDown}) {
//     return (
//       <input
//         id={id}
//         className={cn('flex-auto', 'ma0 pv2 bw0 outline-0')}
//         value={value}
//         onChange={onChange}
//         onKeyDown={onKeyDown}
//       />
//     )
//   },
// )
//
// function NoteTextLine({id}) {
//   return (
//     <div className={cn('code flex items-center')}>
//       <div className={cn('mr3')}>
//         {/*{isNoteExpanded(note) ? `-` : `+`}*/}
//         {`-`}
//       </div>
//       <div
//         className={cn(
//           'flex-auto',
//           'flex items-center',
//           'bb bw1 b--light-gray',
//         )}
//       >
//         <div className={cn('f6 gray mr3', 'dn_')}>
//           {id.slice(0, 3)}
//         </div>
//         <div className={cn('flex-auto', 'flex')}>
//           <NoteTextInput id={id} />
//         </div>
//       </div>
//     </div>
//   )
// }
//
// const NoteChildren = connect(
//   {childrenIds: fakeState`childrenLookup.${props`id`}`},
//   function NoteChildren({childrenIds}) {
//     // if (doesNoteHaveVisibleChildren(note)) {
//     // debugger
//     return (
//       <div className={cn('ml3')}>
//         {_.map(id => (
//           <F key={id}>
//             <NoteChild id={id} />
//           </F>
//         ))(childrenIds)}
//       </div>
//     )
//     // } else {
//     //   return null
//     // }
//   },
// )
// function NoteChild({id}) {
//   return (
//     <F>
//       <NoteTextLine id={id} />
//       <NoteChildren id={id} />
//     </F>
//   )
// }

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

const Component = BucketItem
const idName = 'itemId'

const BucketItems = connect(
  {idList: bucketIdToItemIds},
  function BucketItems({idList}) {
    return _.map(id => <Component key={id} {...{[idName]: id}} />)(
      idList,
    )
  },
)

const Bucket = connect(
  {addItem: signal`addItem`, bucket: bucketById},
  function Bucket({bucket, addItem}) {
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
        <BucketItems bucketId={bucket.id} />
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
            {_.map(bucketId => (
              <Bucket key={bucketId} bucketId={bucketId} />
            ))(bucketIds)}
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
