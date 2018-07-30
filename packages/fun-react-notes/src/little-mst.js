import {applySnapshot, getSnapshot, types} from 'mobx-state-tree'
import nanoid from 'nanoid'
import {_merge, _path, _startsWith} from './little-ramda'

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

export {values, has, get, set} from 'mobx'

export const modelNamed = name => types.model(name)
export const modelProps = props => modelType => modelType.props(props)
export const modelAttrs = attrs => modelType =>
  modelType.props(_merge({...idProp(modelType.name)}, attrs))
export const extend = fn => modelType => modelType.extend(fn)
export const actions = fn => modelType => modelType.actions(fn)
export const views = fn => modelType => modelType.views(fn)
export const tId = types.identifier
export const idProp = prefix => ({
  id: types.optional(identifierFor(prefix), () => `${prefix}_${nanoid()}`),
})

function identifierFor(prefix) {
  return types.refinement(
    `${prefix}Id`,
    types.identifier,
    _startsWith(`${prefix}_`),
  )
}

export const updateAttrs = m => attrs => Object.assign(m, attrs)

export function hotSnapshot(root, module) {
  if (module.hot) {
    const snap = _path(['hot', 'data', 'snap'])(module)
    if (snap) {
      applySnapshot(root, snap)
    }

    module.hot.dispose(data => {
      data.snap = getSnapshot(root)
    })
  }
}
