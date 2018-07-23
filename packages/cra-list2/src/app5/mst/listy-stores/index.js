import {Root} from './collection-stores'
import {setLivelynessChecking} from 'mobx-state-tree'

setLivelynessChecking('warn')

const root = Root.create()
const domain = root.domain

export {domain}

root.initModule(module)
