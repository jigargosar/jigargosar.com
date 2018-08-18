import '../stores/init-mobx'
import React, {Component, Fragment} from 'react'
import {observer} from '../lib/little-react'
import {disposable} from '../lib/hoc'
import {fetchStore} from '../orbit-stores/store'
import {compose, tap} from '../lib/ramda'
import {
  findAllRecordsOfType,
  logRecords,
} from '../orbit-stores/little-orbit'
import {fromPromise} from '../lib/mobx-utils'

function fetchAllTasks(store) {
  return findAllRecordsOfType('task')(store)
}

@disposable
@observer
class AppFrame extends Component {
  storeRes = fetchStore()

  tasksRes = fromPromise(this.storeRes.then(fetchAllTasks))

  componentDidMount() {
    this.storeRes
      .then(compose(fromPromise, fetchAllTasks))
      .then(tap(logRecords))
      .catch(console.error)
  }

  render() {
    return (
      <Fragment>
        <h1>Orbit Tasks</h1>
        <div>{`storeRes.status=${this.storeRes.state}`}</div>
        {`storeRes = ${this.storeRes.case({
          pending: () => 'pending',
          fulfilled: () => 'fulfilled',
          rejected: () => 'rejected',
        })}`}
      </Fragment>
    )
  }
}

export default AppFrame
