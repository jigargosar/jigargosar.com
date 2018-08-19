import {Store} from './orbit'
import {schema} from './schema'
import {TaskRecord} from './TaskRecord'
import {findRecords} from './little-orbit'
import {Disposers} from '../lib/little-mobx'

export function addNewTask(store) {
  return store.update(t => t.addRecord(TaskRecord()))
}

async function createStore() {
  console.debug('[Entering] createStore')
  const disposers = Disposers(module)
  const store = new Store({schema})
  await addNewTask(store)
  await addNewTask(store)

  const storeWrapper = {
    _store: store,
    query: fn => store.query(fn),
    listeners: event => store.listeners(event),
    on,
    off,
  }

  function on(event, callback, binding) {
    console.log('[store] .on', event, callback.name || callback, binding)
    store.on(event, callback, binding)

    console.log(
      `[store] .listeners(${event}).length`,
      store.listeners(event).length,
    )

    return disposers.addDisposer(onAutoDisposer)

    function onAutoDisposer() {
      console.log(
        '[store] disposing: .on',
        event,
        callback.name || callback,
        binding,
      )
      off(event, callback, binding)
    }
  }

  console.debug('[Exiting] createStore')
  return storeWrapper

  function off(e, callback, binding) {
    console.log('[store] .off', e, callback.name || callback, binding)
    return store.off(e, callback, binding)
  }
}

export const findTasks = findRecords('task')

export const storeOP = createStore()
