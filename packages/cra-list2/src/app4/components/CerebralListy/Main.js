import React from 'react'
import {CenterLayout, TypographyDefaults} from '../ui'
import {cn, F, renderKeyedById} from '../utils'
import {connect, Container, state} from '../../little-cerebral'
import {_, idEq} from '../../little-ramda'
import {controller} from '../../CerebralListyState/controller'
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

function Bucket({bucket}) {
  return (
    <div
      className={cn(
        'w-100 w-50-ns fl',
        'pt3 pb2',
        'bg-white bw-1px bb br',
        // 'debug-grid-16-solid',
        // 'debug',
      )}
    >
      <div className={cn('f4 pl3 pb1')}>{bucket.name}</div>
      {renderKeyedById(BucketItem, 'item', bucket.items)}
    </div>
  )
}

function ListDashboard({dashboard}) {
  return (
    <F>
      <div className={cn('bw-1px bl-l')}>
        {renderKeyedById(Bucket, 'bucket', dashboard.buckets)}
        <div className={cn('cf')} />
      </div>
    </F>
  )
}

const DashboardHeaderTabs = connect(
  {
    dashboards: state`dashboards`,
    currentDashboardId: state`currentDashboardId`,
  },
  function DashboardHeaderTabs({dashboards, currentDashboardId}) {
    return _.map(d => (
      <div
        key={d.id}
        className={cn('f4 lh-title pa2', {
          underline: currentDashboardId === d.id,
        })}
      >
        {d.name}
      </div>
    ))(dashboards)
  },
)

function Header({children}) {
  return (
    <div className={'bg-light-blue bw-1px bb'}>
      <CenterLayout className={cn('flex items-center', 'pv1 pv2-ns')}>
        <div className={cn('flex-auto', 'flex mh3')}>{children}</div>
        <div className={cn('flex f5 lh-title mh3')}>
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

function isCurrentDashboard(dashboard) {
  return dashboard.id === fakeState.currentDashboardId
}

function getCurrentDashboard() {
  return _.compose(
    _.defaultTo(fakeState.dashboards[0]),
    _.find(idEq(fakeState.currentDashboardId)),
  )(fakeState.dashboards)
}

const fakeState = createState()

function getDashboards() {
  return fakeState.dashboards
}

function ListyMain() {
  return (
    <Container controller={controller}>
      <TypographyDefaults className={cn('mb4')}>
        <Header>
          <DashboardHeaderTabs />
        </Header>
        <CenterLayout>
          <ListDashboard dashboard={getCurrentDashboard()} />
        </CenterLayout>
      </TypographyDefaults>
    </Container>
  )
}

export default ListyMain
