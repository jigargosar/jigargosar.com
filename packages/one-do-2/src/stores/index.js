import './spy'
import RootStore from './RootStore'
import {observable} from '../lib/mobx'
import TaskStore from './TaskStore'
import {Disposers, mobxStorage} from '../lib/little-mobx'
import {identity} from '../lib/ramda'

export const taskStore = new TaskStore()
export const rootStore = new RootStore({taskStore})
export const store = rootStore

const rootStoreLS = mobxStorage({
  store: rootStore,
  key: 'rootStore',
  disposers: Disposers(module),
  preProcessStorageJS: identity,
})

rootStoreLS.loadAndStart()
