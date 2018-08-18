import '../stores/init-mobx'
import React, {Component, Fragment} from 'react'
import {observer} from '../lib/little-react'
import {disposable} from '../lib/hoc'
import {fetchStore} from '../orbit-stores/store'
import {tap} from '../lib/ramda'
import {
  findAllRecordsOfType,
  logRecords,
} from '../orbit-stores/little-orbit'

async function fetchAllTasks(store) {
  return tap(logRecords)(await findAllRecordsOfType('task')(store))
}

@disposable
@observer
class AppFrame extends Component {
  fetchStoreResult = fetchStore()

  componentDidMount() {
    this.fetchStoreResult.then(fetchAllTasks).catch(console.error)
  }

  render() {
    return (
      <Fragment>
        <h1>Orbit Tasks</h1>
        <div>{`this.storeFP.status=${this.fetchStoreResult.status}`}</div>
      </Fragment>
    )
  }
}

export default AppFrame
