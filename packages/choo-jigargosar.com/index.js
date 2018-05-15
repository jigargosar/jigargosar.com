var css = require('sheetify')
var choo = require('choo')

css('tachyons')

var app = choo()
if (process.env.NODE_ENV === 'production') {
  app.use(require('choo-service-worker')())
} else {
  app.use(require('choo-devtools')())
}

app.use(require('./stores/clicks'))

app.route('/', require('./views/landing'))
app.route('/*', require('./views/404'))

module.exports = app.mount('body')
