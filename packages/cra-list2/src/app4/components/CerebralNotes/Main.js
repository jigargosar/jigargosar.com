import React from 'react'
import {CenterLayout, Title, TypographyDefaults} from '../ui'
import {cn, F} from '../utils'
import {AppHeaderBar} from '../mobx/AppHeaderBar'
import {
  Compute,
  Controller,
  Module,
  connect,
  Container,
  props,
  signal,
  state,
} from './utils'

const computedNoteText = Compute(props`notePath`, (path, get) => {
  debugger
  if (!path) {
    return get(state`rootNote.text`)
  }
  return get(state`${path}.text`)
})

const NoteTextInput = connect(
  {
    setText: signal`setText`,
    value: computedNoteText,
  },
  function({setText, value}) {
    return {
      onChange: e =>
        setText({text: e.target.value, notePath: ['rootNote']}),
      value,
    }
  },
  function NoteTextInput({value, onChange}) {
    console.log(`value,onChange`, value, onChange)
    return (
      <input
        // id={getNoteId(note)}
        className={cn('flex-auto', 'ma0 pv2 bw0 outline-0')}
        // value={getNoteText(note)}
        value={value}
        onChange={onChange}
        // onKeyDown={onNoteInputKeyDown(note)}
      />
    )
  },
)

// const computeNoteFromNotePathProp = Compute(
//   props`notePath`,
//   (path, get) => {
//     if (!path) {
//       return get(state`rootNote`)
//     }
//     return get(state`${path}`)
//   },
// )

const NoteTextLine = connect(
  {},
  function(dp, p, resolve) {
    console.log(`args`, dp, p, resolve)
    return {...dp, ...p}
  },
  function NoteTextLine() {
    return (
      <div className={cn('code flex items-center')}>
        <div className={cn('mr3')}>
          {/*{isNoteExpanded(note) ? `-` : `+`}*/}
          {`-`}
        </div>
        <div
          className={cn(
            'flex-auto',
            'flex items-center',
            'bb bw1 b--light-gray',
          )}
        >
          {/*<div className={cn('f6 gray mr3', 'dn')}>*/}
          {/*{getDebugId(note)}*/}
          {/*</div>*/}
          <div className={cn('flex-auto', 'flex')}>
            <NoteTextInput />
          </div>
        </div>
      </div>
    )
  },
)
/**
 * @return {null}
 */
function NoteChildren({note}) {
  // if (doesNoteHaveVisibleChildren(note)) {
  //   return (
  //     <div className={cn('ml3')}>
  //       {_.map(childNote => (
  //         <F key={getNoteId(childNote)}>
  //           <NoteChild note={childNote} />
  //         </F>
  //       ))(selectChildren(note))}
  //     </div>
  //   )
  // } else {
  return null
  // }
}

function NoteChild({notePath}) {
  return (
    <F>
      <NoteTextLine notePath={notePath} />
      <NoteChildren notePath={notePath} />
    </F>
  )
}

const NoteTree = connect({}, function NoteTree() {
  return (
    <F>
      <div className={cn('ma3 pa3 shadow-1 bg-white')}>
        <NoteChild />
      </div>
    </F>
  )
})

function createAppController() {
  function getDevTools() {
    if (module.hot) {
      return require('cerebral/devtools').default({
        host: 'localhost:8585',
        reconnect: true,
      })
    }
    return null
  }

  const app = Module({
    // Define module state, namespaced by module path
    state: {
      rootNote: {text: 'Root Note Title', children: []},
      currentRootNotePath: ['rootNote'],
    },
    signals: {
      setText: ({state, props, ...other}) => {
        console.debug('other', other)
        state.set(`${props.notePath}.text`, props.text)
      },
    },
    modules: {},
    providers: {},
    catch: [],
  })

  const controller = Controller(app, {
    devtools: getDevTools(),
  })

  return controller
}

const controller = createAppController()

function Main() {
  return (
    <Container controller={controller}>
      <TypographyDefaults className={cn('mb4')}>
        <AppHeaderBar>
          <Title className={cn('flex-auto')}>
            {`Cerebral Note Outliner`}
          </Title>
        </AppHeaderBar>
        <CenterLayout>
          <NoteTree />
        </CenterLayout>
      </TypographyDefaults>
    </Container>
  )
}

export default Main
