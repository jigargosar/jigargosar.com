import {StorageItem} from '../services/storage'
import {_, isNotNil, validate} from '../little-ramda'
import {setFocusAndSelectionOnDOMId} from '../components/utils'
import {
  Controller,
  Module,
  props,
  set,
  state,
  string,
  unshift,
} from '../little-cerebral'
import nanoid from 'nanoid'

function createNewNote({text, parentId = null}) {
  validate('S', [text])
  validate('S|Z', [parentId])
  return {id: nanoid(), text: text, parentId}
}

function createNewNoteAF(text = '', parentId = null) {
  return function createNewNoteAction({resolve}) {
    console.log(`resolve`, resolve)
    console.log(
      `resolve.value(() => nanoid(6))`,
      resolve.value(() => nanoid(6)),
    )
    debugger
    const resolvedText = resolve.value(text)
    return {
      newNoteAF: createNewNote({
        text: _.is(Function)(resolvedText) ? text() : text,
        parentId: resolve.value(parentId),
      }),
    }
  }
}

function getDevTools() {
  if (module.hot) {
    return require('cerebral/devtools').default({
      host: 'localhost:8585',
      reconnect: true,
    })
  }
  return null
}

function createApp() {
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
      console.debug(`ns`, ns)

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

  const app = Module(module => {
    module.controller.on('flush', changes => {
      console.debug(`changes`, changes)
      storedState.save(controller.getState())
    })
    return {
      // Define module state, namespaced by module path
      state: {...initialState},
      signals: {
        setText: [
          set(props`notePath`, string`noteLookup.${props`id`}`),
          set(state`${props`notePath`}.text`, props`text`),
        ],
        prependNewChild: [
          createNewNoteAF(nanoid(7), props`id`),
          ({props}) => {
            console.log(`props`, props)
          },
          ({props: {id}}) => ({
            newNote: createNewNote({
              text: nanoid(7),
              parentId: id,
            }),
          }),
          set(state`childrenLookup.${props`newNote.id`}`, []),
          set(state`noteLookup.${props`newNote.id`}`, props`newNote`),
          unshift(
            state`childrenLookup.${props`newNote.parentId`}`,
            props`newNote.id`,
          ),
          ({props}) => {
            setFocusAndSelectionOnDOMId(props.newNote.id)
          },
        ],
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
      providers: {storedState},
      catch: [],
    }
  })
  return app
}

function createAppController() {
  const controller = Controller(createApp(), {
    devtools: getDevTools(),
  })

  return controller
}

export const controller = createAppController()
