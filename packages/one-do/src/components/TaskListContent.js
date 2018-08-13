import React, {Component} from 'react'
import {observer} from 'mobx-react'
import {wrapSP} from '../lib/little-react'
import CheckBoxBlankIcon from '@material-ui/icons/CheckCircleOutlineRounded'
import CheckBoxCheckedIcon from '@material-ui/icons/CheckCircleRounded'
import cn from 'classnames'
import {AddIcon, DeleteIcon} from './Icons'
import {fWord} from '../lib/fake'
import {Btn} from '../lib/tachyons-components'
import {getParentOfType} from '../lib/little-mst'
import RootStore from '../RootStore'
import {withStore} from '../StoreContext'

@withStore
export class TaskListContent extends Component {
  render() {
    const store = this.props.store
    return (
      <div className={cn('overflow-scroll pb5')}>
        <Header list={store.selectedList} />
        <Tasks store={store} tasks={store.tasks} />
      </div>
    )
  }
}

@observer
class Header extends Component {
  render() {
    const {list} = this.props
    const store = storeOf(list)
    return (
      <div
        className={'frc pa2 pr0 '}
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
    const {tasks} = this.props
    return tasks.map(task => <TaskItem key={task.id} task={task} />)
  }
}

function storeOf(node) {
  return getParentOfType(node, RootStore)
}

@observer
class TaskItem extends Component {
  render() {
    const {task} = this.props
    const store = storeOf(task)
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
        <div className={cn('fa', {strike: isDone})}>
          {task.name}
          {task.isDirty && ` *`}
        </div>

        {isDone && (
          <Btn onClick={wrapSP(() => store.deleteTask(task))}>
            <DeleteIcon />
          </Btn>
        )}
      </div>
    )
  }
}
