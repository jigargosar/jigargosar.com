import {fWord} from '../lib/fake'
import {liveQuery, query, queryRecordsOfType, updateStore} from './Store'
import {compose, insert, map, not} from '../lib/ramda'
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

export async function addNewTask(props = {}) {
  const all = await queryAllTasks()
  const newTask = TaskRecord(props)
  const updateSortIdx = t => {
    return compose(
      map((task, idx) => t.replaceAttribute(task, 'sortIdx', idx + 1)),
      insert(newTask.sortIdx, newTask),
    )(all)
  }
  return updateStore(t => [
    //
    t.addRecord(newTask),
    ...updateSortIdx(t),
  ])
}

function queryAllTasks() {
  return queryRecordsOfType('task')
}

export async function removeAllTasks() {
  const all = await queryAllTasks()

  const removeRecords = t => map(record => t.removeRecord(record))(all)
  return updateStore(removeRecords)
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
