import {mActionBound, mReaction, oArray, oObject} from './utils'
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
      get displayText() {
        return R.when(R.isEmpty, R.always('<empty>'))(this.text)
      },
      get isEditing() {
        return view.isEditingNote(this)
      },
      get isSelected() {
        return view.isSelectedNote(this)
      },
      onToggleDeleteEvent() {
        note.toggleDeleted()
      },
      onTextChange(e) {
        const target = e.target
        note.text = target.value
      },
      get textSelection() {
        return view.editTextSelection
      },
      onEditTextSelectionChange(e) {
        const target = e.target
        view.editTextSelection = {
          start: target.selectionStart,
          end: target.selectionEnd,
        }
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
      editTextSelection: {start: 0, end: 0},
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
        return R.compose(
          oArray,
          R.filter(this.pred),
          R.sortWith(this.sortComparators),
        )(nc.all)
      },
      updateSortIdx() {
        this.sortedList.forEach((n, idx) => (n.sortIdx = idx))
      },
      addNewAt(idx) {
        const newNote = nc.newNote()
        this.sortedList.splice(idx, 0, newNote)
        this.updateSortIdx()
        nc.add(newNote)
        this.sidx = idx
        this.editMode = 'editing'
      },

      onAddNewNoteEvent() {
        this.addNewAt(0)
      },
      onDeleteSelectionEvent() {
        if (this.noteList.length === 0 || !this.isModeSelection)
          return
        this.noteList[this.sidx].onToggleDeleteEvent()
      },
      insertAbove() {
        this.addNewAt(this.sidx)
      },
      insertBelow() {
        this.addNewAt(this.sidx + 1)
      },
      gotoNext() {
        this.sidx = this.sidx + 1
      },
      gotoPrev() {
        this.sidx = this.sidx - 1
      },
      onEnterKey() {
        if (this.noteList.length === 0) return
        if (this.isModeSelection) {
          this.editMode = 'editing'
        } else if (this.isModeEditing) {
          this.editMode = 'selection'
          // if (this.sidx === this.noteList.length - 1) {
          //   this.addNewAt(this.sidx + 1)
          // } else {
          //   this.sidx = this.sidx + 1
          // }
        }
      },
      onEscapeKey() {
        this.editMode = 'selection'
      },
      isEditingNote(note) {
        return this.isModeEditing && R.equals(note.id, this.sid)
      },
      isSelectedNote(note) {
        return this.isModeSelection && R.equals(note.id, this.sid)
      },
    },
    {
      gotoNext: mActionBound,
      onEnterKey: mActionBound,
      onEscapeKey: mActionBound,
      gotoPrev: mActionBound,
      onAddNewNoteEvent: mActionBound,
      onDeleteSelectionEvent: mActionBound,
      insertAbove: mActionBound,
      insertBelow: mActionBound,
    },
  )

  /*const rEidx =*/ mReaction(
    () => [view.sidx],
    () => {
      // mTrace(rEidx)
      if (view.sidx >= view.noteList.length) {
        view.sidx = 0
      }
      if (view.sidx < 0) {
        view.sidx = view.noteList.length - 1
      }
    },
  )

  /*const rLength = */ mReaction(
    () => [view.noteList.length],
    ([listLength]) => {
      // mTrace(rLength)
      if (listLength > 0) {
        view.sidx = R.clamp(0, listLength - 1, view.sidx)
      } else {
        view.sidx = -1
      }
      view.updateSortIdx()
    },
  )

  view.sidx = 0

  return view
}
