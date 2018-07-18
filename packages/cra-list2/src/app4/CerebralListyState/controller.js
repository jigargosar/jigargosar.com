import {StorageItem} from '../services/storage'
import {
  _,
  findById,
  findByMaybeId,
  modelsToIds,
  S,
  validate,
} from '../little-ramda'
import {
  Compute,
  computeToMaybe,
  createAppController,
  Module,
  props,
  push,
  resolveValue,
  set,
  state,
} from '../little-cerebral'
import nanoid from 'nanoid'

function createDashboard({id = nanoid(), name = 'New Dash'}) {
  return {
    id,
    name,
  }
}

function createBucketItem({bucketId}) {
  validate('S', [bucketId])

  return {
    bucketId,
    id: nanoid(),
    text: `I ama todo `,
  }
}
function createBucket({dashboardId, name = `New List`}) {
  validate('S', [dashboardId])
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
    nullableSelectedItemId: null,
  }
  return state
}

// function createNewNote({text, parentId = null}) {
//   validate('S', [text])
//   validate('S|Z', [parentId])
//   return {id: nanoid(), text: text, parentId}
// }

// function createNewNoteAF({text = '', parentId = null}) {
//   return function createNewNoteAction({resolve}) {
//     const resolvedText = resolve.value(text)
//     return {
//       newNoteAF: createNewNote({
//         text: _.is(Function)(resolvedText)
//           ? resolvedText()
//           : resolvedText,
//         parentId: resolve.value(parentId),
//       }),
//     }
//   }
// }

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

export const currentBucketIds = Compute(currentBuckets, modelsToIds)

export const bucketItems = Compute(
  props`bucketId`,
  state`items`,
  _.useWith(_.filter)([_.propEq('bucketId'), _.defaultTo([])]),
)

export const bucketFromProps = Compute(
  props`bucketId`,
  state`buckets`,
  findById,
)

const maybeSelectedItemId = computeToMaybe(
  state`nullableSelectedItemId`,
)

export const maybeSelectedItem = Compute(
  maybeSelectedItemId,
  state`items`,
  findByMaybeId,
)

function createRootModule() {
  const storedState = StorageItem({
    name: 'CerebralListyState',
    getInitial: createInitialState,
    postLoad: state => {
      return _.mergeWith(_.defaultTo)(
        {dashboards: [], buckets: [], items: []},
        state,
      )
    },
  })

  const decodedState = storedState.load()
  // setFocusAndSelectionOnDOMId(decodedState.rootNoteId)

  const rootModule = Module(module => {
    const controller = module.controller

    controller.on('initialized', () => {
      console.log(`initialized`)
      controller.run(ctx => {
        console.debug(
          `resolveValue(maybeSelectedItem, ctx)`,
          S.show(resolveValue(maybeSelectedItem, ctx)),
        )
      })
    })

    controller.on('flush', function(changes) {
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
        selectItem: [],
        addBucket: [
          function createNewBucketInProps({props, state}) {
            return {
              newBucket: createBucket({
                dashboardId: state.get('currentDashboardId'),
              }),
            }
          },
          push(state`buckets`, props`newBucket`),
        ],
        addItem: [
          function createNewItemInProps({props}) {
            return {
              newItem: createBucketItem({
                bucketId: props.bucketId,
              }),
            }
          },
          push(state`items`, props`newItem`),
        ],
      },
      modules: {},
      providers: {storedState},
      catch: [],
    }
  })
  return rootModule
}

export const controller = createAppController(createRootModule(), {
  stateChanges: {
    // currentDashboardId: 'kOYniDg34h9xp3cI1xzN1',
    nullableSelectedItemId: 'OEqPlt2OOepfvjgTOSJX0',
  },
})
