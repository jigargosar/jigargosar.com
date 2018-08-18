import React, {Component, Fragment} from 'react'
import {observer} from '../lib/little-react'
import {fromPromise} from '../lib/mobx-utils'
import {store} from '../orbit-stores/store'
import {observable} from '../lib/mobx'

@observer
class AppFrame extends Component {
  @observable tasksRes = fromPromise(new Promise(() => {}))

  componentDidMount() {
    console.log('componentDidMount')
    this.tasksRes = fromPromise(store.query(q => q.findRecords('tasks')))
  }

  render() {
    return (
      <Fragment>
        <h1>Orbit Tasks</h1>
        {this.tasksRes.case({
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

export default AppFrame
