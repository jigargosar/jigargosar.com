import React from 'react'
import {tapSP} from '../lib/little-react'
import CheckBoxBlankIcon from '@material-ui/icons/CheckCircleOutlineRounded'
import CheckBoxCheckedIcon from '@material-ui/icons/CheckCircleRounded'
import cn from 'classnames'
import {AddIcon, DeleteIcon} from './Icons'
import {fWord} from '../lib/fake'
import {Btn} from '../lib/tachyons-components'
import {withStoreDN} from '../StoreContext'
import {dispatchAddTask, dispatchEditListSP} from '../StoreActions'
import {FlexRow} from './UI'

export const TaskListContent = withStoreDN('TaskListContent')(
  ({store}) => (
    <div className={cn('overflow-scroll pb5')}>
      <Header list={store.selectedList} />
      <Tasks tasks={store.tasks} />
    </div>
  ),
)
const Header = withStoreDN('Header')(({list}) => (
  <FlexRow className={'pa2 pr0 '} onClick={dispatchEditListSP(list)}>
    <div className={cn('fa ttu')}>{list.name}</div>
    <Btn onClick={dispatchAddTask({name: fWord()}, list)}>
      <AddIcon />
    </Btn>
  </FlexRow>
))

const Tasks = withStoreDN('Tasks')(({tasks}) =>
  tasks.map(task => <TaskItem key={task.id} task={task} />),
)

const TaskItem = withStoreDN('TaskItem')(
  ({store, task, _task: {isDone, name, isDirty} = task}) => (
    <div
      className={cn('frc', {pointer: !isDone})}
      onClick={isDone ? null : tapSP(() => store.editTask(task))}
    >
      <Btn
        onClick={tapSP(() => store.updateTask({isDone: !isDone}, task))}
      >
        {isDone ? <CheckBoxCheckedIcon /> : <CheckBoxBlankIcon />}
      </Btn>
      <div className={cn('fa', {strike: isDone})}>
        {name}
        {isDirty && ` *`}
      </div>

      {isDone && (
        <Btn onClick={tapSP(() => store.deleteTask(task))}>
          <DeleteIcon />
        </Btn>
      )}
    </div>
  ),
)
