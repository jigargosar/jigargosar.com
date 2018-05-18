var html = require("choo/html")
var rawHtml = require("choo/html/raw")
var R = require("ramda")
var fs = require("fs")
var Prism = require("prismjs")

var unified = require("unified")
var markdown = require("remark-parse")
var remark2rehype = require("remark-rehype")
var toHtml = require("rehype-stringify")

var processor = unified()
    .use(markdown)
    .use(remark2rehype)
    .use(toHtml)

const src = fs.readFileSync(`${__dirname}/md.js`, "utf8")

var TITLE = "Self Rendering Page - JigarGosar.com"

module.exports = view

function view(state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)
  var src2 = ""

  processor.process(src, function (err, file) {
    src2 = String(file)
  })

  var psrc = Prism.highlight(src, Prism.languages.javascript, "javascript")

  // language=HTML
  return html`<body class="code lh-copy">
<main class="pa3 cf center">
  <p>Self Rendering Page</p>
  <pre class="language-javascript"><code class="language-javascript">${rawHtml(psrc)}</code></pre>
</main>
</body>
`
}


