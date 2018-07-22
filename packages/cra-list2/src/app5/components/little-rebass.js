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

export const B = rebass

const SBtn = system({
  is: 'button',
  bg: 'transparent solid',
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
