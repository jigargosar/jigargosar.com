import Store from '@orbit/store'
import {schema} from './schema'

export const store = new Store({schema})

async function testStore() {
  await store.update(t => [
    t.addRecord({
      type: 'task',
      attributes: {
        title: 'first task',
        createdAt: Date.now(),
      },
    }),
  ])
  const recCt = store.cache.query(q =>
    q.findRecords('task').sort('createdAt'),
  )
  console.log(`recCt`, recCt)
}

testStore().catch(console.log)
