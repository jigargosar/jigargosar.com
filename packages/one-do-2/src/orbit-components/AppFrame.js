import '../stores/init-mobx'
import React, {Component} from 'react'
import {cn, observer} from '../lib/little-react'
import {disposable} from '../lib/hoc'
import {createStore} from '../orbit-stores/store'
import {tap} from '../lib/ramda'
import {
  findAllRecordsOfType,
  logRecords,
} from '../orbit-stores/little-orbit'
import {fromPromise} from '../lib/mobx-utils'
import {ObsPromise} from '../lib/little-mobx-react'

function fetchAllTasks(store) {
  return findAllRecordsOfType('task')(store)
}

@disposable
@observer
class AppFrame extends Component {
  storeOP = fromPromise(createStore())
  tasksOP = fromPromise(this.storeOP.then(fetchAllTasks))

  componentDidMount() {
    this.tasksOP.then(tap(logRecords)).catch(console.error)
  }

  render() {
    return (
      <div className={cn('vh-100 overflow-scroll')}>
        <div className={cn('pa3 f3')}>Orbit Tasks</div>
        <ObsPromise label={'storeOP'} p={this.storeOP} />
        <ObsPromise label={'tasksOP'} p={this.tasksOP} />
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
