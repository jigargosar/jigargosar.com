import React from 'react'
import GLink from 'gatsby-link'

import {rhythm} from '../utils/typography'
import g from 'glamorous'
import {isNil, omit} from 'ramda'

export const Link = ({to, href, children, ...rest}) => {
  return isNil(to)
         ? <ExternalLink href={href} {...rest} >{children}</ExternalLink>
         : <InternalLink to={to} {...rest}>{children}</InternalLink>
}

const InternalLink = g(GLink)(omit(['children']))

export const ExternalLink = g.A

ExternalLink.defaultProps = {
  target: '_blank',
}

