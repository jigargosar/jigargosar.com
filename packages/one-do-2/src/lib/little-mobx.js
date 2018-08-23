import {storage} from './storage'
import {
  autorun,
  configure,
  getDebugName,
  intercept,
  observableKeys,
  observe,
  reaction,
  spy,
  toJS,
} from './mobx'
import {
  call,
  compose,
  concat,
  defaultTo,
  head,
  isNil,
  once,
  pick,
  unless,
} from './ramda'
import {hotDispose} from './hot'
import {validate} from './validate'

export function mobxStorage({store, key, disposers, preProcessStorageJS}) {
  function startStoring() {
    disposers.autorun(() => {
      // console.log(`toJS(store)`, toJS(store))
      compose(storage.set(key), toJS)(store)
    })
  }

  function loadStore() {
    const source = compose(preProcessStorageJS, defaultTo({}))(
      storage.get(key),
    )
    Object.assign(store, source)
  }

  return {
    loadAndStart() {
      loadStore()
      startStoring()
    },
  }
}

export function storeAsPrettyJSON(store) {
  return JSON.stringify(toJS(store), null, 2)
}

export function Disposers(module) {
  const list = []

  function push(...disposers) {
    const onlyOnceDisposers = disposers.map(once)
    list.push(...onlyOnceDisposers)
    return onlyOnceDisposers
  }

  function addDisposer(disposer) {
    validate('F', [disposer])

    return head(push(disposer))
  }

  const dispose = () => {
    list.forEach(call)
    list.splice(0, list.length)
  }

  function setIntervalDisposable(handler, timeout, ...args) {
    const intervalId = setInterval(handler, timeout, ...args)
    return () => clearInterval(intervalId)
  }

  if (module) {
    hotDispose(dispose, module)
  }
  return {
    push,
    dispose,
    length: () => list.length,
    addDisposer,
    add: addDisposer,
    autorun: compose(addDisposer, autorun),
    reaction: compose(addDisposer, reaction),
    setInterval: compose(addDisposer, setIntervalDisposable),
    spy: compose(addDisposer, spy),
    observe: compose(addDisposer, observe),
    intercept: compose(addDisposer, intercept),
  }
}

export const logChange = change => {
  const {type, object, oldValue, newValue, name} = change
  const qualifiedName = `${getDebugName(object)}${unless(isNil)(
    concat('.'),
  )(name)}`
  console.log(`[${type}] ${qualifiedName} ${oldValue} -> ${newValue}`)
  console.log(change)
}
export const configureMobx = configure

function pickObservableKeysOf(observableObj) {
  return pick(observableKeys(observableObj))
}

export function setObservableProps(props, obs) {
  Object.assign(obs, pickObservableKeysOf(obs)(props))
}

export function setObservableProp(key, value, obs) {
  setObservableProps({[key]: value}, obs)
}
export function toggleObservableProp(key, obs) {
  setObservableProps({[key]: !Boolean(obs[key])}, obs)
}
