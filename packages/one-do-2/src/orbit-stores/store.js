import {length} from '../lib/ramda'
import {inMemorySource, loadBackupAndActivate} from './coordinator'
import {TaskRecord} from './TaskRecord'

const store = inMemorySource

export {store}

async function bootStore() {
  await loadBackupAndActivate()
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

bootStore().catch(console.error)

function addRecord(taskRecord, t) {
  return t.addRecord(taskRecord)
}
