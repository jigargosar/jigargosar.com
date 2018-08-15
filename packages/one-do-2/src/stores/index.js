import './spy'
import RootStore from './RootStore'
import {observable} from '../lib/mobx'
import TaskStore from './TaskStore'

export const tasksStore = observable(new TaskStore())
export const rootStore = observable(new RootStore({tasksStore}))
export const store = rootStore
