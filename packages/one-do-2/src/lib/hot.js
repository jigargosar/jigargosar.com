import {tap, tryCatch} from 'ramda'
import {validate} from './assert'

export function hotDispose(fn, module) {
  validate('FO', [fn, module])

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
