import '../stores/init-mobx'
import React, {Component} from 'react'
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
import {buttonStyle} from '../lib/little-tachyons-style'
import {AsciiCheck} from '../lib/AsciiCheck'

@disposable(module)
@observer
class AppContainer extends Component {
  componentDidMount() {
    if (module.hot) {
      this.props.addDisposer(startSimulation(false))
    }
  }

  render() {
    return <AppContent />
  }
}

export default AppContainer

@observer
class AppContent extends Component {
  render() {
    return (
      <div className={cn('vh-100 overflow-scroll')}>
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
      <div>
        <div className={cn('pa3 f3')}>Orbit Tasks</div>
        <div className={cn('frc pv2')}>
          <button
            className={cn('ph3', 'input-reset bn pointer blue link ttu')}
            onClick={() => updateAddTask()}
          >
            Add
          </button>
        </div>
        <Tasks tasks={getSortedTasks()} />
      </div>
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
class AsciiCheckButton extends Component {
  render() {
    const {
      layout = 'ph3',
      checked = false,
      comp: ButtonComponent = 'button',
      ...other
    } = this.props
    return (
      <ButtonComponent className={cn(layout, buttonStyle)} {...other}>
        <AsciiCheck checked={checked} />
      </ButtonComponent>
    )
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
        <div
          className={cn(
            'ph3',
            'frc justify-end_',
            'code f7 lh-copy black-50',
          )}
        >
          {`sortIdz:${TR.sortIdx(task)} id:${
            task.id
          } createdAt:${TR.createdAt(task)}`}
        </div>
      </div>
    )
  }
}
