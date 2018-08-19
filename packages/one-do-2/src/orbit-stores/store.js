import {Store} from './orbit'
import {schema} from './schema'
import {TaskRecord} from './TaskRecord'
import {findRecords} from './little-orbit'
import {Disposers} from '../lib/little-mobx'
import {partial} from '../lib/ramda'

export function addNewTask(store) {
  return store.update(t => t.addRecord(TaskRecord()))
}

const disposers = Disposers(module)

const logPrefix = ['[store]']
const log = partial(console.log.bind(console), logPrefix)
const debug = partial(console.debug.bind(console), logPrefix)

function onWrapper(store) {
  return function on(event, callback, binding) {
    log('.on', event, callback.name || callback, binding)
    store.on(event, callback, binding)

    log(`.listeners(${event}).length`, store.listeners(event).length)

    return disposers.addDisposer(function() {
      log(`disposing: .on`, event, callback.name || callback, binding)
      offWrapper(store)(event, callback, binding)
    })
  }
}

function offWrapper(store) {
  return function off(event, callback, binding) {
    log('.off', event, callback.name || callback, binding)
    return store.off(event, callback, binding)
  }
}

async function createStore() {
  debug('[Entering] createStore')
  const store = new Store({schema})
  await addNewTask(store)
  await addNewTask(store)

  const storeWrapper = {
    _store: store,
    query: fn => store.query(fn),
    listeners: event => store.listeners(event),
    on: onWrapper(store),
    off: offWrapper(store),
  }

  debug('[Exiting] createStore')
  return storeWrapper
}

export const findTasks = findRecords('task')

export const storeOP = createStore()
