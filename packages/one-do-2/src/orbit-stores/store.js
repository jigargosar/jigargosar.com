import Store from '@orbit/store'
import {schema} from './schema'
import Coordinator, {SyncStrategy} from '@orbit/coordinator'
import {fWord} from '../lib/fake'
import {length} from '../lib/ramda'
import {backup} from './backup'

export const store = new Store({schema})

const coordinator = new Coordinator({
  sources: [store, backup],
})

const backupStoreSync = new SyncStrategy({
  source: 'store',
  target: 'backup',
  blocking: true,
})

coordinator.addStrategy(backupStoreSync)

async function testStore() {
  const backTransForms = await backup.pull(q => q.findRecords())
  await store.sync(backTransForms)
  await coordinator.activate()

  const initialTasks = await store.query(q => q.findRecords('task'))

  if (length(initialTasks) === 0) {
    await store.update(t => [
      addRecord(TaskRecord(), t),
      addRecord(TaskRecord(), t),
      addRecord(TaskRecord(), t),
    ])
  }

  const records = await store.query(q =>
    q.findRecords('task').sort('createdAt'),
  )
  console.log(`records`, records)
  console.log(`records.length`, records.length)
  records.forEach(console.table)
}

testStore().catch(console.error)

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
