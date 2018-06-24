/*eslint-disable*/

import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from '../registerServiceWorker'
import {StateProvider} from './components/utils'
import {mAutoRun, oObject} from './mobx/utils'
import {NoteListView} from './mobx/NoteListView'

const R = require('ramda')
const RA = require('ramda-adjunct')

/*eslint-enable*/

const nc = createNC()
const states = oObject({
  nc,
  view: NoteListView({nc}),
})

// R.times(() => {
//   states.nc.addNewNote()
// }, 3)

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

function createNC() {
  const NotesCollection = require('./mobx/NotesCollection')
    .NotesCollection
  const ncSnapshot = R.defaultTo(
    {},
    localStorage.getItem('ncSnapshot'),
  )
  return NotesCollection.create(ncSnapshot)
}

if (module.hot) {
  mAutoRun(() => {
    const ncSnapshot = states.nc.snapshot
    localStorage.setItem(
      'ncSnapshot',
      JSON.stringify(ncSnapshot, null, 2),
    )
    console.log(ncSnapshot)
  })

  module.hot.accept(
    [
      './components/App',
      './mobx/NotesCollection',
      './mobx/NoteListView',
    ],
    () => {
      const NoteListView = require('./mobx/NoteListView').NoteListView

      states.nc = createNC()
      states.view = NoteListView({nc: states.nc})

      render()
    },
  )
}
