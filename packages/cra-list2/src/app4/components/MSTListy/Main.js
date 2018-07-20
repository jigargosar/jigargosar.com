/* eslint-disable no-func-assign*/
import React from 'react'
import {TypographyDefaults} from '../ui'
import {cn} from '../utils'
import {Dashboard} from './Dashboard'
import {observer} from 'mobx-react'

function ListyMain() {
  return (
    <TypographyDefaults className={cn('mb4')}>
      <Dashboard />
    </TypographyDefaults>
  )
}

export default observer(ListyMain)
