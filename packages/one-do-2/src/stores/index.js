import './spy'
import RootStore from './RootStore'
import {observable} from '../lib/mobx'

export const store = observable(new RootStore())
