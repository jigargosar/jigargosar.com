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
    // const length = get(state`${path}.children`).length
    // return _.times(idx => `${path}.children.${idx}`)(length)
    const id = get(state`${path}.id`)
    const childrenPath = `childrenLookup.${id}`
    const children = get(state`${childrenPath}`)
    const length = children ? children.length : 0
    return _.times(idx => `${childrenPath}.${idx}`)(length)
  },
)

const NoteTextInput = connect(
  {
    setText: signal`setText`,
    prependNewChild: signal`prependNewChild`,
    value: state`noteLookup.${props`id`}.text`,
  },
  function({setText, value, prependNewChild}, {id}) {
    validate('FS', [setText, value])

    return {
      onChange: e =>
        setText({
          text: e.target.value,
          id,
        }),
      value,
      onKeyDown: withKeyEvent(
        // whenKey('enter')(() => focusNote(appendNewSiblingNote(note))),
        whenKey('enter')(() => prependNewChild({id})),
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

function NoteTextLine({id}) {
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
          <NoteTextInput id={id} />
        </div>
      </div>
    </div>
  )
}

const NoteChildren = connect(
  {childrenIds: state`childrenLookup.${props`id`}`},
  function NoteChildren({childrenIds}) {
    // if (doesNoteHaveVisibleChildren(note)) {
    debugger
    return (
      <div className={cn('ml3')}>
        {_.map(id => (
          <F key={id}>
            <NoteChild id={id} />
          </F>
        ))(childrenIds)}
      </div>
    )
    // } else {
    //   return null
    // }
  },
)
function NoteChild({id}) {
  return (
    <F>
      <NoteTextLine id={id} />
      <NoteChildren id={id} />
    </F>
  )
}

const NoteTree = connect({id: state`rootNoteId`}, function NoteTree({
  id,
}) {
  return (
    <F>
      <div className={cn('ma3 pa3 shadow-1 bg-white')}>
        <NoteChild id={id} />
      </div>
    </F>
  )
})
function createNewNote({text}) {
  return {id: nanoid(), text: text}
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

  const rootNote = createNewNote({text: 'Root Note Title'})
  const app = Module({
    // Define module state, namespaced by module path
    state: {
      rootNoteId: rootNote.id,
      childrenLookup: {[rootNote.id]: []},
      noteLookup: {[rootNote.id]: rootNote},
      currentRootNotePath: ['rootNote'],
    },
    signals: {
      setText: ({state, props}) => {
        state.set(`noteLookup.${props.id}.text`, props.text)
      },
      prependNewChild: ({state, props}) => {
        const newNote = createNewNote({
          text: nanoid(7),
        })
        state.unshift(`childrenLookup.${props.id}`, newNote.id)
        state.set(`childrenLookup.${newNote.id}`, [])
        state.set(`noteLookup.${newNote.id}`, newNote)
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
