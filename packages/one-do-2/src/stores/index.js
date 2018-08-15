import './spy'
import RootStore from './RootStore'
import {observable} from '../lib/mobx'
import TaskStore from './TaskStore'

export const tasksStore = observable(new TaskStore())
export const store = observable(new RootStore({tasksStore}))
