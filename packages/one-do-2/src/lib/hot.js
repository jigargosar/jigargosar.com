import {tap, tryCatch} from 'ramda'

export function hotDispose(fn, module) {
  return module.hot.dispose(
    tryCatch(
      fn,
      tap(function(e) {
        console.error(e)
        debugger
      }),
    ),
  )
}
