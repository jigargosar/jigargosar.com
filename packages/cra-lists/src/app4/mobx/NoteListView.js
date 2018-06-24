import {mAutoRun, oObject} from './utils'
import * as mu from 'mobx-utils'

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
  const noteTransformer = mu.createTransformer(note => {
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

  const noteListTransformer = mu.createTransformer(
    R.map(noteTransformer),
  )
  const noteListView = oObject({
    pred: R.allPass([R.propEq('deleted', false)]),

    get transformedList() {
      return noteListTransformer(nc.all)
    },

    get noteList() {
      return R.filter(this.pred, this.transformedList)
    },

    onAddNewNoteEvent() {
      nc.addNewNote()
    },
    startEditing() {},
  })
  mAutoRun(r => {
    r.trace()
    console.debug(noteListView.noteList.length)
  })
  return noteListView
}
