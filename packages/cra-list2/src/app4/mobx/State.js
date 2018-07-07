import {createObservableObject, mJS, mReaction} from './utils'
import {StorageItem} from '../services/storage'
import {nanoid} from '../model/util'
import {_, validate} from '../utils'

function ValueType({value = null, parent} = {}) {
  validate('O', [parent])
  const valueTypeFactoryLookup = {
    string: ValueString,
    object: ValueObject,
  }

  const obs = createObservableObject({
    props: {
      value,
      parent,
      get snapshot() {
        return {
          value: this.value.snapshot,
        }
      },
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
} = {}) {
  validate('O', [parent])
  const valueTypeFactoryLookup = {
    string: ValueString,
    object: ValueObject,
  }

  const obs = createObservableObject({
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
    name: 'ValueObjectEntry',
  })
  obs.setDefaults()
  return obs
}

function ValueObject({entries = [], parent} = {}) {
  const obs = createObservableObject({
    props: {
      entries: [],
      get type() {
        return 'object'
      },
      get propCount() {
        return this.entries.length
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

function ValueString({value = 'string value'} = {}) {
  const obs = createObservableObject({
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
