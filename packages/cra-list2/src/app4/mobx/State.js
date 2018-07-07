import {
  createObservableObject,
  extendObservableObject,
  mJS,
  mReaction,
} from './utils'
import {StorageItem} from '../services/storage'
import {nanoid} from '../model/util'
import {_, validate} from '../utils'

function ValueType({value = null, parent} = {}) {
  validate('O', [parent])
  const valueTypeFactoryLookup = {
    string: ValueString,
    object: ValueObject,
    array: ValueArray,
  }

  const obs = createObservableObject({
    props: {
      value,
      parent,
    },
    actions: {
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
    name: 'ValueType',
  })
  obs.setDefaults()
  return obs
}

function ValueObjectEntry({
  id = nanoid(),
  key = 'keyName',
  value = null,
  parent,
  collapsed = false,
} = {}) {
  validate('O', [parent])

  const obs = extendObservableObject(ValueType({value, parent}), {
    props: {
      id,
      key,
      collapsed,
      get snapshot() {
        return {
          ..._.pick(['id', 'key', 'collapsed'], this),
          value: this.value.snapshot,
        }
      },
    },
    actions: {
      onKeyChange(e) {
        this.key = e.target.value
      },
      toggleCollapsed() {
        this.collapsed = !this.collapsed
      },
    },
    name: 'ValueObjectEntry',
  })
  return obs
}

function ValueObject({entries = [], parent} = {}) {
  const obs = createObservableObject({
    props: {
      entries: [],
      get type() {
        return 'object'
      },
      get parent() {
        return parent
      },
      get snapshot() {
        return {
          type: this.type,
          entries: this.entries.map(p => p.snapshot),
        }
      },
    },
    actions: {
      add() {
        this.entries.unshift(ValueObjectEntry({parent: this}))
      },
      removeChild(child) {
        this.entries.splice(this.entries.indexOf(child), 1)
      },
      setDefaults() {
        this.entries = entries.map(entry =>
          ValueObjectEntry({...entry, parent: this}),
        )
      },
    },
    name: 'ValueObject',
  })
  obs.setDefaults()
  return obs
}

function ValueArrayEntry({
  id = nanoid(),
  value = null,
  collapsed = false,
  parent,
} = {}) {
  validate('O', [parent])

  const obs = extendObservableObject(ValueType({value, parent}), {
    props: {
      id,
      collapsed,
      get snapshot() {
        return {
          ..._.pick(['id', 'collapsed'], this),
          value: this.value.snapshot,
        }
      },
    },
    actions: {
      toggleCollapsed() {
        this.collapsed = !this.collapsed
      },
    },
    name: 'ValueObjectEntry',
  })
  return obs
}

function ValueArray({entries = [], parent} = {}) {
  const obs = createObservableObject({
    props: {
      entries: [],
      get type() {
        return 'array'
      },
      get parent() {
        return parent
      },
      get snapshot() {
        return {
          type: this.type,
          entries: this.entries.map(p => p.snapshot),
        }
      },
    },
    actions: {
      add() {
        this.entries.unshift(ValueArrayEntry({parent: this}))
      },
      removeChild(child) {
        this.entries.splice(this.entries.indexOf(child), 1)
      },
      setDefaults() {
        this.entries = entries.map(entry =>
          ValueArrayEntry({...entry, parent: this}),
        )
      },
    },
    name: 'ValueObject',
  })
  obs.setDefaults()
  return obs
}

function ValueString({string = 'string', parent} = {}) {
  validate('O', [parent])
  const obs = createObservableObject({
    props: {
      string,
      get type() {
        return 'string'
      },
      get parent() {
        return parent
      },
      get snapshot() {
        return _.pick(['type', 'string'], this)
      },
    },
    actions: {
      onValueChange(e) {
        this.string = e.target.value
      },
    },
    name: 'ValueString',
  })
  return obs
}

const stateSI = StorageItem({
  name: 'state',
  getInitial() {
    return ValueObject({})
  },
  postLoad(state) {
    return ValueObject(state)
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
