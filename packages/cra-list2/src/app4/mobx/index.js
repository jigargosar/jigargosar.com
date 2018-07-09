import {storage} from '../services/storage'
import {Disposers, mReaction} from './little-mobx'
import {NoteListView} from './NoteListView'
import {NoteCollection} from './NoteCollection'
import {Fire} from './Fire'
import {tryCatchLogError} from '../utils'
// import {startFireNoteCollectionSync} from './FireNoteCollection'
import {Router} from './Router'
import {BrowserExtensionPopup} from './BrowserExtensionPopup'
import {Outliner} from './Outliner'
import {State} from './State'

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
  router: Router(),
  pop: BrowserExtensionPopup({nc}),
  out: Outliner(),
  state: State(),
}

// disposers.push(startFireNoteCollectionSync(state))

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
