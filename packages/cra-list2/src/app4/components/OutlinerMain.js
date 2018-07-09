import React from 'react'
import {CenterLayout, RootContainer} from './ui'
import {mrInjectAll} from './little-mobx'
import OutlinePage from './Outliner/Page'

const Main = mrInjectAll(function App({pop}) {
  return (
    <RootContainer>
      <CenterLayout>
        <OutlinePage />
      </CenterLayout>
    </RootContainer>
  )
})

export default Main
