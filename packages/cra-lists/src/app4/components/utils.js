import React, {Component as RC, Fragment as F} from 'react'
import {observer, Observer} from 'mobx-react'
import isHotKey from 'is-hotkey'
import {R, RX} from '../utils'

export {F, RC, observer, Observer, isHotKey}
export const cn = RX.cx
export const isAnyHotKey = R.compose(
  R.anyPass,
  R.map(R.curryN(2, isHotKey)),
)
export function renderKeyedById(Component, propName, idList) {
  return R.map(value => (
    <Component key={value.id} {...{[propName]: value}} />
  ))(idList)
}

const StateContext = React.createContext(null)

export const StateProvider = StateContext.Provider

export class C extends RC {
  render() {
    return this.r(this.props)
  }

  r(props) {
    return props.render ? props.render(this.props) : null
  }
}

export const OC = observer(C)

const StateContextConsumer = observer(StateContext.Consumer)

export const WithState = function WithState({children}) {
  return (
    <StateContextConsumer>
      {s => <Observer>{() => children(s)}</Observer>}
    </StateContextConsumer>
  )
}

export const injectMappedState = stateToProps => BC => ({
  children,
  ...rest
}) => (
  <WithState>
    {states => <BC {...stateToProps(states, rest)}>{children}</BC>}
  </WithState>
)

export const injectAllStates = injectMappedState(R.merge)
