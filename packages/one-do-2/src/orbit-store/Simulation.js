import {delay, PQueue} from '../lib/p-fun'
import {
  updateRemoveAllTasks,
  updateAddTask,
  updateIsDone,
} from './TaskRecord'
import {compose, flatten, repeat} from 'ramda'

function getSimulationTasks({speed = 1000}) {
  let tasks3
  let tasks2
  let tasks1

  return [
    async () => await delay(speed),
    async () => await updateRemoveAllTasks(),
    async () => await delay(speed),
    async () => (tasks1 = await updateAddTask({title: 'First Task'})),
    async () => await delay(speed),
    async () => (tasks2 = await updateAddTask({title: 'Second Task'})),
    async () => await updateIsDone(tasks2, false),
    async () => await delay(speed),
    async () => await updateIsDone(tasks1, true),
    async () => await delay(speed),
    async () => (tasks3 = await updateAddTask({title: 'Third Task'})),
    async () => await delay(speed),
    async () => await updateIsDone(tasks3, true),
    async () => await delay(speed),
    async () => await updateIsDone(tasks1, false),
    // async () => await delay(speed * 2),
  ]
}

export function startSimulation(dynamic = false) {
  const pQueue = PQueue({concurrency: 1})
  if (dynamic) {
    pQueue.addAll(
      compose(flatten, repeat(getSimulationTasks({speed: 2000})))(100),
    )
  } else {
    pQueue.addAll([
      updateRemoveAllTasks,
      updateAddTask,
      updateAddTask,
      updateAddTask,
      updateAddTask,
    ])
  }
  return () => pQueue.clear()
}
