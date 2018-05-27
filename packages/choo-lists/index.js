require('babel-polyfill')
const log = require('nanologger')('app')
const css = require('sheetify')
css('tachyons')

const choo = require('choo')
const app = choo()

window.addEventListener('error', function(event) {
  log.error(event.error.reason, event.error.message)
})

window.addEventListener('unhandledrejection', function(event) {
  log.error(event.error.reason, event.error.message)
})

if (process.env.NODE_ENV !== 'production') {
  app.use(require('choo-devtools')())
} else {
  app.use(require('choo-service-worker')())
}

app.use(require('./stores/list'))

app.route('/', require('./views/list'))
app.route('/*', require('./views/404'))

module.exports = app.mount('body')
