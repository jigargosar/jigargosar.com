const R = require('ramda')
const html = require('choo/html')

const TITLE = 'Choo Notes'

module.exports = view

function viewEditButton(emit, {id}) {
  return html`<div class="underline pointer" onclick="${onEditClicked}">edit</div>`

  function onEditClicked() {
    emit('notes:edit', {id})
  }
}

const viewNote = R.curry(function(emit, note, idx, notes) {
  return html`
    <div class="center _ph3-m _mb4 bg-white-80">
      <div class="flex f5 _mb1 _mh2 pa2 b--black-10 ${
        notes.length - 1 === idx ? '' : 'bb'
      }">
        <div class="flex-grow-1">
          ${note.title}
        </div>
        ${viewEditButton(emit, {id: note.id})}
      </div>
      ${null && renderNoteBody()}
    </div>
`

  function renderNoteBody() {
    const noteHtml = R.map(
      para => html`<div class="pb2">${para}</div>`,
      note.body.split(/\r\n|\r|\n/),
    )
    return html`
      <div class="f6 bg-white-80 shadow-1 pa3">
        <div class="measure-wide">${noteHtml}</div>
      </div>
`
  }
})

function view(state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  const notes = state.notes
  const notesList = notes.list

  return html`
    <body class="bg-black-10 black-80 code lh-copy _mw7-l _center container-md">
    ${renderHeader()}
      ${notes.viewState.value === 'list' ? renderNotesList(notesList) : null}
      ${notes.viewState.value === 'editing' ? renderEditNote(notes) : null}
    </body>`

  function renderHeader() {
    return html`<header class="bg-black-80 white-80">
      <div class="flex items-center pa3">
        <div class="flex-auto flex f3">
          <div>Choo Notes</div>
          <div class="f6">(${notesList.length})</div>
        </div>
        <div class="underline pointer" onclick=${onAddClick}>
          Add
        </div>
      </div>
    </header>`
  }

  function renderNotesList(notesList) {
    return html`
      <div class="_mt4 ma3-ns shadow-1">
        ${R.addIndex(R.map)(
          viewNote(emit),
          // R.sortWith([R.descend(R.prop('modifiedAt'))], notesList),
          notesList,
        )}
      </div>`
  }

  function renderEditNote(notes) {
    // https://github.com/primer/primer/tree/master/modules/primer-forms
    const fields = notes.editing.fields
    return html`
      <div class="p-5">
        <!--\${renderDebug()}-->
        <form onsubmit=${onSubmit}>
            <dl>
              <input
                autofocus 
                class="form-control input-block" 
                type="text" 
                placeholder="Title"
                value="${fields.title}" 
                />
            </dl>
            <dl>
              <textarea 
                class="form-control input-block" 
                style="height:200px;"
                placeholder="Body"
              >
                ${fields.body}
              </textarea>
            </dl>
            <dl>
              <div class="form-actions">
                <button type="submit" class="btn btn-primary">Save changes</button>
                <button type="button" class="btn" onclick=${onCancel}>Cancel</button>
              </div>
            </dl>
        </form>
`

    function renderDebug() {
      return html`<p>
          <div>editing note ${notes.editing.id}</div>
          <div>${fields.title}</div>
          <div>${fields.body}</div>
        </p>`
    }
  }

  function onAddClick() {
    emit('notes:add')
  }

  function onSubmit(e) {
    e.preventDefault()
    emit('notes:save')
  }

  function onCancel(e) {
    e.preventDefault()
    emit('notes:discard')
  }
}
