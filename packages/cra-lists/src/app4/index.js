/*eslint-disable*/

import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from '../registerServiceWorker'
import {StateProvider} from './components/utils'
import {oObject} from './mobx/utils'
import {NoteListView} from './mobx/NoteListView'
import {NotesCollection} from './mobx/NotesCollection'

const R = require('ramda')
const RA = require('ramda-adjunct')

/*eslint-enable*/

const createNoteListOfSize = R.compose(
  R.map(i => oObject({id: `${i}`, text: `Note Text ${i}`})),
  R.times(R.identity),
)

const nc = NotesCollection.create()

R.times(() => {
  nc.add(nc.newNote())
}, 10)

const states = {
  nc,
  view: NoteListView({nc}),
  noteList: createNoteListOfSize(10),
}

// setInterval(() => {
//   states.noteList.forEach(n => (n.text = n.text + 1))
// }, 1000)

function render() {
  const App = require('./components/App').default
  ReactDOM.render(
    <StateProvider value={states}>
      <App />
    </StateProvider>,
    document.getElementById('root'),
  )
}

render()

registerServiceWorker()

if (module.hot) {
  module.hot.accept(['./components/App'], () => {
    render()
  })
}
