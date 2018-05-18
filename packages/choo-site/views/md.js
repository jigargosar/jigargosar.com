var html = require("choo/html")
var R = require("ramda")
var fs = require("fs")

module.exports = view

function view(state, emit) {
  const src = fs.readFileSync(`${__dirname}/md.js`, "utf8")
  console.log("src", src)
  // language=HTML
  return html`<body class="code lh-copy">
<main class="pa3 cf center">
  <p>HW</p>
  <pre><code>${src}</code></pre>
</main>
</body>
`
}


