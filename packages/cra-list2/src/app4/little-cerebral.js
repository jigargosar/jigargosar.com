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
