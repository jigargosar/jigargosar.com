const log = require('nanologger')('models:collection')



export function createCollection(name) {
  log.info("creating collection", name)
  const log = require('nanologger')(`collection:${name}`)
  const list = []

  return {log, list}
}