var css = require('sheetify')
var html = require('choo/html')

var TITLE = 'Choo List Prototype'

var style = css`
  :host {
    font-size: 4rem;
  }
`
module.exports = view

function view(state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  return html`
<body class="f4">
  <h1 class="bg-blue-light text-center ${style}">Choo List Prototype</h1>
  <div class="container-md p-4">Content</div>
</body>
`
}
