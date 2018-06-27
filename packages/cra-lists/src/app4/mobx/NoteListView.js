import {
  createOObj,
  createTransformer,
  createViewModel,
  mActionBound,
  mReaction,
  oArray,
  oObject,
} from './utils'
import {R} from '../utils'

const EditMode = (() => {
  function create() {
    return R.compose(createOObj)({
      props: {type: null},
      options: {name: 'EditMode'},
    })
  }

  return {create}
})()

/**
 *  @type function
 *  @returns function
 */
const noteTransformer = createTransformer(view =>
  createTransformer(note =>
    oObject(
      {
        get displayText() {
          return R.when(R.isEmpty, R.always('<empty>'))(note.text)
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
          this.form.text = target.value
        },
        get form() {
          return createViewModel(note)
        },
        get text() {
          return note.text
        },
        get id() {
          return note.id
        },
        get deleted() {
          return note.deleted
        },
        get sortIdx() {
          return note.sortIdx
        },
      },
      {onTextChange: mActionBound},
    ),
  ),
)

export function NoteListView({nc}) {
  const view = oObject(
    {
      editMode: 'selection',
      em: EditMode.create(),
      get sid() {
        return R.pathOr(
          null,
          ['noteDisplayList', view.sidx, 'id'],
          view,
        )
      },
      sidx: -1,
      isEditMode(mode) {
        return this.sidx !== -1 && R.equals(this.editMode, mode)
      },
      get isModeEditing() {
        return this.isEditMode('editing')
      },
      get editingNoteForm() {
        return R.pathOr(
          null,
          ['noteDisplayList', view.sidx, 'form'],
          view,
        )
      },
      get isModeSelection() {
        return this.isEditMode('selection')
      },
      pred: R.allPass([]),
      sortComparators: [R.ascend(R.prop('sortIdx'))],
      get noteDisplayList() {
        return R.compose(
          oArray,
          R.map(noteTransformer(view)),
          // R.sortWith(this.sortComparators),
          // R.filter(this.pred),
          // )(nc.all)
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
          if (this.editingNoteForm) {
            this.editingNoteForm.submit()
          }
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
    () => [view.noteModelList.length],
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

  return view
}
