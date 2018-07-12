import {ActiveRecord} from './ActiveRecord'
import {
  attachDelegatingPropertyGetters,
  createObservableObject,
  createTransformer,
} from './little-mobx'
import {
  _,
  dotPath,
  dotPathOr,
  isIndexOutOfBounds,
  isNotNil,
  nop,
} from '../little-ramda'
import {isAnyHotKey, wrapPD} from '../components/utils'
import ReactDOM from 'react-dom'

function getActiveQuery({filters = []} = {}) {
  return {
    filter: _.allPass([
      _.propSatisfies(_.not, 'deleted'),
      ...filters,
    ]),
    sortComparators: [_.descend(_.prop('createdAt'))],
  }
}

const fieldNames = ['text', 'deleted', 'parentId', 'collapsed']
const Notes = ActiveRecord({
  name: 'Note',
  fieldNames,
})

function View() {
  const view = createObservableObject({
    props: {
      zoomedNote: null,
      get zoomedNoteId() {
        return dotPathOr(null, 'zoomedNote', this)
      },
      get displayNoteTransformer() {
        const view = this
        return createTransformer(note => {
          const displayNote = createObservableObject({
            props: {
              textInputRef: null,
              get childNotes() {
                return view.findActiveNotesWithParentId(note.id)
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
              focusTextInput() {
                const inputEl = ReactDOM.findDOMNode(
                  this.textInputRef,
                )
                if (inputEl) {
                  inputEl.focus()
                } else {
                  debugger
                }
              },
            },
            actions: {
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
                  [isAnyHotKey(['enter']), wrapPD(nop)],
                  [isAnyHotKey(['escape']), wrapPD(nop)],
                  [
                    isAnyHotKey(['down']),
                    wrapPD(this.onDownArrowKey),
                  ],
                  [isAnyHotKey(['mod+.']), wrapPD(this.onZoomIn)],
                  [isAnyHotKey(['tab']), wrapPD(nop)],
                  [isAnyHotKey(['shift+tab']), wrapPD(nop)],
                ])(e)
              },
              onZoomIn() {
                view.zoomIntoDisplayNote(this)
              },
              onDownArrowKey() {
                view.focusNextDisplayNote(this)
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
      },
      get noteList() {
        return this.zoomedNoteList || this.rootNoteList
      },
      get zoomedNoteList() {
        return dotPath('zoomedNote.childNotes', this)
      },
      get rootNoteList() {
        return _.map(
          this.displayNoteTransformer,
          this.findActiveNotesWithParentId(null),
        )
      },
      findAll(options) {
        return _.map(
          this.displayNoteTransformer,
          Notes.findAll(options),
        )
      },
      findActiveNotesWithParentId(parentId) {
        return this.findAll(
          getActiveQuery({
            filters: [_.propEq('parentId', parentId)],
          }),
        )
      },
      getSiblingsWithParentId(parentId) {
        if (parentId === this.zoomedNoteId) {
          return this.noteList
        } else {
          const results = this.findAll({
            filter: _.propEq('id', parentId),
          })
          const parentDisplayNote = _.head(results)
          console.assert(isNotNil(parentDisplayNote))
          return parentDisplayNote.childNotes
        }
      },
      getIndexOfDisplayNote(dn) {
        const siblingsOFDisplayNote = this.getSiblingsWithParentId(
          dn.parentId,
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
        const siblingsOFDisplayNote = this.getSiblingsWithParentId(
          dn.parentId,
        )
        if (isIndexOutOfBounds(nextIndex, siblingsOFDisplayNote)) {
          return null
        } else {
          return siblingsOFDisplayNote[nextIndex]
        }
      },
      getParentOfDisplayNote(dn) {},
      focusNextDisplayNote(dn) {
        if (dn.shouldDisplayChildren) {
          dn.firstChildNote.focusTextInput()
        } else {
          const nextSibling = this.getNextSiblingOfDisplayNote(dn)
          if (isNotNil(nextSibling)) {
            nextSibling.focusTextInput()
          } else {
            debugger
          }
        }
      },
    },
    actions: {
      clearZoom() {
        this.zoomedNote = null
      },
      zoomIntoDisplayNote(dn) {
        this.zoomedNote = dn
      },
    },
    name: 'view',
  })

  return view
}

export const state = {view: View()}
