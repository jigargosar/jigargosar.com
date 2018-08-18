import Coordinator, {SyncStrategy} from '@orbit/coordinator'
import {backup} from './backup'
import Store from '@orbit/store'
import {schema} from './schema'
import {Disposers} from '../lib/little-mobx'

const disposers = Disposers(module)

const inMemorySource = new Store({schema, name: 'inMemorySource'})

const coordinator = new Coordinator({
  sources: [inMemorySource, backup],
})

const backupStoreSync = new SyncStrategy({
  source: 'inMemorySource',
  target: 'backup',
  blocking: true,
})
coordinator.addStrategy(backupStoreSync)

function activate() {
  const promise = coordinator.activate()
  disposers.addDisposer(() => coordinator.deactivate())
  return promise
}

async function loadBackupIntoStore() {
  const backTransForms = await backup.pull(q => q.findRecords())
  return inMemorySource.sync(backTransForms)
}

async function loadBackupAndActivate() {
  await loadBackupIntoStore()
  await activate()
}

export {inMemorySource, loadBackupAndActivate}
