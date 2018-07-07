import {createObservableObject, mJS, mReaction} from './utils'
import {StorageItem} from '../services/storage'

const stateSI = StorageItem({
  name: 'state',
  getInitial() {
    return {}
  },
  postLoad(state) {
    return state
  },
})

export function State() {
  const out = createObservableObject({
    props: {
      root: stateSI.load(),
    },
    actions: {},
    name: 'State',
  })

  mReaction(() => mJS(out.root), () => stateSI.save(out.root), {
    name: 'save state-root',
  })

  return out
}
