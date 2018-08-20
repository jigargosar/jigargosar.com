import PropTypes from 'prop-types'
import '../stores/init-mobx'
import React, {Component} from 'react'
import {cn, renderKeyedById} from '../lib/little-react'
import {observable} from '../lib/mobx'
import {observer, Provider} from '../lib/mobx-react'
import store, {addNewTask, sortedTasks} from '../orbit-store/Store'

@observer
class AppContainer extends Component {
  store = store

  render() {
    return (
      <Provider store={this.store}>
        <AppContent />
      </Provider>
    )
  }
}
export default AppContainer

@observer
class AppContent extends Component {
  @observable tasks = sortedTasks()

  render() {
    return (
      <div className={cn('vh-100 overflow-scroll')}>
        <div>
          <TasksPage
            handleAddTask={addNewTask}
            tasks={this.tasks.current()}
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
    return (
      <div className={cn('ph3 pv1', 'frc')}>
        <div className={cn('ph1', 'f7 black-50')}>{`i:${sortIdx}`}</div>
        <div className={cn('ph2', 'code pointer')}>
          {!isDone ? `[x]` : `[ ]`}
        </div>
        <div>{title}</div>
      </div>
    )
  }
}
