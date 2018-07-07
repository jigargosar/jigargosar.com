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

// import Typography from '@material-ui/core/Typography'

const StatePropertyStringValue = mrInjectAll(
  function StatePropertyStringValue({property}) {
    return (
      <input
        // className={cn('lh-copy ma1')}
        value={property.value.value}
        onChange={property.value.onValueChange}
        onFocus={e => e.target.setSelectionRange(0, 999)}
      />
    )
  },
)

const StatePropertyValue = mrInjectAll(function StatePropertyValue({
  property,
}) {
  const componentLookup = {
    string: StatePropertyStringValue,
    object: StateObject,
  }
  const ValueComponent = componentLookup[property.value.type]
  return <ValueComponent property={property} />
})

const StatePropertyKey = mrInjectAll(function StatePropertyKey({
  property,
}) {
  return (
    <input
      // className={cn('lh-copy ma1')}
      autoFocus
      value={property.key}
      onChange={property.onKeyChange}
    />
  )
})

const StatePropertyTypeSelect = mrInjectAll(
  function StatePropertyTypeSelect({property}) {
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
          ['object', 'string'],
        )}
      </select>
    )
  },
)

const StateProperty = mrInjectAll(function StateProperty({property}) {
  return (
    <div>
      <RightAction onClick={property.onRemove}>x</RightAction>
      <StatePropertyKey property={property} />
      =
      <StatePropertyTypeSelect property={property} />
      <StatePropertyValue property={property} />
    </div>
  )
})

const StateObject = withStyles(theme => ({
  sizeSmall: {
    padding: '0px 0px',
    minWidth: 0,
    minHeight: 0,
    fontSize: theme.typography.pxToRem(13),
  },
}))(
  mrInjectAll(function StateObject({
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
          {renderKeyedById(StateProperty, 'property', obj.props)}
        </div>
      </F>
    )
  }),
)

const State = mrInjectAll(function({state}) {
  return (
    <F>
      <Button onClick={e => state.root.add()}>Add field</Button>
      <div>
        {renderKeyedById(StateProperty, 'property', state.root.props)}
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
