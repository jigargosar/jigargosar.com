/* eslint-disable no-func-assign*/
import React from 'react'
import {whenKey, withKeyEvent} from '../utils'
import {Dashboard} from './Dashboard'
import {oInjectNamed} from '../little-mobx-react'
import {observer} from 'mobx-react'
import {maybeOrNil} from '../../little-ramda'
import {DebugStores, DomainPatches} from './Debug'
import {REB} from '../REB'

const KeyboardShortcuts = observer(
  class KeyboardShortcuts extends React.Component {
    componentDidMount() {
      window.addEventListener('keydown', this.onKeyDown)
    }

    componentWillUnmount() {
      window.removeEventListener('keydown', this.onKeyDown)
    }

    onKeyDown = e => {
      const store = this.props.store
      return withKeyEvent(
        whenKey('d')(store.onDeleteSelected),
        whenKey('down')(store.onSelectNext),
        whenKey('up')(store.onSelectPrev),
      )(e)
    }

    render() {
      return null
    }
  },
)

function ListyMain({store, domain}) {
  return (
    <REB.Provider>
      <KeyboardShortcuts store={store} />
      {maybeOrNil(dashboard => <Dashboard dashboard={dashboard} />)(
        domain.currentDashboard,
      )}
      <DomainPatches />
      <DebugStores />
    </REB.Provider>
  )
}

export default oInjectNamed('store', 'domain')(ListyMain)
