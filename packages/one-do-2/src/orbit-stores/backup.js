import LocalStorageSource from '@orbit/local-storage'
import {schema} from './schema'

export const backup = new LocalStorageSource({
  schema,
  name: 'backup',
  namespace: 'od2',
})
