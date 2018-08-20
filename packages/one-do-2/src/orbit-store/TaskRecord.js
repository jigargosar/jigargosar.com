import {fWord} from '../lib/fake'
import {liveQuery, query, queryRecordsOfType, updateStore} from './Store'
import {map, not} from '../lib/ramda'
import {overPath} from '../lib/little-ramda'
import {asc, replaceRecordOP} from './little-orbit'

export const sortedTasksLazyObs = liveQuery(sortedTasksQuery)

export function querySortedTasks() {
  return query(sortedTasksQuery)
}

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

function queryAllTasks() {
  return queryRecordsOfType('task')
}

export async function removeAllTasks() {
  const all = await queryAllTasks()

  const removeRecords = t => map(record => t.removeRecord(record))(all)
  return updateStore(removeRecords)
}

export async function addNewTaskAt(idx) {
  const all = await queryAllTasks()
  const updateSortIdx = t => {
    return all.map((task, idx) => {
      return t.replaceAttribute(task, 'sortIdx', idx + 1)
    })
  }

  return updateStore(t => [
    //
    t.addRecord(TaskRecord({sortIdx: 0})),
    ...updateSortIdx(t),
  ])
}

export function toggleDone(task) {
  return updateStore(
    replaceRecordOP(overPath(['attributes', 'isDone'])(not)(task)),
  )
}

function sortedTasksQuery() {
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
