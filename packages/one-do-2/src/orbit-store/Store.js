import {Store} from './orbit'
import {schema} from './schema'
import {identity, isNil, partial} from '../lib/ramda'
import {fromResource, lazyObservable} from '../lib/mobx-utils'
import {Disposers} from '../lib/little-mobx'
import {validate} from '../lib/little-ramda'
import {autoBind} from '../lib/auto-bind'

const logPrefix = ['[store]']
// const log = partial(console.log.bind(console), logPrefix)
const debug = partial(console.debug.bind(console), logPrefix)

const disposers = Disposers(module)

function createStore() {
  debug('[Entering] createStore')
  const store = (function() {
    const store = new Store({schema})
    console.log(store)
    autoBind(store)
    console.log(store)
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

let store

export function getStore() {
  if (isNil(store)) {
    store = createStore()
  }
  return store
}

export default getStore()

export function findRecordsOfType(type) {
  validate('S', [type])
  return getStore().query(q => q.findRecords(type))
}

export const liveQuery = getStore().liveQuery
