import {
  applySnapshot,
  decorate,
  flow,
  getSnapshot,
  types,
} from 'mobx-state-tree'
import {autorun, reaction} from 'mobx'
import nanoid from 'nanoid'
import {_compose, _merge, _path, _startsWith, call, compose} from './ramda'
import {pDrop} from './little-ramda'
import {atomic} from 'mst-middlewares'
import {hotDispose} from './hot'

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
  observable,
  values,
  has,
  get,
  set,
  autorun,
  trace,
  reaction,
  computed,
  action,
} from 'mobx'

export {
  UndoManager,
  TimeTraveller,
  connectReduxDevtools,
  atomic,
  asReduxStore,
  actionLogger,
  simpleActionLogger,
} from 'mst-middlewares'

export const modelNamed = name => types.model(name)
export const modelProps = props => modelType => modelType.props(props)
export const modelAttrs = attrs => modelType =>
  modelType.props(_merge({...modelId(modelType.name)}, attrs))
export const extend = fn => modelType => modelType.extend(fn)
export const actions = fn => modelType => modelType.actions(fn)
export const views = fn => modelType => modelType.views(fn)
export const tId = types.identifier
export const modelId = prefix =>
  types.optional(identifierFor(prefix), () => `${prefix}_${nanoid()}`)

function identifierFor(prefix) {
  return types.refinement(
    `${prefix}Id`,
    types.identifier,
    _startsWith(`${prefix}_`),
  )
}

export const hotSnapshot = module => root => {
  if (module.hot) {
    const snap = _path(['hot', 'data', 'snap'])(module)
    if (snap) {
      applySnapshot(root, snap)
    }

    module.hot.dispose(data => {
      data.snap = getSnapshot(root)
    })
  }
  return root
}

export const nullRef = _compose(types.maybeNull, types.reference)
export const nullString = types.maybeNull(types.string)
export const nullNumber = types.maybeNull(types.number)
export const optional = (t, dv = {}) => types.optional(t, dv)
export const stringArray = types.array(types.string)

export function Disposers(module) {
  const list = []
  const push = (...args) => list.push(...args)
  const addDisposer = disposer => {
    push(disposer)
    return disposer
  }
  const dispose = () => {
    list.forEach(call)
    list.splice(0, list.length)
  }
  if (module) {
    hotDispose(dispose, module)
  }
  return {
    push,
    dispose,
    length: () => list.length,
    addDisposer,
    autorun: compose(addDisposer, autorun),
    reaction: compose(addDisposer, reaction),
  }
}

export const spliceItem = el => arr => arr.splice(arr.indexOf(el), 1)
export const dropFlow = generator => pDrop(flow(generator))
export const decorateAtomic = action => decorate(atomic, action)
export const bindStoreAction = actionName => comp => (...args) => () =>
  comp.props.store[actionName](...args)
export const optionalEnum = (name, values, defaultValue = values[0]) =>
  optional(types.enumeration(name, values), defaultValue)
