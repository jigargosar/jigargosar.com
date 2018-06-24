import {mAutoRun, oObject} from './utils'
import * as mu from 'mobx-utils'

const R = require('ramda')

const defineDelegatePropertyGetter = R.curry(
  (propertyName, src, target) =>
    Object.defineProperty(target, propertyName, {
      get() {
        return src[propertyName]
      },
      enumerable: true,
    }),
)

export function NoteListView({nc}) {
  const view = oObject({
    eid: null,
    get isEditing() {
      return !R.isNil(this.eid)
    },
    pred: R.allPass([R.propEq('deleted', false)]),
    get transformedList() {
      return noteListTransformer(nc.all)
    },
    get noteList() {
      return R.filter(this.pred, this.transformedList)
    },
    onAddNewNoteEvent() {
      nc.addNewNote()
    },
    startEditing() {
      if (this.isEditing || R.isEmpty(this.noteList)) return
      this.eid = R.head(this.noteList).id
    },
    isEditingNote(note) {
      return this.isEditing && R.equals(note.id, this.eid)
    },
  })
  const noteTransformer = mu.createTransformer(note => {
    const displayNote = {
      onToggleDeleteEvent() {
        note.toggleDeleted()
      },
      get isEditing() {
        return view.isEditingNote(this)
      },
    }
    ;['id', 'text', 'deleted'].forEach(
      defineDelegatePropertyGetter(R.__, note, displayNote),
    )
    return oObject(displayNote)
  })

  const noteListTransformer = mu.createTransformer(
    R.map(noteTransformer),
  )
  mAutoRun(r => {
    r.trace()
    console.debug(view.noteList.length)
  })
  return view
}
