import {types} from 'mobx-state-tree'
import {addDisposer} from './mst-utils'
import {SF} from '../safe-fun'

const R = require('ramda')
const RA = require('ramda-adjunct')
const assert = require('assert')

const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')
const log = require('nanologger')('Fire')

export const Fire = types
  .model('Fire')
  .volatile(() => ({
    authState: 'loading',
    userInfo: null,
    app: firebase.apps[0],
  }))
  .views(self => {
    return {
      get store() {
        return self.app.firestore()
      },
      get auth() {
        return self.app.auth()
      },
      get isAuthLoading() {
        return R.equals(self.authState, 'loading')
      },
      get isSignedIn() {
        return R.equals(self.authState, 'signedIn')
      },
      userCollectionRef(collectionName) {
        assert(RA.isNotNil(collectionName))
        if (!self.isSignedIn) return null
        return self.store.collection(
          `/users/${self.uid}/${collectionName}`,
        )
      },
      get uid() {
        return R.pathOr(null, 'userInfo.uid'.split('.'))(self)
      },
    }
  })
  .actions(self => {
    return {
      afterCreate: function afterCreate() {
        if (!self.app) {
          var config = {
            apiKey: 'AIzaSyAve3E-llOy2_ly87mJMSvcWDG6Uqyq8PA',
            authDomain: 'not-now-142808.firebaseapp.com',
            databaseURL: 'https://not-now-142808.firebaseio.com',
            projectId: 'not-now-142808',
            storageBucket: 'not-now-142808.appspot.com',
            messagingSenderId: '476064436883',
          }
          self.app = firebase.initializeApp(config)
          self.store.settings({timestampsInSnapshots: true})
          self.store
            .enablePersistence()
            .catch(error =>
              log.trace('store enablePersistence result', error),
            )
        }
        // self.store.disableNetwork()

        addDisposer(
          self,
          self.auth.onAuthStateChanged(self._onAuthStateChanged),
        )
      },

      _onAuthStateChanged(user) {
        //'metadata' : creationTime, lastSignInTime
        const userProps = [
          'displayName',
          'email',
          'emailVerified',
          'isAnonymous',
          'metadata',
          'phoneNumber',
          'photoURL',
          'providerData',
          'providerId',
          'refreshToken',
          'uid',
        ]
        self.userInfo = R.unless(R.isNil, SF.pick(userProps), user)
        log.trace('onAuthStateChanged userInfo:', self.userInfo)
        self.authState = user ? 'signedIn' : 'signedOut'
      },
      signIn() {
        var provider = new firebase.auth.GoogleAuthProvider()
        provider.setCustomParameters({prompt: 'select_account'})
        return self.auth.signInWithRedirect(provider)
      },
      signOut() {
        return self.auth.signOut()
      },
    }
  })
