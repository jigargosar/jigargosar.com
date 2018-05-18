var css = require("sheetify")
var choo = require("choo")

css("./global.css")
css("tachyons")
css("prismjs/themes/prism.css")

var app = choo()
if (process.env.NODE_ENV === "production") {
  app.use(require("choo-service-worker")())
} else {
  app.use(require("choo-devtools")())
}

app.use(require("./stores/clicks"))
app.use(function (state, emitter) {
  state.rowCount = 50
  state.colCount = 5
})

app.route("/", require("./views/landing"))
app.route("/main", require("./views/main"))
app.route("/rendering-performance", require("./views/rendering-performance"))
app.route("/render-self", require("./views/render-self"))
app.route("/*", require("./views/404"))

module.exports = app.mount("body")
