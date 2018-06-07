const {
  syncFromFirestoreToPDB,
  syncFromPDBToFireStore,
} = require('./stores/firestore-grains-store')

const R = require('ramda')
const log = require('nanologger')('window')
const css = require('sheetify')
css('tachyons')

const choo = require('choo')
const app = choo()

window.addEventListener('error', function(event) {
  log.error(
    R.pathOr('noMessageFound', 'error.message'.split('.'), event),
    R.pathOr('noReasonFound', 'error.reason'.split('.'), event),
  )
})

window.addEventListener('unhandledrejection', function(event) {
  log.error(
    R.pathOr('noMessageFound', 'error.message'.split('.'), event),
    R.pathOr('noReasonFound', 'error.reason'.split('.'), event),
  )
})

if (process.env.NODE_ENV !== 'production') {
  app.use(require('choo-devtools')())
} else {
  app.use(require('choo-service-worker')())
}

app.use(require('./stores/firebase-app-store'))
app.use(require('./stores/firebase-auth-store').firebaseAuthStore)
app.use(syncFromPDBToFireStore)
app.use(syncFromFirestoreToPDB)
app.use(require('./stores/pdb-grains-store'))
app.use(require('./stores/edit-grain-store'))
app.route('/', require('./views/list'))
app.route('/*', require('./views/404'))

module.exports = app.mount('body')
