const m = require('mobx')
export function PouchSeq(initialValue = 0) {
  return m.observable({
    seq: initialValue,
  })
}
