import {fWord} from '../lib/fake'
import {length} from '../lib/ramda'
import {loadBackupAndActivate, store} from './coordinator'

export {store} from './coordinator'

async function testStore() {
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
