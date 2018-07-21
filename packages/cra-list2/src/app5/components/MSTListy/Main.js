/* eslint-disable no-func-assign*/
import React from 'react'
import {StyleRoot} from '../styled'
import {whenKey, withKeyEvent} from '../utils'
import {Dashboard} from './Dashboard'
import {oInject} from './utils'
import {_} from '../../little-ramda'
import {Inspector} from 'react-inspector'
import {getSnapshot} from 'mobx-state-tree'
import {observer} from 'mobx-react'

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
  return (
    <Inspector
      name={'store'}
      data={getSnapshot(store)}
      expandLevel={2}
    />
  )
})
function ListyMain({store}) {
  return (
    <StyleRoot>
      <KeyboardShortcuts store={store} />
      <Dashboard dashboard={store} />
      <InspectStore store={store} />
    </StyleRoot>
  )
}

export default oInject(_.identity)(ListyMain)
