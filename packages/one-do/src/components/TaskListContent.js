import React from 'react'
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
import {ifElse_} from '../lib/little-ramda'
import CheckBtn from './CheckBtn'
import {renderKeyedById} from '../lib/little-react'

export const TaskListContent = withStoreDN('TaskListContent')(
  ({store: {tasks, selectedList: list}}) => (
    <div className={cn('overflow-scroll pb5')}>
      <FlexRow className={'pa2 pr0 '} onClick={dispatchEditListSP(list)}>
        <div className={cn('fa ttu')}>{list.name}</div>
        <Btn onClick={dispatchAddTask({name: fWord()}, list)}>
          <AddIcon />
        </Btn>
      </FlexRow>
      {renderKeyedById(TaskItem, 'task', tasks)},
    </div>
  ),
)

const TaskItem = withStoreDN('TaskItem')(
  ({store, task, _task: {isDone, name, isDirty} = task}) => (
    <div
      className={cn('frc', {pointer: !isDone})}
      onClick={ifElse_(isDone, null, dispatchEditTaskSP(task))}
    >
      <CheckBtn
        checked={isDone}
        onClick={dispatchUpdateTaskSP({isDone: !isDone}, task)}
      />
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
