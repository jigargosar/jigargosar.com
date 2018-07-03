import {storage} from '../services/storage'
import {Disposers, mReaction} from './utils'
import {NoteListView} from './NoteListView'
import {NoteCollection} from './NoteCollection'
import {Fire} from './Fire'
import {tryCatchLogError} from '../utils'
import {startFireNoteCollectionSync} from './FireNoteCollection'

const ncSnapshot = storage.get('ncSnapshot') || {}
const nc = NoteCollection.create(ncSnapshot)
const state = {
  nc,
  view: NoteListView({nc}),
  fire: Fire(),
}

const disposers = Disposers()

disposers.push(
  mReaction(
    () => [nc.snapshot],
    () => storage.set('ncSnapshot', nc.snapshot),
  ),
  startFireNoteCollectionSync(state),
)

export {state}

if (module.hot) {
  module.hot.dispose(
    tryCatchLogError(() => {
      console.clear()
      console.log('disposing state')
      disposers.dispose()
    }),
  )
}
