import {createObservableObject, mReaction} from './utils'
import {nanoid} from '../model/util'
import {StorageItem} from '../services/storage'
import {_, validate} from '../utils'

function Outline({id = nanoid(), text = 'line x', lines = []} = {}) {
  const userProps = ['text']
  const pickUserProps = _.pick(userProps)
  const line = createObservableObject({
    props: {
      id,
      text,
      lines: lines.map(Outline),
      findById(id) {
        if (_.equals(id, this.id)) {
          return this
        } else {
          return _.reduce(
            (acc, line) =>
              _.isNil(acc) ? line.findById(id) : _.reduced(acc),
            null,
            lines,
          )
        }
      },
      findChildById(id) {
        return _.find(_.propEq('id', id), lines)
      },
      findParentOfId(id) {
        if (_.isNil(this.findChildById(id))) {
          _.reduce(
            (acc, line) =>
              _.isNil(acc) ? line.findParentOfId(id) : _.reduced(acc),
            null,
            lines,
          )
        } else {
          return this
        }
      },
    },
    actions: {
      insertNewAfter(id) {
        this.lines.splice(
          _.indexOf(this.findChildById(id)),
          0,
          Outline(),
        )
      },

      userUpdate(props) {
        Object.assign(this, pickUserProps(props))
      },
    },
    name: 'Outline',
  })

  return line
}

const outlineSI = StorageItem({
  name: 'outliner-root',
  getInitial() {
    return Outline({text: 'Home', lines: [{text: 'line1'}]})
  },
  postLoad(root) {
    return Outline(root)
  },
})

export function Outliner() {
  const out = createObservableObject({
    props: {
      root: outlineSI.load(),
      get lines() {
        return this.root.lines
      },
    },
    actions: {
      onEnter(line) {
        const parent = this.root.findParentOfId(line.id)
        validate('O', [parent])
        parent.insertNewAfter(line.id)
      },
    },
    name: 'Outliner',
  })

  mReaction(() => out.root, () => outlineSI.save(out.root), {
    name: 'save outliner-root',
  })

  return out
}
