import PropTypes from 'prop-types'
import '../stores/init-mobx'
import React, {Component} from 'react'
import {cn, renderKeyedById} from '../lib/little-react'
import {observer, Provider} from '../lib/mobx-react'
import store from '../orbit-store/Store'
import {
  getSortedTasks,
  removeAllTasks,
  updateAddTask,
  updateIsDone,
  updateToggleDone,
} from '../orbit-store/TaskRecord'
import {delay, PQueue} from '../lib/p-fun'
import {disposable} from '../lib/disposable'
import {compose, flatten, repeat} from '../lib/ramda'

function getSimulationTasks({speed = 1000}) {
  let tasks3
  let tasks2
  let tasks1

  return [
    async () => await delay(speed),
    async () => await removeAllTasks(),
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
    async () => await delay(speed * 2),
  ]
}

function startSimulation() {
  const pQueue = PQueue({concurrency: 1})
  pQueue.addAll(
    compose(flatten, repeat(getSimulationTasks({speed: 1000})))(100),
  )
  return () => pQueue.clear()
}

@disposable(module)
@observer
class AppContainer extends Component {
  componentDidMount() {
    if (module.hot) {
      this.props.addDisposer(startSimulation())
    }
  }

  render() {
    return (
      <Provider store={store}>
        <AppContent />
      </Provider>
    )
  }
}
export default AppContainer

@observer
class AppContent extends Component {
  render() {
    return (
      <div className={cn('vh-100 overflow-scroll')}>
        <div>
          <TasksPage
            handleAddTask={() => updateAddTask()}
            tasks={getSortedTasks()}
          />
        </div>
      </div>
    )
  }
}

@observer
class TasksPage extends Component {
  static propTypes = {
    handleAddTask: PropTypes.func.isRequired,
    tasks: PropTypes.array.isRequired,
  }

  render() {
    const {tasks, handleAddTask} = this.props
    return (
      <div>
        <div className={cn('pa3 f3')}>Orbit Tasks</div>
        <div className={cn('frc pv2')}>
          <button
            className={cn('ph3', 'input-reset bn pointer blue link ttu')}
            onClick={handleAddTask}
          >
            Add
          </button>
        </div>
        <Tasks tasks={tasks} />
      </div>
    )
  }
}

@observer
class Tasks extends Component {
  render() {
    return renderKeyedById(Task, 'task', this.props.tasks)
  }
}

@observer
class Task extends Component {
  render() {
    const {task} = this.props
    const {title, isDone, sortIdx} = task.attributes
    const id = task.id
    return (
      <div className={cn('pv1')}>
        <div className={cn('frc lh-copy')}>
          <div
            className={cn('ph3', 'code pointer')}
            onClick={() => updateToggleDone(task)}
          >
            {!isDone ? `[x]` : `[ ]`}
          </div>
          <div className={cn('flex-auto')}>{title}</div>
        </div>
        <div
          className={cn(
            'ph3',
            'frc justify-end_',
            'code f7 lh-copy black-50',
          )}
        >
          {`i:${sortIdx} id:${id}`}
        </div>
      </div>
    )
  }
}
