import {observer} from 'mobx-react'
import {CenterLayout} from '../ui'
import {cn} from '../utils'
import React from 'react'

export const AppHeaderBar = observer(function AppHeaderBar({
  children,
}) {
  return (
    <div className={'shadow-1 bg-light-blue'}>
      <CenterLayout className={cn('flex pv2 pv3-ns')}>
        {children}
      </CenterLayout>
    </div>
  )
})
