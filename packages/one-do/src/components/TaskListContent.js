import React, {Component} from 'react'
import {wrapSP} from '../lib/little-react'
import CheckBoxBlankIcon from '@material-ui/icons/CheckCircleOutlineRounded'
import CheckBoxCheckedIcon from '@material-ui/icons/CheckCircleRounded'
import cn from 'classnames'
import {AddIcon, DeleteIcon} from './Icons'
import {fWord} from '../lib/fake'
import {Btn} from '../lib/tachyons-components'
import {withStore, withStoreDN} from '../StoreContext'
import {dispatchAddTask, dispatchEditListSP} from '../StoreActions'
import {FlexRow} from './UI'

@withStore
export class TaskListContent extends Component {
  render() {
    const store = this.props.store
    return (
      <div className={cn('overflow-scroll pb5')}>
        <Header list={store.selectedList} />
        <Tasks tasks={store.tasks} />
      </div>
    )
  }
}

@withStore
class Header extends Component {
  render() {
    const {list} = this.props
    return (
      <FlexRow className={'pa2 pr0 '} onClick={dispatchEditListSP(list)}>
        <div className={cn('fa ttu')}>{list.name}</div>
        <Btn onClick={dispatchAddTask({name: fWord()}, list)}>
          <AddIcon />
        </Btn>
      </FlexRow>
    )
  }
}

const Tasks = withStoreDN('Tasks')(props =>
  props.tasks.map(task => <TaskItem key={task.id} task={task} />),
)

@withStore
class TaskItem extends Component {
  render() {
    const {store, task} = this.props
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
