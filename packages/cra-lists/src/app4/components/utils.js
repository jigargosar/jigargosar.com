// Foo

/*eslint-disable*/
import React from 'react'
import {observer, Observer} from 'mobx-react'

const R = require('ramda')
const RA = require('ramda-adjunct')

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

export const RC = React.Component
export const F = React.Fragment

export function renderKeyedById(Component, propName, idList) {
  return R.map(value => (
    <Component key={value.id} {...{[propName]: value}} />
  ))(idList)
}

// export const ro = observer

const StateContext = React.createContext(null)

export const StateProvider = StateContext.Provider

export class C extends React.Component {
  render() {
    return this.r(this.props)
  }

  r(props) {
    return props.render ? props.render(this.props) : null
  }
}

export const withS = BaseComponent => {
  const ObserverBaseComponent = observer(BaseComponent)
  return class WithS extends C {
    r({children, ...rest}) {
      return (
        <StateContext.Consumer>
          {state => (
            <ObserverBaseComponent state={state} {...state} {...rest}>
              {children}
            </ObserverBaseComponent>
          )}
        </StateContext.Consumer>
      )
    }
  }
}

export {Observer as O}
export {observer as o}
