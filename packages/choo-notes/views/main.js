const R = require('ramda')
const html = require('choo/html')

const TITLE = 'Choo Notes'

module.exports = view

function viewNote(note) {
  var noteHtml = R.map(
    para => html`<p>${para}</p>`,
    note.text.split(/\r\n|\r|\n/),
  )
  return html`<div class="mv3 measure-wide">
    <div class="f5 mb2 bb">Note</div>
    <div class="f6">
      ${noteHtml}
    </div>
  </div>`
}

function view(state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  function onClick() {
    emit('notes:add')
  }

  var allNotes = state.notes.list
  return html`<body class="bg-black-10 black-80 mw7-l center code lh-copy">
<header class="bg-black-80 white-80">
  <div class="flex items-center pa3">
    <div class="flex-auto f3">
      Choo Notes<span class="f6">(${allNotes.length})</span>
    </div>
    <button onclick=${onClick}>
      Add Note
    </button>
  </div>
</header>
<div class="center measure-wide bg-white-80 pa3">
  ${R.map(viewNote, allNotes)}
</div>
</body>      
  `
}
