import {_} from './little-ramda'
import {applySnapshot, getSnapshot, types} from 'mobx-state-tree'
import * as R from 'ramda'

export {
  addDisposer,
  addMiddleware,
  applyAction,
  applyPatch,
  applySnapshot,
  clone,
  createActionTrackingMiddleware,
  decorate,
  destroy,
  detach,
  escapeJsonPath,
  flow,
  getChildType,
  getEnv,
  getIdentifier,
  getMembers,
  getParent,
  getParentOfType,
  getPath,
  getPathParts,
  getRelativePath,
  getRoot,
  getSnapshot,
  getType,
  hasParent,
  hasParentOfType,
  isAlive,
  isProtected,
  isRoot,
  isStateTreeNode,
  onAction,
  onPatch,
  onSnapshot,
  setLivelynessChecking,
  splitJsonPath,
  tryResolve,
  typecheck,
  types,
  unescapeJsonPath,
  unprotect,
  walk,
} from 'mobx-state-tree'

export const mapSnapshot = _.map(getSnapshot)
export const applySnapshot2 = _.curryN(2, applySnapshot)
const optionalObj = T => types.optional(T, {})
export const optionalCollections = R.map(optionalObj)

if (module.hot) {
  window.mst = require('mobx-state-tree')
}
