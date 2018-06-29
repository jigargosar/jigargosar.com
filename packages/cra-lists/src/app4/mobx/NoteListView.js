import {
  createObservableObject,
  createTransformer,
  mGet,
  mReaction,
  oArray,
  oObject,
} from './utils'
import {_, R} from '../utils'
import {clampIdx, cycleIdx} from '../model/util'

const SELECT_MODE = 'SELECT_MODE'
const EDIT_MODE = 'EDIT_MODE'

const ViewMode = (() => {
  function create() {
    const viewMode = createObservableObject({
      props: {
        _type: SELECT_MODE,
        _idx: 0,
        get sidx() {
          return this._idx
        },
        overMode(cases) {
          return cases[this._type](this._idx)
        },
        overListWithSidx(list, fn) {
          const item = mGet(list, this._idx)
          if (item) {
            fn(item, this._idx)
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
          this.overSidx(cycleIdx(listLength))
        },
        clampSidx(listLength) {
          this.overSidx(clampIdx(listLength))
        },
        overSidx(fn) {
          this._idx = fn(this._idx)
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
        _updateSortIndex: note.updateSortIdx,
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
        return R.compose(
          oArray,
          R.map(noteTransformer(view)),
          R.sortWith(this.sortComparators),
          R.filter(this.pred),
        )(nc.active)
      },
    },
    actions: {
      updateSortIdx() {
        // debugger
        this.noteDisplayList.forEach((n, idx) =>
          n._updateSortIndex(idx),
        )
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
        this.mode.overListWithSidx(this.noteDisplayList, dn =>
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
        this.mode.overSidx(_.inc)
      },
      moveDown() {
        const sidx = this.mode.sidx
        const listLength = this.noteDisplayList.length
        if (listLength <= 1 || sidx >= listLength - 1) {
          return
        }
        const a = this.noteDisplayList
        const [x, y] = [sidx, sidx + 1]
        a.splice(y, 1, a.splice(x, 1, a[y])[0])
        this.updateSortIdx()
        this.gotoNext()
      },
      moveUp() {
        const sidx = this.mode.sidx
        const listLength = this.noteDisplayList.length
        if (listLength <= 1 || sidx <= 0) {
          return
        }
        const a = this.noteDisplayList
        const [x, y] = [sidx - 1, sidx]
        a.splice(y, 1, a.splice(x, 1, a[y])[0])
        this.updateSortIdx()
        this.gotoNext()
      },
      gotoPrev() {
        this.mode.overSidx(_.dec)
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

  mReaction(
    () => [view.mode.sidx],
    () => {
      view.mode.cycleSidx(view.noteDisplayList.length)
    },
    {name: 'cycleIdx'},
  )

  mReaction(
    () => [view.noteDisplayList.length],
    ([listLength]) => {
      view.mode.clampSidx(listLength)
      view.updateSortIdx()
    },
  )

  return view
}
