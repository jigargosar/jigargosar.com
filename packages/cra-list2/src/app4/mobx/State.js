import {createObservableObject, mJS, mReaction} from './utils'
import {StorageItem} from '../services/storage'
import {nanoid} from '../model/util'

function StateObjectProperty({
  id = nanoid(),
  key = 'keyName',
  value = 'string value',
} = {}) {
  return createObservableObject({
    props: {
      id,
      key,
      value,
    },
    actions: {
      onKeyChange(e) {
        this.key = e.target.value
      },
      onValueChange(e) {
        this.value = e.target.value
      },
    },
    name: 'StateObjectProperty',
  })
}

function StateObject({props = []} = {}) {
  return createObservableObject({
    props: {
      props: props.map(StateObjectProperty),
      get propCount() {
        return this.props.length
      },
    },
    actions: {
      add() {
        this.props.unshift(StateObjectProperty())
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
