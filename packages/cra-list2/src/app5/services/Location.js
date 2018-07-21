import queryString from 'query-string'

export function getParsedQS() {
  const search = global.window.location.search
  return queryString.parse(search)
}
