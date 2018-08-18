import '../stores/init-mobx'
import React, {Component, Fragment} from 'react'
import {observer} from '../lib/little-react'
import {fromPromise} from '../lib/mobx-utils'
import {store} from '../orbit-stores/store'
import {action, observable, runInAction} from '../lib/mobx'
import {disposable} from '../lib/hoc'

@disposable
@observer
class AppFrame extends Component {
  @observable tasksRes = fromPromise(new Promise(() => {}))
  @observable ct = 0

  @action
  inc = () => {
    this.ct++
  }

  componentDidMount() {
    console.log('componentDidMount')
    runInAction(
      () =>
        (this.tasksRes = fromPromise(
          store.query(q => q.findRecords('tasks')),
        )),
    )

    this.props.disposers.setInterval(this.inc, 1000)
  }

  render() {
    return (
      <Fragment>
        <h1>Orbit Tasks</h1>
        <div>{`${this.ct}`}</div>
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
