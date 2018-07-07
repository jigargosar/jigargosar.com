import React from 'react'
import {Button, CenterLayout, RootContainer, Text} from './ui'
import {cn, F, mrInjectAll, renderKeyedById} from './utils'
import {withStyles} from '@material-ui/core/styles'
import {_} from '../utils'
import * as Recompose from 'recompose'

const RightAction = _.compose(
  Recompose.defaultProps({
    className: cn('fr'),
  }),
)(Button)

const componentLookup = {
  string: StringValue,
  object: ObjectCollection,
}

const StateValue = mrInjectAll(function StateValue({value}) {
  const ValueComponent = componentLookup[value.type]
  return <ValueComponent value={value} />
})

const StateValueTypeSelect = mrInjectAll(
  function StateValueTypeSelect({value}) {
    return (
      <select value={value.type} onChange={value.onTypeChange}>
        {_.map(
          type => (
            <option key={type} value={type}>
              {type}
            </option>
          ),
          ['object', 'string', 'array'],
        )}
      </select>
    )
  },
)

const StringValue = mrInjectAll(function ObjectItemStringValue({
  value,
}) {
  return (
    <input
      // className={cn('lh-copy ma1')}
      value={value.value}
      onChange={value.onValueChange}
      onFocus={e => e.target.setSelectionRange(0, 999)}
    />
  )
})

const ObjectKey = mrInjectAll(function ObjectKey({entry}) {
  return (
    <input autoFocus value={entry.key} onChange={entry.onKeyChange} />
  )
})

const ObjectCollectionEntry = mrInjectAll(
  function ObjectCollectionEntry({entry}) {
    return (
      <div>
        <RightAction onClick={entry.onRemove}>x</RightAction>
        <ObjectKey entry={entry} />
        =
        <StateValueTypeSelect value={entry.value} />
        {/*<StateValue value={entry.value} />*/}
      </div>
    )
  },
)

const ObjectCollection = mrInjectAll(function StateObject({
  state,
  stateObject,
  property,
}) {
  const obj = stateObject || property.value
  return (
    <F>
      <RightAction onClick={e => obj.add()}>+</RightAction>
      <div className={cn('pl3')}>
        {renderKeyedById(ObjectCollectionEntry, 'entry', obj.props)}
      </div>
    </F>
  )
})

const State = mrInjectAll(function({state}) {
  return (
    <F>
      <Button onClick={e => state.root.add()}>Add field</Button>
      <div>
        {renderKeyedById(
          ObjectCollectionEntry,
          'entry',
          state.root.props,
        )}
      </div>
    </F>
  )
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
