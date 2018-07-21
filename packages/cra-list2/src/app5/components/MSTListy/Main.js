/* eslint-disable no-func-assign*/
import React from 'react'
import {Flex, StyleRoot} from '../styled'
import {whenKey, withKeyEvent} from '../utils'
import {Dashboard} from './Dashboard'
import {oInject} from './utils'
import {_} from '../../little-ramda'
import {Inspector} from 'react-inspector'
import {getSnapshot} from 'mobx-state-tree'
import {observer} from 'mobx-react'
import {domain} from '../../mst/listy-stores'

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
const InspectStore = observer(function InspectStore({store}) {
  getSnapshot(store)
  return (
    <Inspector
      name={'store'}
      data={store}
      // showNonenumerable
      expandLevel={2}
    />
  )
})

function ListyMain({store}) {
  return (
    <StyleRoot>
      <KeyboardShortcuts store={store} />
      <Dashboard dashboard={store} />
      <Flex bg={'pink'} p={10}>
        <Flex p={1}>
          <InspectStore store={domain} style={{padding: 10}} />
        </Flex>
        <Flex>
          <InspectStore store={store} />
        </Flex>
      </Flex>
    </StyleRoot>
  )
}

export default oInject(_.identity)(ListyMain)
