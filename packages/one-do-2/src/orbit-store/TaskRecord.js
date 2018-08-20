import {fWord} from '../lib/fake'
import {findRecordsOfType, getStore} from './Store'
import {map, not} from '../lib/ramda'
import {overPath} from '../lib/little-ramda'
import {asc} from './little-orbit'

export function TaskRecord({sortIdx = 0} = {}) {
  return {
    type: 'task',
    attributes: {
      title: fWord(),
      createdAt: Date.now(),
      isDone: false,
      sortIdx,
    },
  }
}

export function addNewTask() {
  return addNewTaskAt(0)
}

function findAllTask() {
  return findRecordsOfType('task')
}

export async function removeAllTasks() {
  const all = await findAllTask()

  const removeRecords = t => map(record => t.removeRecord(record))(all)

  return getStore().update(removeRecords)
}

export async function addNewTaskAt(idx) {
  const all = await findAllTask()
  const updateSortIdx = t => {
    return all.map((task, idx) => {
      return t.replaceAttribute(task, 'sortIdx', idx + 1)
    })
  }

  return getStore().update(t => [
    //
    t.addRecord(TaskRecord({sortIdx: 0})),
    ...updateSortIdx(t),
  ])
}

export function toggleDone(task) {
  return replaceRecord(overPath(['attributes', 'isDone'])(not)(task))
}

export function replaceRecord(record) {
  return getStore().update(t => t.replaceRecord(record))
}

function sortedTasksQuerOp() {
  return {
    op: 'findRecords',
    type: 'task',
    sort: [asc('sortIdx')],
    filter: [],
    page: {
      kind: 'offsetLimit',
      offset: 0,
      limit: Number.MAX_SAFE_INTEGER,
    },
  }
}

export const sortedTasksLazyObs = getStore().liveQuery(sortedTasksQuerOp())
