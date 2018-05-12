import React from 'react'
import GLink from 'gatsby-link'

import g from 'glamorous'
import {isNil, omit} from 'ramda'

const InternalLink = g(GLink)(omit(['children']))

const ExternalLink = g.A
ExternalLink.defaultProps = {
  target: '_blank',
}

export function Link({to, href, children, ...rest}) {
  return isNil(to)
         ? <ExternalLink href={href} {...rest} >{children}</ExternalLink>
         : <InternalLink to={to} {...rest}>{children}</InternalLink>
}
