import {ActiveRecord} from './ActiveRecord'
import {
  attachDelegatingPropertyGetters,
  createObservableObject,
  createTransformer,
} from './little-mobx'
import {_, dotPath, nop} from '../little-ramda'
import {isAnyHotKey, wrapPD} from '../components/utils'

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
      get displayNoteTransformer() {
        const view = this
        return createTransformer(note => {
          const displayNote = createObservableObject({
            props: {
              get childNotes() {
                return view.findActiveNotesWithParentId(note.id)
              },
              get hasChildren() {
                return !_.isEmpty(this.childNotes)
              },
              get shouldDisplayChildren() {
                return this.hasChildren && !note.collapsed
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

              onDownArrowKey() {},
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
      getParentOfDisplayNote(dn) {
        return _.head(this.findAll({filter: _.eqProps('id', dn)}))
      },
      findActiveNotesWithParentId(parentId) {
        return this.findAll(
          getActiveQuery({
            filters: [_.propEq('parentId', parentId)],
          }),
        )
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
