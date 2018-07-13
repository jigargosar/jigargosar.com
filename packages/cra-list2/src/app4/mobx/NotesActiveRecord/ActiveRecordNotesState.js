import {
  _,
  constant,
  idEq,
  isIndexOutOfBounds,
  isNilOrEmpty,
  isNotEmpty,
  isNotNil,
  maybeHead,
  maybeOr,
  maybeOrElse,
  nop,
  validate,
} from '../../little-ramda'
import {
  attachDelegatingPropertyGetters,
  createObservableObject,
  createTransformer,
} from '../little-mobx'
import {
  elFocus,
  elSetSelectionRange,
  isAnyHotKey,
  tryCatchLogFindDOMNode,
  wrapPD,
} from '../../components/utils'
import {getActiveQuery, Notes} from './NotesActiveRecord'
import {nanoid} from '../../model/util'
import S from 'sanctuary'

function createDisplayNoteTransformer(view) {
  console.debug('createDisplayNoteTransformer for', view)
  validate('O', [view])
  const transformer = note => {
    validate('O', [note])
    const _debugName = `DN-${nanoid(4)}-${note.id.slice(0, 9)}`
    const displayNote = createObservableObject({
      props: {
        _debugName,
        textInputRef: null,
        get isCollapseButtonDisabled() {
          return !this.hasChildren
        },
        get navLinkText() {
          return _.when(isNilOrEmpty, constant('(empty)'))(this.text)
        },
        get maybeParentId() {
          return S.toMaybe(note.parentId)
        },
        get maybeParentNote() {
          return S.map(id => view.findById(id))(this.maybeParentId)
        },
        get lastVisibleLeafNoteOrSelf() {
          return S.pipe([
            S.last,
            S.map(last => last.lastVisibleLeafNoteOrSelf),
            maybeOr(this),
          ])(this.visibleChildNotes)
        },
        get childNotes() {
          return view.findAllWithParentId(note.id)
        },
        get hasChildren() {
          return isNotEmpty(this.childNotes)
        },
        get visibleChildNotes() {
          return note.collapsed ? [] : this.childNotes
        },
        get hasVisibleChildren() {
          return isNotEmpty(this.visibleChildNotes)
        },
        maybeSiblingAtOffset(num) {
          const maybeChildAtOffsetFrom = (
            child,
            offset,
          ) => parent => {
            const children = parent.childNotes
            const childIdx = _.findIndex(idEq(child.id), children)
            console.assert(childIdx !== -1)
            const nextIdx = childIdx + offset
            return isIndexOutOfBounds(nextIdx)(children)
              ? S.Nothing
              : S.Just(children[nextIdx])
          }

          return S.chain(maybeChildAtOffsetFrom(this, num))(
            this.maybeParentNote,
          )
          // return S.at(this.index + num)(this.siblingNotes)
        },
        get maybeNextSiblingNote() {
          return this.maybeSiblingAtOffset(1)
        },
        get maybePreviousSiblingNote() {
          return this.maybeSiblingAtOffset(-1)
        },
        get maybeFirstVisibleChildNote() {
          return maybeHead(this.visibleChildNotes)
        },
        get firstChildNote() {
          return _.head(this.childNotes)
        },
        get textInputHandlers() {
          return {
            onChange: this.onTextChange,
            onFocus: this.onTextFocus,
            onBlur: nop,
            onKeyDown: this.onTextKeyDown,
          }
        },
      },
      actions: {
        tryFocusTextInput() {
          requestAnimationFrame(() => this.focusTextInput())
        },
        focusTextInput() {
          if (!this.textInputRef) {
            // debugger
            return
          }
          tryCatchLogFindDOMNode(
            _.compose(
              elSetSelectionRange({start: 0, end: 0}),
              elFocus,
            ),
          )(this.textInputRef)
        },
        onTextInputRef(ref) {
          this.textInputRef = ref
          view.onDisplayNoteTextInputRef(ref, this)
        },
        onAddChild() {
          view.prependNewChildNote(note)
        },
        onEnterKeyDown(e) {
          const [start /*, end*/] = [
            e.target.selectionStart,
            e.target.selectionEnd,
          ]
          if (start === 0) {
            view.prependSibling(note)
          } else {
            view.appendSibling(note)
          }
        },
        onBackspaceKeyDown(e) {
          if (_.isEmpty(e.target.value)) {
            view.navigateToPreviousDisplayNote(this)
            this.onDelete()
          }
        },
        update(values) {
          // Notes.upsert({id: note.id, ...values})
          view.upsert({id: note.id, ...values})
        },
        updateAndQueueFocus(values) {
          // Notes.upsert({id: note.id, ...values})
          view.upsertAndQueueFocus({id: note.id, ...values})
        },
        onDelete() {
          this.update({deleted: true})
        },
        onTextChange(e) {
          this.update({text: e.target.value})
        },
        onToggleExpand() {
          if (!this.hasChildren) {
            return
          }
          this.updateAndQueueFocus({collapsed: !note.collapsed})
        },
        onExpandKeyDown() {
          if (!this.hasChildren) {
            return
          }
          this.update({collapsed: false})
        },
        onCollapseKeyDown() {
          if (!this.hasChildren) {
            return
          }
          this.update({collapsed: true})
        },
        onTextFocus(e) {
          e.target.setSelectionRange(0, 0)
        },
        onTextKeyDown(e) {
          _.cond([
            [isAnyHotKey(['enter']), this.onEnterKeyDown],
            [isAnyHotKey(['escape']), wrapPD(nop)],
            [isAnyHotKey(['up']), wrapPD(this.onUpArrowKey)],
            [isAnyHotKey(['down']), wrapPD(this.onDownArrowKey)],
            [isAnyHotKey(['mod+.']), wrapPD(this.onZoomIn)],
            [isAnyHotKey(['mod+,']), wrapPD(this.onZoomOut)],
            [isAnyHotKey(['tab']), wrapPD(nop)],
            [isAnyHotKey(['shift+tab']), this.onShiftTabKeyDown],
            [isAnyHotKey(['backspace']), this.onBackspaceKeyDown],
            [isAnyHotKey(['mod+up']), wrapPD(this.onCollapseKeyDown)],
            [isAnyHotKey(['mod+down']), wrapPD(this.onExpandKeyDown)],
          ])(e)
        },
        onZoomIn() {
          view.zoomIntoDisplayNote(this)
        },
        onZoomOut(e) {
          e.preventDefault()
          view.zoomOutFromDisplayNote(this)
        },
        onDownArrowKey() {
          view.navigateToNextDisplayNote(this)
        },
        onUpArrowKey() {
          view.navigateToPreviousDisplayNote(this)
        },
        onShiftTabKeyDown(e) {
          if (this.parentId === view.currentRoot.id) {
          } else {
            e.preventDefault()
          }
        },
      },
      name: _debugName,
    })
    attachDelegatingPropertyGetters(
      note,
      displayNote,
      Notes.allFieldNames,
    )
    return displayNote
  }
  return createTransformer(transformer, (dn, n) => {
    console.debug(`destroying`, dn._debugName, n)
  })
}

function maybeFocusDisplayNoteTextInput(maybeDisplayNoteToFocus) {
  console.log(
    `maybeDisplayNoteToFocus.text`,
    S.maybe_(() => '!!Not Found!!')(_.prop('text'))(
      maybeDisplayNoteToFocus,
    ),
  )
  S.map(fdn => fdn.focusTextInput())(maybeDisplayNoteToFocus)
}

function View() {
  const view = createObservableObject({
    props: {
      rootNote: null,
      maybeZoomedNote: S.Nothing,
      displayNoteTransformer: null,
      shouldFocusOnRefQueue: [],
      get currentRoot() {
        const note = maybeOr(this.rootNote)(this.maybeZoomedNote)
        validate('O', [note])
        return note
      },
      get currentNotesList() {
        return this.currentRoot.childNotes
      },
      findAll(options) {
        return _.map(
          this.displayNoteTransformer,
          Notes.findAll(options),
        )
      },

      findById(id) {
        return this.displayNoteTransformer(Notes.findById(id))
      },

      findAllWithParentId(parentId) {
        return this.findAll(
          getActiveQuery({
            filters: [_.propEq('parentId', parentId)],
          }),
        )
      },
    },
    actions: {
      onDisplayNoteTextInputRef(ref, dn) {
        if (ref && _.contains(dn.id, this.shouldFocusOnRefQueue)) {
          dn.focusTextInput()
          this.shouldFocusOnRefQueue = _.without(
            [dn.id],
            this.shouldFocusOnRefQueue,
          )
        }
      },
      navigateToNextDisplayNote(dn) {
        const maybeFDN = _.compose(
          maybeOrElse(() =>
            S.chain(parentNote => parentNote.maybeNextSiblingNote)(
              dn.maybeParentNote,
            ),
          ),
          maybeOrElse(() => dn.maybeNextSiblingNote),
        )(dn.maybeFirstVisibleChildNote)

        maybeFocusDisplayNoteTextInput(maybeFDN)
      },
      navigateToPreviousDisplayNote(dn) {
        const maybeFDN = _.compose(
          maybeOrElse(() => dn.maybeParentNote),
          S.map(
            prevSiblingNote =>
              prevSiblingNote.lastVisibleLeafNoteOrSelf,
          ),
        )(dn.maybePreviousSiblingNote)

        maybeFocusDisplayNoteTextInput(maybeFDN)
      },
      indentDisplayNote() {},
      upsert(values) {
        const {id} = values
        const newNote = Notes.upsert(values)
        if (_.isNil(id) && isNotNil(newNote.parentId)) {
          const parent = this.findById(newNote.parentId)
          parent.childNotes.forEach(({id}, sortIdx) => {
            Notes.upsert({id, sortIdx})
          })
        }
        return newNote
      },
      queueFocusOnRefChange({id}) {
        this.shouldFocusOnRefQueue.push(id)
      },
      upsertAndQueueFocus(values) {
        const note = this.upsert(values)
        if (_.isNil(values.id)) {
          this.queueFocusOnRefChange(note)
        } else {
          this.findById(values.id).focusTextInput()
        }
        return note
      },
      prependNewChildNote(note) {
        const sortIdx = _.defaultTo(0, note.sortIdx)
        this.upsertAndQueueFocus({
          parentId: note.id,
          sortIdx: sortIdx - 1,
        })
      },
      appendSibling(note) {
        const sortIdx = _.defaultTo(0, note.sortIdx)
        this.upsertAndQueueFocus({
          parentId: note.parentId,
          sortIdx: sortIdx,
        })
      },
      prependSibling(note) {
        const sortIdx = _.defaultTo(0, note.sortIdx)
        this.upsertAndQueueFocus({
          parentId: note.parentId,
          sortIdx: sortIdx - 1,
        })
      },
      zoomIntoDisplayNote(dn) {
        this.maybeZoomedNote = S.Just(dn)
        this.focusOnZoomChange()
      },
      zoomOutFromDisplayNote(dn) {
        this.maybeZoomedNote = this.currentRoot.maybeParentNote
        this.focusOnZoomChange()
        this.queueFocusOnRefChange(dn)
      },
      focusOnZoomChange() {
        const dnToFocus = _.when(_.isNil, constant(this.currentRoot))(
          this.currentRoot.firstChildNote,
        )
        this.queueFocusOnRefChange(dnToFocus)
      },
      init() {
        this.displayNoteTransformer = createDisplayNoteTransformer(
          view,
        )

        this.rootNote = _.compose(
          _.when(_.isNil, () => this.findById(this.upsert().id)),
          _.head,
        )(this.findAll({filter: _.propEq('parentId', null)}))

        console.assert(isNotNil(this.currentRoot))

        this.focusOnZoomChange()
      },
    },
    name: 'view',
  })

  view.init()

  return view
}

export const state = {view: View()}
