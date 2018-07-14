import {nanoid} from '../../model/util'
import {S, validate} from '../../little-ramda'

function createNote({
  id = `N-${nanoid()}`,
  maybeParentId = S.Nothing,
  text = '',
} = {}) {
  validate('SOS', [id, maybeParentId, text])
  return {id, text, maybeParentId}
}

function createNoteCollection() {
  return {
    idLookup: {},
  }
}
