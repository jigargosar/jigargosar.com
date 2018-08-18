import '../stores/init-mobx'
import React, {Component} from 'react'
import {cn, observer, renderKeyedById} from '../lib/little-react'
import {disposable} from '../lib/hoc'
import {createStore} from '../orbit-stores/store'
import {findRecords, tapLogRecords} from '../orbit-stores/little-orbit'
import {fromPromise} from '../lib/mobx-utils'

const findTasks = findRecords('task')

@disposable
@observer
class AppFrame extends Component {
  storeOP = fromPromise(createStore())
  tasksOP = fromPromise(this.storeOP.then(findTasks))

  componentDidMount() {
    this.tasksOP.then(tapLogRecords).catch(console.error)
  }

  render() {
    return (
      <div className={cn('vh-100 overflow-scroll')}>
        {/*<ObsPromise label={'storeOP'} p={this.storeOP} />*/}
        {/*<ObsPromise label={'tasksOP'} p={this.tasksOP} />*/}
        <div>
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
    const {tasks} = this.props
    return (
      <div>
        <div className={cn('pa3 f3')}>Orbit Tasks</div>
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
    const {title} = task.attributes
    return <div className={cn('ph3 pv1')}>{title}</div>
  }
}
