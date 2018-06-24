import {mReaction, mTrace, oObject} from './utils'
import * as mu from 'mobx-utils'

const R = require('ramda')
// const RA = require('ramda-adjunct')

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

  const view = oObject({
    eid: null,
    eidx: -1,
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
    editNext() {
      this.eidx = this.eidx + 1
    },
    editPrev() {
      this.eidx = this.eidx - 1
    },
    isEditingNote(note) {
      return this.isEditing && R.equals(note.id, this.eid)
    },
  })

  const rEid = mReaction(
    () => view.eid,
    () => {
      mTrace(rEid)
      view.eidx = R.findIndex(R.propEq('id', view.eid), view.noteList)
    },
  )
  const rEidx = mReaction(
    () => view.eidx,
    () => {
      mTrace(rEidx)
      view.eid = R.pathOr(null, ['noteList', view.eidx, 'id'], view)
    },
  )

  view.eidx = 0

  return view
}
