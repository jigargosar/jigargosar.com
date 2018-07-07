import {createObservableObject, mJS, mReaction} from './utils'
import {StorageItem} from '../services/storage'

function StateObject({props = {}}) {
  return createObservableObject({
    props: {
      props,
    },
    actions: {
      add() {
        this.props['key'] = 'value'
      },
    },
    name: 'StateObject',
  })
}

const stateSI = StorageItem({
  name: 'state',
  getInitial() {
    return StateObject({})
  },
  postLoad(state) {
    return StateObject(state)
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
