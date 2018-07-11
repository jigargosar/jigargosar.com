import {ActiveRecord} from './ActiveRecord'
import {
  attachDelegatingPropertyGetters,
  createObservableObject,
  createTransformer,
} from './little-mobx'
import {_, nop} from '../little-ramda'
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
                  onBlur: this.onTextBlur,
                  onKeyDown: this.onTextKeyDown,
                }
              },
            },
            actions: {
              onDelete(note) {
                Notes.upsert({id: note.id, deleted: true})
              },
              onTextChange(e) {
                Notes.upsert({id: note.id, text: e.target.value})
              },
              onTextFocus(e) {
                e.target.setSelectionRange(0, 0)
              },
              onTextKeyDown(e) {
                _.cond([
                  [isAnyHotKey(['enter']), wrapPD(nop)],
                  [isAnyHotKey(['escape']), wrapPD(nop)],
                  [isAnyHotKey(['down']), wrapPD(nop)],
                ])(e)
              },
              onToggleExpand() {
                if (!this.hasChildren) {
                  return
                }
                Notes.upsert({
                  id: note.id,
                  collapsed: !note.collapsed,
                })
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
