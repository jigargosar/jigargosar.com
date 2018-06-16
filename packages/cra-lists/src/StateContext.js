import React from 'react'
import './index.css'
import {observer} from 'mobx-react/index'

const R = require('ramda')

const StateContext = React.createContext(null)
export const StateProvider = StateContext.Provider

const StateConsumer = StateContext.Consumer

export const injectState = R.compose(
  BaseComponent =>
    function StateInjector(props) {
      return (
        <StateConsumer>
          {state => <BaseComponent s={state} {...props} />}
        </StateConsumer>
      )
    },
  observer,
)
