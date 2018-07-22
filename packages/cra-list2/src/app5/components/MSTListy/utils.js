import {inject, observer} from 'mobx-react'
import * as R from 'ramda'

export function injectStores(fn) {
  return inject(({stores}, props) => fn(stores, props))
}

function injectNamed(...names) {
  return injectStores((stores, props) => ({
    ...R.pick(names)(stores),
    ...props,
  }))
}

export const oInject = fn => R.compose(injectStores(fn), observer)
export const oInjectNamed = (...names) => c =>
  R.compose(injectNamed(...names), observer)(c)
