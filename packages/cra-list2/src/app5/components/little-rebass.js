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
  minHeight,
  borders,
  borderColor,
} from 'styled-system'

import {omit, Tag} from 'clean-tag'

/*eslint-enable, eslint-disable no-empty-pattern*/

export {styled}
export const B = rebass
export const Flex = B.Flex
export const Box = system(
  'width',
  'fontFamily',
  'fontSize',
  'flex',
  'order',
  'alignSelf',
  'colorStyle',
  'minHeight',
  'border',
  'borderColor',
)

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

export const Btn = system({
  is: 'button',
  bg: 'transparent',
  variant: 'dim',
  border: 0,
  p: 1,
  textAlign: 'start',
  width: null,
  fontSize: null,
  lineHeight: null,
})

export function IconBtn({icon: Icon, iconSize, ...other}) {
  return (
    <Btn {...other}>
      <Icon fontSize={iconSize} />
    </Btn>
  )
}

IconBtn.defaultProps = {
  variant: 'icon',
  iconSize: 'default',
}
