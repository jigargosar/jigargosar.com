import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import App from './components/App'
import {BrowserRouter} from 'react-router-dom'
import {StateProvider} from './StateContext'
import {FirebaseService} from './mobx-stores/FirebaseService'

const state = {
  fire: FirebaseService,
}

function render(App) {
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
  module.hot.accept(['./components/App'], () => {
    render(require('./components/App').default)
  })
}
