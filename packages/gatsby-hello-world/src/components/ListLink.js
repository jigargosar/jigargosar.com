import React from 'react'
import Link from 'gatsby-link'

import {rhythm} from '../utils/typography'

export const ListLink = props =>
  <li style={{display: `inline-block`, marginRight: `1rem`}}>
    <Link to={props.to} href={props.href} target={props.target}>
      {props.children}
    </Link>
  </li>

export const ListLinkExternal = props =>
  <li style={{display: `inline-block`, marginRight: `1rem`}}>
    <a href={props.href} target={props.target || '_blank'}>
      {props.children}
    </a>
  </li>

