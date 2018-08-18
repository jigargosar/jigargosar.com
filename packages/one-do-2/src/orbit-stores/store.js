import Store from '@orbit/store'
import {schema} from './schema'
import LocalStorageSource from '@orbit/local-storage'
import Coordinator, {SyncStrategy} from '@orbit/coordinator'
import {fWord} from '../lib/fake'

export const store = new Store({schema})

const backup = new LocalStorageSource({
  schema,
  name: 'backup',
  namespace: 'one-do-2',
})

const coordinator = new Coordinator({
  sources: [store, backup],
})

const backupStoreSync = new SyncStrategy({
  source: 'store',
  target: 'backup',
  blocking: true,
})

coordinator.addStrategy(backupStoreSync)
coordinator.activate().catch(console.error)

function TaskRecord() {
  return {
    type: 'task',
    attributes: {
      title: fWord(),
      createdAt: Date.now(),
    },
  }
}

function addRecord(taskRecord, t) {
  return t.addRecord(taskRecord)
}

async function testStore() {
  await store.update(t => [
    addRecord(TaskRecord(), t),
    addRecord(TaskRecord(), t),
    addRecord(TaskRecord(), t),
  ])
  const records = await store.query(q =>
    q.findRecords('task').sort('createdAt'),
  )
  console.log(`records`, records)
  console.log(`records.length`, records.length)
  records.forEach(console.table)
}

testStore().catch(console.error)
