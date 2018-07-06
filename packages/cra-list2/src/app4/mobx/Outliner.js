import {createObservableObject, mReaction} from './utils'
import {nanoid} from '../model/util'
import {StorageItem} from '../services/storage'
import {_} from '../utils'

function Outline({id = nanoid(), text = 'line x', lines = []} = {}) {
  const userProps = ['text']
  const pickUserProps = _.pick(userProps)
  const line = createObservableObject({
    props: {
      id,
      text,
      lines: lines.map(Outline),
    },
    actions: {
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
    actions: {},
    name: 'Outliner',
  })

  mReaction(() => out.root, () => outlineSI.save(out.root), {
    name: 'save outliner-root',
  })

  return out
}
