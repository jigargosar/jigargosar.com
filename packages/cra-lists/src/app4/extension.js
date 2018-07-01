import {_} from './utils'
import {mWhen} from './mobx/utils'

function getLocationHash() {
  return global.window.location.hash
}

function getLocation() {
  return global.window.location
}

function isLocationHashSignIn() {
  return _.equals(getLocationHash(), '#signIn')
}

function removeLocationHash() {
  global.window.history.replaceState(
    {},
    null,
    `${getLocation().pathname}${getLocation().search}`,
  )
}

export const initExtension = async appState => {
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
      appState.isSignedIn,
      () => {
        if (isLocationHashSignIn()) {
          removeLocationHash()
        }
      },
      {name: 'removeLocationHash #signIn'},
    )

    mWhen(
      appState.isAuthKnown,
      () => {
        if (appState.isSignedOut()) {
          appState.fire.auth.signInWithPopup()
        }
      },
      {name: '#signIn'},
    )
  }
}
