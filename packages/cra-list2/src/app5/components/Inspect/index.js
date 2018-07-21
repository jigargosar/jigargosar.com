import {Inspector} from 'react-inspector'
import React from 'react'
import {observer} from 'mobx-react'
import {getSnapshot, getType} from 'mobx-state-tree'

export const InspectSnapshot = observer(function InspectSnapshot({
  node,
  ...other
}) {
  return (
    <Inspector
      name={getType(node).name}
      data={getSnapshot(node)}
      expandLevel={20}
      {...other}
    />
  )
})
