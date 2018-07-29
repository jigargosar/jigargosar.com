import FocusTrap from 'focus-trap-react'
import {cn} from '../utils'
import {AutoSize} from '../lib/AutoSize'
import React from 'react'

export const InputWrapper = function InputWrapper({children}) {
  return (
    <FocusTrap
      className={cn('flex-auto flex')}
      focusTrapOptions={{returnFocusOnDeactivate: false}}
    >
      <AutoSize>{children}</AutoSize>
    </FocusTrap>
  )
}
