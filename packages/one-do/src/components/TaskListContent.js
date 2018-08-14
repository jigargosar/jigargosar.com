import React from 'react'
import cn from 'classnames'
import {AddIcon} from './Icons'
import {fWord} from '../lib/fake'
import {Btn, BtnBehaviour} from '../lib/Btn'
import {withStoreDN} from '../StoreContext'
import {
  dispatchAddTaskSP,
  dispatchEditList,
  dispatchEditTaskSP,
  dispatchSetSelection,
} from '../StoreActionsHandlers'
import {Div, FlexRow} from './UI'
import {renderKeyedById} from '../lib/little-react'

export const TaskListContent = withStoreDN('TaskListContent')(({list}) => (
  <div className={cn('overflow-scroll h-100')}>
    <FlexRow className={'pa2 pr0 '} onClick={dispatchEditList(list)}>
      <div className={cn('fa ttu')}>{list.name}</div>
      <Btn onClick={dispatchAddTaskSP({name: fWord()}, list)}>
        <AddIcon />
      </Btn>
    </FlexRow>
    <div className={cn('pointer')}>
      {renderKeyedById(TaskItem, 'task', list.activeTasks)}
    </div>
  </div>
))

const TaskItem = withStoreDN('TaskItem')(
  ({store, task, _task: {isDone, name, isDirty} = task}) => (
    <Div>
      <BtnBehaviour
        className={cn(
          'link ph3 pointer bl bw2',
          store.isSelected(task) ? 'b--blue' : 'b--transparent',
        )}
        onClick={dispatchSetSelection(task)}
        onDoubleClick={dispatchEditTaskSP(task)}
      >
        <Div cn={['fa', {strike: isDone}]}>
          {name}
          {isDirty && ` *`}
        </Div>
      </BtnBehaviour>
    </Div>
  ),
)
