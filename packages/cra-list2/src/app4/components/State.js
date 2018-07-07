import React from 'react'
import {Button, CenterLayout, RootContainer, Text} from './ui'
import {cn, F, mrInjectAll, renderKeyedById} from './utils'
import {_} from '../utils'
import * as Recompose from 'recompose'

const RightActionButton = _.compose(
  Recompose.defaultProps({
    className: cn('fr'),
  }),
)(Button)

const StateValue = mrInjectAll(function StateValue({value}) {
  const ValueComponent = getComponentForType(value.type)
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

const ValueString = mrInjectAll(function ValueString({value}) {
  return (
    <input
      value={value.value}
      onChange={value.onValueChange}
      onFocus={e => e.target.setSelectionRange(0, 999)}
    />
  )
})

const ValueObjectEntry = mrInjectAll(function ValueObjectEntry({
  entry,
}) {
  return (
    <div>
      <RightActionButton onClick={entry.onRemove}>
        x
      </RightActionButton>
      <input
        autoFocus
        value={entry.key}
        onChange={entry.onKeyChange}
      />
      =
      <StateValueTypeSelect value={entry.value} />
      <StateValue value={entry.value} />
    </div>
  )
})

const ValueObject = mrInjectAll(function ValueObject({state, value}) {
  return (
    <F>
      <RightActionButton onClick={e => value.add()}>
        +
      </RightActionButton>
      <div className={cn('pl3')}>
        {renderKeyedById(ValueObjectEntry, 'entry', value.entries)}
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
          ValueObjectEntry,
          'entry',
          state.root.entries,
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

function getComponentForType(type) {
  const lookup = {
    string: ValueString,
    object: ValueObject,
  }
  return lookup[type]
}
