/* eslint-disable no-func-assign*/
import React from 'react'
import {Flex, StyleRoot} from '../styled'
import {renderIndexed, whenKey, withKeyEvent} from '../utils'
import {Dashboard} from './Dashboard'
import {oInjectNamed} from '../little-mobx-react'
import {observer} from 'mobx-react'
import {InspectSnapshot} from '../Inspect/index'

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

const DebugStores = oInjectNamed('store', 'domain')(
  function DebugStores(props) {
    return (
      <Flex>
        {renderIndexed(InspectSnapshot, 'node', Object.values(props))}
      </Flex>
    )
  },
)

function ListyMain({store, domain}) {
  return (
    <StyleRoot>
      <KeyboardShortcuts store={store} />
      <Dashboard dashboard={domain.currentDashboard} />
      <DebugStores />
    </StyleRoot>
  )
}

export default oInjectNamed('store', 'domain')(ListyMain)
