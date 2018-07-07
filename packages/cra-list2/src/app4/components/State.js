import React from 'react'
import {CenterLayout, RootContainer} from './ui'
import {mrInjectAll} from './utils'

const Main = mrInjectAll(function App({}) {
  return (
    <RootContainer>
      <CenterLayout>
        <OutlinePage />
      </CenterLayout>
    </RootContainer>
  )
})

export default Main
