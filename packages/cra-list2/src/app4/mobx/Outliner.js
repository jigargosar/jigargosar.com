import {createObservableObject, mJS, mReaction} from './utils'
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
      findIndexOfChildById(id) {
        return _.findIndex(_.propEq('id', id), this.lines)
      },
      findParentOfId(id) {
        if (_.isNil(this.findChildById(id))) {
          _.reduce(
            (acc, line) =>
              _.isNil(acc) ? line.findParentOfId(id) : _.reduced(acc),
            null,
            this.lines,
          )
        } else {
          return this
        }
      },
    },
    actions: {
      insertNewAfter(id) {
        const insertAtIdx = _.findIndex(
          _.propEq('id', id),
          this.lines,
        )
        console.log(`start`, insertAtIdx)
        this.lines.splice(insertAtIdx, 0, Outline())
      },

      userUpdate(props) {
        Object.assign(this, pickUserProps(props))
      },
      removeById(id) {
        this.lines.splice(this.findIndexOfChildById(id), 1)
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
      onBackspace(line) {
        if (_.isEmpty(line.text)) {
          const parent = this.root.findParentOfId(line.id)
          parent.remove(line)
        }
      },
    },
    name: 'Outliner',
  })

  mReaction(() => mJS(out.root), () => outlineSI.save(out.root), {
    name: 'save outliner-root',
  })

  return out
}
