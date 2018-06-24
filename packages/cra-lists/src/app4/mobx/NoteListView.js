import {mActionBound, mReaction, mTrace, oObject} from './utils'
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
      onTextChange(e) {
        note.text = e.target.value
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

  const view = oObject(
    {
      // eid: null,
      get eid() {
        return R.pathOr(null, ['noteList', view.eidx, 'id'], view)
      },
      eidx: -1,
      get isEditing() {
        return !R.isNil(this.eid)
      },
      pred: R.allPass([R.propEq('deleted', false)]),
      sortComparators: [R.ascend(R.prop('sortIdx'))],
      get transformedList() {
        return noteListTransformer(nc.all)
      },
      get noteList() {
        return R.compose(
          R.sortWith(this.sortComparators),
          R.filter(this.pred),
        )(this.transformedList)
      },
      onAddNewNoteEvent() {
        nc.addNewNote()
      },
      startEditing() {
        // if (this.isEditing || R.isEmpty(this.noteList)) return
        // this.eid = R.head(this.noteList).id
        if (!this.isEditing) {
          this.eidx = 0
        }
      },
      editNext() {
        this.eidx = this.eidx + 1
      },
      editPrev() {
        this.eidx = this.eidx - 1
      },
      insertBelow() {
        // this.eidx = this.eidx + 1
        nc.addNewNote()
      },
      isEditingNote(note) {
        return this.isEditing && R.equals(note.id, this.eid)
      },
    },
    {
      editNext: mActionBound,
      editPrev: mActionBound,
    },
  )

  // const rEid = mReaction(
  //   () => view.eid,
  //   () => {
  //     mTrace(rEid)
  //     view.eidx = R.findIndex(R.propEq('id', view.eid), view.noteList)
  //   },
  // )
  const rEidx = mReaction(
    () => [view.eidx],
    () => {
      mTrace(rEidx)
      if (view.eidx >= view.noteList.length) {
        view.eidx = 0
      }
      if (view.eidx < 0) {
        view.eidx = view.noteList.length - 1
      }
      // view.eid = R.pathOr(null, ['noteList', view.eidx, 'id'], view)
    },
  )

  const rLength = mReaction(
    () => [view.noteList.length],
    () => {
      mTrace(rLength)
      view.eidx = R.clamp(0, view.noteList.length - 1, view.eidx)
    },
  )

  view.eidx = 0

  return view
}
