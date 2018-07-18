import React from 'react'
import {CenterLayout, TypographyDefaults} from '../ui'
import {cn, F, renderKeyedById, wrapPD} from '../utils'
import {
  connect,
  Container,
  signal,
  state,
} from '../../little-cerebral'
import {_, idEq} from '../../little-ramda'
import {
  bucketFromProps,
  bucketItems,
  controller,
  currentBucketIds,
  currentDashboard,
} from '../../CerebralListyState/controller'
import {nanoid} from '../../model/util'

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

function BucketItem({item}) {
  return (
    <div
      className={cn(
        'flex items-center lh-copy f7',
        'pv2',
        'outline-0 hover-bg-light-blue',
      )}
      tabIndex={0}
    >
      <div className={cn('ph3', 'flex items-center')}>
        <input type={'checkbox'} tabIndex={-1} />
      </div>
      <div className={cn('code')}>{item.text}</div>
    </div>
  )
}

const BucketItems = connect(
  {items: bucketItems},
  function BucketItems({items}) {
    return <F>{renderKeyedById(BucketItem, 'item', items)}</F>
  },
)

const Bucket = connect(
  {addItem: signal`addItem`, bucket: bucketFromProps},
  function Bucket({bucket, addItem}) {
    return (
      <div
        className={cn(
          'w-100 w-50-m w-third-l fl',
          'pt3 pb2',
          'bg-white',
          'bb br b--moon-gray',
          // 'debug-grid-16-solid',
          // 'debug',
        )}
      >
        <div className={cn('f4 pl3 pb1')}>{bucket.name}</div>
        <BucketItems bucketId={bucket.id} />
        <div onClick={() => addItem({bucketId: bucket.id})}>
          Add Task
        </div>
      </div>
    )
  },
)

const Dashboard = connect(
  {
    bucketIds: currentBucketIds,
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

function linkCN({isSelected = false, isHeader = false}) {
  return cn(
    'input-reset button-reset',
    'link hover-z-1',
    'bn',
    'pa2',
    'code pointer outline-transparent',
    isSelected
      ? 'black bg-white-80 o-hover-black-70'
      : 'black hover-bg-white-20',
  )
}

const DashboardHeaderTabs = connect(
  {
    dashboards: state`dashboards`,
    currentDashboard: currentDashboard,
    switchDashboard: signal`switchDashboard`,
  },
  function DashboardHeaderTabs({
    dashboards,
    currentDashboard,
    switchDashboard,
  }) {
    return _.map(dashboard => (
      <a
        onClick={wrapPD(() => switchDashboard({dashboard}))}
        href={`/dashboard/${dashboard.id}/${dashboard.name}`}
        key={dashboard.id}
        tabIndex={0}
        className={linkCN({
          isHeader: true,
          isSelected: isSelected(dashboard),
        })}
      >
        {dashboard.name}
      </a>
    ))(dashboards)

    function isSelected(dashboard) {
      return currentDashboard === dashboard
    }
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

function createState() {
  const dashboards = [
    createDashboard({name: 'Master'}),
    createDashboard({name: 'Project X'}),
    createDashboard({name: 'Tutorial'}),
  ]

  const state = {
    dashboards,
    currentDashboardId: dashboards[0].id,
  }
  return state

  function createBucketItem(i) {
    return {
      id: nanoid(),
      text: `${i} I ama todo `,
    }
  }

  function createBucket(i) {
    return {
      id: nanoid(),
      name: `List ${i}`,
      items: _.times(createBucketItem)(3),
    }
  }

  function createDashboard({name}) {
    return {
      id: nanoid(),
      name,
      buckets: _.times(createBucket)(5),
    }
  }
}

function getCurrentDashboard() {
  return _.compose(
    _.defaultTo(fakeState.dashboards[0]),
    _.find(idEq(fakeState.currentDashboardId)),
  )(fakeState.dashboards)
}

const fakeState = createState()

function ListyMain() {
  return (
    <Container controller={controller}>
      <TypographyDefaults className={cn('mb4')}>
        <Header>
          <DashboardHeaderTabs />
        </Header>
        <Dashboard dashboard={getCurrentDashboard()} />
      </TypographyDefaults>
    </Container>
  )
}

export default ListyMain
