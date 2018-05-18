var html = require("choo/html")

var TITLE = "choo-notes - main"

module.exports = view

function view(state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  return html`
  <body class="code lh-copy pa3">
    <div class="flex bb">
      <div class="f3">Notes List</div>
    </div>
    
  </body>      
  `

}
