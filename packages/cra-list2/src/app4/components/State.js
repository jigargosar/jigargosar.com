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

const Value = mrInjectAll(function Value({value}) {
  const lookup = {
    string: ValueString,
    object: ValueObject,
    array: ValueArray,
  }

  const ValueComponent = lookup[value.type]
  return <ValueComponent value={value} />
})

const EntryTypeSelect = mrInjectAll(function EntryTypeSelect({
  entry,
}) {
  return (
    <select value={entry.value.type} onChange={entry.onTypeChange}>
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
})

const ValueString = mrInjectAll(function ValueString({value}) {
  return (
    <input
      value={value.string}
      onChange={value.onValueChange}
      onFocus={e => e.target.setSelectionRange(0, 999)}
    />
  )
})

const ValueObjectEntry = mrInjectAll(function ValueObjectEntry({
  entry,
}) {
  const isCollection = _.contains(entry.value.type, [
    'array',
    'object',
  ])
  return (
    <div>
      <RightActionButton onClick={entry.onRemove}>
        x
      </RightActionButton>
      {isCollection && (
        <Button onClick={entry.toggleCollapsed}>
          {entry.collapsed ? '>' : 'v'}
        </Button>
      )}
      <input
        autoFocus
        value={entry.key}
        onChange={entry.onKeyChange}
      />
      {!isCollection ||
        (!entry.collapsed && (
          <F>
            =
            <EntryTypeSelect entry={entry} />
            <Value value={entry.value} />
          </F>
        ))}
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

const ValueArrayEntry = mrInjectAll(function ValueArrayEntry({
  entry,
}) {
  const isCollection = _.contains(entry.value.type, [
    'array',
    'object',
  ])
  console.log(`entry.collapsed`, entry.collapsed)
  return (
    <div>
      <RightActionButton onClick={entry.onRemove}>
        x
      </RightActionButton>
      {isCollection && (
        <Button onClick={entry.toggleCollapsed}>
          {entry.collapsed ? '>' : 'v'}
        </Button>
      )}
      <EntryTypeSelect entry={entry} />
      {!isCollection ||
        (!entry.collapsed && (
          <F>
            <Value value={entry.value} />
          </F>
        ))}
    </div>
  )
})

const ValueArray = mrInjectAll(function ValueArray({state, value}) {
  return (
    <F>
      <RightActionButton onClick={e => value.add()}>
        +
      </RightActionButton>
      <div className={cn('pl3')}>
        {renderKeyedById(ValueArrayEntry, 'entry', value.entries)}
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
