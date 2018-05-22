const css = require('sheetify')
const html = require('choo/html')

const {TITLE} = require('./meta')
const {updateTitle} = require('./events')

const style = css`
  :host {
    font-size: 4rem;
  }
`
module.exports = view

function view(state, emit) {
  updateTitle(TITLE, state, emit)

  return html`
<body class="f4">
  <h1 class="bg-blue-light text-center ${style}">${TITLE}</h1>
  <div class="container-md p-4">Content</div>
</body>
`
}
