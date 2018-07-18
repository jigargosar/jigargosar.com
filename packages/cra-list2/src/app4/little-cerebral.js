import {Compute, Controller, Module} from 'cerebral'
import {connect, Container} from '@cerebral/react'
import {props, signal, state, string} from 'cerebral/tags'
import {push, set, unshift} from 'cerebral/operators'
import {_, mergeWithDefaults} from './little-ramda'
import S from 'sanctuary'

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
  push,
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

export function createAppController(rootModule, options = {}) {
  const controller = Controller(
    rootModule,
    mergeWithDefaults({
      devtools: getDevTools(),
    })(options),
  )

  return controller
}

export function computeToMaybe(operator) {
  return Compute(operator, x => S.toMaybe(x))
}

export function resolveValue(computed, ctx) {
  return ctx.resolve.value(computed)
}
