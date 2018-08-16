import {storage} from './storage'
import {autorun, reaction, spy, toJS} from './mobx'
import {call, compose, defaultTo} from './ramda'
import {hotDispose} from './hot'

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
  const push = (...args) => list.push(...args)
  const addDisposer = disposer => {
    push(disposer)
    return disposer
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
    autorun: compose(addDisposer, autorun),
    reaction: compose(addDisposer, reaction),
    setInterval: compose(addDisposer, setIntervalDisposable),
    spy: compose(addDisposer, spy),
  }
}

export const logChange = change => {
  const {type, object, oldValue, newValue} = change
  console.log(`[${type}] ${object.name} ${oldValue} -> ${newValue}`)
  console.debug(change)
}
