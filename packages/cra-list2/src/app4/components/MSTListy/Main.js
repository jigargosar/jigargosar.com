/* eslint-disable no-func-assign*/
import React from 'react'
import {TypographyDefaults} from '../ui'
import {cn} from '../utils'
import {Dashboard} from './Dashboard'
import {oInject} from './utils'
import {_} from '../../little-ramda'

function ListyMain({store}) {
  return (
    <TypographyDefaults className={cn('mb4')}>
      <Dashboard dashboard={store} />
    </TypographyDefaults>
  )
}

export default oInject(_.identity)(ListyMain)
