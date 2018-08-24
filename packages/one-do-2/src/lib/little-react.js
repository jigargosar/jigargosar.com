import React, {Component as RC, Fragment as Fr} from 'react'
import {inject, observer} from 'mobx-react'
import isHotKey from 'is-hotkey'
import * as R from 'ramda'
import {
  _compose,
  _cond,
  _tap,
  compose,
  curry,
  prop,
  reduce,
  reduced,
} from './exports-ramda'
import ReactDOM from 'react-dom'
import cn from 'classnames'
import {mapIndexed} from './little-ramda'
import ReactEventListener from 'react-event-listener'
import {setDisplayName} from './recompose'

export {cn}

export const EventListener = ReactEventListener

export {Fr, RC, isHotKey}

export const isAnyHotKey = R.compose(
  R.anyPass,
  R.map(R.curryN(2, isHotKey)),
)

function isKey(...keys) {
  return function(keyEvent) {
    return reduce(
      (acc, key) => (isHotKey(key, keyEvent) ? reduced(true) : acc),
    )(false)(keys)
  }
}

export function whenKey(...keys) {
  return function(fn) {
    return [isKey(...keys), fn]
  }
}

export function whenKeyPD(...keys) {
  return function(fn) {
    return [isKey(...keys), tapPD(fn)]
  }
}

export function whenKeySP(...keys) {
  return function(fn) {
    return [isKey(...keys), tapSP(fn)]
  }
}

export function withKeyEvent(...conditions) {
  return _tap(_cond(conditions))
}

export const tapPD = fn =>
  R.tap(e => {
    e.preventDefault()
    fn(e)
  })

export const tapSP = fn =>
  R.tap(e => {
    e.stopPropagation()
    fn(e)
  })

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
  // validate('FSA', [Component, propName, idList])
  return R.map(value => (
    <Component key={value.id} {...{[propName]: value}} />
  ))(idList)
}

export function renderKeyed(Component, propName, getKey, idList) {
  return R.map(value => (
    <Component key={getKey(value)} {...{[propName]: value}} />
  ))(idList)
}

export function renderIndexed(Component, propName, list) {
  return mapIndexed((model, idx) => (
    <Component key={idx} {...{[propName]: model}} />
  ))(list)
}

export function renderKeyedByProp(Component, propName, keyName, models) {
  return renderKeyed(Component, propName, prop(keyName), models)
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

// const StateContext = React.createContext(null)

// export const StateProvider = StateContext.Provider

// const StateContextConsumer = StateContext.Consumer

// export const WithState = function WithState({children}) {
//   return (
//     <StateContextConsumer>
//       {s => <Observer render={() => children(s)} />}
//     </StateContextConsumer>
//   )
// }
//
// const withStateToProps = _.curry((stateToProps, BC) => {
//   const hoc = ({children, ...rest}) => {
//     const OBC = observer(BC)
//     return (
//       <StateContextConsumer>
//         {states => <OBC {...stateToProps(states, rest)}>{children}</OBC>}
//       </StateContextConsumer>
//     )
//   }
//   if (process.env.NODE_ENV !== 'production') {
//     return setDisplayName(wrapDisplayName(BC, 'inject'))(hoc)
//   }
//   return hoc
// })

// export const withStateMergedIntoProps = withStateToProps(R.merge)

export const mrInjectAll = _compose(
  inject(({appState}, props) => ({
    ...appState,
    ...props,
  })),
  observer,
)

export const findDOMNode = ReactDOM.findDOMNode

export function elFocus(el) {
  // validate('O', [el])
  el.focus()
  return el
}
export const elSetSelectionRange = curry(function elSetSelectionRange(
  {start, end, direction},
  el,
) {
  // validate('O', [el])
  el.setSelectionRange(start, end, direction)
  return el
})

// export const focusRef = tryCatchLog(_.compose(elFocus, findDOMNode))
//
// export const setSelectionRangeRef = options =>
//   tryCatchLog(_.compose(elSetSelectionRange(options), findDOMNode))
//
// export const tryCatchLogFindDOMNode = fn =>
//   tryCatchLog(_.compose(fn, findDOMNode))

export function getSelectionFromEvent(e) {
  return {start: e.target.selectionStart, end: e.target.selectionEnd}
}

export function isSelectionAtStart(selectionRange) {
  return selectionRange.start === 0 && selectionRange.end === 0
}

export function createSelection(start, end = start) {
  return {start, end}
}

export const setFocusAndSelectionOnDOMId = (domId, selection) =>
  requestAnimationFrame(() => {
    const el = document.getElementById(domId)
    debugger
    console.assert(!!el, `Focus: el not found ${domId}`)
    if (el) {
      console.log(`el.focus()`, el.focus())
    }
    if (selection) {
      el.setSelectionRange(selection.start, selection.end)
    }
  })

export function cnWith(...cnArgs) {
  return cls => cn(...cnArgs, cls)
}

export const onClickSP = fn => ({onClick: tapSP(fn)})

export const observerDN = dn => compose(setDisplayName(dn), observer)

export function logPersistEvent(e) {
  e.persist()
  console.debug(e)
}
