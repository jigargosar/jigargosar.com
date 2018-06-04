const R = require('ramda')
const RA = require('ramda-adjunct')
const log = require('nanologger')('firebaseStore')
const assert = require('assert')
const firebase = require('firebase/app')
const omitFirebaseClutter = R.unless(
  R.isNil,
  R.pickBy(
    (val, key) =>
      !(key.length <= 2 || RA.isFunction(val) || R.head(key) === '_'),
  ),
)

export function firebaseAuthStore(state, emitter) {
  state.authState = 'loading'
  state.userInfo = null

  state.events.firebase_auth_state_changed =
    'firebase:auth:state-changed'

  state.events.firebase_auth_signin = 'firebase:auth:signin'
  state.events.firebase_auth_signout = 'firebase:auth:signout'

  emitter.on(state.events.firebase_app_ready, () => {
    state.firebaseAuth.onAuthStateChanged(user => {
      state.userInfo = omitFirebaseClutter(user)
      log.debug('onAuthStateChanged userInfo:', state.userInfo)
      state.authState = 'signedOut'
      if (user) {
        state.authState = 'signedIn'
      }
      emitter.emit(state.events.firebase_auth_state_changed)
      emitter.emit(state.events.RENDER)
    })

    emitter.on(state.events.firebase_auth_signin, () => {
      var provider = new firebase.auth.GoogleAuthProvider()
      provider.setCustomParameters({prompt: 'select_account'})
      state.firebaseAuth.signInWithRedirect(provider)
    })

    emitter.on(state.events.firebase_auth_signout, () => {
      state.firebaseAuth.signOut()
    })
  })
}
