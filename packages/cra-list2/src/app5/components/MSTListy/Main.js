/* eslint-disable no-func-assign*/
import React from 'react'
import {StyleRoot} from '../styled'
import {Flex} from 'rebass'
import {renderIndexed, whenKey, withKeyEvent} from '../utils'
import {Dashboard} from './Dashboard'
import {oInjectNamed} from '../little-mobx-react'
import {observer} from 'mobx-react'
import {InspectSnapshot} from '../Inspect/index'
import {mapIndexed, R, S} from '../../little-ramda'
import {onPatch} from 'mobx-state-tree'
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

const DebugStores = oInjectNamed('store', 'domain')(
  function DebugStores(props) {
    return (
      <Flex>
        {renderIndexed(InspectSnapshot, 'node', Object.values(props))}
      </Flex>
    )
  },
)

const DomainPatches = class DomainPatches extends React.Component {
  state = {
    patches: [],
  }
  componentDidMount() {
    this.disposer = onPatch(domain, patch => {
      this.setState({
        patches: R.prepend(patch, this.state.patches),
      })
      console.log(`patches`, ...this.state.patches)
    })
  }

  componentWillUnmount() {
    this.disposer()
  }

  render() {
    return (
      <div>
        {mapIndexed((p, idx) => (
          <pre key={idx}>{JSON.stringify(p, null, 2)}</pre>
        ))(this.state.patches)}
      </div>
    )
  }
}

function ListyMain({store, domain}) {
  return (
    <StyleRoot>
      <KeyboardShortcuts store={store} />
      {S.maybe_(() => null)(dashboard => (
        <Dashboard dashboard={dashboard} />
      ))(domain.currentDashboard)}
      <DomainPatches />
      <DebugStores />
    </StyleRoot>
  )
}

export default oInjectNamed('store', 'domain')(ListyMain)
