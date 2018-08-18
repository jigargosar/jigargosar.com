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
        <div className={cn('pa3 f3')}>Orbit Tasks</div>
        {/*<ObsPromise label={'storeOP'} p={this.storeOP} />*/}
        {/*<ObsPromise label={'tasksOP'} p={this.tasksOP} />*/}
        <div>
          {this.tasksOP.case({
            fulfilled: tasks => `tasks.length=${tasks.length}`,
          })}
        </div>
      </div>
    )
  }
}

export default AppFrame

const Tasks = observer(function Tasks(props) {
  return renderKeyedById(Task, 'task', props.tasks)
})

@observer
class Task extends Component {
  render() {
    const {task} = this.props
    return <div>{task.attributes.title}</div>
  }
}
