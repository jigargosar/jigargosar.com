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
import {isAnyHotKey, wrapPD} from '../../components/utils'
import {getActiveQuery, Notes} from './NotesActiveRecord'
import {nanoid} from '../../model/util'
import S from 'sanctuary'

let count = 0

function createDisplayNoteTransformer(view) {
  console.debug('createDisplayNoteTransformer for', view)
  validate('O', [view])
  const transformer = note => {
    validate('O', [note])
    count += 1
    console.debug('creating DisplayNote', count)
    const _debugName = `DN-${nanoid(4)}-${note.id.slice(0, 9)}`
    const displayNote = createObservableObject({
      props: {
        _debugName,
        get shouldFocus() {
          return view.shouldFocusDisplayNoteTextInput(this)
        },
        get isCollapseButtonDisabled() {
          return !this.hasChildren
        },
        get navLinkText() {
          return _.when(isNilOrEmpty, constant('(empty)'))(this.text)
        },
        get parentAncestors() {
          return S.pipe([
            S.map(parentNote => [
              ...parentNote.parentAncestors,
              this,
            ]),
            maybeOr([]),
          ])(this.maybeParentNote)
        },
        get ancestors_() {
          return [...this.parentAncestors, this]
        },
        get ancestors() {
          return S.pipe([
            S.map(parentNote => [...parentNote.ancestors, this]),
            maybeOr([]),
          ])(this.maybeParentNote)
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
        get maybePreviousSiblingNoteId() {
          return S.map(n => n.id)(this.maybeSiblingAtOffset(-1))
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
        get sortIdxOrZero() {
          return _.defaultTo(0, this.sortIdx)
        },
      },
      actions: {
        insertChild({id, ...values}) {
          validate('Z', [id])
          view.upsertAndSetFocused({
            ...values,
            parentId: this.id,
          })
        },
        insertSibling({id, ...values}) {
          validate('Z', [id])
          view.upsertAndSetFocused({
            ...values,
            parentId: this.parentId,
          })
        },
        update(values) {
          return view.update(values, this)
        },
        updateAndSetFocused(values) {
          return view.update(values, this)
        },
        onAddChild() {
          this.insertChild({sortIdx: -1})
        },
        appendSibling() {
          this.insertSibling({sortIdx: this.sortIdxOrZero})
        },
        prependSibling() {
          this.insertSibling({sortIdx: this.sortIdxOrZero - 1})
        },
        onEnterKeyDown(e) {
          const [start /*, end*/] = [
            e.target.selectionStart,
            e.target.selectionEnd,
          ]
          if (start === 0) {
            this.prependSibling()
          } else {
            this.appendSibling()
          }
        },
        onBackspaceKeyDown(e) {
          if (_.isEmpty(e.target.value)) {
            this.navigateToPreviousDisplayNote()
            this.onDelete()
          }
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
          this.updateAndSetFocused({collapsed: !note.collapsed})
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
            [isAnyHotKey(['tab']), this.onTabKeyDown],
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
        onNavLinkClicked(e) {
          e.preventDefault()
          view.zoomOutTillDisplayNote(this)
        },
        onDownArrowKey() {
          this.navigateToNextDisplayNote()
        },
        onUpArrowKey() {
          this.navigateToPreviousDisplayNote()
        },
        navigateToNextDisplayNote() {
          const maybeFDN = _.compose(
            maybeOrElse(() =>
              S.chain(parentNote => parentNote.maybeNextSiblingNote)(
                this.maybeParentNote,
              ),
            ),
            maybeOrElse(() => this.maybeNextSiblingNote),
          )(this.maybeFirstVisibleChildNote)
          view.maybeSetFocusedDisplayNote(maybeFDN)

          // maybeFocusDisplayNoteTextInput(maybeFDN)
        },
        navigateToPreviousDisplayNote() {
          const maybeFDN = _.compose(
            maybeOrElse(() => this.maybeParentNote),
            S.map(
              prevSiblingNote =>
                prevSiblingNote.lastVisibleLeafNoteOrSelf,
            ),
          )(this.maybePreviousSiblingNote)
          view.maybeSetFocusedDisplayNote(maybeFDN)

          // maybeFocusDisplayNoteTextInput(maybeFDN)
        },
        onShiftTabKeyDown(e) {
          const isAtLeftEdge = this.parentId === view.currentRoot.id
          if (isAtLeftEdge) {
            e.preventDefault()
            e.stopPropagation()
          } else {
            S.map(parent => {
              e.preventDefault()
              e.stopPropagation()
              return this.updateAndSetFocused({
                parentId: parent.parentId,
                sortIdx: parent.sortIdxOrZero,
              })
            })(this.maybeParentNote)
          }
        },
        onTabKeyDown(e) {
          S.map(prevSibling => {
            e.preventDefault()
            e.stopPropagation()
            return this.updateAndSetFocused({
              parentId: prevSibling.id,
              sortIdx: prevSibling.childNotes.length,
            })
          })(this.maybePreviousSiblingNote)
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

function View() {
  const view = createObservableObject({
    props: {
      rootNote: null,
      maybeZoomedNote: S.Nothing,
      nullableFocusedNoteId: null,
      displayNoteTransformer: null,
      get currentRoot() {
        const note = maybeOr(this.rootNote)(this.maybeZoomedNote)
        validate('O', [note])
        return note
      },
      get currentAncestors() {
        return this.currentRoot.ancestors
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
        if (this.rootNote && this.rootNote.id === id) {
          return this.rootNote
        }
        if (this.currentRoot && this.currentRoot.id === id) {
          return this.currentRoot
        }
        return this.displayNoteTransformer(Notes.findById(id))
      },

      findAllWithParentId(parentId) {
        return this.findAll(
          getActiveQuery({
            filters: [_.propEq('parentId', parentId)],
          }),
        )
      },
      shouldFocusDisplayNoteTextInput(dn) {
        return this.nullableFocusedNoteId === dn.id
      },
    },
    actions: {
      maybeSetFocusedDisplayNote(maybeDN) {
        const nullableId = S.pipe([
          S.map(dn => dn.id),
          S.maybeToNullable,
        ])(maybeDN)
        if (isNotNil(nullableId)) {
          this.setFocusedNoteId(nullableId)
        }
      },
      setFocusedNoteId(id) {
        validate('S', [id])
        this.nullableFocusedNoteId = id
      },
      indentDisplayNote() {},
      sortChildrenWithParentId(parentId) {
        if (_.isNil(parentId)) {
          return
        }
        const parent = this.findById(parentId)
        parent.childNotes.forEach(({id}, sortIdx) => {
          Notes.upsert({id, sortIdx})
        })
      },
      upsert(values = {}) {
        const {id} = values
        const upsertedNote = Notes.upsert(values)
        if (_.isNil(id)) {
          this.sortChildrenWithParentId(upsertedNote.parentId)
        }
        return upsertedNote
      },
      upsertAndSetFocused(values) {
        const note = this.upsert(values)
        this.setFocusedNoteId(note.id)
        return note
      },
      update(values, {id, parentId}) {
        const updatedNote = this.upsert({...values, id})
        if (values.parentId !== parentId) {
          this.sortChildrenWithParentId(values.parentId)
          this.sortChildrenWithParentId(parentId)
        }
        return updatedNote
      },
      updateAndSetFocused(values, dn) {
        validate('OO', [values, dn])

        const note = this.update(values, dn)
        this.setFocusedNoteId(note.id)
        return note
      },
      zoomIntoDisplayNote(dn) {
        this.maybeZoomedNote = S.Just(dn)
      },
      zoomOutFromDisplayNote(dn) {
        this.maybeZoomedNote = this.currentRoot.maybeParentNote
      },
      zoomOutTillDisplayNote(dn) {
        this.maybeZoomedNote = S.Just(dn)
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
      },
    },
    name: 'view',
  })

  view.init()

  return view
}

export const state = {view: View()}
