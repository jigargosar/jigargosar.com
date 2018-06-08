import React from 'react'
import './index.css'

const StateContext = React.createContext(null)
export const StateProvider = StateContext.Provider

export function withState(Component) {
  return function ComponentWithState(props) {
    return (
      <StateContext.Consumer>
        {state => <Component s={state} {...props} />}
      </StateContext.Consumer>
    )
  }
}
