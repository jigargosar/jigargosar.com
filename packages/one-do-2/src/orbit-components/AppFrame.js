import '../stores/init-mobx'
import React, {Component, Fragment} from 'react'
import {observer} from '../lib/little-react'
import {disposable} from '../lib/hoc'
import {fetchStore} from '../orbit-stores/store'
import {prettyJSONStringify} from '../lib/little-ramda'
import {map, tap} from '../lib/ramda'

const flattenRecord = ({attributes, ...rest}) => ({
  ...rest,
  ...attributes,
})

function logRecords(records) {
  const flatRecords = map(flattenRecord)(records)
  console.table(flatRecords)
  console.debug(prettyJSONStringify(records))
}

const findAllRecordsOfType = type => store =>
  store.query(q => q.findRecords(type))

async function fetchTasks(store) {
  return tap(logRecords)(await findAllRecordsOfType('task')(store))
}

@disposable
@observer
class AppFrame extends Component {
  fetchStoreResult = fetchStore()

  componentDidMount() {
    this.fetchStoreResult.then(fetchTasks).catch(console.error)
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
