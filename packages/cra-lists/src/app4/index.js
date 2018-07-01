import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from '../registerServiceWorker'
import {mReaction, mRunInAction, mWhen, oObject} from './mobx/utils'
import {storage} from './services/storage'
import {createObservableHistory} from './mobx/utils/StateHistory'
import {_} from './utils'
import {Provider} from 'mobx-react'
import {Fire} from './mobx/Fire'

function createNotesCollection() {
  const ncSnapshot = storage.get('ncSnapshot') || {}
  return require('./mobx/NoteCollection').NoteCollection.create(
    ncSnapshot,
  )
}

function createNoteListView(nc) {
  return require('./mobx/NoteListView').NoteListView({nc})
}

function createStateItems() {
  const nc = createNotesCollection()
  return {
    nc,
    view: createNoteListView(nc),
    fire: Fire(),
  }
}

const appState = oObject(
  {...createStateItems()},
  {},
  {name: 'appState'},
)

function render() {
  const App = require('./components/App').default
  ReactDOM.render(
    <Provider appState={appState}>
      <App />
    </Provider>,
    document.getElementById('root'),
  )
}

render()

registerServiceWorker()

mReaction(
  () => [appState.nc.snapshot],
  () => storage.set('ncSnapshot', appState.nc.snapshot),
)

function getLocationHash() {
  return global.window.location.hash
}

function isLocationHashSignIn() {
  return _.equals(getLocationHash(), '#signIn')
}

function removeLocationHash() {
  global.window.location.hash = ''
}

function isAuthKnown() {
  return appState.fire.auth.isAuthKnown
}

function isSignedIn() {
  return appState.fire.auth.isSignedIn
}

function isSignedOut() {
  return appState.fire.auth.isSignedOut
}

const ext = (async () => {
  const query = _.pathOr(null, 'chrome.tabs.query'.split('.'))(global)
  if (query) {
    const result = await new Promise(resolve =>
      query({active: true, currentWindow: true}, resolve),
    )
    const tabInfo = _.head(result)
    console.log(`tabInfo.url`, tabInfo.url)
    if (!_.isNil(tabInfo.url)) {
      const note = appState.nc.newNote({sortIdx: -1})
      appState.nc.add(note)
      note.updateText(`${tabInfo.title} -- ${tabInfo.url}`)
    }

    mWhen(
      isSignedIn,
      () => {
        if (isLocationHashSignIn()) {
          removeLocationHash()
        }
      },
      {name: 'removeLocationHash #signIn'},
    )

    mWhen(
      isAuthKnown,
      () => {
        if (isSignedOut()) {
          appState.fire.auth.signInWithPopup()
        }
      },
      {name: '#signIn'},
    )
  }
})()

ext.catch(console.error)

if (module.hot) {
  window.s = appState
  // createObservableHistory(appState)
  console.debug(`createObservableHistory`, createObservableHistory)

  module.hot['accept'](
    [
      './components/App',
      './mobx/NoteCollection',
      './mobx/NoteListView',
    ],
    _.tryCatch(() => {
      console.clear()
      mRunInAction('Hot Update States', () =>
        Object.assign(appState, ...createStateItems()),
      )
      render()
    }, console.error),
  )
}
