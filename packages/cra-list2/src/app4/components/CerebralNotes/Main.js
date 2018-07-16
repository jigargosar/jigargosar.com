import React from 'react'
import {CenterLayout, Title, TypographyDefaults} from '../ui'
import {cn, F, whenKey, withKeyEvent} from '../utils'
import {AppHeaderBar} from '../mobx/AppHeaderBar'
import {
  Compute,
  connect,
  Container,
  Controller,
  Module,
  props,
  signal,
  state,
} from './utils'
import {_, mapIndexed, validate} from '../../little-ramda'
import {nanoid} from '../../model/util'

const computedNoteChildrenPaths = Compute(
  props`notePath`,
  (path, get) => {
    const length = get(state`${path}.children`).length
    return _.times(idx => `${path}.children.${idx}`)(length)
  },
)

const NoteTextInput = connect(
  {
    setText: signal`setText`,
    prependNewChild: signal`prependNewChild`,
    value: state`${props`notePath`}.text`,
  },
  function({setText, value, prependNewChild}, {notePath}) {
    validate('FS', [setText, value])

    return {
      onChange: e =>
        setText({
          text: e.target.value,
          notePath,
        }),
      value,
      onKeyDown: withKeyEvent(
        // whenKey('enter')(() => focusNote(appendNewSiblingNote(note))),
        whenKey('enter')(() => prependNewChild({notePath})),
        // whenKey('backspace')(onBackspaceKeyDown),
        // whenKey('tab')(wrapPD(indentNote)),
        // whenKey('shift+tab')(wrapPD(unIndentNote)),
        // whenKey('down')(wrapPD(navigateToNextNote)),
        // whenKey('up')(wrapPD(navigateToPreviousNote)),
        // whenKey('shift+up')(wrapPD(() => collapseNote(note))),
        // whenKey('shift+down')(wrapPD(() => expandNote(note))),
        // whenKey('mod+.')(wrapPD(() => setCurrentRootNote(note))),
        // whenKey('mod+,')(wrapPD(setCurrentRootNoteOneLevelUp)),
      ),
    }
  },
  function NoteTextInput({value, onChange, onKeyDown}) {
    return (
      <input
        // id={getNoteId(note)}
        className={cn('flex-auto', 'ma0 pv2 bw0 outline-0')}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    )
  },
)

function NoteTextLine({notePath}) {
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
          <NoteTextInput notePath={notePath} />
        </div>
      </div>
    </div>
  )
}

const NoteChildren = connect(
  {childPaths: computedNoteChildrenPaths},
  function NoteChildren({childPaths}) {
    // if (doesNoteHaveVisibleChildren(note)) {
    debugger
    return (
      <div className={cn('ml3')}>
        {mapIndexed(notePath => (
          <F key={notePath}>
            <NoteChild notePath={notePath} />
          </F>
        ))(childPaths)}
      </div>
    )
    // } else {
    //   return null
    // }
  },
)
function NoteChild({notePath}) {
  return (
    <F>
      <NoteTextLine notePath={notePath} />
      <NoteChildren notePath={notePath} />
    </F>
  )
}

function NoteTree() {
  return (
    <F>
      <div className={cn('ma3 pa3 shadow-1 bg-white')}>
        <NoteChild notePath={'rootNote'} />
      </div>
    </F>
  )
}

function createNewNote({text}) {
  return {id: nanoid(), text: text, children: []}
}

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
      rootNote: createNewNote({text: 'Root Note Title'}),
      currentRootNotePath: ['rootNote'],
    },
    signals: {
      setText: ({state, props, ...other}) => {
        console.debug('other', other)
        state.set(`${props.notePath}.text`, props.text)
      },
      prependNewChild: ({state, props}) => {
        state.unshift(
          `${props.notePath}.children`,
          createNewNote({
            text: 'new child',
          }),
        )
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
