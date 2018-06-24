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

const states = {
  nc,
  view: NoteListView({nc}),
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
  let ncJSON = '{}'
  autoRun(() => {
    ncJSON = JSON.stringify(oJS(nc), null, 2)
    console.log(ncJSON)
  })

  module.hot.accept(['./components/App'], () => {
    states.nc = NotesCollection.create(ncJSON)
    states.view = NoteListView({nc: states.nc})

    render()
  })
}
