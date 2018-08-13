import React from 'react'

import cn from 'classnames'
import {fWord} from './lib/fake'
import {
  dispatchAddTask,
  dispatchDeleteTask,
  dispatchToggleDrawer,
  dispatchUpdateItem,
} from './StoreActions'
import {FlexRow} from './components/UI'
import {IconBtn} from './lib/IconBtn'
import {AddIcon, DeleteIcon, DoneIcon, MenuIcon} from './components/Icons'
import {withStore} from './StoreContext'

function BottomBar({store: {selectedTask: task}}) {
  return (
    <FlexRow className={cn('pa2 flex-shrink-0', 'bt b--moon-gray')}>
      <IconBtn
        Icon={DeleteIcon}
        label={'delete'}
        disabled={Boolean(!task)}
        onClick={dispatchDeleteTask(task)}
      />
      <div className={cn('flex-auto')} />
      <IconBtn
        Icon={MenuIcon}
        label={'menu'}
        onClick={dispatchToggleDrawer()}
      />
      <IconBtn
        Icon={AddIcon}
        label={'add'}
        onClick={e => dispatchAddTask({name: fWord()})(e)}
      />
      <IconBtn
        Icon={DoneIcon}
        label={'done'}
        disabled={Boolean(!task)}
        onClick={
          task ? dispatchUpdateItem({isDone: !task.isDone}, task) : null
        }
      />
    </FlexRow>
  )
}

BottomBar.propTypes = {}

export default withStore(BottomBar)
