import {StorageItem} from '../services/storage'
import {_, findById, validate} from '../little-ramda'
import {setFocusAndSelectionOnDOMId} from '../components/utils'
import {
  Compute,
  createAppController,
  logProps,
  Module,
  pauseFlowThe,
  props,
  push,
  set,
  state,
  string,
  unshift,
} from '../little-cerebral'
import nanoid from 'nanoid'

function createDashboard({id = nanoid(), name}) {
  return {
    id,
    name,
  }
}

function createBucketItem() {
  return {
    id: nanoid(),
    text: `I ama todo `,
  }
}
function createBucket({dashboardId, name = `New List`}) {
  return {
    id: nanoid(),
    dashboardId,
    name,
  }
}

function createInitialState() {
  const masterDashboard = createDashboard({name: 'Master'})

  const dashboards = [
    masterDashboard,
    createDashboard({name: 'Project X'}),
    createDashboard({name: 'Tutorial'}),
  ]

  const state = {
    dashboards,
    currentDashboardId: masterDashboard.id,
  }
  return state
}

function createNewNote({text, parentId = null}) {
  validate('S', [text])
  validate('S|Z', [parentId])
  return {id: nanoid(), text: text, parentId}
}

function createNewNoteAF({text = '', parentId = null}) {
  return function createNewNoteAction({resolve}) {
    const resolvedText = resolve.value(text)
    return {
      newNoteAF: createNewNote({
        text: _.is(Function)(resolvedText)
          ? resolvedText()
          : resolvedText,
        parentId: resolve.value(parentId),
      }),
    }
  }
}

function createRootModule() {
  const storedState = StorageItem({
    name: 'CerebralListyState',
    getInitial: createInitialState,
    postLoad: state => {
      // const ns = _.merge(state, {
      //   childrenLookup: _.compose(
      //     _.merge(_.map(() => [])(state.noteLookup)),
      //     _.map(_.map(_.prop('id'))),
      //     _.groupBy(_.prop('parentId')),
      //     _.values,
      //   )(state.noteLookup),
      // })
      // console.debug(`ns`, ns)
      //
      // return ns
      return _.mergeWith(_.defaultTo)(
        {dashboards: [], buckets: [], items: []},
        state,
      )
    },
  })

  const decodedState = storedState.load()
  // setFocusAndSelectionOnDOMId(decodedState.rootNoteId)

  const rootModule = Module(module => {
    module.controller.on('flush', changes => {
      console.debug(`changes`, changes)
      storedState.save(controller.getState())
    })

    return {
      // Define module state, namespaced by module path
      state: {...decodedState},
      signals: {
        switchDashboard: [
          set(state`currentDashboardId`, props`dashboard.id`),
        ],
        addBucket: [
          ({props, state}) => ({
            newBucket: createBucket({
              dashboardId: state.get('currentDashboardId'),
            }),
          }),
          push(state`buckets`, props`newBucket`),
        ],
        setText: [
          set(props`notePath`, string`noteLookup.${props`id`}`),
          set(state`${props`notePath`}.text`, props`text`),
        ],
        prependNewChild: [
          createNewNoteAF({
            text: () => nanoid(7),
            parentId: props`id`,
          }),
          logProps,
          pauseFlowThe,
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
      },
      modules: {},
      providers: {storedState},
      catch: [],
    }
  })
  return rootModule
}

export const controller = createAppController(createRootModule())

export const currentDashboard = Compute(
  state`currentDashboardId`,
  state`dashboards`,
  findById,
)
export const currentBuckets = Compute(
  state`currentDashboardId`,
  state`buckets`,
  _.useWith(_.filter)([_.propEq('dashboardId'), _.defaultTo([])]),
)
