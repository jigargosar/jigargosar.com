import {createObservableObject, mJS, mReaction} from './utils'
import {StorageItem} from '../services/storage'
import {nanoid} from '../model/util'
import {_, validate} from '../utils'

function StateObjectProperty({
  id = nanoid(),
  key = 'keyName',
  value = null,
  parent,
} = {}) {
  validate('O', [parent])
  const valueTypeFactoryLookup = {
    string: StateString,
    object: StateObject,
  }

  const property = createObservableObject({
    props: {
      id,
      key,
      value,
      parent,
      get snapshot() {
        return {
          ..._.pick(['id', 'key'], this),
          value: this.value.snapshot,
        }
      },
    },
    actions: {
      onKeyChange(e) {
        this.key = e.target.value
      },
      onRemove() {
        this.parent.removeChild(this)
      },
      onTypeChange(e) {
        const type = e.target.value
        if (this.value.type !== type) {
          this.value = valueTypeFactoryLookup[type]({parent})
        }
      },
      setDefaults() {
        const type = _.propOr('string', 'type', value)
        this.value = valueTypeFactoryLookup[type]({
          ...value,
          parent: this,
        })
      },
    },
    name: 'StateObjectProperty',
  })
  property.setDefaults()
  return property
}

function StateObject({props = [], parent} = {}) {
  const stateObject = createObservableObject({
    props: {
      props: [],
      get type() {
        return 'object'
      },
      get propCount() {
        return this.props.length
      },
      get parent() {
        return parent
      },
      get snapshot() {
        return {
          type: this.type,
          props: this.props.map(p => p.snapshot),
        }
      },
    },
    actions: {
      add() {
        this.props.unshift(StateObjectProperty({parent: this}))
      },
      removeChild(child) {
        this.props.splice(this.props.indexOf(child), 1)
      },
      setDefaults() {
        this.props = props.map(p =>
          StateObjectProperty({...p, parent: this}),
        )
      },
    },
    name: 'StateObject',
  })
  stateObject.setDefaults()
  return stateObject
}

function StateString({value = 'string value'} = {}) {
  const stateObject = createObservableObject({
    props: {
      value,
      get type() {
        return 'string'
      },
      get snapshot() {
        return _.pick(['type', 'value'], this)
      },
    },
    actions: {
      onValueChange(e) {
        this.value = e.target.value
      },
    },
    name: 'StateObject',
  })
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
