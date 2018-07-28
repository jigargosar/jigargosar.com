import {_, C} from './little-ramda'
import {
  applySnapshot,
  getSnapshot,
  getType,
  types,
} from 'mobx-state-tree'
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
  recordActions,
  recordPatches,
  resolveIdentifier,
  resolvePath,
} from 'mobx-state-tree'

export {
  simpleActionLogger,
  actionLogger,
  asReduxStore,
  atomic,
  connectReduxDevtools,
  TimeTraveller,
  UndoManager,
} from 'mst-middlewares'

export const mapSnapshot = _.map(getSnapshot)
export const applySnapshot2 = _.curryN(2, applySnapshot)
export const optionalObj = T => types.optional(T, {})
export const optionalCollections = R.map(optionalObj)

if (module.hot) {
  window.mst = require('mobx-state-tree')
}

export function modelNamed(name) {
  return types.model(name)
}

export const typeIs = type => C(R.equals(type), getType)
