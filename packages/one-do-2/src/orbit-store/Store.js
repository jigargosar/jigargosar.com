import {Store} from './orbit'
import {schema} from './schema'
import {TaskRecord} from './TaskRecord'
import {identity, isNil, partial} from '../lib/ramda'
import {fromResource, lazyObservable} from '../lib/mobx-utils'
import {Disposers} from '../lib/little-mobx'

const logPrefix = ['[store]']
// const log = partial(console.log.bind(console), logPrefix)
const debug = partial(console.debug.bind(console), logPrefix)

const disposers = Disposers(module)

function createStore() {
  debug('[Entering] createStore')
  const store = new Store({schema})

  const transforms = createTransformObservable(store)

  function lazyQuery({q, o, id, i: ini = []}) {
    return lazyObservable(
      sink =>
        store
          .query(q, o, id)
          .then(sink)
          .catch(console.error),
      ini,
    )
  }

  function liveQuery(options) {
    const q = lazyQuery(options)
    disposers.reaction(() => transforms.current(), () => q.refresh())
    return q
  }

  function liveQueryExpr(expr) {
    const q = lazyQuery({q: expr})
    disposers.reaction(() => transforms.current(), () => q.refresh())
    return q
  }

  const storeWrapper = {
    _store: store,
    query: store.query.bind(store),
    listeners: store.listeners.bind(store),
    transforms,
    lazyQuery,
    liveQuery,
    liveQueryExpr,
    update: store.update.bind(store),
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

export function addNewTask() {
  return getStore().update(t => t.addRecord(TaskRecord()))
}
