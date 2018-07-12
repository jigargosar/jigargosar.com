import {ActiveRecord} from './ActiveRecord'
import {
  attachDelegatingPropertyGetters,
  createObservableObject,
  createTransformer,
  mTrace,
  mWhen,
} from './little-mobx'
import {
  _,
  constant,
  isIndexOutOfBounds,
  isNilOrEmpty,
  isNotNil,
  nop,
  validate,
} from '../little-ramda'
import {
  elFocus,
  elSetSelectionRange,
  isAnyHotKey,
  tryCatchLogFindDOMNode,
  wrapPD,
} from '../components/utils'
import {nanoid} from '../model/util'

function getActiveQuery({filters = []} = {}) {
  return {
    filter: _.allPass([
      _.propSatisfies(_.not, 'deleted'),
      ...filters,
    ]),
    sortComparators: [
      _.ascend(_.prop('sortIdx')),
      _.ascend(_.prop('createdAt')),
    ],
  }
}

const fieldNames = [
  'text',
  'deleted',
  'parentId',
  'collapsed',
  'sortIdx',
]
const Notes = ActiveRecord({
  name: 'Note',
  fieldNames,
})

function createDisplayNoteTransformer(view) {
  validate('O', [view])
  const transformer = note => {
    validate('O', [note])

    const _debugName = `DisplayNote@${note.id}@${nanoid()}`
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
          // setTimeout(() => {
          //   requestAnimationFrame(() => this.focusTextInput())
          // }, 0)
          mWhen(
            () => isNotNil(this.textInputRef),
            () => {
              console.log(
                `when tryFocusTextInput success`,
                this.textInputRef,
              )
              this.focusTextInput()
            },
          )
        },
        focusTextInput() {
          if (!this.textInputRef) {
            debugger
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
        },
        update(values) {
          // Notes.upsert({id: note.id, ...values})
          view.upsert({id: note.id, ...values})
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
          this.update({collapsed: !note.collapsed})
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
    console.log(`destroying`, dn._debugName, n)
  })
}

function View() {
  const view = createObservableObject({
    props: {
      rootNote: null,
      zoomedNote: null,
      displayNoteTransformer: null,
      get currentRoot() {
        mTrace()
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
          prevSibling.focusTextInput()
        }
      },
      upsert(values) {
        return this.displayNoteTransformer(Notes.upsert(values))
      },
      prependNewChildNote(note) {
        const sortIdx = _.defaultTo(0, note.sortIdx)
        const dn = this.upsert({
          parentId: note.id,
          sortIdx: sortIdx - 1,
        })
        dn.tryFocusTextInput()
        this.findById(dn.id).tryFocusTextInput()
      },
      appendSibling(note) {
        const sortIdx = _.defaultTo(0, note.sortIdx)
        const dn = this.upsert({
          parentId: note.parentId,
          sortIdx: sortIdx,
        })
        console.log(`dn.id`, dn._debugName)
        dn.tryFocusTextInput()
        this.findById(dn.id).tryFocusTextInput()
      },
      clearZoom() {
        this.zoomedNote = null
      },
      zoomIntoDisplayNote(dn) {
        this.zoomedNote = dn
      },
      init(view) {
        view.displayNoteTransformer = createDisplayNoteTransformer(
          view,
        )
        const foundRoot = _.head(
          view.findAll({filter: _.propEq('parentId', null)}),
        )
        view.rootNote = _.isNil(foundRoot) ? view.upsert() : foundRoot
        const dnToFocus = _.when(
          _.isNil,
          constant(view.currentRoot),
          view.currentRoot.firstChildNote,
        )
        dnToFocus.tryFocusTextInput()
      },
    },
    name: 'view',
  })

  view.init(view)

  return view
}

export const state = {view: View()}
