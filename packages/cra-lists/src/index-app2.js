/*eslint-disable*/

import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import App from './components/App'
import {BrowserRouter} from 'react-router-dom'
import {StateProvider} from './StateContext'

import {Router} from 'react-router'
import createBrowserHistory from 'history/createBrowserHistory'

/*eslint-enable*/

function render(App) {
  const state = {
    fire: require('./mobx-stores/FirebaseService').FirebaseService,
  }
  ReactDOM.render(
    <BrowserRouter>
      <StateProvider value={state}>
        <App />
      </StateProvider>
    </BrowserRouter>,
    document.getElementById('root'),
  )
}

render(App)

registerServiceWorker()

if (module.hot) {
  module.hot.accept(
    ['./components/App', './mobx-stores/FirebaseService'],
    () => {
      render(require('./components/App').default)
    },
  )
}
