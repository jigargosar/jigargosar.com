import {Store} from './orbit'
import {schema} from './schema'
import {TaskRecord} from './TaskRecord'

export async function createStore() {
  console.log('creating store')
  const store = new Store({schema})
  await store.update(t => t.addRecord(TaskRecord()))
  console.log('store created')
  return store
}
