import {Root} from './Root'
import {getSnapshot, setLivelynessChecking} from 'mobx-state-tree'
import {dotPath, isNotNil} from '../../little-ramda'
import * as R from 'ramda'
import {applySnapshot2} from '../../little-mst'

setLivelynessChecking('warn')

const root = Root.create({})

if (module && module.hot) {
  window.r = root
  const snapKey = Root.name
  const snap = dotPath(`hot.data.${snapKey}`)(module)
  R.ifElse(isNotNil)(applySnapshot2(root))(root.addMockData)(snap)

  module.hot.dispose(data => (data[snapKey] = getSnapshot(root)))
}

export {root}
