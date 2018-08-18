import {length} from '../lib/ramda'
import {inMemorySource, loadBackupAndActivate} from './coordinator'
import {TaskRecord} from './TaskRecord'
import {addRecord} from './little-orbit'
import {Disposers} from '../lib/little-mobx'

const store = inMemorySource

export {store}

const disposers = Disposers(module)

store.on('transform', console.log)

disposers.addDisposer(() => store.off('transform'))

function addNewTaskRecord(t) {
  return addRecord(TaskRecord(), t)
}

// localStorage.clear()

async function bootStore() {
  console.log('bootstrapping')
  await loadBackupAndActivate()
  const initialTasks = await store.query(q => q.findRecords('task'))

  if (length(initialTasks) === 0) {
    await store.update(t =>
      [addNewTaskRecord, addNewTaskRecord].map(fn => fn(t)),
    )
  }

  const records = await store.query(q =>
    q.findRecords('task').sort('createdAt'),
  )
  console.log(`records`, records)
  console.log(`records.length`, records.length)
  records.forEach(console.table)
}

export const bootPromise = bootStore()

bootPromise.catch(console.error)
