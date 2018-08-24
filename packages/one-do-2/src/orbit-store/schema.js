/*eslint-disable*/

import {nanoid} from '../lib/nanoid'
import {Schema} from './orbit'
import {mergeDefaults, overProp} from '../lib/little-ramda'
import {attributePath} from './little-orbit'
import {
  _path,
  always,
  compose,
  cond,
  equals,
  isNil,
  map,
  pathEq,
  pathOr,
} from '../lib/exports-ramda'
import {randomBool, randomTS, randomWord} from '../lib/fake'
import {assert} from '../lib/assert'
import {validate} from '../lib/validate'
import {T, take} from 'ramda'

function timeStampToGroupTitle(timestamp) {
  const now = Date.now()
  return cond([
    //
    [ts => ts <= now, () => 'Overdue'],
    [T, () => 'Someday'],
  ])(timestamp)
}

/*eslint-enable */

const modelsDefinition = {
  task: {
    views: {
      'Projects View': {
        columnNames: ['shortId', 'isDone', 'title', 'dueAt', 'projectId'],
        groupBy: pathOr('Inbox', [
          'relationships',
          'project',
          'data',
          'id',
        ]),
      },
      'Date View': {
        columnNames: ['dueGroup', 'isDone', 'title', 'projectId', 'dueAt'],
        groupBy: compose(
          timeStampToGroupTitle,
          _path(attributePath('dueAt')),
        ),
      },
      All: {
        columnNames: ['title', 'dueAt'],
        groupBy: _path(attributePath('isDone')),
        groupKeyToTitle: groupKey =>
          JSON.parse(groupKey) ? 'Completed' : 'Pending',
      },
      Pending: {
        columnNames: ['isDone', 'title', 'dueAt'],
        filters: [pathEq(attributePath('isDone'), false)],
      },
    },
    attributes: {
      sortIdx: {type: 'number', label: 'Sort Index'},
      isDone: {type: 'boolean', label: 'Done'},
      title: {type: 'string', label: 'Title'},
      dueAt: {type: 'timestamp', label: 'Due Date'},
      createdAt: {type: 'timestamp', label: 'Created'},
    },
    relationships: {
      project: {type: 'hasOne', model: 'project', inverse: 'tasks'},
    },
    computed: {
      isDone: {
        type: 'string',
        label: 'Completion Status',
        get: compose(
          bool => (bool ? 'DONE' : 'PENDING'),
          _path(attributePath('isDone')),
        ),
      },
      dueGroup: {
        type: 'string',
        label: 'Schedule',
        get: compose(timeStampToGroupTitle, _path(attributePath('dueAt'))),
      },
      projectId: {
        type: 'string',
        label: 'Project',
        get: pathOr('Inbox', ['relationships', 'project', 'data', 'id']),
      },
    },
  },
  project: {
    attributes: {
      title: {type: 'string', label: 'Title'},
    },
    relationships: {
      tasks: {type: 'hasMany', model: 'task', inverse: 'project'},
    },
    computed: {
      shortId: {
        label: 'ID',
        get: row => take(10)(row.id),
      },
    },
  },
}

function generateId(type) {
  return `${type}_${nanoid()}`
}

function getDefaultValueForAttribute(a) {
  return cond([
    //
    [equals('number'), always(0)],
    [equals('string'), randomWord],
    [equals('boolean'), randomBool],
    [equals('timestamp'), randomTS],
  ])(a.type)
}

class CustomSchema extends Schema {
  initializeRecord(record) {
    super.initializeRecord(record)
    const type = record.type

    validate('S', [type])
    const model = this.getModel(type)
    assert(!isNil(model))

    const defaultAttributes = map(getDefaultValueForAttribute)(
      model.attributes,
    )
    const setDefaultProps = compose(
      overProp('attributes')(mergeDefaults(defaultAttributes)),
      mergeDefaults({attributes: {}}),
    )
    Object.assign(record, setDefaultProps(record))
  }
}

function createDefaultSchema() {
  return new CustomSchema({
    models: modelsDefinition,
    generateId,
  })
}

export const schema = createDefaultSchema()
