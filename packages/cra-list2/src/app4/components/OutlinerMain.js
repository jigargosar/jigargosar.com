import React from 'react'
import {CenterLayout, RootContainer} from './ui'
import {mrInjectAll} from './utils'

const Main = mrInjectAll(function App({pop}) {
  return (
    <RootContainer>
      <CenterLayout>
        <div>Outliner</div>
      </CenterLayout>
    </RootContainer>
  )
})

export default Main
