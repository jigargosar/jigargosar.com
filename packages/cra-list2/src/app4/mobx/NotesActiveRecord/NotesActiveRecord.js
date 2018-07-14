import {ActiveRecord} from '../ActiveRecord'
import {_, mergeWithDefaults} from '../../little-ramda'

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
  preProcessSnapshot: mergeWithDefaults({
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
  return _.when(_.isNil)(Notes.upsert)(
    Notes.findFirst({
      filter: _.propEq('parentId', null),
    }),
  )
}

export function getActiveQuery({filters = []} = {}) {
  return {
    filter: _.allPass([_.propEq('deleted', false), ...filters]),
    sortComparators: [
      _.ascend(_.prop('sortIdx')),
      _.ascend(_.prop('createdAt')),
    ],
  }
}

export function findAllActiveNotesWithParentId(parentId) {
  return Notes.findAll(
    getActiveQuery({
      filters: [_.propEq('parentId', parentId)],
    }),
  )
}

export function findAllActiveChildrenOfNote(note) {
  return findAllActiveNotesWithParentId(note.id)
}
