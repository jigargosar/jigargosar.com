import {Compute, Controller, Module} from 'cerebral'
import {connect, Container} from '@cerebral/react'
import {props, signal, state, string} from 'cerebral/tags'
import {set, unshift} from 'cerebral/operators'
import {_} from './little-ramda'

export {
  Compute,
  Controller,
  Module,
  connect,
  Container,
  props,
  signal,
  state,
  set,
  string,
  unshift,
}

export function logProps(ctx) {
  console.log(`props`, ctx.props)
}

export function pauseFlowThe(ctx) {
  console.warn(`ctx.props`, ctx.props, 'ctx', _.omit(['props'])(ctx))
  debugger
  throw new Error('Action Discontinued')
}

function getDevTools() {
  if (module.hot) {
    return require('cerebral/devtools').default({
      host: 'localhost:8585',
      reconnect: true,
    })
  }
  return null
}

export function createAppController(rootModule) {
  const controller = Controller(rootModule, {
    devtools: getDevTools(),
  })

  return controller
}
