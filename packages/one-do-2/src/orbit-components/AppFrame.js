import React, {Component, Fragment} from 'react'
import {observer} from '../lib/little-react'
import {fromPromise} from '../lib/mobx-utils'
import {store} from '../orbit-stores/store'

const tasksRes = fromPromise(store.query(q => q.findRecords('tasks')))

class AppFrame extends Component {
  render() {
    return (
      <Fragment>
        <h1>Orbit Tasks</h1>
        {tasksRes.case({
          pending: () => 'pending',
          fulfilled: () => 'fulfilled',
          rejected: e => {
            console.log(`e`, e)
            return 'rejected'
          },
        })}
      </Fragment>
    )
  }
}

export default observer(AppFrame)
