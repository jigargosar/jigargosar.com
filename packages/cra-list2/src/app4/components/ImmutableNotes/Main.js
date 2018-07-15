import React from 'react'
import {CenterLayout, Title, TypographyDefaults} from '../ui'
import {cn, mrInjectAll} from '../utils'
import {AppHeaderBar} from '../mobx/AppHeaderBar'

const Main = mrInjectAll(function Main() {
  return (
    <TypographyDefaults className={cn('mb4')}>
      <AppHeaderBar>
        <Title className={cn('flex-auto')}>
          {`Immutable Note Outliner`}
        </Title>
      </AppHeaderBar>
      <CenterLayout>{`HW`}</CenterLayout>
    </TypographyDefaults>
  )
})

export default Main
