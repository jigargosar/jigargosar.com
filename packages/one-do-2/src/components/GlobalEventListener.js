import {withStore} from '../StoreContext'
import React, {Component} from 'react'
import {EventListener, whenKeyPD, withKeyEvent} from '../lib/little-react'
import {always, identity, ifElse, isNil} from 'ramda'
import {
  handleDeleteItem,
  handleEditTask,
} from '../mst-models/StoreActionsHandlers'
import PropTypes from 'prop-types'

class GlobalEventListener extends Component {
  render() {
    const {store} = this.props
    return (
      <EventListener
        target={'document'}
        onKeyDown={withKeyEvent(
          whenKeyPD('d')(
            ifElse(isNil)(always(identity))(handleDeleteItem)(
              store.selectedTask,
            ),
          ),
          whenKeyPD('e')(
            ifElse(isNil)(always(identity))(handleEditTask)(
              store.selectedTask,
            ),
          ),
        )}
      />
    )
  }
}

GlobalEventListener.propTypes = {store: PropTypes.any}

export default withStore(GlobalEventListener)
