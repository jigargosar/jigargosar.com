import React from 'react'
import {CenterLayout, RootContainer, Text} from './ui'
import {cn, F, mrInjectAll, renderKeyed} from './utils'
import {_} from '../utils'
import Button from '@material-ui/core/Button'

const StateProperty = mrInjectAll(function StateProperty({property}) {
  return <div>{`${property[0]}`}</div>
})

const StateObject = mrInjectAll(function StateObject({
  state,
  object,
}) {
  return (
    <F>
      <div>Type: Object</div>
      <div>propCount: {_.compose(_.length, _.keys)(object)}</div>
      {/*<Button size={'small'}>add</Button>*/}
      <Button size={'small'}>add</Button>
      <div>
        {renderKeyed(
          StateProperty,
          'property',
          _.head,
          _.toPairs(object),
        )}
      </div>
    </F>
  )
})

const State = mrInjectAll(function({state}) {
  return <StateObject object={state.root} />
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
