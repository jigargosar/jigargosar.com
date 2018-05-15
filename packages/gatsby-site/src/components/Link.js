import React from 'react'
import GLink from 'gatsby-link'

import g from 'glamorous'
import {compose, equals, isNil, omit, pathEq, prop, propEq} from 'ramda'
import {mapProps} from 'recompose'

const InternalLink = g(GLink)(omit(['children']))

const ExternalLink = g.A
ExternalLink.defaultProps = {
  target: '_blank',
}

const enhanceLink = compose(
  mapProps(({to, href, location, ...rest}) => ({
    ...(location && to && location.pathname === to)
       ? {
        href: to,
        target: '_self',
        onClick: e => e.preventDefault(),
      }
       : {to, href},
    ...rest,
  })),
)

export const Link = enhanceLink(function Link({to, location, href, children, ...rest}) {
  return isNil(to)
         ? <ExternalLink href={href} {...rest} >{children}</ExternalLink>
         : <InternalLink to={to} {...rest}>{children}</InternalLink>
})
