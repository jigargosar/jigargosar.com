import '../stores/init-mobx'
import React, {Component} from 'react'
import {cn, observer, renderKeyedById} from '../lib/little-react'
import {disposable} from '../lib/disposable'
import {addNewTask, findTasks, storeOP} from '../orbit-stores/store'
import {fromPromise} from '../lib/mobx-utils'
import {observable, runInAction} from '../lib/mobx'
import {invoker} from '../lib/ramda'

@disposable(module)
@observer
class AppFrame extends Component {
  @observable storeOP = storeOP
  @observable tasksOP
  @observable
  tasksLQ = fromPromise(
    storeOP.then(
      invoker(1, 'observableQuery')({
        q: q => q.findRecords('task'),
        i: [],
      }),
    ),
  )

  constructor(props, context) {
    super(props, context)
    this.fetchTasks()
  }

  fetchTasks() {
    console.log('[Entering] AppFrame.fetchTasks')
    this.tasksLQ.then(invoker(0, 'refresh'))
    runInAction(
      'fetchTasks',
      () => (this.tasksOP = fromPromise(storeOP.then(findTasks))),
    )
  }

  componentDidMount() {
    // this.tasksOP.then(tapLogRecords).catch(console.error)

    this.storeOP.then(s => {
      this.props.addDisposer(s.on('transform', this.fetchTasks, this))
    })
  }

  render() {
    return (
      <div className={cn('vh-100 overflow-scroll')}>
        {/*<ObsPromise label={'storeOP'} p={this.storeOP} />*/}
        {/*<ObsPromise label={'tasksOP'} p={this.tasksOP} />*/}
        <div>
          {this.tasksLQ.case({
            fulfilled: tasks => {
              return (
                <TasksPage
                  store={this.storeOP.value}
                  tasks={tasks.current()}
                />
              )
            },
          })}
          {this.tasksOP.case({
            fulfilled: tasks => (
              <TasksPage store={this.storeOP.value} tasks={tasks} />
            ),
          })}
        </div>
      </div>
    )
  }
}

export default AppFrame

@observer
class TasksPage extends Component {
  render() {
    const {tasks, store} = this.props
    return (
      <div>
        <div className={cn('pa3 f3')}>Orbit Tasks</div>
        <div className={cn('frc pv2')}>
          <button
            className={cn('ph3', 'input-reset bn pointer blue link ttu')}
            onClick={() => addNewTask(store)}
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
