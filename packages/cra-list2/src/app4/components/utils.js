import React, {Component as RC, Fragment as F} from 'react'
import {inject, observer, Observer} from 'mobx-react'
import isHotKey from 'is-hotkey'
import {_, R, RX, tryCatchLog, validate} from '../little-ramda'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import {setDisplayName, wrapDisplayName} from './recompose-utils'

export {F, RC, observer, Observer, inject, isHotKey}
export const cn = RX.cx

export {PropTypes}

export const isAnyHotKey = R.compose(
  R.anyPass,
  R.map(R.curryN(2, isHotKey)),
)

export function isKey(...keys) {
  return function(keyEvent) {
    return _.reduce(
      (acc, key) => (isHotKey(key, keyEvent) ? _.reduced(true) : acc),
    )(false)(keys)
  }
}

export function whenKey(...keys) {
  return function(fn) {
    return [isKey(...keys), fn]
  }
}

export function withKeyEvent(...conditions) {
  return function(keyEvent) {
    return _.cond(conditions)(keyEvent)
  }
}

export const wrapPD = fn => e => {
  e.preventDefault()
  fn(e)
}

// export function wrapPD(fn) {
//   return function wrapPD(e) {
//     e.preventDefault()
//     return fn(e)
//   }
// }

/**
 * @return {null}
 */
export function Debugger() {
  if (process.env.NODE_ENV !== 'production') {
    debugger
  }
  return null
}

export function renderKeyedById(Component, propName, idList) {
  validate('FSA', [Component, propName, idList])
  return R.map(value => (
    <Component key={value.id} {...{[propName]: value}} />
  ))(idList)
}

export function renderKeyed(Component, propName, getKey, idList) {
  return R.map(value => (
    <Component key={getKey(value)} {...{[propName]: value}} />
  ))(idList)
}

export class C extends RC {
  render() {
    return this.r(this.props)
  }

  r(props) {
    return props.render ? props.render(this.props) : null
  }
}

export const OC = observer(C)

const StateContext = React.createContext(null)

export const StateProvider = StateContext.Provider

const StateContextConsumer = StateContext.Consumer

export const WithState = function WithState({children}) {
  return (
    <StateContextConsumer>
      {s => <Observer render={() => children(s)} />}
    </StateContextConsumer>
  )
}

const withStateToProps = _.curry((stateToProps, BC) => {
  const hoc = ({children, ...rest}) => {
    const OBC = observer(BC)
    return (
      <StateContextConsumer>
        {states => (
          <OBC {...stateToProps(states, rest)}>{children}</OBC>
        )}
      </StateContextConsumer>
    )
  }
  if (process.env.NODE_ENV !== 'production') {
    return setDisplayName(wrapDisplayName(BC, 'inject'))(hoc)
  }
  return hoc
})

export const withStateMergedIntoProps = withStateToProps(R.merge)

export const mrInjectAll = _.compose(
  inject(({appState}, props) => ({
    ...appState,
    ...props,
  })),
  observer,
)

export const findDOMNode = ReactDOM.findDOMNode

export function elFocus(el) {
  validate('O', [el])
  el.focus()
  return el
}
export const elSetSelectionRange = _.curry(
  function elSetSelectionRange({start, end, direction}, el) {
    validate('O', [el])
    el.setSelectionRange(start, end, direction)
    return el
  },
)

export const focusRef = tryCatchLog(_.compose(elFocus, findDOMNode))

export const setSelectionRangeRef = options =>
  tryCatchLog(_.compose(elSetSelectionRange(options), findDOMNode))

export const tryCatchLogFindDOMNode = fn =>
  tryCatchLog(_.compose(fn, findDOMNode))

export function getSelectionFromEvent(e) {
  return {start: e.target.selectionStart, end: e.target.selectionEnd}
}

export function isSelectionAtStart(selectionRange) {
  return selectionRange.start === 0 && selectionRange.end === 0
}

export function createSelection(start, end = start) {
  return {start, end}
}

export function setFocusAndSelectionOnDOMId(domId, selection) {
  requestAnimationFrame(() => {
    const el = document.getElementById(domId)
    el.focus()
    if (selection) {
      el.setSelectionRange(selection.start, selection.end)
    }
  })
}

export function cnWith(...cnArgs) {
  return cls => cn(...cnArgs, cls)
}
