import './spy'
import RootStore from './RootStore'
import TaskStore from './TaskStore'
import {observable} from '../lib/mobx'

export const taskStore = observable(new TaskStore())
export const rootStore = observable(new RootStore({taskStore}))
export const store = rootStore

// const rootStoreLS = mobxStorage({
//   store: rootStore,
//   key: 'rootStore',
//   disposers: Disposers(module),
//   preProcessStorageJS: identity,
// })
//
// false && rootStoreLS.loadAndStart()
