import {_, validate} from '../little-ramda'

export const storage = Storage()

function Storage() {
  const ls = global.window.localStorage
  return {
    get: k => {
      try {
        return JSON.parse(ls.getItem(k))
      } catch (e) {
        console.error(`storage.get`, e)
        return null
      }
    },
    set: (k, v) => {
      const value = JSON.stringify(v)
      ls.setItem(k, value)
      return value
    },
    keys() {
      return Object.keys(ls)
    },

    clear: () => ls.clear(),
  }
}

// console.debug(`storage.keys()`, storage.keys())

if (module.hot) {
  global.window.ls = storage
}
export const StorageItem = ({
  name,
  getInitial,
  postLoad = _.identity,
}) => {
  validate('SFF', [name, getInitial, postLoad])

  const getItem = () => storage.get(name)
  const setItem = val => storage.set(name, val)

  if (_.isNil(getItem())) {
    setItem(getInitial())
  }

  return {
    save: setItem,
    load: _.compose(postLoad, getItem),
  }
}
