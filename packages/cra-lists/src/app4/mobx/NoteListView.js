import {mReaction, oObject} from './utils'
import * as mu from 'mobx-utils'

const R = require('ramda')
const RA = require('ramda-adjunct')

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
    findById(id) {
      return R.find(R.propEq('id', id), this.noteList)
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

  const rEid = mReaction(
    () => view.eid,
    () => {
      rEid.trace()
      if (RA.isNotNil(view.eid)) {
        if (RA.isNotNil(view.findById(view.eid))) {
          view.eidx = R.findIndex(
            R.propEq('id', view.eid),
            view.noteList,
          )
        } else {
          view.eid = R.pathOr(
            null,
            ['noteList', view.eidx, 'id'],
            view,
          )
        }
      }
    },
  )

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
  return view
}
