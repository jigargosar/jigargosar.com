import React, {Fragment as F} from 'react'
import {Link} from '../components/Link'

export function NavLinks() {
  return <F>
    <Link to="/blog/">BLOG</Link>
    <Link href="https://medium.com/@jigargosar">
      MEDIUM
    </Link>
    <Link href="https://twitter.com/@jigargosar">
      TWITTER
    </Link>
  </F>
}
