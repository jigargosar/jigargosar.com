import {oInjectNamed} from '../little-mobx-react'
import {Flex} from 'rebass'
import {renderIndexed} from '../utils'
import {InspectSnapshot} from '../Inspect'
import React from 'react'
import {onPatch} from 'mobx-state-tree'
import {domain} from '../../mst/listy-stores'
import * as R from 'ramda'
import {mapIndexed} from '../../little-ramda'

export const DebugStores = oInjectNamed('store', 'domain')(
  function DebugStores(props) {
    return (
      <Flex>
        {renderIndexed(InspectSnapshot, 'node', Object.values(props))}
      </Flex>
    )
  },
)
export const DomainPatches = class DomainPatches extends React.Component {
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
