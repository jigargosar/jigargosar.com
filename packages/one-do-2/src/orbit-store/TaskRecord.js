import {fWord} from '../lib/fake'
import {liveQuery, query, queryRecordsOfType, updateStore} from './Store'
import {compose, insert, map, tap} from '../lib/ramda'
import {mapIndexed, tapLog} from '../lib/little-ramda'
import {asc, dsc, recAttr, replaceAttributeOP} from './little-orbit'

export const sortedTasksLazyObs = liveQuery(sortedTasksQuery)

export function querySortedTasks() {
  return query(sortedTasksQuery)
}

export function TaskRecord({
  id,
  title = fWord(),
  createdAt = Date.now(),
  isDone = false,
  sortIdx = 0,
} = {}) {
  return {
    id,
    type: 'task',
    attributes: {
      title,
      createdAt,
      isDone,
      sortIdx,
    },
  }
}

function replaceSortIdxOP(task, idx) {
  return replaceAttributeOP(task, 'sortIdx', idx)
}

const getSortIdx = recAttr('sortIdx')

export async function updateAddTask(props) {
  const all = await querySortedTasks()
  const newTask = TaskRecord(props)
  const updateSortIdx = t => {
    return compose(
      mapIndexed((task, idx) => replaceSortIdxOP(task, idx)(t)),
      tap(map(tapLog)),
      insert(getSortIdx(newTask), newTask),
      Array.from,
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

export function updateToggleDone(task) {
  return updateIsDone(task, !task.isDone)
}

export function updateIsDone(task, value) {
  return updateStore(replaceAttributeOP(task, 'isDone', value))
}

function sortedTasksQuery() {
  return {
    op: 'findRecords',
    type: 'task',
    sort: [asc('sortIdx'), dsc('createdAt')],
    filter: [],
    page: {
      kind: 'offsetLimit',
      offset: 0,
      limit: Number.MAX_SAFE_INTEGER,
    },
  }
}
