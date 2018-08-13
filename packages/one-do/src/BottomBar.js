import React, {Component} from 'react'

import cn from 'classnames'
import {fWord} from './lib/fake'
import {dispatchAddTask, dispatchToggleDrawer} from './StoreActions'
import {FlexRow} from './components/UI'
import {IconBtn} from './lib/IconBtn'
import {AddIcon, MenuIcon} from './components/Icons'

export class BottomBar extends Component {
  render() {
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
      </FlexRow>
    )
  }
}

BottomBar.propTypes = {}
