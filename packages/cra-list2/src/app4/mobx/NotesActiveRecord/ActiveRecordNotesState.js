import {
  _,
  constant,
  isIndexOutOfBounds,
  isNilOrEmpty,
  isNotNil,
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

const nCache = {}

function createDisplayNoteTransformer(view) {
  let counter = 0
  console.log('createDisplayNoteTransformer for', view)
  validate('O', [view])
  const transformer = note => {
    validate('O', [note])
    if (nCache[note.id]) {
      // debugger
    } else {
      nCache[note.id] = note
    }
    counter += 1
    const _debugName = `DN-${counter}--${note.id}`
    const displayNote = createObservableObject({
      props: {
        _debugName,
        textInputRef: null,
        get parentNote() {
          if (_.isNil(note.parentId)) {
            return null
          }
          return view.findById(note.parentId)
        },
        get lastLeafNote() {
          if (this.shouldDisplayChildren && this.lastChildNote) {
            return this.lastChildNote.lastLeafNote
          } else {
            return this
          }
        },
        get navLinkText() {
          return _.when(isNilOrEmpty, constant('(empty)'))(this.text)
        },
        get childNotes() {
          return view.findAllWithParentId(note.id)
        },
        get siblingNotes() {
          return this.parentNote.childNotes
        },
        get index() {
          const idx = _.indexOf(this, this.siblingNotes)
          console.assert(idx !== -1)
          return idx
        },
        get nextSiblingNote() {
          const nextIdx = this.index + 1
          if (isIndexOutOfBounds(nextIdx, this.siblingNotes)) {
            return null
          }
          return this.siblingNotes[nextIdx]
        },
        get prevSiblingNote() {
          const prevId = this.index - 1
          if (isIndexOutOfBounds(prevId, this.siblingNotes)) {
            return null
          }
          return this.siblingNotes[prevId]
        },
        get hasChildren() {
          return !_.isEmpty(this.childNotes)
        },
        get shouldDisplayChildren() {
          return this.hasChildren && !note.collapsed
        },
        get firstChildNote() {
          return _.head(this.childNotes)
        },
        get lastChildNote() {
          return _.last(this.childNotes)
        },
        get isCollapseButtonDisabled() {
          return !this.hasChildren
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
        onAddChild() {
          view.prependNewChildNote(note)
        },
        onAppendSibling() {
          view.appendSibling(note)
        },
        onTextInputRef(ref) {
          this.textInputRef = ref
          view.onDisplayNoteTextInputRef(ref, this)
        },
        update(values) {
          // Notes.upsert({id: note.id, ...values})
          view.upsert({id: note.id, ...values})
        },
        updateAndFocus(values) {
          // Notes.upsert({id: note.id, ...values})
          view.upsertAndFocus({id: note.id, ...values})
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
          this.updateAndFocus({collapsed: !note.collapsed})
        },
        onTextFocus(e) {
          e.target.setSelectionRange(0, 0)
        },
        onTextKeyDown(e) {
          _.cond([
            [isAnyHotKey(['enter']), wrapPD(this.onAppendSibling)],
            [isAnyHotKey(['escape']), wrapPD(nop)],
            [isAnyHotKey(['up']), wrapPD(this.onUpArrowKey)],
            [isAnyHotKey(['down']), wrapPD(this.onDownArrowKey)],
            [isAnyHotKey(['mod+.']), wrapPD(this.onZoomIn)],
            [isAnyHotKey(['tab']), wrapPD(nop)],
            [isAnyHotKey(['shift+tab']), this.onShiftTabKeyDown],
            [isAnyHotKey(['backspace']), this.onBackspaceKeyDown],
          ])(e)
        },
        onZoomIn() {
          view.zoomIntoDisplayNote(this)
        },
        onDownArrowKey() {
          view.focusNextDisplayNote(this)
        },
        onUpArrowKey() {
          view.focusPreviousDisplayNote(this)
        },
        onBackspaceKeyDown(e) {
          if (_.isEmpty(e.target.value)) {
            this.onDelete()
          }
        },
        onShiftTabKeyDown(e) {
          console.log(
            `this.parent === view.currentRoot`,
            this.parentNote,
            view.currentRoot,
          )
          if (this.parentNote.id === view.currentRoot.id) {
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

function View() {
  const view = createObservableObject({
    props: {
      rootNote: null,
      zoomedNote: null,
      displayNoteTransformer: null,
      shouldFocusOnRefCache: {},
      get currentRoot() {
        const note = this.zoomedNote || this.rootNote
        validate('O', [note])
        return note
      },
      get currentRootId() {
        return this.currentRoot.id
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
        if (ref && this.shouldFocusOnRefCache[dn.id]) {
          dn.focusTextInput()
          delete this.shouldFocusOnRefCache[dn.id]
        }
      },
      focusNextDisplayNote(dn) {
        if (dn.shouldDisplayChildren) {
          dn.firstChildNote.focusTextInput()
        } else {
          const nextSibling = dn.nextSiblingNote
          if (isNotNil(nextSibling)) {
            nextSibling.focusTextInput()
          } else {
            const parentDN = dn.parentNote
            if (parentDN && parentDN.parentId) {
              const nextSibling = parentDN.nextSiblingNote
              if (isNotNil(nextSibling)) {
                nextSibling.focusTextInput()
              }
            }
          }
        }
      },
      focusPreviousDisplayNote(dn) {
        const prevSibling = dn.prevSiblingNote
        if (isNotNil(prevSibling)) {
          const lastLeafNote = prevSibling.lastLeafNote
          if (isNotNil(lastLeafNote)) {
            lastLeafNote.focusTextInput()
          }
        } else {
          if (dn.parentNote) {
            dn.parentNote.focusTextInput()
          }
        }
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
      upsertAndFocus(values) {
        const note = this.upsert(values)
        if (_.isNil(values.id)) {
          this.shouldFocusOnRefCache[note.id] = true
        } else {
          this.findById(values.id).focusTextInput()
        }
        return note
      },
      prependNewChildNote(note) {
        const sortIdx = _.defaultTo(0, note.sortIdx)
        this.upsertAndFocus({
          parentId: note.id,
          sortIdx: sortIdx - 1,
        })
      },
      appendSibling(note) {
        const sortIdx = _.defaultTo(0, note.sortIdx)
        this.upsertAndFocus({
          parentId: note.parentId,
          sortIdx: sortIdx,
        })
      },
      clearZoom() {
        this.zoomedNote = null
      },
      zoomIntoDisplayNote(dn) {
        this.zoomedNote = dn
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

        const dnToFocus = _.when(_.isNil, constant(this.currentRoot))(
          this.currentRoot.firstChildNote,
        )

        dnToFocus.tryFocusTextInput()
      },
    },
    name: 'view',
  })

  view.init()

  return view
}

export const state = {view: View()}
