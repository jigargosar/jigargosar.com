import {createObservableObject, mJS, mReaction} from './utils'
import {StorageItem} from '../services/storage'
import {nanoid} from '../model/util'
import {_, validate} from '../utils'

function StateObjectProperty({
  id = nanoid(),
  key = 'keyName',
  value = 'string value',
  parent,
} = {}) {
  validate('O', [parent])
  return createObservableObject({
    props: {
      id,
      key,
      value,
      parent,
      get snapshot() {
        return _.pick(['id', 'key', 'value'], this)
      },
    },
    actions: {
      onKeyChange(e) {
        this.key = e.target.value
      },
      onValueChange(e) {
        this.value = e.target.value
      },

      onRemove() {
        this.parent.removeChild(this)
      },
    },
    name: 'StateObjectProperty',
  })
}

function StateObject({props = []} = {}) {
  const stateObject = createObservableObject({
    props: {
      props: [],
      get propCount() {
        return this.props.length
      },
      get snapshot() {
        return {props: this.props.map(p => p.snapshot)}
      },
    },
    actions: {
      add() {
        this.props.unshift(StateObjectProperty({parent: this}))
      },
      removeChild(child) {
        this.props.splice(this.props.indexOf(child), 1)
      },
      setPropsFromSnapshot(props) {
        this.props = props.map(p =>
          StateObjectProperty({...p, parent: this}),
        )
      },
    },
    name: 'StateObject',
  })
  stateObject.setPropsFromSnapshot(props)
  return stateObject
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

  mReaction(
    () => mJS(out.root),
    () => stateSI.save(out.root.snapshot),
    {
      name: 'save state-root',
    },
  )

  return out
}
