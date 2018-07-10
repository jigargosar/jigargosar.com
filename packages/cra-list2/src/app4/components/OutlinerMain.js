import React from 'react'
import {CenterLayout, TypographyDefaults} from './ui'
import {mrInjectAll} from './utils'
import OutlinePage from './Outliner/Page'

const Main = mrInjectAll(function App({pop}) {
  return (
    <TypographyDefaults>
      <CenterLayout>
        <OutlinePage />
      </CenterLayout>
    </TypographyDefaults>
  )
})

export default Main
