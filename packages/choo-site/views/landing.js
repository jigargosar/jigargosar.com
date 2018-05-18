var html = require('choo/html')

var TITLE = 'JigarGosar.com'

module.exports = view

function link(href, title) {
  return html`<a class="link dim gray f6 f5-ns dib mr3" href="${href}" title="${title}">${title}</a>`
}

function view(state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  // language=HTML
  return html`
<body class="code lh-copy">
<main class="pa3 cf center">
  <nav class="pa3 pa4-ns">
    <a
        class="link dim black b f1 f-headline-ns tc db mb3 mb4-ns"
        href="#"
        title="Home"
    >
      Jigar Gosar
    </a>
    <div class="tc pb3">
      <a class="link dim gray f6 f5-ns dib mr3" href="#" title="Home">Home</a>
      <a class="link dim gray f6 f5-ns dib mr3" href="#" title="About">About</a>
      <a class="link dim gray f6 f5-ns dib mr3" href="#" title="Store">Store</a>
      <a class="link dim gray f6 f5-ns dib" href="#" title="Contact">Contact</a>
    </div>
    <section>
        <h2>Experiments</h2>
        <div>
            ${link(`rendering-performance`, `Rendering Performance`)}
        </div>
    </section>
  </nav>
</main>
</body>
`
}
