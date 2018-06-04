const LocalStorageItem = require('./local-storage-item')

const syncSeq = LocalStorageItem(
  'choo-list:syncedTillSequenceNumber',
  0,
)
