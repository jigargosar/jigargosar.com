// require('babel-polyfill')

const choo = require('choo')
const html = require('choo/html')
const css = require('sheetify')
const NanoLogger = require('nanologger')
const assert = require('assert')

console.log('foo', ...{a: 1})

css('tachyons')
const app = choo()

var log = new NanoLogger('index')

// window.addEventListener('error', function(event) {
//   log.error(event.error.reason, event.error.message)
// })
//
// window.addEventListener('unhandledrejection', function(event) {
//   log.error(event.error.reason, event.error.message)
// })

// if (process.env.NODE_ENV !== 'production') {
//   app.use(require('choo-devtools')())
// } else {
//   app.use(require('choo-service-worker')())
// }

// app.use(require('./stores/list'))

// app.route('/', require('./views/list'))
app.route('/', function() {
  return html`<body>HW</body>`
})

app.route('/*', require('./views/404'))

module.exports = app.mount('body')
