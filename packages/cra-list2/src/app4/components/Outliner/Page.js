import React from 'react'
import {cn, mrInjectAll} from '../utils'
import {Section} from '../ui'

const OutlinePage = mrInjectAll(function App({out}) {
  return (
    <div className={cn('pa3 bg-blue white shadow-1')}>
      Outliner {`${out}`}{' '}
    </div>
  )
})

export default OutlinePage
