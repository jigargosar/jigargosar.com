import React, {Component} from 'react'
import {observer} from 'mobx-react'
import {wrapSP} from '../lib/little-react'
import CheckBoxBlankIcon from '@material-ui/icons/CheckCircleOutlineRounded'
import CheckBoxCheckedIcon from '@material-ui/icons/CheckCircleRounded'
import cn from 'classnames'
import {AddIcon, DeleteIcon} from './Icons'
import {fWord} from '../lib/fake'
import {Btn} from '../lib/tachyons-components'

@observer
export class TaskListContent extends Component {
  render() {
    const store = this.props.store
    return (
      <div className={cn('overflow-scroll pb5')}>
        <Header store={store} />
        <Tasks store={store} />
      </div>
    )
  }
}

@observer
class Header extends Component {
  render() {
    const {store} = this.props
    const list = store.selectedList
    return (
      <div
        className={'frc pa2 pr0'}
        onClick={wrapSP(() => store.editList(list))}
      >
        <div className={cn('fa ttu')}>{list.name}</div>
        <Btn onClick={wrapSP(() => store.addTask({name: fWord()}, list))}>
          <AddIcon />
        </Btn>
      </div>
    )
  }
}

@observer
class Tasks extends Component {
  render() {
    const {store} = this.props
    return store.tasks.map(task => (
      <TaskItem key={task.id} task={task} store={store} />
    ))
  }
}

@observer
class TaskItem extends Component {
  render() {
    const {task, store} = this.props
    const isDone = task.isDone
    return (
      <div
        className={cn('frc', {pointer: !isDone})}
        onClick={isDone ? null : wrapSP(() => store.editTask(task))}
      >
        <Btn
          onClick={wrapSP(() => store.updateTask({isDone: !isDone}, task))}
        >
          {isDone ? <CheckBoxCheckedIcon /> : <CheckBoxBlankIcon />}
        </Btn>
        <div className={cn('fa', {strike: isDone})}>{task.name}</div>
        <div>{task.isDirty && `*`}</div>

        {isDone && (
          <Btn onClick={wrapSP(() => store.deleteTask(task))}>
            <DeleteIcon />
          </Btn>
        )}
      </div>
    )
  }
}
