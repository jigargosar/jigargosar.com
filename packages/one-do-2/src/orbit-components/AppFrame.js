import '../stores/init-mobx'
import React, {Component, Fragment} from 'react'
import {observer} from '../lib/little-react'
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
  return (
    <Fragment>
      <div>{`status=${obsPromise.state}`}</div>
      <div>{`${obsPromise.case({
        pending: () => 'pending',
        fulfilled: data => (
          <pre>
            <code>{prettyStringifySafe(data)}</code>
          </pre>
        ),
        rejected: () => 'rejected',
      })}`}</div>
    </Fragment>
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
      <Fragment>
        <h1>Orbit Tasks</h1>
        {renderObsPromise(storeRes)}
        <div>{`tasksRes.status=${tasksRes.state}`}</div>
        <div>{`tasksRes = ${tasksRes.case({
          pending: () => 'pending',
          fulfilled: tasks => `${tasks.length}`,
          rejected: () => 'rejected',
        })}`}</div>
      </Fragment>
    )
  }
}

export default AppFrame
