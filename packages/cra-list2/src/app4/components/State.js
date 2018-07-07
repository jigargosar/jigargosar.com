import React from 'react'
import {CenterLayout, RootContainer, Text} from './ui'
import {
  cn,
  F,
  mrInjectAll,
  renderKeyed,
  renderKeyedById,
} from './utils'
import {_} from '../utils'

const StateProperty = mrInjectAll(function StateProperty({property}) {
  return <div>{`${property[0]}`}</div>
})

const StateObject = mrInjectAll(function StateObject({object}) {
  return (
    <div>
      {renderKeyed(
        StateProperty,
        'property',
        _.head,
        _.toPairs(object),
      )}
    </div>
  )
})

const State = mrInjectAll(function({state}) {
  return <StateObject object={state} />
})

const Main = mrInjectAll(function App() {
  return (
    <RootContainer>
      <CenterLayout>
        <F>
          <div className={cn('pa3 bg-blue white shadow-1')}>
            <Text>{`State`}</Text>
          </div>
          <div className={cn('pa3')}>
            <State />
          </div>
        </F>
      </CenterLayout>
    </RootContainer>
  )
})

export default Main
