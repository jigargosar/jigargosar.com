import {Store} from './orbit'
import {schema} from './schema'
import {TaskRecord} from './TaskRecord'
import {identity, partial} from '../lib/ramda'
import {fromResource, lazyObservable} from '../lib/mobx-utils'
import {Disposers} from '../lib/little-mobx'

const logPrefix = ['[store]']
// const log = partial(console.log.bind(console), logPrefix)
const debug = partial(console.debug.bind(console), logPrefix)

const disposers = Disposers(module)

export function createStore() {
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

  const storeWrapper = {
    _store: store,
    query: store.query.bind(store),
    listeners: store.listeners.bind(store),
    transforms,
    lazyQuery,
    liveQuery,
    update: store.update.bind(store),
  }

  debug('[Exiting] createStore')
  return storeWrapper
}

export function addNewTask(store) {
  return store.update(t => t.addRecord(TaskRecord()))
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
