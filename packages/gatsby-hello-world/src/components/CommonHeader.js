import React from 'react'
import g from 'glamorous'
import {Link} from '../components/Link'
import {NavLinks} from '../components/NavLinks'

export function CommonHeader({title}) {
  return <g.Header
    marginBottom={`1.5em`}
    display={`flex`}
    alignItems={`center`}
  >
    <g.H2 display="inline" margin="0" flex="1">
      <Link to="/">{title}</Link>
    </g.H2>

    <g.Div
      display="grid"
      gridTemplateColumns={`repeat(3, fit-content(100%))`}
      gridGap="0.5em"
    >
      <NavLinks/>
    </g.Div>
  </g.Header>
}
