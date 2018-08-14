import React, {Component} from 'react'

import cn from 'classnames'
import {fWord} from '../lib/fake'
import {handleUpdateItem} from '../mst-models/StoreActionsHandlers'
import {FlexRow} from './UI'
import {IconBtn} from '../lib/IconBtn'
import {AddIcon, DeleteIcon, DoneIcon, MenuIcon} from './Icons'
import {withStore} from '../StoreContext'
import {computed} from '../lib/mobx'
import {isNil} from '../lib/ramda'
import {handleToggleDrawer} from '../mst-models/RootStore'

class BottomBar extends Component {
  @computed
  get selectedTask() {
    return this.props.store.selectedTask
  }

  @computed
  get store() {
    return this.props.store
  }

  @computed
  get isTaskSelectionEmpty() {
    return isNil(this.selectedTask)
  }

  handleDeleteTask = () => this.store.deleteItem(this.selectedTask)

  handleAddTask = () => this.store.addTask({name: fWord()})

  handleDoneTask = () => {
    return this.selectedTask
      ? handleUpdateItem(
          {isDone: !this.selectedTask.isDone},
          this.selectedTask,
        )
      : null
  }

  render() {
    return (
      <FlexRow className={cn('pa2 flex-shrink-0', 'bt b--moon-gray')}>
        <IconBtn
          Icon={DeleteIcon}
          label={'delete'}
          disabled={this.isTaskSelectionEmpty}
          onClick={this.handleDeleteTask}
        />
        <div className={cn('flex-auto')} />
        <IconBtn
          Icon={MenuIcon}
          label={'menu'}
          onClick={handleToggleDrawer}
        />
        <IconBtn
          Icon={AddIcon}
          label={'add'}
          onClick={this.handleAddTask}
        />
        <IconBtn
          Icon={DoneIcon}
          label={'done'}
          disabled={this.isTaskSelectionEmpty}
          onClick={this.handleDoneTask}
        />
      </FlexRow>
    )
  }
}

BottomBar.propTypes = {}

export default withStore(BottomBar)
