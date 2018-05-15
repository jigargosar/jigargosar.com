import React from 'react'
import g from 'glamorous'
import {NavLinks} from '../components/NavLinks'

export function LandingPage() {
  return <g.Div display="flex" alignItems="center" justifyContent="center" height="100%">
    <g.H1 flex="1" fontSize="4em">
      Jigar Gosar
    </g.H1>
    <g.H2 flex="2" display="flex" flexDirection="column" alignItems="center">
      <NavLinks/>
    </g.H2>
  </g.Div>
}
