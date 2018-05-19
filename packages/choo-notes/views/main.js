const R = require('ramda')
const html = require('choo/html')
const rawHtml = require('choo/html/raw')

const TITLE = 'Choo Notes'

module.exports = view

function viewNote(note) {
  var noteHtml = R.compose(
    R.map(para => html`<p>${para}</p>`),
    R.split(/\n ?\r?/),
  )(note.text)
  console.log('noteHtml', noteHtml)
  return html`<div class="mv4 measure-wide">
    <div class="f5 mb2 bb">Note</div>
    <div class="f6">
      ${noteHtml}
    </div>
  </div>`
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
    <div class="center measure-wide">
      ${R.map(viewNote, allNotes)}
    </div>
  </body>      
  `
}
