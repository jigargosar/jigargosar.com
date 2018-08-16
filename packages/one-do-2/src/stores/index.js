import './spy'
import RootStore from './RootStore'
import {configure, observable, observe} from '../lib/mobx'
import {Disposers, logChange} from '../lib/little-mobx'

configure({computedRequiresReaction: true, enforceActions: true})

export const rootStore = observable(new RootStore())

export const taskStore = rootStore.taskStore
export const debugStore = rootStore.debugStore
export const taskViewStore = rootStore.taskViewStore
export const store = rootStore

observe(taskStore.tasks, logChange)
// observe(debugStore, logChange)
// observe(taskViewStore, logChange)

const disposers = Disposers(module)
rootStore.loadFromLS()

disposers.autorun(() => {
  rootStore.saveToLS()
})
