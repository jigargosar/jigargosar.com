import './init-mobx'
import RootStore from './RootStore'
import {configure, observable} from '../lib/mobx'
import {Disposers} from '../lib/little-mobx'

configure({computedRequiresReaction: true, enforceActions: true})

export const rootStore = observable(new RootStore())

export const debugStore = rootStore.debugStore
export const taskView = rootStore.taskView
export const addTaskView = rootStore.addTaskView
const disposers = Disposers(module)
rootStore.loadFromLS()

disposers.autorun(rootStore.saveToLS)
