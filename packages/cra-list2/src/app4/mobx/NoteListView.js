import {
  createObservableObject,
  createTransformer,
  mGet,
  mReaction,
  oArray,
  oObject,
} from './little-mobx'
import {_, swapElementsAt} from '../little-ramda'
import {clampIdx, cycleIdx} from '../model/utils'
import escapeStringRegexp from 'escape-string-regexp'
import {getParsedQS} from '../services/Location'

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
        overListItemWithSidx(list, fn) {
          const item = mGet(list, this._idx)
          if (item) {
            fn(item, this._idx)
          }
        },
        isMode(mode) {
          return this._idx !== -1 && _.equals(this._type, mode)
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
          return _.when(_.isEmpty, _.always('<empty>'))(note.text)
        },
        get isEditing() {
          return view.mode.isEdit && _.equals(note.id, view.sid)
        },
        get isSelected() {
          return view.mode.isSelect && _.equals(note.id, view.sid)
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
        get actorId() {
          return note.actorId
        },
        get createdAt() {
          return note.createdAt
        },
        get modifiedAt() {
          return note.modifiedAt
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
        return _.pathOr(
          null,
          ['noteDisplayList', this.sidx, 'id'],
          this,
        )
      },
      get sidx() {
        return this.mode.sidx
      },
      get pred() {
        const parsedQS = getParsedQS()

        // console.log(`parsed`, parsedQS)
        const urlPred = _.ifElse(
          _.has('url'),
          ({url}) => note =>
            _.compose(
              _.test(_.__, note.text),
              str => new RegExp(str),
              escapeStringRegexp,
            )(url),
          () => _.T,
        )(parsedQS)
        return _.allPass([urlPred])
      },
      sortComparators: [
        _.ascend(_.prop('sortIdx')),
        _.descend(_.prop('createdAt')),
      ],
      get noteDisplayList() {
        return _.compose(
          oArray,
          _.map(noteTransformer(view)),
          _.sortWith(this.sortComparators),
          _.filter(this.pred),
        )(nc.active)
      },
      findDisplayNoteById(id) {
        return this.noteDisplayList.find(_.propEq('id', id))
      },
    },
    actions: {
      updateSortIdx(list = this.noteDisplayList) {
        list.forEach((n, idx) => n._updateSortIndex(idx))
      },
      addNewAt(idx) {
        const newNote = nc.newNote({sortIdx: idx - 1})
        nc.add(newNote)
        this.updateSortIdx()
        this.mode.switchToEdit(idx)
      },
      cyclicMoveBy(moveBy) {
        const listLength = this.noteDisplayList.length
        if (listLength <= 1) {
          return
        }
        const newSidx = cycleIdx(listLength, this.sidx + moveBy)
        const swappedList = swapElementsAt(
          this.sidx,
          newSidx,
          this.noteDisplayList,
        )
        this.updateSortIdx(swappedList)
        this.mode.overSidx(_.always(newSidx))
      },
      onAddNewNoteEvent() {
        this.addNewAt(0)
      },
      onToggleDeleteSelectedEvent() {
        this.mode.overListItemWithSidx(this.noteDisplayList, dn =>
          dn.onToggleDeleteEvent(),
        )
        this.updateSortIdx()
      },
      insertAbove() {
        this.addNewAt(this.sidx)
      },
      insertBelow() {
        this.addNewAt(this.sidx + 1)
      },
      gotoNext: function() {
        this.mode.overSidx(_.inc)
      },
      gotoPrev: function() {
        this.mode.overSidx(_.dec)
      },
      moveDown() {
        this.cyclicMoveBy(1)
      },
      moveUp() {
        this.cyclicMoveBy(-1)
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
      // view.updateSortIdx()
    },
  )

  return view
}
