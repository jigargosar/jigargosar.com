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
      zoomInNote: null,
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
              onDelete(note) {
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
                  [isAnyHotKey(['down']), wrapPD(nop)],
                  [
                    isAnyHotKey(['mod+.']),
                    wrapPD(() => {
                      view.zoomInNote = this
                    }),
                  ],
                ])(e)
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
        return dotPath('zoomInNote.childNotes', this)
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
    },
    actions: {},
    name: 'view',
  })

  return view
}

export const state = {view: View()}
