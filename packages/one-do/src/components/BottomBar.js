import React from 'react'

import cn from 'classnames'
import {fWord} from '../lib/fake'
import {
  handleAddTask,
  handleDeleteItem,
  handleUpdateItem,
} from '../mst-models/StoreActionsHandlers'
import {FlexRow} from './UI'
import {IconBtn} from '../lib/IconBtn'
import {AddIcon, DeleteIcon, DoneIcon, MenuIcon} from './Icons'
import {withStore} from '../StoreContext'
import {handleToggleDrawer} from '../mst-models/StoreActionsHandlers'

function BottomBar({store: {selectedTask: task}}) {
  return (
    <FlexRow className={cn('pa2 flex-shrink-0', 'bt b--moon-gray')}>
      <IconBtn
        Icon={DeleteIcon}
        label={'delete'}
        disabled={Boolean(!task)}
        onClick={handleDeleteItem(task)}
      />
      <div className={cn('flex-auto')} />
      <IconBtn
        Icon={MenuIcon}
        label={'menu'}
        onClick={handleToggleDrawer()}
      />
      <IconBtn
        Icon={AddIcon}
        label={'add'}
        onClick={e => handleAddTask({name: fWord()})(e)}
      />
      <IconBtn
        Icon={DoneIcon}
        label={'done'}
        disabled={Boolean(!task)}
        onClick={
          task ? handleUpdateItem({isDone: !task.isDone}, task) : null
        }
      />
    </FlexRow>
  )
}

BottomBar.propTypes = {}

export default withStore(BottomBar)
