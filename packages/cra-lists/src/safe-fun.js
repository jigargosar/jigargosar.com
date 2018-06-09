import * as R from 'ramda'
import assert from 'assert'

const prop = R.curry(function prop(propName, obj) {
  assert(R.hasIn(propName, obj))
  return R.prop(propName, obj)
})

const SF = {prop}
export {SF}
