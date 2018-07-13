import {storage} from '../services/storage'
import {Disposers, mReaction} from './little-mobx'
import {NoteListView} from './NoteListView'
import {NoteCollection} from './NoteCollection'
import {Fire} from './Fire'
import {tryCatchLog} from '../little-ramda'
// import {startFireNoteCollectionSync} from './FireNoteCollection'
import {BrowserExtensionPopup} from './BrowserExtensionPopup'

const ncSnapshot = storage.get('ncSnapshot') || {}
const nc = NoteCollection.create(ncSnapshot)
const disposers = Disposers()
disposers.push(
  mReaction(
    () => [nc.snapshot],
    () => storage.set('ncSnapshot', nc.snapshot),
  ),
)

const state = {
  nc,
  view: NoteListView({nc}),
  fire: Fire(),
  pop: BrowserExtensionPopup({nc}),
}

// disposers.push(startFireNoteCollectionSync(state))

export {state}

if (module.hot) {
  module.hot.dispose(
    tryCatchLog(() => {
      console.clear()
      console.log('disposing state')
      disposers.dispose()
    }),
  )
}
