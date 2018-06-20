/*eslint-disable*/

const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')
var nanostate = require('nanostate')
var nanoid = require('nanoid')
const R = require('ramda')
const m = require('mobx')
const validate = require('aproba')
const RA = require('ramda-adjunct')

/*eslint-enable*/

function Notes(fire) {
  const notes = m.observable.object(
    {
      _notes: m.observable.map([], {deep: false}),
      get list() {
        return Array.from(this._notes.values())
      },
      add() {
        return this._put({id: nanoid(), text: `New Note`})
      },
      _put(n) {
        this._notes.set(n.id, n)
      },
      _updateNotesListFromFirestore(notes) {
        notes.for(this._put)
      },
    },
    {add: m.action.bound},
    {name: 'Notes'},
  )
  m.autorun(() => {
    if (fire.auth.isSignedIn) {
      fire.store.createUserCollectionRef('notes').onSnapshot(qs => {
        const docs = qs
          .docChanges()
          .map(dc => R.merge(dc.doc.data(), {id: dc.id}))
        notes._updateNotesListFromFirestore(docs)
      })
    }
  })
  return notes
}

export default Notes
