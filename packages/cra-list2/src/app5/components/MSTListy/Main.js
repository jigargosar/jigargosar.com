/* eslint-disable no-func-assign*/
import React from 'react'
import {Flex, StyleRoot} from '../styled'
import {cn, whenKey, withKeyEvent} from '../utils'
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
      style={{padding: '100px'}}
      className={cn('p3')}
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
      <Flex>
        <InspectStore store={domain} />
        <InspectStore store={store} />
      </Flex>
    </StyleRoot>
  )
}

export default oInject(_.identity)(ListyMain)
