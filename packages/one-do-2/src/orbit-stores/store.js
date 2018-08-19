import {Store} from './orbit'
import {schema} from './schema'
import {TaskRecord} from './TaskRecord'
import {findRecords} from './little-orbit'
import {Disposers} from '../lib/little-mobx'
import {partial} from '../lib/ramda'

export function addNewTask(store) {
  return store.update(t => t.addRecord(TaskRecord()))
}

const disposers = Disposers(module)

const log = console.log.bind(console)

function onWrapper(evented) {
  return (event, callback, binding) => {
    const logger = partial(log, [`[${evented.name || 'Evented'}]`])

    logger('.on', event, callback.name || callback, binding)
    evented.on(event, callback, binding)

    logger(`.listeners(${event}).length`, evented.listeners(event).length)

    return disposers.addDisposer(function() {
      logger(`disposing: .on`, event, callback.name || callback, binding)
      offWrapper(evented)(event, callback, binding)
    })
  }
}

function offWrapper(store) {
  return (e, callback, binding) => {
    console.log(
      `[store${store.name}] .off`,
      e,
      callback.name || callback,
      binding,
    )
    return store.off(e, callback, binding)
  }
}

async function createStore() {
  console.debug('[Entering] createStore')
  const store = new Store({schema})
  await addNewTask(store)
  await addNewTask(store)

  const storeWrapper = {
    _store: store,
    query: fn => store.query(fn),
    listeners: event => store.listeners(event),
    on: onWrapper(store),
    off: offWrapper(store),
  }

  console.debug('[Exiting] createStore')
  return storeWrapper
}

export const findTasks = findRecords('task')

export const storeOP = createStore()
