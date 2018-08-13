import React from 'react'

import cn from 'classnames'
import {fWord} from './lib/fake'
import {
  dispatchAddTask,
  dispatchDeleteTask,
  dispatchToggleDrawer,
} from './StoreActions'
import {FlexRow} from './components/UI'
import {IconBtn} from './lib/IconBtn'
import {AddIcon, DeleteIcon, MenuIcon} from './components/Icons'
import {withStore} from './StoreContext'

function BottomBar({store: {selectedTask}}) {
  return (
    <FlexRow className={cn('pa2 flex-shrink-0', 'bt b--moon-gray')}>
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
        Icon={DeleteIcon}
        label={'delete'}
        disabled={Boolean(!selectedTask)}
        onClick={dispatchDeleteTask(selectedTask)}
      />
    </FlexRow>
  )
}

BottomBar.propTypes = {}

export default withStore(BottomBar)
