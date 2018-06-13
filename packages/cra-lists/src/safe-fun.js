import * as R from 'ramda'
import assert from 'assert'

import * as RA from 'ramda-adjunct'

const prop = R.curry(function prop(propName, obj) {
  assert(R.hasIn(propName, obj))
  return R.prop(propName, obj)
})

const omit = R.curry(function omit(props, obj) {
  assert(RA.isArray(props))
  return R.omit(props, obj)
})

const pick = R.curry(function pick(props, obj) {
  assert(RA.isArray(props))
  return R.pick(props, obj)
})

const SF = {prop, omit, pick}
export {SF}
