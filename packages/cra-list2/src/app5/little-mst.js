import {_} from './little-ramda'
import {applySnapshot, getSnapshot, types} from 'mobx-state-tree'
import * as R from 'ramda'

export {
  getSnapshot,
  types,
  flow,
  clone,
  addDisposer,
  getEnv,
  getRoot,
  applySnapshot,
  getType,
  isStateTreeNode,
  onSnapshot,
  addMiddleware,
  applyAction,
  applyPatch,
  createActionTrackingMiddleware,
  decorate,
  destroy,
  detach,
  escapeJsonPath,
  getChildType,
  getIdentifier,
  getMembers,
  getParent,
  getParentOfType,
  getPath,
  getPathParts,
  getRelativePath,
  hasParent,
  hasParentOfType,
  isAlive,
  isProtected,
  isRoot,
  walk,
  unprotect,
  unescapeJsonPath,
  typecheck,
  tryResolve,
  splitJsonPath,
  setLivelynessChecking,
} from 'mobx-state-tree'

export const mapSnapshot = _.map(getSnapshot)
export const applySnapshot2 = _.curryN(2, applySnapshot)
const optionalObj = T => types.optional(T, {})
export const optionalCollections = R.map(optionalObj)
