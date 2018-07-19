import {StorageItem} from '../../services/storage'
import {
  _,
  mergeWithDefaults,
  modelsToIdLookup,
  modelsToIds,
  S,
  validate,
} from '../../little-ramda'
import {
  Compute,
  Module,
  props,
  resolveValue,
  set,
  state,
  unset,
} from '../../little-cerebral'
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
    dashboardLookup: modelsToIdLookup(dashboards),
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

export const dashboards = Compute(state`dashboardLookup`, _.values)
export const buckets = Compute(state`bucketLookup`, _.values)
export const items = Compute(state`itemLookup`, _.values)

export const dashboardIdToBucketIds = Compute(
  props`dashboardId`,
  buckets,
  _.useWith(_.filter)([_.propEq('dashboardId'), _.defaultTo([])]),
  modelsToIds,
)

export const bucketIdToItemIds = Compute(
  props`bucketId`,
  items,
  _.useWith(_.filter)([_.propEq('bucketId'), _.defaultTo([])]),
  modelsToIds,
)

export const bucketById = state`bucketLookup.${props`bucketId`}`
export const itemById = state`itemLookup.${props`itemId`}`

export const nullableSelectedItemId = state`nullableSelectedItemId`

export const maybeSelectedItem = Compute(
  nullableSelectedItemId,
  items,
  _.compose(S.toMaybe, _.prop),
)

export function createRootModule() {
  const storedState = StorageItem({
    name: 'CerebralListyState',
    getInitial: createInitialState,
    postLoad: _.compose(state =>
      mergeWithDefaults({
        dashboardLookup: {},
        bucketLookup: {},
        itemLookup: {},
      })(state),
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
          set(state`itemLookup.${props`newItem.id`}`, props`newItem`),
        ],
        deleteBucket: [unset(bucketById)],
        deleteItem: [unset(itemById)],
      },
      modules: {},
      providers: {storedState},
      catch: [],
    }
  })
  return rootModule
}

export const isItemSelected = Compute(
  nullableSelectedItemId,
  props`itemId`,
  _.equals,
)
