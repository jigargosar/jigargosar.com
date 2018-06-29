import {
  createObservableObject,
  createTransformer,
  mComputed,
  mGet,
  mReaction,
  oArray,
  oObject,
} from './utils'
import {_, R} from '../utils'

const SELECT_MODE = 'SELECT_MODE'
const EDIT_MODE = 'EDIT_MODE'

function clampListIdx(list, idx) {
  if (list.length < 0) {
    return -1
  }
  return _.clamp(0, list.length - 1, idx)
}

const ViewMode = (() => {
  function create() {
    const viewMode = createObservableObject({
      props: {
        _type: SELECT_MODE,
        _idx: -1,
        get sidx() {
          return this._idx
        },
        set sidx(num) {
          return (this._idx = num)
        },
        overMode(cases) {
          return cases[this._type](this._idx)
        },
        overSidx(list, fn) {
          const item = mGet(list, this._idx)
          if (item) {
            fn(item)
          }
        },
        isMode(mode) {
          return this._idx !== -1 && R.equals(this._type, mode)
        },
        get isEdit() {
          return this.isMode(EDIT_MODE)
        },
        get isSelect() {
          return this.isMode(SELECT_MODE)
        },
      },
      actions: {
        cycleSidx(listLength) {
          mReaction(
            () => [viewMode.sidx],
            () => {
              if (viewMode.sidx >= listLength) {
                viewMode.sidx = 0
              }
              if (viewMode.sidx < 0) {
                viewMode.sidx = listLength - 1
              }
            },
          )

          mReaction(
            () => [listLength],
            ([listLength]) => {
              if (listLength > 0) {
                viewMode.sidx = R.clamp(
                  0,
                  listLength - 1,
                  viewMode.sidx,
                )
              } else {
                viewMode.sidx = -1
              }
            },
          )
        },
        toggle() {
          this._type = this.overMode({
            SELECT_MODE: _.always(EDIT_MODE),
            EDIT_MODE: _.always(SELECT_MODE),
          })
        },
        switchToSelect() {
          this._type = SELECT_MODE
        },
        switchToEdit(idx = this._idx) {
          this._type = EDIT_MODE
          this._idx = idx
        },
      },
      name: 'ViewMode',
    })
    return viewMode
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
          return view.mode.isEdit && R.equals(note.id, view.sid)
        },
        get isSelected() {
          return view.mode.isSelect && R.equals(note.id, view.sid)
        },
        onToggleDeleteEvent() {
          note.toggleDeleted()
        },
        onTextChange(e) {
          const target = e.target
          note.updateText(target.value)
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
      {},
      {name: 'DisplayNote'},
    ),
  ),
)

export function NoteListView({nc}) {
  const view = createObservableObject({
    props: {
      mode: ViewMode.create(),
      get sid() {
        return R.pathOr(
          null,
          ['noteDisplayList', view.mode.sidx, 'id'],
          view,
        )
      },
      pred: R.allPass([]),
      sortComparators: [R.ascend(R.prop('sortIdx'))],
      get noteDisplayList() {
        return R.compose(oArray, R.map(noteTransformer(view)))(
          this.noteModelList,
        )
      },
      get noteModelList() {
        return R.compose(
          oArray,
          R.sortWith(this.sortComparators),
          R.filter(this.pred),
        )(nc.active)
      },
    },
    actions: {
      updateSortIdx() {
        this.noteModelList.forEach((n, idx) => (n.sortIdx = idx))
      },
      addNewAt(idx) {
        const newNote = nc.newNote({sortIdx: idx - 1})
        nc.add(newNote)
        this.mode.switchToEdit(idx)
      },
      onAddNewNoteEvent() {
        this.addNewAt(0)
      },
      onToggleDeleteSelectedEvent() {
        this.mode.overSidx(this.noteDisplayList, dn =>
          dn.onToggleDeleteEvent(),
        )
      },
      insertAbove() {
        this.addNewAt(this.mode.sidx)
      },
      insertBelow() {
        this.addNewAt(this.mode.sidx + 1)
      },
      gotoNext() {
        this.mode.sidx += 1
      },
      gotoPrev() {
        this.mode.sidx -= 1
      },
      onEnterKey() {
        if (this.noteDisplayList.length === 0) {
          return
        }
        this.mode.toggle()
      },
      onEscapeKey() {
        this.mode.switchToSelect()
      },
    },
    name: 'NoteListView',
  })

  view.mode.cycleSidx(mComputed(() => view.noteDisplayList.length))

  // mReaction(
  //   () => [view.mode.sidx],
  //   () => {
  //     if (view.mode.sidx >= view.noteDisplayList.length) {
  //       view.mode.sidx = 0
  //     }
  //     if (view.mode.sidx < 0) {
  //       view.mode.sidx = view.noteDisplayList.length - 1
  //     }
  //   },
  // )

  mReaction(
    () => [view.noteDisplayList.length],
    () => {
      view.updateSortIdx()
    },
  )

  return view
}
