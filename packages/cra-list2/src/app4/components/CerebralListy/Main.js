import React from 'react'
import {CenterLayout, Title, TypographyDefaults} from '../ui'
import {cn, F, renderKeyedById} from '../utils'
import {AppHeaderBar} from '../mobx/AppHeaderBar'
import {Container} from '../../little-cerebral'
import {_, mapIndexed} from '../../little-ramda'
import {controller} from '../../CerebralListyState/controller'
import {nanoid} from '../../model/util'

// const NoteTextInput = connect(
//   {
//     setText: signal`setText`,
//     prependNewChild: signal`prependNewChild`,
//     appendSibling: signal`appendSibling`,
//     value: state`noteLookup.${props`id`}.text`,
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
//   {childrenIds: state`childrenLookup.${props`id`}`},
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

function Bucket({bucket}) {
  return (
    <div className={cn('pa3')}>
      <div>{bucket.name}</div>
      {}
    </div>
  )
}

function ListDashboard({dashboard}) {
  return <F>{renderKeyedById(Bucket, 'bucket', dashboard.buckets)}</F>
}

function Header({dashboards, selectedIdx}) {
  return (
    <div className={'shadow-1 bg-light-blue'}>
      <CenterLayout className={cn('flex items-center', 'pv1 pv2-ns')}>
        <div className={cn('flex-auto', 'flex mh3')}>
          {mapIndexed((dashboard, idx) => (
            <div
              key={idx}
              className={cn('f4 lh-title pa2', {
                'white bg-black': selectedIdx === idx,
              })}
            >
              {dashboard.name}
            </div>
          ))(dashboards)}
        </div>
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
    selectedIdx: 0,
  }
  return state

  function createBucketItem(i) {
    return {id: nanoid(), text: `${i} I ama todo ddda`}
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

const state = createState()

function ListyMain() {
  return (
    <Container controller={controller}>
      <TypographyDefaults className={cn('mb4')}>
        <Header
          dashboards={state.dashboards}
          selectedIdx={state.selectedIdx}
        />
        <CenterLayout>
          <ListDashboard
            dashboard={state.dashboards[state.selectedIdx]}
          />
        </CenterLayout>
      </TypographyDefaults>
    </Container>
  )
}

export default ListyMain
