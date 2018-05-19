const R = require('ramda')
const html = require('choo/html')

const TITLE = 'Choo Notes'

module.exports = view

function viewEditButton(emit, idx) {
  return html`<div class="underline" onclick="${onEditClicked}">edit</div>`

  function onEditClicked() {
    emit('notes:edit', idx)
  }
}

const viewNote = R.curry(function(emit, totalNotes, note, idx) {
  var noteHtml = R.map(
    para => html`<div class="pb2">${para}</div>`,
    note.body.split(/\r\n|\r|\n/),
  )

  function renderNoteBody() {
    return html`<div class="f6 bg-white-80 shadow-1 pa3">
    <div class="measure-wide">${noteHtml}</div>
  </div>`
  }

  //<div className="center ph3-m mb4">
  return html`<div class="center _ph3-m bg-white-80">
  <div class="flex f5 _mb1 _mh2 pa2 b--black-10 ${
    totalNotes - 1 === idx ? '' : 'bb'
  }">
    <div class="flex-grow-1">
      ${note.title}
    </div>
    ${viewEditButton(emit, idx)}
  </div>
  ${renderNoteBody() && null}
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
<div class="_mt4 ma3-ns shadow-1">
  ${R.addIndex(R.map)(
    viewNote(emit, allNotes.length),
    // R.sortWith([R.descend(R.prop('modifiedAt'))], allNotes),
    allNotes,
  )}
</div>
</body>      
`

  function onAddClick() {
    emit('notes:add')
  }
}
