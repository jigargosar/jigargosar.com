var html = require("choo/html")

var TITLE = "JigarGosar.com"

module.exports = view

function link(href, title) {
  return html`<a class="link dim gray f6 f5-ns mr3" href="${href}" title="${title}">${title}</a>`
}

function view(state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  // language=HTML
  return html`
<body class="w-100 w-80-ns w-65-l code lh-copy center">
<div class="pa3 tc">
    <div class="b f2 f1-m f-6-l tc mb3 mb4-ns">
      JigarGosar.com
    </div>
    <div class="f4 f3-ns b-l">Experiments</div>
    <div class="flex-column">
      <div>${link(`rendering-performance`, `Rendering Performance`)}</div>
      <div>${link(`render-self`, `Self Rendering Page`)}</div>
      <div>${link(`main`, `Old Index Page`)}</div>
    </div>
</div>
</body>
`
}
