import {fWord} from '../lib/fake'
import {asc} from './little-orbit'
import {getStore, queryTasksExpr} from './Store'
import {compose, isNil, map, tap} from '../lib/ramda'

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
  return getStore().query(q => q.findRecords('task'))
}

export async function removeAllTasks() {
  const all = await queryAllTasks()

  const removeRecords = t =>
    compose(map(tap(console.warn), map(record => t.removeRecord(record))))(
      all,
    )

  return getStore().update(removeRecords)
}

export function addNewTaskAt(idx) {
  const updateSortIdx = t => {
    return getSortedTasks()
      .current()
      .map((task, idx) => {
        return t.replaceAttribute(task, 'sortIdx', idx + 1)
      })
  }

  return getStore().update(t => [
    //
    t.addRecord(TaskRecord({sortIdx: 0})),
    ...updateSortIdx(t),
  ])
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
