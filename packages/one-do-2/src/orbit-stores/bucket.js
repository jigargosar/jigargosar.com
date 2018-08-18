import LocalStorageBucket from '@orbit/local-storage-bucket'
import IndexedDBBucket, {supportsIndexedDB} from '@orbit/indexeddb-bucket'
const BucketClass = supportsIndexedDB()
  ? IndexedDBBucket
  : LocalStorageBucket

export const bucket = new BucketClass({namespace: 'od2'})
