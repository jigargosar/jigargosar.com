import React from 'react'
import GLink from 'gatsby-link'

import {rhythm} from '../utils/typography'
import g from 'glamorous'
import {omit} from 'ramda'

export const InternalLink = g(GLink)(omit(['children']))

export const ExternalLink = ({target, children, ...others}) =>
  <g.A target={target || '_blank'} {...others}>{children}</g.A>

