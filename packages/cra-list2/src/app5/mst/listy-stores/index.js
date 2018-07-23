import rootStore from './root-store'
import {Root} from './collection-stores'
import {dotPath, isNotNil, R} from '../../little-ramda'
import {applySnapshot2} from '../../little-mst'
import {getSnapshot, setLivelynessChecking} from 'mobx-state-tree'

setLivelynessChecking('warn')
const store = rootStore

const root = Root.create()
const domain = root.domain

export {domain, store}

if (module.hot) {
  console.debug(`store`, store)
  domain.addMockData()

  const rootSnap = dotPath('hot.data.rootSnap')(module)
  R.ifElse(isNotNil)(applySnapshot2(root))(domain.addMockData)(
    rootSnap,
  )

  module.hot.dispose(data => (data.rootSnap = getSnapshot(root)))
}
