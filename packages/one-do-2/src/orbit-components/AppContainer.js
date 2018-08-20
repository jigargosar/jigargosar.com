import PropTypes from 'prop-types'
import '../stores/init-mobx'
import React, {Component} from 'react'
import {cn, observer, renderKeyedById} from '../lib/little-react'
import {disposable} from '../lib/disposable'
import {observable} from '../lib/mobx'
import {store} from '../orbit-store'
import {addNewTask} from '../orbit-store/createStore'

@disposable(module)
@observer
class AppContainer extends Component {
  @observable
  tasksLQ = store.liveQuery({
    q: q => q.findRecords('task'),
  })

  render() {
    return (
      <div className={cn('vh-100 overflow-scroll')}>
        {/*<ObsPromise label={'storeOP'} p={this.storeOP} />*/}
        {/*<ObsPromise label={'tasksOP'} p={this.tasksOP} />*/}
        <div>
          <TasksPage
            handleAddTask={() => {
              addNewTask(store)
            }}
            tasks={this.tasksLQ.current()}
          />
        </div>
      </div>
    )
  }
}

export default AppContainer

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
    const {title, isDone} = task.attributes
    return (
      <div className={cn('ph3 pv1', 'frc')}>
        <div className={cn('ph3', 'code pointer')}>
          {!isDone ? `[x]` : `[ ]`}
        </div>
        <div>{title}</div>
      </div>
    )
  }
}
