const R = require('ramda')
const html = require('choo/html')

const TITLE = 'Choo Notes'

module.exports = view

function viewNote(note) {
  return html`<div class="mb2"><pre>${note.text}</pre></div>`
}

function view(state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  function onClick() {
    emit('notes.addNew')
  }

  var allNotes = state.notes.list
  return html`
  <body class="code lh-copy pa3">
    <div class="flex bb items-center">
      <div class="flex-auto f3">
        Choo Notes<span class="f6">(${allNotes.length})</span>
      </div>
      <button 
        onclick=${onClick}>
        Add Note
      </button>
    </div>
    <div>
      ${R.map(viewNote, allNotes)}
    </div>
  </body>      
  `
}
