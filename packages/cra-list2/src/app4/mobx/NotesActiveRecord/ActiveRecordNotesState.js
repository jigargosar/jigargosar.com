import {
  _,
  constant,
  idEq,
  isIndexOutOfBounds,
  isNilOrEmpty,
  isNotEmpty,
  isNotNil,
  maybeOr,
  maybeOrElse,
  nop,
  throttle,
  validate,
} from '../../little-ramda'
import {
  attachDelegatingPropertyGetters,
  createObservableObject,
  createTransformer,
  Disposers,
  mAutoRun,
  mTrace,
  oArray,
} from '../little-mobx'
import {isAnyHotKey, wrapPD} from '../../components/utils'
import {
  findAllActiveNotes,
  getOrUpsertRootNote,
  Notes,
} from './NotesActiveRecord'
import {nanoid} from '../../model/util'
import S from 'sanctuary'

function createDisplayNoteTransformer(view) {
  console.debug('createDisplayNoteTransformer for', view)
  validate('O', [view])
  const transformerFn = note => {
    validate('O', [note])
    const _debugName = `DN-${nanoid(4)}-${note.id.slice(0, 9)}`
    const displayNote = createObservableObject({
      props: {
        _debugName,
        get textInputValue() {
          return _.defaultTo('', this.text)
        },
        get shouldFocus() {
          return view.shouldFocusDisplayNoteTextInput(this)
        },
        get isCollapseButtonDisabled() {
          return !this.hasChildren
        },
        get navLinkText() {
          return _.when(isNilOrEmpty, constant('(empty)'))(this.text)
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
        get lastVisibleLeafNoteOrSelf() {
          return S.pipe([
            S.last,
            S.map(last => last.lastVisibleLeafNoteOrSelf),
            maybeOr(this),
          ])(this.visibleChildNotes)
        },
        get hasChildren() {
          return isNotEmpty(this.childNotes)
        },
        get isCurrentRoot() {
          return view.currentRootDisplayNote.id === this.id
        },
        get isExpanded() {
          return !this.isCollapsed
        },
        get isCollapsed() {
          return note.collapsed
        },
        get visibleChildNotes() {
          return this.isExpanded || this.isCurrentRoot
            ? this.childNotes
            : []
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
          return S.head(this.visibleChildNotes)
        },
        get maybeFirstChildNote() {
          return S.head(this.childNotes)
        },
        get textInputHandlers() {
          return this.isCurrentRoot
            ? this.currentRootTextInputHandlers
            : this.nonRootTextInputHandlers
        },
        get nonRootTextInputHandlers() {
          return {
            onChange: this.onTextChange,
            onFocus: this.onTextFocus,
            onKeyDown: this.onTextKeyDown,
          }
        },
        get currentRootTextInputHandlers() {
          return {
            onChange: this.onTextChange,
            onKeyDown: this.onCurrentRootTextKeyDown,
          }
        },
        get sortIdxOrZero() {
          return _.defaultTo(0, this.sortIdx)
        },
        get hasHiddenChildren() {
          return this.hasChildren && !this.hasVisibleChildren
        },
        hasDecedentsWithId(id) {
          return this.hasChildWithId(id)
            ? true
            : _.compose(
                isNotNil,
                _.find(cn => cn.hasDecedentsWithId(id)),
              )(this.childNotes)
        },
        hasChildWithId(id) {
          return _.compose(isNotNil, _.find(idEq(id)))(
            this.childNotes,
          )
        },
        hasHiddenChildrenWithId(id) {
          return this.hasHiddenChildren && this.hasDecedentsWithId(id)
        },
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
        appendSibling() {
          this.insertSibling({sortIdx: this.sortIdxOrZero})
        },
        prependSibling() {
          this.insertSibling({sortIdx: this.sortIdxOrZero - 1})
        },
        get childNotes() {
          return view.lookupChildDisplayNotes(this)
        },
        get maybeParentNote() {
          return view.maybeLookupParentDisplayNote(this)
        },
      },
      actions: {
        update(values) {
          return view.update(values, this)
        },
        updateAndSetFocused(values) {
          return view.updateAndSetFocused(values, this)
        },
        onAddChild() {
          this.insertChild({sortIdx: -1})
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
          this.updateAndSetFocused({collapsed: !this.isCollapsed})
        },
        onExpandKeyDown() {
          if (this.hasChildren) {
            this.update({collapsed: false})
            this.navigateToFirstChildNote()
          } else {
            this.navigateToNextDisplayNote()
          }
        },
        onCollapseKeyDown() {
          if (this.hasVisibleChildren) {
            this.update({collapsed: true})
          } else {
            this.navigateToParent()
          }
        },
        onTextFocus(e) {
          e.target.setSelectionRange(0, 0)
        },
        onZoomIn() {
          view.zoomIntoNote(note)
        },
        onZoomOut(e) {
          e.preventDefault()
          view.zoomOutOneLevel()
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
        navigateToParent() {
          view.maybeSetFocusedDisplayNote(this.maybeParentNote)
        },
        navigateToFirstChildNote() {
          view.maybeSetFocusedDisplayNote(this.maybeFirstChildNote)
        },
        navigateToNextDisplayNote() {
          const computeNext = dn =>
            maybeOrElse(() =>
              S.chain(computeNext)(dn.maybeParentNote),
            )(dn.maybeNextSiblingNote)

          const maybeFDN = maybeOrElse(() => computeNext(this))(
            this.maybeFirstVisibleChildNote,
          )
          view.maybeSetFocusedDisplayNote(maybeFDN)
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
          const isAtLeftEdge =
            this.parentId === view.currentRootDisplayNote.id
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
        onTextKeyDown: throttle(
          function(e) {
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
              [isAnyHotKey(['mod+up']), this.onCollapseKeyDown],
              [isAnyHotKey(['mod+down']), this.onExpandKeyDown],
            ])(e)
          },
          0,
          {leading: true, trailing: false},
        ),
        onCurrentRootTextKeyDown(e) {
          _.cond([
            // [isAnyHotKey(['enter']), this.onEnterKeyDown],
            // [isAnyHotKey(['escape']), wrapPD(nop)],
            // [isAnyHotKey(['up']), wrapPD(this.onUpArrowKey)],
            [isAnyHotKey(['down']), wrapPD(this.onDownArrowKey)],
            // [isAnyHotKey(['mod+.']), wrapPD(this.onZoomIn)],
            [isAnyHotKey(['mod+,']), wrapPD(this.onZoomOut)],
            // [isAnyHotKey(['tab']), this.onTabKeyDown],
            // [isAnyHotKey(['shift+tab']), this.onShiftTabKeyDown],
            // [isAnyHotKey(['backspace']), this.onBackspaceKeyDown],
            // [isAnyHotKey(['mod+up']), this.onCollapseKeyDown],
            // [isAnyHotKey(['mod+down']), this.onExpandKeyDown],
          ])(e)
        },
      },
      name: _debugName,
    })
    attachDelegatingPropertyGetters(
      note,
      displayNote,
      Notes.allFieldNames,
    )
    // console.log('DN: NEW', note.text, _debugName)
    return displayNote
  }

  const displayNoteTransformer = createTransformer(
    transformerFn,
    (dn, n) => {
      console.debug(`DN: DEL`, n.text, dn._debugName, n)
    },
  )
  return displayNoteTransformer
}

function View() {
  const view = createObservableObject({
    props: {
      notesIdLookup: {},
      parentIdToActiveChildrenLookup: {},
      rootNote: getOrUpsertRootNote(),
      get rootDisplayNote() {
        return this.displayNoteTransformer(this.rootNote)
      },
      maybeZoomedNote: S.Nothing,
      get maybeZoomedDisplayNote() {
        return S.map(this.displayNoteTransformer)(
          view.maybeZoomedNote,
        )
      },
      nullableFocusedNoteId: null,
      get displayNoteTransformer() {
        return createDisplayNoteTransformer(this)
      },
      get currentRootNote() {
        const note = maybeOr(this.rootNote)(this.maybeZoomedNote)
        validate('O', [note])
        return note
      },
      get currentRootDisplayNote() {
        const note = maybeOr(this.rootNote)(this.maybeZoomedNote)
        const displayNote = this.displayNoteTransformer(note)
        validate('O', [displayNote])
        return displayNote
      },
      get currentAncestors() {
        return this.currentRootDisplayNote.ancestors
      },
      get currentNotesList() {
        return this.currentRootDisplayNote.childNotes
      },
      lookupAllActiveNotesWithParentId(parentId) {
        return this.parentIdToActiveChildrenLookup[parentId] || []
      },
      lookupChildDisplayNotes({id}) {
        return _.map(this.displayNoteTransformer)(
          this.lookupAllActiveNotesWithParentId(id),
        )
      },
      maybeLookupParentDisplayNote({parentId}) {
        return S.map(this.displayNoteTransformer)(
          this.maybeLookupNoteById(parentId),
        )
      },
      maybeLookupParentNote({parentId}) {
        return this.maybeLookupNoteById(parentId)
      },
      maybeLookupNoteById(id) {
        return _.compose(S.toMaybe, _.prop(id))(this.notesIdLookup)
      },
      shouldFocusDisplayNoteTextInput(dn) {
        return _.isNil(this.nullableFocusedNoteId)
          ? dn.isCurrentRoot
          : this.nullableFocusedNoteId === dn.id ||
              dn.hasHiddenChildrenWithId(this.nullableFocusedNoteId)
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
      sortChildrenWithParentId(parentId) {
        if (_.isNil(parentId)) {
          return
        }
        const childNotes = this.lookupAllActiveNotesWithParentId(
          parentId,
        )
        childNotes.forEach(({id}, sortIdx) => {
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
      zoomIntoNote({id}) {
        this.maybeZoomedNote = this.maybeLookupNoteById(id)
        this.setFocusedNoteId(id)
      },
      zoomOutOneLevel() {
        this.maybeZoomedNote = this.maybeLookupParentNote(
          this.currentRootNote,
        )
      },
      zoomOutTillDisplayNote({id}) {
        this.maybeZoomedNote = this.maybeLookupNoteById(id)
      },
      updateNotesIdLookup(notes) {
        _.forEach(n => {
          this.notesIdLookup[n.id] = n
        })(notes)
        const oldKeys = _.keys(this.notesIdLookup)
        const newKeys = _.map(_.prop('id'))(notes)
        const keysToDelete = _.difference(oldKeys, newKeys)

        // console.log(`keysToDelete`, keysToDelete)
        _.forEach(id => {
          delete this.notesIdLookup[id]
        })(keysToDelete)
      },

      updateParentIdToActiveChildrenLookup(notes) {
        const childrenLookup = _.groupBy(
          _.propOr('null', 'parentId'),
        )(notes)

        _.forEachObjIndexed((children, pid) => {
          if (!this.parentIdToActiveChildrenLookup[pid]) {
            this.parentIdToActiveChildrenLookup[pid] = oArray([])
          }
          children.forEach((n, idx) => {
            this.parentIdToActiveChildrenLookup[pid][idx] = n
          })
          const newLength = children.length
          const oldLength = this.parentIdToActiveChildrenLookup[pid]
            .length
          if (newLength < oldLength) {
            this.parentIdToActiveChildrenLookup[pid].splice(
              newLength - 1,
              oldLength - newLength,
            )
          }
        })(childrenLookup)

        const oldKeys = _.keys(this.parentIdToActiveChildrenLookup)
        const newKeys = _.keys(childrenLookup)
        const keysToDelete = _.difference(oldKeys, newKeys)
        // console.log(`keysToDelete`, keysToDelete)

        _.forEach(id => {
          delete this.parentIdToActiveChildrenLookup[id]
        })(keysToDelete)
      },
    },
    name: 'view',
  })

  const disposers = Disposers()
  disposers.push(
    mAutoRun(
      r => {
        mTrace(r)
        const notes = findAllActiveNotes()
        view.updateNotesIdLookup(notes)
        view.updateParentIdToActiveChildrenLookup(notes)
      },
      {name: `[${nanoid(3)}] update lookup tables`},
    ),
  )

  if (module.hot) {
    module.hot.dispose(() => disposers.dispose())
  }

  // mAutoRun(
  //   r => {
  //     mTrace(r)
  //     const computed = mComputed(
  //       // () => view.notesIdLookup['Note@a3mNtpYzQojp6oLDHA5Tq'],
  //       () =>
  //         view.parentIdToActiveChildrenLookup[
  //           'Note@a3mNtpYzQojp6oLDHA5Tq'
  //         ],
  //       {
  //         name:
  //           "dynamic computed view.notesIdLookup['Note@a3mNtpYzQojp6oLDHA5Tq']",
  //       },
  //     )
  //
  //     console.log(
  //       `view.parentIdToActiveChildrenLookup['Note@a3mNtpYzQojp6oLDHA5Tq']`,
  //       computed.get(),
  //     )
  //   },
  //   {name: 'Notes ID lookup log'},
  // )

  console.assert(isNotNil(view.currentRootDisplayNote))

  return view
}

export const state = {view: View()}
