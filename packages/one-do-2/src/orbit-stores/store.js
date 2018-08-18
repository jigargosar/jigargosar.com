import {Store} from './orbit'
import {schema} from './schema'
import {TaskRecord} from './TaskRecord'

async function addNewTask(store) {
  await store.update(t => t.addRecord(TaskRecord()))
}

export async function createStore() {
  console.log('creating store')
  const store = new Store({schema})
  await addNewTask(store)
  await addNewTask(store)
  console.log('store created')
  return store
}
