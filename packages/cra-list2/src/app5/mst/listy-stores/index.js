import rootStore from './root-store'
import {Root} from './collection-stores'
import {dotPath, isNotNil, R} from '../../little-ramda'
import {applySnapshot2} from '../../little-mst'
import {getSnapshot} from 'mobx-state-tree'

const store = rootStore

const root = Root.create()
const domain = root.domain

export {domain, store}

if (module.hot) {
  console.debug(`store`, store)
  domain.addMockData()

  const snap = dotPath('hot.data.snap')(module)
  R.ifElse(isNotNil)(applySnapshot2(root))(domain.addMockData)(snap)

  module.hot.dispose(data => (data.snap = getSnapshot(root)))
}
