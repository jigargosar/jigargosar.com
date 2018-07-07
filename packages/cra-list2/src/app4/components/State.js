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
  array: ArrayCollection,
}

const StateValue = mrInjectAll(function StateValue({property}) {
  const ValueComponent = componentLookup[property.value.type]
  return <ValueComponent property={property} />
})

const StateValueTypeSelect = mrInjectAll(
  function StateValueTypeSelect({property}) {
    return (
      <select
        value={property.value.type}
        onChange={property.onTypeChange}
      >
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
  property,
}) {
  return (
    <input
      // className={cn('lh-copy ma1')}
      value={property.value.value}
      onChange={property.value.onValueChange}
      onFocus={e => e.target.setSelectionRange(0, 999)}
    />
  )
})

const ObjectKey = mrInjectAll(function ObjectKey({property}) {
  return (
    <input
      // className={cn('lh-copy ma1')}
      autoFocus
      value={property.key}
      onChange={property.onKeyChange}
    />
  )
})

const ObjectCollectionEntry = mrInjectAll(
  function ObjectCollectionEntry({property}) {
    return (
      <div>
        <RightAction onClick={property.onRemove}>x</RightAction>
        <ObjectKey property={property} />
        =
        <StateValueTypeSelect property={property} />
        <StateValue property={property} />
      </div>
    )
  },
)

const ObjectCollection = mrInjectAll(function StateObject({
  state,
  stateObject,
  property,
  classes: c,
}) {
  const obj = stateObject || property.value
  return (
    <F>
      <RightAction onClick={e => obj.add()}>+</RightAction>
      <div className={cn('pl3')}>
        {renderKeyedById(
          ObjectCollectionEntry,
          'property',
          obj.props,
        )}
      </div>
    </F>
  )
})

const ArrayCollectionEntry = mrInjectAll(
  function ArrayCollectionEntry({state, property, classes: c}) {
    return (
      <F>
        <RightAction onClick={e => property.value.add()}>
          +
        </RightAction>
        <div className={cn('pl3')}>
          {renderKeyedById(
            ObjectCollectionEntry,
            'property',
            property.value.props,
          )}
        </div>
      </F>
    )
  },
)

const ArrayCollection = mrInjectAll(function ArrayCollection({
  state,
  property,
  classes: c,
}) {
  return (
    <F>
      <RightAction onClick={e => property.value.add()}>+</RightAction>
      <div className={cn('pl3')}>
        {renderKeyedById(
          ObjectCollectionEntry,
          'property',
          property.value.props,
        )}
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
          'property',
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
