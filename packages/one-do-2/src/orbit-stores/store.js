import {Store} from './orbit'
import {schema} from './schema'
import {TaskRecord} from './TaskRecord'
import {findRecords} from './little-orbit'
import {Disposers} from '../lib/little-mobx'

export function addNewTask(store) {
  return store.update(t => t.addRecord(TaskRecord()))
}

const disposers = Disposers(module)

function onWrapper(store) {
  return (event, callback, binding) => {
    console.log('[store] .on', event, callback.name || callback, binding)
    store.on(event, callback, binding)

    console.log(
      `[store] .listeners(${event}).length`,
      store.listeners(event).length,
    )

    return disposers.addDisposer(function() {
      console.log(
        '[store] disposing: .on',
        event,
        callback.name || callback,
        binding,
      )
      offWrapper(store)(event, callback, binding)
    })
  }
}

function offWrapper(store) {
  return (e, callback, binding) => {
    console.log('[store] .off', e, callback.name || callback, binding)
    return store.off(e, callback, binding)
  }
}

async function createStore() {
  console.debug('[Entering] createStore')
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

  console.debug('[Exiting] createStore')
  return storeWrapper
}

export const findTasks = findRecords('task')

export const storeOP = createStore()
