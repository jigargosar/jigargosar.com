import {types} from 'mobx-state-tree'
import nanoid from 'nanoid'
import {_startsWith} from './little-ramda'

export const modelNamed = name => types.model(name)
export const modelProps = props => modelType => modelType.props(props)
export const extend = fn => modelType => modelType.extend(fn)
export const actions = fn => modelType => modelType.actions(fn)
export const views = fn => modelType => modelType.views(fn)
export const tId = types.identifier
export const idProp = name => ({
  id: types.optional(identifierFor(name), () => newModelId(name)),
})

function idPrefixFromModelName(name) {
  return `${name}_`
}

function newModelId(name) {
  return `${idPrefixFromModelName(name)}${nanoid()}`
}

function identifierFor(name) {
  return types.refinement(
    `${name}Id`,
    types.identifier,
    _startsWith(idPrefixFromModelName(name)),
  )
}

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
