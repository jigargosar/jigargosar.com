import {ActiveRecord} from '../ActiveRecord'
import {_} from '../../little-ramda'

// function getActiveQuery({filters = []} = {}) {
//   return {
//     filter: _.allPass([
//       _.propSatisfies(_.not, 'deleted'),
//       ...filters,
//     ]),
//     sortComparators: [
//       _.ascend(_.prop('sortIdx')),
//       _.ascend(_.prop('createdAt')),
//     ],
//   }
// }

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
})

const Notes = NotesActiveRecord

export {Notes, NotesActiveRecord}

export function findParentNoteOrNull(note) {
  if (_.isNil(note.parentId)) {
    return null
  }
  return NotesActiveRecord.findById({
    filter: _.propEq('id', note.parentId),
  })
}

export function findAllChildrenOfNote(note) {
  return NotesActiveRecord.findAll({
    filter: _.propEq('parentId', note.id),
  })
}

export function getOrUpsertRootNote() {
  return _.compose(
    _.when(_.isNil, () => NotesActiveRecord.upsert()),
    _.head,
  )(
    NotesActiveRecord.findAll({
      filter: _.propEq('parentId', null),
    }),
  )
}
