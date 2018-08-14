import {pick} from './ramda'
import {storage} from './storage'

export const bindToggle = pn => self => () => (self[pn] = !self[pn])
export const syncLS = key => pns => comp => {
  const propName = key
  Object.assign(comp, pick(pns)(storage.get(propName) || {}))
  return comp.props.autorun(() => {
    storage.set(propName, pick(pns)(comp))
  })
}
