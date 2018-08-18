import Coordinator, {SyncStrategy} from '@orbit/coordinator'
import {backup} from './backup'
import Store from '@orbit/store'
import {schema} from './schema'

const store = new Store({schema})

const coordinator = new Coordinator({
  sources: [store, backup],
})

const backupStoreSync = new SyncStrategy({
  source: 'store',
  target: 'backup',
  blocking: true,
})
coordinator.addStrategy(backupStoreSync)

function activate() {
  return coordinator.activate()
}

async function loadBackupIntoStore() {
  const backTransForms = await backup.pull(q => q.findRecords())
  return store.sync(backTransForms)
}

async function loadBackupAndActivate() {
  await loadBackupIntoStore()
  await activate()
}

export {store, loadBackupAndActivate}
