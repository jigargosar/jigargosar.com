import React from 'react'
import './index.css'
import {observer} from 'mobx-react'

const R = require('ramda')

const StateContext = React.createContext(null)
export const StateProvider = StateContext.Provider

export const injectState = c => {
  return R.compose(
    BaseComponent =>
      function StateInjector(props) {
        return (
          <StateContext.Consumer>
            {state => <BaseComponent s={state} {...props} />}
          </StateContext.Consumer>
        )
      },
    observer,
  )(c)
}

export const C = observer(
  class C extends React.Component {
    render() {
      return (
        <StateContext.Consumer>
          {state => this.r({s: state, ...this.props})}
        </StateContext.Consumer>
      )
    }

    r(props) {
      return props.render ? props.render(this.props) : null
    }
  },
)
