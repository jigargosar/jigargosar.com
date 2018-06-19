/*eslint-disable*/

import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import App from './components-2/App'
import {BrowserRouter} from 'react-router-dom'
import {StateProvider} from './StateContext'

import {Router} from 'react-router'
import createBrowserHistory from 'history/createBrowserHistory'

/*eslint-enable*/

const history = createBrowserHistory()

function render(App) {
  const state = {
    fire: require('./mobx-stores/FirebaseService').FirebaseService,
  }
  ReactDOM.render(
    <Router history={history}>
      <StateProvider value={state}>
        <App />
      </StateProvider>
    </Router>,
    document.getElementById('root'),
  )
}

render(App)

registerServiceWorker()

if (module.hot) {
  module.hot.accept(
    ['./components-2/App', './mobx-stores/FirebaseService'],
    () => {
      render(require('./components-2/App').default)
    },
  )
}
