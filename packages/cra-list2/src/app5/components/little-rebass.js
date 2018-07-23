/*eslint-disable*/

import * as rebass from 'rebass'
import system from 'system-components'
import styled from 'styled-components'
import React from 'react'
import {
  color,
  flex,
  fontSize,
  fontWeight,
  lineHeight,
  space,
  width,
  display,
  fontFamily,
} from 'styled-system'

/*eslint-enable, eslint-disable no-empty-pattern*/

export const B = rebass
export const Flex = B.Flex
export const Box = B.Box

export const FlexRow = styled(Flex).attrs({
  alignItems: 'center',
})``

const SBtn = system({
  is: 'button',
  bg: 'transparent',
  color: '#666',
  border: 0,
  p: 1,
  display: 'flex',
  alignItems: 'center',
  lineHeight: 'inherit',
})

export const Btn = styled(SBtn)`
  :focus {
    z-index: 1;
  }
  ${fontSize};
`

export function IconBtn({icon: Icon, ...other}) {
  return (
    <Btn {...other}>
      <Icon fontSize={'inherit'} />
    </Btn>
  )
}

IconBtn.defaultProps = {
  fontSize: 3,
}
