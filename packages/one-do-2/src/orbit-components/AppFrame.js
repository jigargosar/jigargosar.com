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
import {prettyStringifySafe} from '../lib/little-ramda'

function fetchAllTasks(store) {
  return findAllRecordsOfType('task')(store)
}

function renderObsPromise(obsPromise) {
  const renderResult = obsPromise.case({
    fulfilled: data => (
      <pre className={cn('pa3', 'br4 f6 code bg-black-10')}>
        <code typeof={'JSON'}>{prettyStringifySafe(data)}</code>
      </pre>
    ),
  })
  return (
    <div className={cn('pa3')}>
      <div className={cn('f4')}>{`status=${obsPromise.state}`}</div>
      <div>{renderResult}</div>
    </div>
  )
}

@disposable
@observer
class AppFrame extends Component {
  storeRes = fromPromise(createStore())
  tasksRes = fromPromise(this.storeRes.then(fetchAllTasks))

  componentDidMount() {
    this.tasksRes.then(tap(logRecords)).catch(console.error)
  }

  render() {
    const tasksRes = this.tasksRes
    const storeRes = this.storeRes
    return (
      <div className={cn('vh-100 overflow-scroll')}>
        <div className={cn('pa3 f3')}>Orbit Tasks</div>
        {renderObsPromise(storeRes)}
        <div>{`tasksRes.status=${tasksRes.state}`}</div>
        <div>{`tasksRes = ${tasksRes.case({
          pending: () => 'pending',
          fulfilled: tasks => `${tasks.length}`,
          rejected: () => 'rejected',
        })}`}</div>
      </div>
    )
  }
}

export default AppFrame
