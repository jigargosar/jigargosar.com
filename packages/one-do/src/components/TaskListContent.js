import React from 'react'
import {wrapSP} from '../lib/little-react'
import CheckBoxBlankIcon from '@material-ui/icons/CheckCircleOutlineRounded'
import CheckBoxCheckedIcon from '@material-ui/icons/CheckCircleRounded'
import cn from 'classnames'
import {AddIcon, DeleteIcon} from './Icons'
import {fWord} from '../lib/fake'
import {Btn} from '../lib/tachyons-components'
import {withStoreDN} from '../StoreContext'
import {dispatchAddTask, dispatchEditListSP} from '../StoreActions'
import {FlexRow} from './UI'

export const TaskListContent = withStoreDN('TaskListContent')(props => {
  const store = props.store
  return (
    <div className={cn('overflow-scroll pb5')}>
      <Header list={store.selectedList} />
      <Tasks tasks={store.tasks} />
    </div>
  )
})
const Header = withStoreDN('Header')(props => {
  const {list} = props
  return (
    <FlexRow className={'pa2 pr0 '} onClick={dispatchEditListSP(list)}>
      <div className={cn('fa ttu')}>{list.name}</div>
      <Btn onClick={dispatchAddTask({name: fWord()}, list)}>
        <AddIcon />
      </Btn>
    </FlexRow>
  )
})

const Tasks = withStoreDN('Tasks')(props =>
  props.tasks.map(task => <TaskItem key={task.id} task={task} />),
)

const TaskItem = withStoreDN('TaskItem')(props => {
  const {store, task} = props
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
})
