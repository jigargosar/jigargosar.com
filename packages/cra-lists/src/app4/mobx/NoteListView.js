import {
  mActionBound,
  mReaction,
  mTrace,
  oArray,
  oObject,
} from './utils'
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
      get isSelected() {
        return view.isSelectedNote(this)
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
      editMode: 'selection',
      get sid() {
        return R.pathOr(null, ['noteList', view.sidx, 'id'], view)
      },
      sidx: -1,
      get isEditMode() {
        return R.equals(this.editMode)
      },
      get isModeEditing() {
        return this.isEditMode('editing')
      },
      get isModeSelection() {
        return this.isEditMode('selection')
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

      get sortedList() {
        return R.compose(oArray, R.sortWith(this.sortComparators))(
          this.all,
        )
      },

      onAddNewNoteEvent() {
        nc.addNewNote()
      },
      gotoNext() {
        this.sidx = this.sidx + 1
      },
      gotoPrev() {
        this.sidx = this.sidx - 1
      },
      insertBelow() {
        // this.sidx = this.sidx + 1
        nc.addNewNote()
      },
      isEditingNote(note) {
        return this.isModeEditing && R.equals(note.id, this.sid)
      },
      isSelectedNote(note) {
        return this.isModeSelection && R.equals(note.id, this.sid)
      },
      updateSortIdx() {
        this.noteList.forEach((n, idx) => n.setSortIndex(idx))
      },
    },
    {
      gotoNext: mActionBound,
      gotoPrev: mActionBound,
    },
  )

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
    },
  )

  const rLength = mReaction(
    () => [view.noteList.length],
    ([listLength]) => {
      mTrace(rLength)
      if (listLength > 0) {
        view.sidx = R.clamp(0, listLength - 1, view.sidx)
      }
      view.updateSortIdx()
    },
  )

  view.sidx = 0

  return view
}
