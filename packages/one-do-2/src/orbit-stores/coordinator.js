import Coordinator, {SyncStrategy} from '@orbit/coordinator'
import {backup} from './backup'
import Store from '@orbit/store'
import {schema} from './schema'

export const store = new Store({schema})
export const coordinator = new Coordinator({
  sources: [store, backup],
})

export const backupStoreSync = new SyncStrategy({
  source: 'store',
  target: 'backup',
  blocking: true,
})
