import '../stores/init-mobx'
import '../stores'
import React, {Component, Fragment} from 'react'
import {cn, renderKeyedById} from '../lib/little-react'
import {observer} from '../lib/mobx-react'
import {
  getSortedTasks,
  TR,
  updateAddTask,
  updateToggleDone,
} from '../orbit-store/TaskRecord'
import {disposable} from '../lib/disposable'
import {startSimulation} from '../orbit-store/Simulation'
import {AsciiCheckButton} from '../lib/AsciiCheckButton'
import {take} from '../lib/exports-ramda'
import {PageTitle} from './PageTitle'
import {Page} from './Page'
import {SchemaPage} from './SchemaPage'
import {CssBaseline} from '@material-ui/core'

@disposable(module)
@observer
class AppContainer extends Component {
  componentDidMount() {
    this.props.disposers.add(startSimulation(false))
  }

  render() {
    return (
      <Fragment>
        <CssBaseline />
        <AppContent />
      </Fragment>
    )
  }
}

export default AppContainer

@observer
class AppContent extends Component {
  render() {
    return (
      <div className={cn('vh-100 overflow-scroll')}>
        <div>
          <SchemaPage />
        </div>
        <div>
          <TasksPage />
        </div>
      </div>
    )
  }
}

@observer
class TasksPage extends Component {
  render() {
    return (
      <Page>
        <PageTitle>Orbit Tasks</PageTitle>
        <div className={cn('frc pb2')}>
          <button
            className={cn('ph3', 'input-reset bn pointer blue link ttu')}
            onClick={() => updateAddTask()}
          >
            Add
          </button>
        </div>
        <Tasks tasks={getSortedTasks()} />
      </Page>
    )
  }
}

@observer
class Tasks extends Component {
  render() {
    return renderKeyedById(Task, 'task', this.props.tasks)
  }
}

@observer
class Task extends Component {
  render() {
    const {task} = this.props
    return (
      <div className={cn('pv1')}>
        <div className={cn('frc lh-copy')}>
          <AsciiCheckButton
            checked={TR.isDone(task)}
            onClick={() => updateToggleDone(task)}
          />
          <div className={cn('fa')}>{TR.title(task)}</div>
        </div>
        <div className={cn('ph3', 'frc', 'code f7 lh-copy black-50')}>
          <div className={cn('ph1')}>{`id:${take(10)(task.id)}`}</div>
          <div className={cn('ph1')}>{`type:${task.type}`}</div>
          <div className={cn('ph1')}>{`sortIdx:${TR.sortIdx(task)}`}</div>
          <div className={cn('ph1')}>{`isDone:${TR.isDone(task)}`}</div>
          <div className={cn('ph1')}>
            {`createdAt:${TR.createdAt(task)}`}
          </div>
        </div>
        <div className={cn('ph3', 'frc', 'code f7 lh-copy black-50')}>
          <div className={cn('ph1')}>{`title:${TR.title(task)}`}</div>
        </div>
      </div>
    )
  }
}
