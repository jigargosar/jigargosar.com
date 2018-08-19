import {Store} from './orbit'
import {schema} from './schema'
import {TaskRecord} from './TaskRecord'
import {findRecords} from './little-orbit'

export function addNewTask(store) {
  return store.update(t => t.addRecord(TaskRecord()))
}

export async function createStore() {
  console.log('creating store')
  const store = new Store({schema})
  await addNewTask(store)
  await addNewTask(store)
  console.log('store created')
  return {
    _store: store,
    query: fn => store.query(fn),
    listeners: event => store.listeners(event),
  }
}

export const findTasks = findRecords('task')
