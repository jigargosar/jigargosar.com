import '../stores/init-mobx'
import React, {Component, Fragment} from 'react'
import {observer} from '../lib/little-react'
import {disposable} from '../lib/hoc'
import {fetchStore} from '../orbit-stores/store'
import {prettyJSONStringify} from '../lib/little-ramda'
import {
  apply,
  chain,
  fromPairs,
  map,
  partial,
  toPairs,
  type,
} from '../lib/ramda'

const flattenObj = obj => {
  const go = obj_ =>
    chain(([k, v]) => {
      if (type(v) === 'Object' || type(v) === 'Array') {
        return map(([k_, v_]) => [`${k}.${k_}`, v_], go(v))
      } else {
        return [[k, v]]
      }
    }, toPairs(obj_))

  return fromPairs(go(obj))
}

const flattenRecord = ({attributes, ...rest}) => ({
  ...rest,
  ...attributes,
})
function logRecords(records) {
  console.log(`records`, ...records)
  const flatRecords = map(flattenRecord)(records)
  apply(partial(console.log, ['records']), flatRecords)
  console.table(flatRecords)
  console.log(prettyJSONStringify(records))
}

async function fetchTasks(store) {
  const tasks = await store.query(q => q.findRecords('task'))
  logRecords(tasks)
  return tasks
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
