import {observer} from 'mobx-react'
import {TypographyDefaults} from '../ui'
import FocusTrap from 'focus-trap-react'
import React from 'react'

export const RootContainer = observer(function RootContainer({
  focusTrapOptions = {escapeDeactivates: false},
  children,
  className,
}) {
  return (
    <TypographyDefaults className={className}>
      <FocusTrap focusTrapOptions={focusTrapOptions}>
        {children}
      </FocusTrap>
    </TypographyDefaults>
  )
})
