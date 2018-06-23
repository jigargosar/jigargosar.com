import {createTransformer, oObject} from './utils'

const R = require('ramda')

const defineDelegatePropertyGetter = R.curry(
  (propertyName, src, target) =>
    Object.defineProperty(target, propertyName, {
      get() {
        return src[propertyName]
      },
      enumerable: true,
    }),
)
export function NoteListView({nc}) {
  const noteTransformer = createTransformer(note => {
    const displayNote = {
      onToggleDeleteEvent() {
        note.toggleDeleted()
      },
    }
    ;['id', 'text', 'deleted'].forEach(
      defineDelegatePropertyGetter(R.__, note, displayNote),
    )
    return oObject(displayNote)
  })

  const noteListTransformer = createTransformer(
    R.map(noteTransformer),
  )
  return oObject({
    get noteList() {
      return noteListTransformer(nc.all)
    },
  })
}
