import {liveQuery, query, queryRecordsOfType, updateStore} from './Store'
import {__, compose, head, insert, map} from '../lib/ramda'
import {mapIndexed} from '../lib/little-ramda'
import {
  asc,
  dsc,
  recAttr,
  removeRecordOP,
  replaceAttributeOP,
} from './little-orbit'

export const sortedTasksLazyObs = liveQuery(sortedTasksQuery)

export const getSortedTasks = () => sortedTasksLazyObs.current()

export function querySortedTasks() {
  return query(sortedTasksQuery)
}

export function TaskRecord({id, title, createdAt, isDone, sortIdx} = {}) {
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

export const TR = {
  sortIdx: recAttr('sortIdx'),
  isDone: recAttr('isDone'),
  title: recAttr('title'),
  createdAt: recAttr('createdAt'),
}

function replaceSortIdxOP(task, idx) {
  return replaceAttributeOP(task, 'sortIdx', idx)
}

export async function updateAddTask(props) {
  const all = await querySortedTasks()
  const newTask = TaskRecord(props)
  const updateSortIdx = t => {
    return compose(
      mapIndexed((task, idx) => replaceSortIdxOP(task, idx)(t)),
      insert(TR.isDone(newTask), newTask),
      Array.from,
    )(all)
  }
  return updateStore(t => [
    //
    t.addRecord(newTask),
    ...updateSortIdx(t),
  ]).then(head)
}

function queryAllTasks() {
  return queryRecordsOfType('task')
}

export async function updateRemoveAllTasks() {
  const all = await queryAllTasks()
  const removeRecords = t => map(removeRecordOP(__, t))(all)
  return updateStore(removeRecords)
}

export async function updateRemoveTasks(task) {
  return updateStore(removeRecordOP(task))
}

export function updateToggleDone(task) {
  return updateIsDone(task, !TR.isDone(task))
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
