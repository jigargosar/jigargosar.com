import React, {Component as RC, Fragment as F} from 'react'
import {inject, observer, Observer} from 'mobx-react'
import isHotKey from 'is-hotkey'
import {_, R, RX, tryCatchLog, validate} from '../little-ramda'
import {setDisplayName, wrapDisplayName} from 'recompose'

import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'

export {F, RC, observer, Observer, isHotKey}
export const cn = RX.cx

export {PropTypes}

export const isAnyHotKey = R.compose(
  R.anyPass,
  R.map(R.curryN(2, isHotKey)),
)
export const wrapPD = fn => e => {
  e.preventDefault()
  fn(e)
}

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
}

export const focusRef = tryCatchLog(_.compose(elFocus, findDOMNode))
