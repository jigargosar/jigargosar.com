import Store from '@orbit/store'
import {schema} from './schema'

export const store = new Store({schema})

async function testStore() {
  await store.update(t => [
    t.addRecord({
      type: 'task',
      id: 'task_1',
      attributes: {
        title: 'first task',
      },
    }),
  ])
  const recCt = store.cache.query(q =>
    q.findRecords('task').sort('createdAt'),
  ).length
  console.log(`recCt`, recCt)
}

testStore().catch(console.log)
