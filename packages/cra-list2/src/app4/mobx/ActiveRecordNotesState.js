import {ActiveRecord} from './ActiveRecord'
import {
  attachDelegatingPropertyGetters,
  createObservableObject,
  createTransformer,
} from './little-mobx'
import {_} from '../utils'

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
            },
            actions: {
              onDelete(note) {
                Notes.upsert({id: note.id, deleted: true})
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
      modeNameEq(name) {
        return _.equals(this.mode.name, name)
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
    actions: {
      onToggleNoteCollapsed(note) {
        Notes.upsert({
          id: note.id,
          collapsed: !note.collapsed,
        })
      },
      onTextBlur() {
        this.save()
      },
      onEnter() {
        this.save()
      },
      onEscape() {},
      save() {},
    },
    name: 'view',
  })

  return view
}

export const state = {view: View()}
