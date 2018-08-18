import Store from '@orbit/store'
import {schema} from './schema'

export const store = new Store({schema})

async function testStore() {
  await store.update(t => [
    t.aRecord({
      type: 'task',
      id: 'task_1',
      attributes: {
        title: 'first task',
      },
    }),
  ])
}

testStore().catch(console.log)
