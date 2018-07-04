import React from 'react'
import {validate} from '../../utils'
import {Link} from '../ui'
import {mrInjectAll} from '../utils'

export const LinkTo = mrInjectAll(function LinkTo({
  children,
  to,
  router,
  ...rest
}) {
  validate('SOA', [to, router, rest])
  return (
    <Link onClick={() => router.goto(to)} {...rest}>
      {children}
    </Link>
  )
})
