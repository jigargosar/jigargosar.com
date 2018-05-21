const R = require('ramda')
const html = require('choo/html')
const TITLE = 'add - Choo Notes'

module.exports = view

// https://github.com/primer/primer/tree/master/modules/primer-forms

function view(state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  const {fields} = R.defaultTo({fields: {title: '', body: ''}}, state.newNote)
  return html`
    <body class="bg-black-10 black-80 code lh-copy container-md">
      <div class="p-5">
        <form onsubmit=${onSubmit}>
          <dl>
            <input
              autofocus 
              class="form-control input-block" 
              type="text" 
              placeholder="Title"
              onchange=${onTitleChane} 
            />
          </dl>
          <dl>
            <textarea 
              class="form-control input-block" 
              style="height:200px;"
              placeholder="Body"
              onchange=${onBodyChane}
            >
            ${fields.body}
            </textarea>
          </dl>
          <dl>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Add</button>
              <button type="button" class="btn" onclick=${onCancel}>Cancel</button>
            </div>
          </dl>
        </form>
      </div>
    </body>`

  function onTitleChane(e) {
    // e.preventDefault()
    emit('newNote:update', {title: e.target.value})
  }

  function onBodyChane(e) {
    // e.preventDefault()
    emit('newNote:update', {body: e.target.value})
  }

  function onSubmit(e) {
    e.preventDefault()
    emit('newNote:add')
  }

  function onCancel(e) {
    e.preventDefault()
    emit('newNote:discard')
  }
}
