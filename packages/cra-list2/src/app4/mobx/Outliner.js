import {createObservableObject} from './utils'
import {nanoid} from '../model/util'
import {storage, StorageItem} from '../services/storage'

function Outline({id = nanoid(), text = 'line x', lines = []} = {}) {
  const line = createObservableObject({
    props: {
      id,
      text,
      lines: lines.map(Outline),
    },
    actions: {},
    name: 'Outline',
  })

  return line
}

const outlineSI = StorageItem({
  name: 'outliner-root',
  getInitial() {
    return Outline({text: 'line1'})
  },
  postLoad(root) {},
})

export function Outliner() {
  const out = createObservableObject({
    props: {
      root: Outline({
        text: 'Home',
        lines: [{text: 'line1'}],
      }),
      get lines() {
        return this.root.lines
      },
    },
    actions: {},
    name: 'Outliner',
  })

  return out
}
