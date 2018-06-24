/*eslint-disable*/

import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from '../registerServiceWorker'
import {StateProvider} from './components/utils'
import {autoRun, oJS, oObject} from './mobx/utils'
import {NoteListView} from './mobx/NoteListView'
import {NotesCollection} from './mobx/NotesCollection'

const R = require('ramda')
const RA = require('ramda-adjunct')

/*eslint-enable*/

const nc = NotesCollection.create()

R.times(() => {
  nc.addNewNote()
}, 3)

const states = oObject({
  nc,
  view: NoteListView({nc}),
})
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
  let ncSnapshot = {}
  autoRun(() => {
    // ncSnapshot = JSON.stringify(oJS(states.nc), null, 2)
    ncSnapshot = states.nc.snapshot
    console.log(ncSnapshot)
  })

  module.hot.accept(
    [
      './components/App',
      './mobx/NotesCollection',
      './mobx/NoteListView',
    ],
    () => {
      const NotesCollection = require('./mobx/NotesCollection')
        .NotesCollection
      const NoteListView = require('./mobx/NoteListView').NoteListView

      states.nc = NotesCollection.create(ncSnapshot)
      states.view = NoteListView({nc: states.nc})

      render()
    },
  )
}
