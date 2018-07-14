import {ActiveRecord} from '../ActiveRecord'
import {_} from '../../little-ramda'

const fieldNames = [
  'text',
  'deleted',
  'parentId',
  'collapsed',
  'sortIdx',
]

const NotesActiveRecord = ActiveRecord({
  name: 'Note',
  fieldNames,
  preProcessSnapshot: _.mergeWith(_.defaultTo)({
    text: '',
    deleted: false,
    parentId: null,
    collapsed: false,
    sortIdx: 0,
  }),
})

const Notes = NotesActiveRecord

export {Notes, NotesActiveRecord}

export function findParentNoteOrNull(note) {
  if (_.isNil(note.parentId)) {
    return null
  }
  return Notes.findById({
    filter: _.propEq('id', note.parentId),
  })
}

export function findAllChildrenOfNote(note) {
  return Notes.findAll({
    filter: _.propEq('parentId', note.id),
  })
}

export function getOrUpsertRootNote() {
  return _.compose(_.when(_.isNil, () => Notes.upsert()), _.head)(
    Notes.findAll({
      filter: _.propEq('parentId', null),
    }),
  )
}

export function getActiveQuery({filters = []} = {}) {
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
