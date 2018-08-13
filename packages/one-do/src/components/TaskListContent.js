import React from 'react'
import {tapSP} from '../lib/little-react'
import CheckBoxBlankIcon from '@material-ui/icons/CheckCircleOutlineRounded'
import CheckBoxCheckedIcon from '@material-ui/icons/CheckCircleRounded'
import cn from 'classnames'
import {AddIcon, DeleteIcon} from './Icons'
import {fWord} from '../lib/fake'
import {Btn} from '../lib/tachyons-components'
import {withStoreDN} from '../StoreContext'
import {
  dispatchAddTask,
  dispatchDeleteTaskSP,
  dispatchEditListSP,
  dispatchEditTaskSP,
  dispatchUpdateTaskSP,
} from '../StoreActions'
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

const ifTF = (bool, t, f) => {
  return bool ? t : f
}

function checkBoxIcon(isChecked) {
  return ifTF(isChecked, <CheckBoxCheckedIcon />, <CheckBoxBlankIcon />)
}

const TaskItem = withStoreDN('TaskItem')(
  ({store, task, _task: {isDone, name, isDirty} = task}) => (
    <div
      className={cn('frc', {pointer: !isDone})}
      onClick={isDone ? null : dispatchEditTaskSP(task)}
    >
      <Btn onClick={dispatchUpdateTaskSP({isDone: !isDone}, task)}>
        {checkBoxIcon(isDone)}
      </Btn>
      <div className={cn('fa', {strike: isDone})}>
        {name}
        {isDirty && ` *`}
      </div>

      {isDone && (
        <Btn onClick={dispatchDeleteTaskSP(task)}>
          <DeleteIcon />
        </Btn>
      )}
    </div>
  ),
)
