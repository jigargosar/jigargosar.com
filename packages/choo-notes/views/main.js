const R = require('ramda')
const html = require('choo/html')

const TITLE = 'Choo Notes'

module.exports = view

const viewNote = R.curry(function(note, emit, idx) {
  var noteHtml = R.map(
    para => html`<div class="pb2">${para}</div>`,
    note.body.split(/\r\n|\r|\n/),
  )
  function onEditClicked() {
    emit('notes:edit', {noteIdx: idx})
  }

  return html`<div class="center ph3-m mb4">
  <div class="f5 mb1 ml2">
    ${note.title}
  </div>
  <div class="f6 bg-white-80 shadow-1 pa3">
    <div class="measure-wide">${noteHtml}</div>
  </div>
</div>`
})
function view(state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  var allNotes = state.notes.list
  return html`<body class="bg-black-10 black-80 mw7-l center code lh-copy">
<header class="bg-black-80 white-80">
  <div class="flex items-center pa3">
    <div class="flex-auto flex f3">
      <div>Choo Notes</div>
      <div class="f6">(${allNotes.length})</div>
    </div>
    <div class="underline pointer" onclick=${onAddClick}>
      Add
    </div>
  </div>
</header>
<div class="mt4">
  ${R.addIndex(R.map)(
    viewNote,
    R.sortWith([R.descend(R.prop('modifiedAt'))], allNotes),
  )}
</div>
</body>      
  `
}
