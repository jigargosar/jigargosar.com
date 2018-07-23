/*eslint-disable*/

import * as rebass from 'rebass'
import system from 'system-components'
import styled, {injectGlobal} from 'styled-components'
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
  background,
  buttonStyle,
  alignContent,
  alignItems,
  colorStyle,
  textStyle,
} from 'styled-system'

import {omit, Tag} from 'clean-tag'

/*eslint-enable, eslint-disable no-empty-pattern*/

export {styled}
export const B = rebass
export const Flex = B.Flex
export const Box = B.Box

injectGlobal`
body{
  //background: #f1f1f1;
  
  //min-width: 300px;
  line-height: 1.1;
}
`

export const FlexRow = styled(Flex).attrs({
  alignItems: 'center',
})``

// export const Btn = styled('button').attrs({})`
//
//
// ${width}
// ${border}
// ${textAlign}
// ${space}
// ${background}
// ${color}
// ${fontSize}
// ${flex}
// ${display}
//
// `
//
// Btn.defaultProps = {
//   bg: 'transparent',
//   color: '#666',
//   border: 0,
//   p: 1,
//   textAlign: 'start',
// }
export const Btn = styled(
  system({
    is: 'button',
    bg: 'transparent',
    color: '#666',
    border: 0,
    p: 1,
    textAlign: 'start',
    width: null,
    fontSize: null,
    lineHeight: null,
  }),
)``

export function IconBtn({icon: Icon, fz, ...other}) {
  return (
    <Btn {...other}>
      <Icon fontSize={'fz'} />
    </Btn>
  )
}

IconBtn.defaultProps = {
  ...Btn.defaultProps,
  // fontSize: 3,
  lineHeight: 0,
  p: 0,
  fz: 'default',
}
