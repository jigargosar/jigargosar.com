import {fWord} from '../lib/fake'
import {asc} from './little-orbit'
import {findRecordsOfType, getStore} from './Store'
import {isNil, map} from '../lib/ramda'

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
  return getStore().update(t =>
    t.replaceAttribute(task, 'isDone', !task.isDone),
  )
}

export function queryTasksExpr({sort = []}) {
  return getStore().liveQueryExpr({
    op: 'findRecords',
    type: 'task',
    sort: sort,
    filter: [],
    page: {
      kind: 'offsetLimit',
      offset: 0,
      limit: Number.MAX_SAFE_INTEGER,
    },
  })
}

let sortedTasks = null

export function getSortedTasks() {
  if (isNil(sortedTasks)) {
    sortedTasks = queryTasksExpr({
      sort: [asc('sortIdx') /*dsc('createdAt')*/],
    })
  }
  return sortedTasks
}
