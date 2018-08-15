import './spy'
import RootStore from './RootStore'
import {observable} from '../lib/mobx'

export const rootStore = observable(new RootStore())
export const taskStore = rootStore.taskStore
export const store = rootStore

// const rootStoreLS = mobxStorage({
//   store: rootStore,
//   key: 'rootStore',
//   disposers: Disposers(module),
//   preProcessStorageJS: identity,
// })
//
// false && rootStoreLS.loadAndStart()
