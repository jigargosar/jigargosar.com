import {Store} from './orbit'
import {schema} from './schema'
import {identity, partial} from '../lib/ramda'
import {fromResource, lazyObservable} from '../lib/mobx-utils'
import {Disposers} from '../lib/little-mobx'
import {autoBind} from '../lib/auto-bind'
import {StoreSchema} from './StoreSchema'
import {validate} from '../lib/validate'

const logPrefix = ['[store]']
// const log = partial(console.log.bind(console), logPrefix)
const debug = partial(console.debug.bind(console), logPrefix)

const disposers = Disposers(module)

function createStore() {
  debug('[Entering] createStore')
  const store = (function() {
    const store = new Store({schema})
    autoBind(store)
    return store
  })()

  const transforms = createTransformObservable(store)

  function lazyQuery(query) {
    return lazyObservable(
      sink =>
        store
          .query(query)
          .then(sink)
          .catch(console.error),
      [],
    )
  }

  function liveQuery(query) {
    const q = lazyQuery(query)
    disposers.reaction(() => transforms.current(), () => q.refresh())
    return q
  }

  const storeWrapper = {
    ...store,
    transforms,
    lazyQuery,
    liveQuery,
    schema: StoreSchema(store),
  }

  debug('[Exiting] createStore', storeWrapper)
  return storeWrapper
}

function createTransformObservable(store) {
  let disposer = identity

  return fromResource(
    sink => {
      function listener(transforms) {
        sink(transforms)
      }

      store.on('transform', listener)
      disposer = listener
    },
    disposer,
    [],
  )
}

export function queryRecordsOfType(type) {
  validate('S', [type])
  return store.query(q => q.findRecords(type))
}

const store = createStore()

export default store

export const liveQuery = store.liveQuery

export const query = store.query

export const updateStore = store.update
