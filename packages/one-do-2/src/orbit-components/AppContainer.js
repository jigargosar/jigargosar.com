import PropTypes from 'prop-types'
import '../stores/init-mobx'
import React, {Component} from 'react'
import {cn, renderKeyedById} from '../lib/little-react'
import {inject, observer, Provider} from '../lib/mobx-react'
import store from '../orbit-store/Store'
import {
  addNewTask,
  getSortedTasks,
  removeAllTasks,
} from '../orbit-store/TaskRecord'
import {pEachSeries} from '../lib/p-fun'
import {call} from '../lib/ramda'

@observer
class AppContainer extends Component {
  componentDidMount() {
    pEachSeries(
      [
        //
        removeAllTasks,
        addNewTask,
        addNewTask,
      ],
      call,
    ).catch(console.error)
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
            handleAddTask={addNewTask}
            tasks={getSortedTasks().current()}
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

@inject((s, {task}) => ({...task.attributes, ...task}))
@observer
class Task extends Component {
  render() {
    // const {task} = this.props
    // const {title, isDone, sortIdx} = task.attributes
    // const id = task.id
    const {title, isDone, sortIdx, id} = this.props
    return (
      <div className={cn('pv1')}>
        <div className={cn('frc lh-copy')}>
          <div className={cn('ph3', 'code pointer')}>
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
