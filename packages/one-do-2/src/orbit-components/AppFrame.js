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

function ObsPromise({p}) {
  const renderResult = p.case({
    fulfilled: renderJSON,
    rejected: e => {
      console.error(`renderObsPromise`, e)
      return null
    },
  })

  function renderJSON(data) {
    return (
      <pre className={cn('pa3', 'br4 f6 code bg-black-10')}>
        <code typeof={'JSON'}>{prettyStringifySafe(data)}</code>
      </pre>
    )
  }
  return (
    <div className={cn('pa3')}>
      <div className={cn('ph3 ', 'f6 ttu')}>{`status = ${p.state}`}</div>
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
        <ObsPromise p={storeRes} />
        <ObsPromise p={tasksRes} />
        <div>
          {tasksRes.case({
            fulfilled: tasks => `tasks.length=${tasks.length}`,
          })}
        </div>
      </div>
    )
  }
}

export default AppFrame
