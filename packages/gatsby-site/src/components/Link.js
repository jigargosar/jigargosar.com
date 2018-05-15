import React from 'react'
import GLink from 'gatsby-link'

import g from 'glamorous'
import {equals, isNil, omit, prop} from 'ramda'

const GLinkWrapper = ({to, location, children}) => {
  console.log('location.pathname', prop('pathname', location), to)
  return location && equals(location.pathname, to)
         ? <g.Div>{children}</g.Div>
         : <GLink to={to}>{children}</GLink>
}

const InternalLink = g(GLinkWrapper)(omit(['children']))

const ExternalLink = g.A
ExternalLink.defaultProps = {
  target: '_blank',
}

export function Link({to, location, href, children, ...rest}) {
  return isNil(to)
         ? <ExternalLink href={href} {...rest} >{children}</ExternalLink>
         : <InternalLink to={to} location={location} {...rest}>{children}</InternalLink>
}
