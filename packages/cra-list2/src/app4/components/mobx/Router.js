import React from 'react'
import {validate} from '../../utils'
import {Link} from '../ui'
import {mrInjectAll} from '../little-mobx'

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
