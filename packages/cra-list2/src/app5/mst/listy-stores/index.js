import {Root} from './Root'
import {setLivelynessChecking} from 'mobx-state-tree'

setLivelynessChecking('warn')

const root = Root.create({})
root.initModule(module)
export {root}
