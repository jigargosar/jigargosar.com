var css = require("sheetify")
var choo = require("choo")

css("tachyons")

var app = choo()
if (process.env.NODE_ENV === "production") {
  app.use(require("choo-service-worker")())
} else {
  app.use(require("choo-devtools")())
}

app.use(require("./stores/clicks"))
app.use(function (state, emitter) {
  state.rowCount = 1000
  state.colCount = 5
})

app.route("/rendering-performance", require("./views/rendering-performance"))
app.route("/", require("./views/landing"))
app.route("/*", require("./views/404"))

module.exports = app.mount("body")
