import {
  createOObj,
  mActionBound,
  mReaction,
  oArray,
  oObject,
} from './utils'
import {R} from '../utils'
import * as mu from 'mobx-utils/lib/mobx-utils'

const defineDelegatePropertyGetter = R.curry(
  (propertyName, src, target) =>
    Object.defineProperty(target, propertyName, {
      get() {
        return src[propertyName]
      },
      enumerable: true,
    }),
)

const EditMode = (() => {
  function create() {
    return R.compose(createOObj)({
      props: {type: null},
      options: {name: 'EditMode'},
    })
  }

  return {create}
})()

const noteTransformer = view =>
  mu.createTransformer(note => {
    const displayNote = {
      get displayText() {
        return R.when(R.isEmpty, R.always('<empty>'))(this.text)
      },
      get isEditing() {
        return view.isModeEditing && R.equals(note.id, view.sid)
      },
      get isSelected() {
        return view.isModeSelection && R.equals(note.id, view.sid)
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

export function NoteListView({nc}) {
  const view = oObject(
    {
      editMode: 'selection',
      em: EditMode.create(),
      editTextSelection: {start: 0, end: 0},
      get sid() {
        return R.pathOr(
          null,
          ['noteDisplayList', view.sidx, 'id'],
          view,
        )
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
      pred: R.allPass([]),
      sortComparators: [R.ascend(R.prop('sortIdx'))],
      get noteDisplayList() {
        return R.compose(
          R.map(noteTransformer(view)),
          // R.sortWith(this.sortComparators),
          // R.filter(this.pred),
        )(this.noteModelList)
      },
      get noteModelList() {
        return R.compose(
          oArray,
          R.sortWith(this.sortComparators),
          R.filter(this.pred),
        )(nc.all)
      },
      updateSortIdx() {
        this.noteModelList.forEach((n, idx) => (n.sortIdx = idx))
      },
      addNewAt(idx) {
        const newNote = nc.newNote()
        this.noteModelList.splice(idx, 0, newNote)
        this.updateSortIdx()
        nc.add(newNote)
        this.sidx = idx
        this.editMode = 'editing'
      },

      onAddNewNoteEvent() {
        this.addNewAt(0)
      },
      onDeleteSelectionEvent() {
        if (
          this.noteDisplayList.length === 0 ||
          !this.isModeSelection
        ) {
          return
        }
        this.noteDisplayList[this.sidx].onToggleDeleteEvent()
      },
      insertAbove() {
        this.addNewAt(this.sidx)
      },
      insertBelow() {
        this.addNewAt(this.sidx + 1)
      },
      gotoNext() {
        this.sidx += 1
      },
      gotoPrev() {
        this.sidx -= 1
      },
      onEnterKey() {
        if (this.noteDisplayList.length === 0) {
          return
        }
        if (this.isModeSelection) {
          this.editMode = 'editing'
        } else if (this.isModeEditing) {
          this.editMode = 'selection'
        }
      },
      onEscapeKey() {
        this.editMode = 'selection'
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

  /*const rEidx =*/
  mReaction(
    () => [view.sidx],
    () => {
      // mTrace(rEidx)
      if (view.sidx >= view.noteDisplayList.length) {
        view.sidx = 0
      }
      if (view.sidx < 0) {
        view.sidx = view.noteDisplayList.length - 1
      }
    },
  )

  /*const rLength = */
  mReaction(
    () => [view.noteDisplayList.length],
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
