import {ActiveRecord} from './ActiveRecord'
import {
  attachDelegatingPropertyGetters,
  createObservableObject,
  createTransformer,
} from './little-mobx'
import {
  _,
  constant,
  dotPath,
  isIndexOutOfBounds,
  isNilOrEmpty,
  isNotNil,
  nop,
  validate,
} from '../little-ramda'
import {focusRef, isAnyHotKey, wrapPD} from '../components/utils'

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
  return createTransformer(note => {
    validate('O', [note])

    const displayNote = createObservableObject({
      props: {
        textInputRef: null,
        get parentDN() {
          return view.findById(note.parentId)
        },
        get navLinkText() {
          return _.when(isNilOrEmpty, constant('(empty)'))(this.text)
        },
        get childNotes() {
          return view.findAllWithParentId(note.id)
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
        tryFocusTextInput() {
          requestAnimationFrame(() => {
            this.focusTextInput()
          })
        },
        focusTextInput() {
          if (!this.textInputRef) {
            // debugger
          }
          focusRef(this.textInputRef)
        },
      },
      actions: {
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
          Notes.upsert({id: note.id, ...values})
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
            [isAnyHotKey(['down']), wrapPD(this.onDownArrowKey)],
            [isAnyHotKey(['mod+.']), wrapPD(this.onZoomIn)],
            [isAnyHotKey(['tab']), wrapPD(nop)],
            [isAnyHotKey(['shift+tab']), wrapPD(nop)],
            [isAnyHotKey(['backspace']), this.onBackspaceKeyDown],
          ])(e)
        },
        onZoomIn() {
          view.zoomIntoDisplayNote(this)
        },
        onDownArrowKey() {
          view.focusNextDisplayNote(this)
        },
        onBackspaceKeyDown(e) {
          if (_.isEmpty(e.target.value)) {
            this.onDelete()
          }
        },
      },
      name: `DisplayNote@${note.id}`,
    })
    attachDelegatingPropertyGetters(
      note,
      displayNote,
      Notes.allFieldNames,
    )
    return displayNote
  })
}

function View() {
  const dnMap = {}

  const view = createObservableObject({
    props: {
      rootNote: null,
      zoomedNote: null,
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
      get _dnt() {
        return createDisplayNoteTransformer(this)
      },
      get displayNoteTransformer() {
        return note => {
          const displayNote = this._dnt(note)
          const cachedDN = dnMap[note.id]
          if (_.isNil(cachedDN)) {
            dnMap[note.id] = displayNote
          } else {
            console.assert(displayNote === cachedDN)
          }
          return displayNote
        }
      },
      get noteList() {
        return this.zoomedNoteList || this.rootNoteList
      },
      get zoomedNoteList() {
        return dotPath('zoomedNote.childNotes', this)
      },
      get rootNoteList() {
        return this.findAllWithParentId(null)
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
      getSiblingsOfDisplayNote(dn) {
        if (dn === this.currentRoot) {
          debugger
          // return this.currentNotesList
        } else if (dn.id === this.currentRootId) {
          return []
        } else {
          const results = this.findAll({
            filter: _.propEq('id', dn.parentId),
          })
          const parentDisplayNote = _.head(results)
          console.assert(isNotNil(parentDisplayNote))
          return parentDisplayNote.childNotes
        }
      },
      getIndexOfDisplayNote(dn) {
        const siblingsOFDisplayNote = this.getSiblingsOfDisplayNote(
          dn,
        )
        const dnIdx = _.findIndex(
          _.eqProps('id', dn),
          siblingsOFDisplayNote,
        )
        console.assert(
          !isIndexOutOfBounds(dnIdx, siblingsOFDisplayNote),
        )
        return dnIdx
      },
      getNextSiblingOfDisplayNote(dn) {
        const nextIndex = this.getIndexOfDisplayNote(dn) + 1
        const siblingsOFDisplayNote = this.getSiblingsOfDisplayNote(
          dn,
        )
        if (isIndexOutOfBounds(nextIndex, siblingsOFDisplayNote)) {
          return null
        } else {
          return siblingsOFDisplayNote[nextIndex]
        }
      },
      focusNextDisplayNote(dn) {
        if (dn.shouldDisplayChildren) {
          dn.firstChildNote.focusTextInput()
        } else {
          const nextSibling = this.getNextSiblingOfDisplayNote(dn)
          if (isNotNil(nextSibling)) {
            nextSibling.focusTextInput()
          } else {
            const parentDN = dn.parentDN
            if (parentDN) {
              const nextSibling = this.getNextSiblingOfDisplayNote(
                parentDN,
              )
              if (isNotNil(nextSibling)) {
                nextSibling.focusTextInput()
              }
            }
          }
        }
      },
      upsert(values) {
        return this.displayNoteTransformer(Notes.upsert(values))
      },
      prependNewChildNote(note) {
        const sortIdx = _.defaultTo(0, note.sortIdx)
        this.upsert({
          parentId: note.id,
          sortIdx: sortIdx - 2,
        }).tryFocusTextInput()
      },
      appendSibling(note) {
        const sortIdx = _.defaultTo(0, note.sortIdx)
        const dn = this.upsert({
          parentId: note.parentId,
          sortIdx: sortIdx + 1,
        })
        console.log(
          `dn.id`,
          dn.id,
          dn.parentId,
          note.id,
          note.parentId,
        )
        dn.tryFocusTextInput()
      },
    },
    actions: {
      clearZoom() {
        this.zoomedNote = null
      },
      zoomIntoDisplayNote(dn) {
        this.zoomedNote = dn
      },
      findOrCreateRootNote() {
        const foundRoot = _.head(
          this.findAll({filter: _.propEq('parentId', null)}),
        )
        this.rootNote = _.isNil(foundRoot) ? this.upsert() : foundRoot
      },
    },
    name: 'view',
  })

  view.findOrCreateRootNote()

  return view
}

export const state = {view: View()}
