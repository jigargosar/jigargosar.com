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

export const withState = c => {
  return R.compose(
    BaseComponent =>
      function StateInjector(props) {
        return (
          <StateContext.Consumer>
            {state => (
              <BaseComponent
                {...{
                  s: state,
                  fire: state.fire,
                  auth: state.fire.auth,
                }}
                {...props}
              />
            )}
          </StateContext.Consumer>
        )
      },
    observer,
  )(c)
}

export const M = observer(
  class M extends React.Component {
    render() {
      return (
        <StateContext.Consumer>
          {state => (
            <Observer>
              {() =>
                this.r({
                  s: state,
                  fire: state.fire,
                  auth: state.fire.auth,
                  ns: state.ns,
                  ...this.props,
                })
              }
            </Observer>
          )}
        </StateContext.Consumer>
      )
    }

    r(props) {
      return props.render ? props.render(this.props) : null
    }
  },
)

export class C extends React.Component {
  render() {
    return this.r(this.props)
  }

  r(props) {
    return props.render ? props.render(this.props) : null
  }
}

export {Observer as O}
export {observer as o}
