// Foo

/*eslint-disable*/
import React, {Component as RC, Fragment as F} from 'react'
import {observer, Observer} from 'mobx-react'

const R = require('ramda')
const RA = require('ramda-adjunct')

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

const o = observer
const O = Observer
export {o, O, F, RC, observer, Observer}

export function renderKeyedById(Component, propName, idList) {
  return R.map(value => (
    <Component key={value.id} {...{[propName]: value}} />
  ))(idList)
}

// export const ro = observer

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

export const injectState = (...statePropsNames) => BC => {
  const OBC = o(BC)
  return function injectState({children, ...rest}) {
    return (
      <StateContext.Consumer>
        {state => (
          <OBC {...R.pick(statePropsNames, state)} {...rest}>
            {children}
          </OBC>
        )}
      </StateContext.Consumer>
    )
  }
}

export const i = injectState
