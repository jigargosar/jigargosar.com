import {_} from '../../little-ramda'
import {inject, observer} from 'mobx-react'
import * as R from 'ramda'

export function injectStores(fn) {
  return inject(({stores}, props) => {
    return fn(stores, props)
  })
}

function injectNamed(...names) {
  return injectStores((stores, props) => {
    debugger

    return {
      ...R.pick(names)(stores),
      ...props,
    }
  })
}

export const oInject = fn => _.compose(injectStores(fn), observer)
export const oInjectNamed = (...names) => c =>
  _.compose(injectNamed(...names), observer)(c)
