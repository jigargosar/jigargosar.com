import React from 'react'
import {
  LiveEditor,
  Diff,
  Cartesian,
  Example,
  Library,
  withDebug,
  XRay,
} from '@compositor/kit'

import * as kit from '@compositor/kit'

import {Box as B} from '../src/app5/components/styled'

const Box = withDebug(B)

function renderBox() {
  return <Box>Box</Box>
}

export default props => (
  <Library>
    <Example name={'Box Example'}>{renderBox()}</Example>
    <Example name={'Box Live Edit'}>
      <LiveEditor
        code="<button>Hello</Button>"
        scope={{
          kit,
        }}
      />
    </Example>
    <Example name={'Box Diff'}>
      {
        <Diff>
          <Box>Box1</Box>
          <Box>Box2</Box>
        </Diff>
      }
    </Example>
    <Example name={'Box XRay'}>
      <XRay>
        <Box>Box</Box>
      </XRay>
    </Example>
    <Example name={'Box Cartesian'}>
      <Cartesian
        component={Box}
        m={4}
        p={2}
        fontSize={[1, 2, 3]}
        color={'white'}
        bg={['blue', 'pink', 'tomato', 'purple']}
        children={['Hello, world!', 'Beep']}
      />
    </Example>
  </Library>
)
