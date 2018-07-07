import React from 'react'
import {CenterLayout, RootContainer, Text} from './ui'
import {cn, F, mrInjectAll} from './utils'
import OutlinePage from './Outliner/Page'

const Main = mrInjectAll(function App({state}) {
  return (
    <RootContainer>
      <CenterLayout>
        <F>
          <div className={cn('pa3 bg-blue white shadow-1')}>
            <Text>{`State`}</Text>
          </div>
          <div className={cn('pa3')}>{state}</div>
        </F>
      </CenterLayout>
    </RootContainer>
  )
})

export default Main
