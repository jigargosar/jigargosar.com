import './spy'
import RootStore from './RootStore'
import {configure, observable} from '../lib/mobx'
import {Disposers} from '../lib/little-mobx'

configure({computedRequiresReaction: true, enforceActions: true})

export const rootStore = observable(new RootStore())

export const taskStore = rootStore.taskStore
export const debugStore = rootStore.debugStore
export const taskViewStore = rootStore.taskView
export const store = rootStore

const disposers = Disposers(module)
rootStore.loadFromLS()

disposers.autorun(() => {
  rootStore.saveToLS()
})
