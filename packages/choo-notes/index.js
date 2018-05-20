var css = require('sheetify')
var choo = require('choo')

css('tachyons')
css('primer')
css('./global.css')

var app = choo()
if (process.env.NODE_ENV !== 'production') {
  app.use(require('choo-devtools')())
} else {
  app.use(require('choo-service-worker')())
}

app.use(require('./stores/notes'))

app.route('/', require('./views/notes'))
app.route('/*', require('./views/404'))

module.exports = app.mount('body')
