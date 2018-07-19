import {_} from '../little-ramda'
import {getSnapshot} from 'mobx-state-tree'

export const mapSnapshot = _.map(getSnapshot)
