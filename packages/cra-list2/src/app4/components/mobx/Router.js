import React from 'react'
import {validate} from '../../little-ramda'
import {Link} from '../ui'
import {mrInjectAll} from '../utils'

export const LinkTo = mrInjectAll(function LinkTo({
  children,
  to,
  router,
  ...rest
}) {
  validate('SOO', [to, router, rest])
  return (
    <Link onClick={() => router.goto({name: to})} {...rest}>
      {children}
    </Link>
  )
})
