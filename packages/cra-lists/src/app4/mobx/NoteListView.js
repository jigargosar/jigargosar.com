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
      setSortIndex(idx) {
        note.sortIdx = idx
      },
    }
    ;['id', 'text', 'deleted', 'sortIdx'].forEach(
      defineDelegatePropertyGetter(R.__, note, displayNote),
    )
    return oObject(displayNote)
  })

  const noteListTransformer = mu.createTransformer(
    R.map(noteTransformer),
  )

  const view = oObject(
    {
      // sid: null,
      get sid() {
        return R.pathOr(null, ['noteList', view.sidx, 'id'], view)
      },
      sidx: -1,
      get isEditing() {
        return !R.isNil(this.sid)
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
        // this.sid = R.head(this.noteList).id
        if (!this.isEditing) {
          this.sidx = 0
        }
      },
      editNext() {
        this.sidx = this.sidx + 1
      },
      editPrev() {
        this.sidx = this.sidx - 1
      },
      insertBelow() {
        // this.sidx = this.sidx + 1
        nc.addNewNote()
      },
      isEditingNote(note) {
        return this.isEditing && R.equals(note.id, this.sid)
      },
      updateSortIdx() {
        this.noteList.forEach((n, idx) => n.setSortIndex(idx))
      },
    },
    {
      editNext: mActionBound,
      editPrev: mActionBound,
    },
  )

  // const rEid = mReaction(
  //   () => view.sid,
  //   () => {
  //     mTrace(rEid)
  //     view.sidx = R.findIndex(R.propEq('id', view.sid), view.noteList)
  //   },
  // )
  const rEidx = mReaction(
    () => [view.sidx],
    () => {
      mTrace(rEidx)
      if (view.sidx >= view.noteList.length) {
        view.sidx = 0
      }
      if (view.sidx < 0) {
        view.sidx = view.noteList.length - 1
      }
      // view.sid = R.pathOr(null, ['noteList', view.sidx, 'id'], view)
    },
  )

  const rLength = mReaction(
    () => [view.noteList.length],
    () => {
      mTrace(rLength)
      // view.sidx = R.clamp(0, view.noteList.length - 1, view.sidx)
      view.updateSortIdx()
    },
  )

  view.sidx = 0

  return view
}
