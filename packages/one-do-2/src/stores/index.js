import './spy'
import RootStore from './RootStore'
import {observable} from '../lib/mobx'
import TaskStore from './TaskStore'
import {Disposers, mobxStorage} from '../lib/little-mobx'
import {identity} from '../lib/ramda'

export const tasksStore = observable(new TaskStore())
export const rootStore = observable(new RootStore({tasksStore}))
export const store = rootStore

const rootStoreLS = mobxStorage({
  store: rootStore,
  key: 'rootStore',
  disposers: Disposers(module),
  preProcessStorageJS: identity,
})

rootStoreLS.loadAndStart()
