import './spy'
import RootStore from './RootStore'
import {observable} from '../lib/mobx'
import {Disposers} from '../lib/little-mobx'

export const rootStore = observable(new RootStore())
export const taskStore = rootStore.taskStore
export const debugStore = rootStore.debugStore
export const store = rootStore

const disposers = Disposers(module)
rootStore.loadFromLS()

disposers.autorun(() => {
  rootStore.saveToLS()
})
