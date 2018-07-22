import * as rebass from 'rebass'
import system from 'system-components'
import styled from 'styled-components'

export const B = rebass

const SIcnBtn = system({
  is: 'button',
  bg: 'transparent solid',
  color: '#666',
  border: 0,
  p: 1,
  fontSize: 3,
  display: 'flex',
  alignItems: 'center',
  lineHeight: 'inherit',
})

export const IcnBtn = styled(SIcnBtn)`
  :focus {
    z-index: 1;
  }
`
