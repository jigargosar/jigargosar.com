import React from 'react'
import './index.css'
import {observer} from 'mobx-react/index'

const R = require('ramda')

const StateContext = React.createContext(null)
export const StateProvider = StateContext.Provider

export const injectState = R.compose(
  BaseComponent =>
    function StateInjector(props) {
      return (
        <StateContext.Consumer>
          {state => <BaseComponent s={state} {...props} />}
        </StateContext.Consumer>
      )
    },
  observer,
)
