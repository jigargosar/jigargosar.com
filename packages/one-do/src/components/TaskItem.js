import {withStore} from '../StoreContext'
import {Div} from './UI'
import {BtnBehaviour} from '../lib/Btn'
import cn from 'classnames'
import {
  handleEditTaskSP,
  handleSetSelection,
} from '../mst-models/StoreActionsHandlers'
import React, {Component} from 'react'
import * as PropTypes from 'prop-types'

class TaskItem extends Component {
  render() {
    const {store, task} = this.props
    const {isDone, name, isDirty} = task
    return (
      <Div>
        <BtnBehaviour
          className={cn(
            'link ph3 pointer bl bw2',
            store.isSelected(task) ? 'b--blue' : 'b--transparent',
          )}
          onClick={handleSetSelection(task)}
          onDoubleClick={handleEditTaskSP(task)}
        >
          <Div cn={['fa', {strike: isDone}]}>
            {name}
            {isDirty && ` *`}
          </Div>
        </BtnBehaviour>
      </Div>
    )
  }
}

TaskItem.propTypes = {
  store: PropTypes.any,
  task: PropTypes.any,
}

export default withStore(TaskItem)
