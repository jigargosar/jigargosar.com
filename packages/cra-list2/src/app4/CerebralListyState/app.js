import {StorageItem} from '../services/storage'
import {
  _,
  findByMaybeId,
  findIndexById,
  mergeWithDefaults,
  modelsToIdLookup,
  modelsToIds,
  S,
  validate,
} from '../little-ramda'
import {
  Compute,
  computeToMaybe,
  Module,
  props,
  push,
  resolveValue,
  set,
  splice,
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

export const dashboardIdToBucketIds = Compute(
  props`dashboardId`,
  state`buckets`,
  _.useWith(_.filter)([_.propEq('dashboardId'), _.defaultTo([])]),
  modelsToIds,
)

export const bucketIdToItemIds = Compute(
  props`bucketId`,
  state`items`,
  _.useWith(_.filter)([_.propEq('bucketId'), _.defaultTo([])]),
  modelsToIds,
)

export const bucketById = state`bucketLookup.${props`bucketId`}`
export const itemById = state`itemLookup.${props`itemId`}`

export const bucketIndexById = Compute(
  props`bucketId`,
  state`buckets`,
  findIndexById,
)

export const itemIndexById = Compute(
  props`itemId`,
  state`items`,
  findIndexById,
)

const maybeSelectedItemId = computeToMaybe(
  state`nullableSelectedItemId`,
)

export const maybeSelectedItem = Compute(
  maybeSelectedItemId,
  state`items`,
  findByMaybeId,
)

export function createRootModule() {
  const storedState = StorageItem({
    name: 'CerebralListyState',
    getInitial: createInitialState,
    postLoad: _.compose(
      state =>
        _.merge(_.__, {
          dashboardLookup: modelsToIdLookup(state.dashboards),
          bucketLookup: modelsToIdLookup(state.buckets),
          itemLookup: modelsToIdLookup(state.items),
        })(state),
      mergeWithDefaults({
        dashboards: [],
        buckets: [],
        items: [],
      }),
    ),
  })

  const decodedState = storedState.load()
  // setFocusAndSelectionOnDOMId(decodedState.rootNoteId)

  const rootModule = Module(module => {
    const controller = module.controller

    controller.on('initialized', () => {
      console.log(`initialized`)
      controller.runSignal(
        'show-maybeSelectedItem',
        [
          ctx =>
            console.debug(
              `resolveValue(maybeSelectedItem, ctx)`,
              S.show(resolveValue(maybeSelectedItem, ctx)),
            ),
        ],
        {},
      )
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
        selectItem: [
          set(state`nullableSelectedItemId`, props`item.id`),
        ],
        addBucket: [
          function createNewBucketInProps({props}) {
            return {
              newBucket: createBucket({
                dashboardId: props.dashboardId,
              }),
            }
          },
          push(state`buckets`, props`newBucket`),
          set(
            state`bucketLookup.${props`newBucket.id`}`,
            props`newBucket`,
          ),
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
          set(state`itemLookup.${props`newItem.id`}`, props`newItem`),
        ],
        deleteItem: [splice(state`items`, itemIndexById, 1)],
        deleteBucket: [splice(state`buckets`, bucketIndexById, 1)],
      },
      modules: {},
      providers: {storedState},
      catch: [],
    }
  })
  return rootModule
}
