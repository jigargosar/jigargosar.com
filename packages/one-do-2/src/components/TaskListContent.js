import React from 'react'
import cn from 'classnames'
import {AddIcon} from './Icons'
import {fWord} from '../lib/fake'
import {Btn} from '../lib/Btn'
import {withStore} from '../StoreContext'
import {
  handleAddTaskSP,
  handleEditList,
} from '../mst-models/StoreActionsHandlers'
import {FlexRow} from './UI'
import {renderKeyedById} from '../lib/little-react'
import TaskItem from './TaskItem'

export default withStore(TaskListContent)

function TaskListContent({list}) {
  return (
    <div className={cn('overflow-scroll h-100')}>
      <FlexRow className={'pa2 pr0 '} onClick={handleEditList(list)}>
        <div className={cn('fa ttu')}>{list.name}</div>
        <Btn onClick={handleAddTaskSP({name: fWord()}, list)}>
          <AddIcon />
        </Btn>
      </FlexRow>
      <div className={cn('pointer')}>
        {renderKeyedById(TaskItem, 'task', list.activeTasks)}
      </div>
    </div>
  )
}
