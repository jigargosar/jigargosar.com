import React from 'react'
import {CenterLayout, Title, TypographyDefaults} from '../ui'
import {
  cn,
  F,
  setFocusAndSelectionOnDOMId,
  whenKey,
  withKeyEvent,
} from '../utils'
import {AppHeaderBar} from '../mobx/AppHeaderBar'
import {
  connect,
  Container,
  Controller,
  Module,
  props,
  signal,
  state,
} from '../../little-cerebral'
import {_, isNotNil, validate} from '../../little-ramda'
import {nanoid} from '../../model/util'
import {StorageItem} from '../../services/storage'

const NoteTextInput = connect(
  {
    setText: signal`setText`,
    prependNewChild: signal`prependNewChild`,
    appendSibling: signal`appendSibling`,
    value: state`noteLookup.${props`id`}.text`,
  },
  function({setText, value, prependNewChild, appendSibling}, {id}) {
    validate('FS', [setText, value])

    return {
      id,
      onChange: e =>
        setText({
          text: e.target.value,
          id,
        }),
      value,
      onKeyDown: withKeyEvent(
        whenKey('enter')(() => appendSibling({id})),
        whenKey('alt+enter')(() => prependNewChild({id})),
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
  function NoteTextInput({id, value, onChange, onKeyDown}) {
    return (
      <input
        id={id}
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
        <div className={cn('f6 gray mr3', 'dn_')}>
          {id.slice(0, 3)}
        </div>
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
    // debugger
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
function createNewNote({text, parentId = null}) {
  return {id: nanoid(), text: text, parentId}
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

  const storedState = StorageItem({
    name: 'CerebralNoteTreeState',
    getInitial: () => {
      const rootNote = createNewNote({text: 'Root Note Title'})
      const rootNoteId = rootNote.id

      const initialState = {
        rootNoteId,
        childrenLookup: {[rootNoteId]: []},
        noteLookup: {[rootNoteId]: rootNote},
        currentRootNoteId: rootNoteId,
      }
      return initialState
    },
    postLoad: state => {
      const ns = _.merge(state, {
        childrenLookup: _.compose(
          _.merge(_.map(() => [])(state.noteLookup)),
          _.map(_.map(_.prop('id'))),
          _.groupBy(_.prop('parentId')),
          _.values,
        )(state.noteLookup),
      })
      console.log(`ns`, ns)

      return ns
    },
  })

  const initialState = storedState.load()
  setFocusAndSelectionOnDOMId(initialState.rootNoteId)

  function getNote(id, state) {
    return state.get(`noteLookup.${id}`)
  }

  function hasParent(id, state) {
    const note = getNote(id, state)
    return isNotNil(note.parentId)
  }

  function getParentId(id, state) {
    const note = getNote(id, state)
    return note.parentId
  }

  function getParent(id, state) {
    return getNote(getParentId(id, state), state)
  }

  function getChildren(id, state) {
    return state.get(`childrenLookup.${id}`)
  }
  function getSiblings(id, state) {
    const parent = getParent(id, state)
    return getChildren(parent.id, state)
  }
  function getIndexOf(id, state) {
    const siblingNotes = getSiblings(id, state)
    return _.indexOf(id, siblingNotes)
  }

  const app = Module({
    // Define module state, namespaced by module path
    state: {...initialState},
    signals: {
      setText: ({state, props}) => {
        state.set(`noteLookup.${props.id}.text`, props.text)
      },
      prependNewChild: ({state, props}) => {
        const parentId = props.id
        const childNote = createNewNote({
          text: nanoid(7),
          parentId: parentId,
        })
        const childId = childNote.id
        state.unshift(`childrenLookup.${parentId}`, childId)
        state.set(`childrenLookup.${childId}`, [])
        state.set(`noteLookup.${childId}`, childNote)

        setFocusAndSelectionOnDOMId(childId)
      },
      appendSibling: ({state, props}) => {
        if (!hasParent(props.id, state)) {
          return
        }

        const idx = getIndexOf(props.id, state)
        const newNote = createNewNote({
          text: nanoid(7),
          parentId: getParentId(props.id, state),
        })
        const childId = newNote.id

        const childrenIds = state.get(
          `childrenLookup.${newNote.parentId}`,
        )

        state.set(
          `childrenLookup.${newNote.parentId}`,
          _.insert(idx + 1)(childId)(childrenIds),
        )

        state.set(`childrenLookup.${childId}`, [])
        state.set(`noteLookup.${childId}`, newNote)

        setFocusAndSelectionOnDOMId(childId)
      },
    },
    modules: {},
    providers: {},
    catch: [],
  })

  const controller = Controller(app, {
    devtools: getDevTools(),
  })

  // controller.on('mutation', mutation => {
  //   console.log(`mutation`, mutation)
  // })

  controller.on('flush', changes => {
    console.debug(`changes`, changes)
    storedState.save(controller.getState())
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
