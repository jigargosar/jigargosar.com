import {Store} from './orbit'
import {schema} from './schema'
import {TaskRecord} from './TaskRecord'
import {findRecords} from './little-orbit'
import {Disposers} from '../lib/little-mobx'

export function addNewTask(store) {
  return store.update(t => t.addRecord(TaskRecord()))
}

export async function createStore() {
  console.log('creating store')
  const disposers = Disposers(module)
  const store = new Store({schema})
  await addNewTask(store)
  await addNewTask(store)
  console.log('store created')
  return {
    _store: store,
    query: fn => store.query(fn),
    listeners: event => store.listeners(event),
    on: (event, callback, binding) => {
      console.log('[store] .on', event, callback.name || callback, binding)
      store.on(event, callback, binding)
      disposers.addDisposer(() => {
        console.log(
          '[store] disposing: .on',
          event,
          callback.name || callback,
          binding,
        )
        off(event, callback, binding)
      })
    },
    off,
  }

  function off(e, callback, binding) {
    console.log('[store] .off', e, callback.name || callback, binding)
    // a

    // a

    return store.off(e, callback, binding)
  }
}

export const findTasks = findRecords('task')
