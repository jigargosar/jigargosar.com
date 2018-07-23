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
  border,
  textAlign,
} from 'styled-system'

/*eslint-enable, eslint-disable no-empty-pattern*/

export const B = rebass
export const Flex = B.Flex
export const Box = B.Box

export const FlexRow = styled(Flex).attrs({
  alignItems: 'center',
})``

export const Btn = styled(Box).attrs({
  is: 'button',
  bg: 'transparent',
  color: '#666',
  border: 0,
  p: 1,
  textAlign: 'start',
  // display: 'flex',
  // alignItems: 'center',
  // lineHeight: 'inherit',
})`
  :focus {
    z-index: 1;
  }
  ${fontSize};
  ${border};
  ${textAlign};
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
